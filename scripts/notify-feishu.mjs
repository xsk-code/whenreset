#!/usr/bin/env node

/**
 * scripts/notify-feishu.mjs
 *
 * Sends the "an upstream record is waiting for you" notification to a Feishu
 * group bot, with a one-click confirmation link.
 *
 * This script exists in a different runtime from the Next.js app: GitHub
 * Actions cannot import TypeScript, so the small amount of logic that must run
 * on BOTH sides (payload shaping, confirm-token signing, Feishu signing) is
 * mirrored here rather than shared. That duplication is a real risk, so it is
 * not left to trust:
 *
 *   - `src/lib/notify-payload.ts` and `formatNotifyText()` below must agree;
 *   - `src/lib/confirm-token.ts` and `signConfirmToken()` below must agree.
 *
 * Both are proven by behaviour, not by inspection: a token minted here is
 * verified by the deployed `/api/confirm` during the drill in
 * cards/when-20260915-07.md. If either implementation drifted, verification
 * would fail with `bad_signature`.
 *
 * Input: the JSON document produced by `sync-tibo.mjs --probe --json`.
 *        Pass a file path as the first argument, or pipe it on stdin.
 *
 * Modes:
 *   (default)   POST the notification.
 *   --dry-run   Print the exact request body instead of sending it. Tokens are
 *               real, so the printed URL is genuinely clickable — useful for
 *               testing `/confirm` without spamming the group.
 *
 * Exit codes:
 *   0  sent, or deliberately skipped (no webhook configured / nothing pending)
 *   1  the notification could not be delivered
 *
 * Feishu limits this obeys (from the official custom-bot docs):
 *   - request body ≤ 20 KB
 *   - 100 requests/minute, 5 requests/second per bot
 *   - signature: base64(HMAC-SHA256(key = `${timestamp}\n${secret}`, msg = "")),
 *     timestamp in Unix seconds, valid for one hour
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);

const SITE_URL = (process.env.SITE_URL || "https://whenreset.top").replace(/\/$/, "");
const MAX_BODY_BYTES = 20 * 1024;
const MAX_TEXT_CHARS = 500;

// ---------------------------------------------------------------------------
// Mirrors src/lib/notify-payload.ts
// ---------------------------------------------------------------------------

export function formatNotifyText(title, body, url) {
  const full = url ? `${body}\n${url}` : body;
  return `${title}\n${full}`;
}

// ---------------------------------------------------------------------------
// Mirrors src/lib/confirm-token.ts
// ---------------------------------------------------------------------------

export const CONFIRM_TTL_MS = 24 * 60 * 60 * 1000;

const encoder = new TextEncoder();

function bytesToBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmacBase64Url(secret, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return bytesToBase64Url(new Uint8Array(mac));
}

export async function signConfirmToken(payload, secret, nowMs = Date.now()) {
  const full = {
    id: payload.id,
    announced_at: payload.announced_at,
    text: payload.text,
    url: payload.url,
    type: payload.type,
    exp: payload.exp ?? nowMs + CONFIRM_TTL_MS,
  };
  const body = bytesToBase64Url(encoder.encode(JSON.stringify(full)));
  const signature = await hmacBase64Url(secret, body);
  return `${body}.${signature}`;
}

// ---------------------------------------------------------------------------
// Mirrors src/lib/feishu-sign.ts
// ---------------------------------------------------------------------------

export async function computeFeishuSign(secret, timestampSeconds) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(`${timestampSeconds}\n${secret}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, new Uint8Array(0));
  let binary = "";
  for (const byte of new Uint8Array(mac)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export async function withFeishuSign(payload, secret, nowMs = Date.now()) {
  if (!secret) return payload;
  const timestamp = Math.floor(nowMs / 1000);
  const sign = await computeFeishuSign(secret, timestamp);
  return { ...payload, timestamp: String(timestamp), sign };
}

// ---------------------------------------------------------------------------

function readInput(pathArg) {
  return new Promise((resolve, reject) => {
    if (pathArg) {
      fs.readFile(pathArg, "utf-8").then(resolve, reject);
      return;
    }
    let raw = "";
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk) => (raw += chunk));
    process.stdin.on("end", () => resolve(raw));
    process.stdin.on("error", reject);
  });
}

function recordBlock(record, index, token) {
  const link = `${SITE_URL}/confirm?t=${encodeURIComponent(token)}`;
  const when = record.announced_at || "(no timestamp)";
  const author = record.url ? `\n   推文  ${record.url}` : "";
  const truncated = record.text_truncated ? " …" : "";
  return [
    `${index + 1}) ${record.type} · ${when} · id=${record.id}`,
    `   "${String(record.text || "").replace(/\n/g, " ").slice(0, 200)}${truncated}"`,
    author,
    `   确认入账  ${link}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function closingNote(omitted) {
  const lines = [];
  if (omitted > 0) {
    lines.push(
      `… 另有 ${omitted} 条未放入本条消息（超出 20 KB 限制）。请打开 GitHub Issue 查看全部。`
    );
  }
  lines.push("确认后由你本人触发写入；上游数据源无写入权限。");
  return `\n\n${lines.join("\n")}`;
}

export async function buildMessage(probe, secret) {
  const title = `[WhenReset] 疑似新重置待确认 · ${probe.pending} 条`;
  const header = [
    "上游报告了本地数据集还没有的记录。",
    "这些不会自动写入 —— 只有你本人点确认才会入账。",
    "",
    "先点开推文核对，再点「确认入账」。确认链接 24 小时内有效，点一次即可。",
    "",
  ].join("\n");

  // Feishu caps the request body at 20 KB, so the record list is trimmed to fit
  // rather than letting the whole request be rejected. The closing note is
  // given a fixed byte reserve so the size check cannot be invalidated by the
  // footer growing to mention the records that were left out.
  const CLOSING_RESERVE_BYTES = 300;
  const blocks = [];

  for (const record of probe.records) {
    const token = await signConfirmToken(
      {
        id: record.id,
        announced_at: record.announced_at,
        text: String(record.text || "").slice(0, MAX_TEXT_CHARS),
        url: record.url || "",
        type: record.type,
      },
      secret
    );
    const candidateBlocks = [...blocks, recordBlock(record, blocks.length, token)];
    const candidate = formatNotifyText(title, `${header}${candidateBlocks.join("\n\n")}`);
    if (
      Buffer.byteLength(candidate, "utf-8") + CLOSING_RESERVE_BYTES >
      MAX_BODY_BYTES
    ) {
      break;
    }
    blocks.push(candidateBlocks[candidateBlocks.length - 1]);
  }

  const omitted = probe.pending - blocks.length;
  if (omitted > 0) {
    console.error(
      `⚠️  Body limit reached — ${omitted} record(s) left out of the message (see the GitHub issue).`
    );
  }

  return formatNotifyText(title, `${header}${blocks.join("\n\n")}${closingNote(omitted)}`);
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const inputPath = args.find((arg) => !arg.startsWith("--"));

  const webhookUrl = process.env.FEISHU_WEBHOOK_URL;
  const webhookSecret = process.env.FEISHU_WEBHOOK_SECRET;
  const confirmSecret = process.env.CONFIRM_SECRET;

  const raw = await readInput(inputPath);
  let probe;
  try {
    probe = JSON.parse(raw);
  } catch (err) {
    console.error(`❌ [NOTIFY] Input is not valid JSON: ${err.message}`);
    process.exit(1);
  }

  if (!probe?.ok || probe.mode !== "probe") {
    console.error("❌ [NOTIFY] Input is not a successful probe document.");
    process.exit(1);
  }

  if (!probe.pending || !Array.isArray(probe.records) || probe.records.length === 0) {
    console.log("✅ [NOTIFY] Nothing awaits confirmation. No message sent.");
    process.exit(0);
  }

  if (!confirmSecret) {
    console.error(
      "❌ [NOTIFY] CONFIRM_SECRET is not set, so no confirm link can be signed."
    );
    console.error("   Set it as an Actions secret; it must match the Vercel env var.");
    process.exit(1);
  }

  const text = await buildMessage(probe, confirmSecret);
  const payload = await withFeishuSign(
    { msg_type: "text", content: { text } },
    webhookSecret
  );

  if (dryRun) {
    const body = JSON.stringify(payload);
    console.log(JSON.stringify(payload, null, 2));
    console.log(
      `\n(dry run) not sent. body=${Buffer.byteLength(body, "utf-8")} bytes ` +
        `(limit ${MAX_BODY_BYTES}), signed=${Boolean(payload.sign)}, pending=${probe.pending}`
    );
    process.exit(0);
  }

  if (!webhookUrl) {
    // Deliberately not an error: an unconfigured channel must leave the issue
    // (the audit trail) intact and the workflow green, otherwise the pipeline
    // reports failure for something that is merely optional.
    console.log(
      "ℹ️  [NOTIFY] FEISHU_WEBHOOK_URL is not configured — skipping the Feishu notification."
    );
    console.log("   The GitHub issue was still opened; nothing was lost.");
    process.exit(0);
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const echoed = await res.json().catch(() => null);

  if (res.ok && echoed?.code === 0) {
    console.log(`✅ [NOTIFY] Feishu accepted the message (code 0, ${probe.pending} pending).`);
    process.exit(0);
  }

  // Feishu returns HTTP 200 with a non-zero code on rejection, so the status
  // line alone would report a false success.
  console.error(
    `❌ [NOTIFY] Feishu rejected the message: HTTP ${res.status} code=${echoed?.code ?? "?"} msg=${echoed?.msg ?? "(no body)"}`
  );
  process.exit(1);
}

// Only run when invoked as a CLI. Importing this module (which the parity
// check against src/lib/confirm-token.ts does) must not start reading stdin.
const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (isDirectRun) {
  main().catch((err) => {
    console.error("💥 [NOTIFY] Fatal error:", err);
    process.exit(1);
  });
}
