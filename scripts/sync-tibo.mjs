#!/usr/bin/env node

/**
 * scripts/sync-tibo.mjs
 *
 * Radar ingestion tool for WhenReset.
 *
 * TWO MODES, and only one of them can write:
 *
 *   1. `--probe` (default) — READ-ONLY. Reads the local dataset, asks the
 *      upstream API what it knows, and reports which records the local
 *      dataset does not have yet. It never writes anything. Upstream is a
 *      detector, not an authority: it may tell us that something happened, it
 *      may not decide that it did.
 *
 *   2. `--add-tweet "<text>" --url <tweet-url> [--type regular|banked]` —
 *      human-confirmed ingestion. This is the ONLY write path into
 *      `src/data/fallback-resets.json`, and it stamps the record with
 *      `provenance: "manual"`.
 *
 * Why upstream lost its write access: the previous version merged upstream
 * rows straight into the authoritative dataset. A mis-reported or
 * re-timestamped upstream row would land in git history, shift every
 * historical statistic derived from it, and could not be cleanly undone. For a
 * product whose only asset is the credibility of its forecast, **delay is
 * acceptable and a wrong fact is not** — so the write path is human-gated
 * while the read path (degrading to the last known snapshot) stays automatic.
 *
 * Exit codes:
 *   0  probe finished with nothing pending, or a manual ingestion succeeded
 *   1  fatal: dataset unreadable, upstream unreachable, or bad arguments
 *   3  probe finished and records await human confirmation
 *   4  upstream answered with a Cloudflare edge challenge: nothing could be
 *      detected, and nothing was disproved. Deliberately not a failure.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_UPSTREAM_URL, fetchUpstreamResets } from "./lib/upstream.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE_PATH = path.resolve(__dirname, "../src/data/fallback-resets.json");

const UPSTREAM_RESETS_URL = process.env.UPSTREAM_RESETS_URL || DEFAULT_UPSTREAM_URL;
const TIMEOUT_MS = 6000;

// Bounds for the machine-readable payload. Feishu rejects any request body over
// 20 KB, and every record also has to fit inside a clickable confirm token, so
// the probe output is deliberately capped rather than "however many there are".
const MAX_JSON_RECORDS = 10;
const MAX_TEXT_CHARS = 500;

/**
 * The `::probe::` machine marker. Normally on stdout so `cat probe.log` shows
 * it; redirected to stderr under `--json`, where stdout must stay exactly one
 * parseable JSON document.
 */
function markerLine(payload, jsonMode) {
  const line = `::probe::${JSON.stringify(payload)}`;
  if (jsonMode) console.error(line);
  else console.log(line);
}

export const PROVENANCE = {
  manual: "manual",
  upstream: "upstream",
  xApi: "x_api",
  officialStatus: "official_status",
};

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: false,
    addTweet: null,
    tweetAt: null,
    tweetId: null,
    tweetType: "regular",
    tweetUrl: null,
    author: "thsottiaux",
    json: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--dry-run" || arg === "-d") {
      options.dryRun = true;
    } else if (arg === "--add-tweet" && args[i + 1]) {
      options.addTweet = args[++i];
    } else if (arg === "--at" && args[i + 1]) {
      options.tweetAt = args[++i];
    } else if (arg === "--id" && args[i + 1]) {
      options.tweetId = args[++i];
    } else if (arg === "--type" && args[i + 1]) {
      options.tweetType = args[++i].toLowerCase();
    } else if (arg === "--url" && args[i + 1]) {
      options.tweetUrl = args[++i];
    } else if (arg === "--author" && args[i + 1]) {
      options.author = args[++i];
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    }
  }

  return options;
}

/**
 * @returns {Promise<{ok: true, items: unknown[]} | {ok: false, blocked: boolean, error: string}>}
 * Never silently degrades to an empty list: an unreachable upstream is an
 * error the caller must surface, not a quiet "nothing new". A Cloudflare edge
 * challenge is flagged as `blocked` so the caller can tell "the network is not
 * allowed to see upstream" apart from "upstream is broken".
 */
async function fetchUpstream(url) {
  const result = await fetchUpstreamResets(url, {
    ua: "WhenReset-Radar/1.0",
    timeoutMs: TIMEOUT_MS,
  });
  if (result.ok) return { ok: true, items: result.items };
  return { ok: false, blocked: result.blocked, error: result.detail };
}

async function readLocalResets() {
  const raw = await fs.readFile(DATA_FILE_PATH, "utf-8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("fallback-resets.json is not an array");
  return parsed;
}

function sortDescending(resets) {
  return [...resets].sort(
    (a, b) => new Date(b.announced_at).getTime() - new Date(a.announced_at).getTime()
  );
}

async function main() {
  const options = parseArgs();

  if (options.help) {
    console.log(`
WhenReset radar ingestion

Usage:
  node scripts/sync-tibo.mjs [--probe] [--json]    Read-only: report records awaiting confirmation
  node scripts/sync-tibo.mjs --add-tweet <text> --url <tweet-url> [--id <record-id>] [--type regular|banked]
                                                    Human-confirmed ingestion (the only write path)

Options:
  -d, --dry-run             Parse and validate without writing
  --at <iso-timestamp>      announced_at for the ingested record (default: now)
  --id <record-id>          Explicit record id (default: trailing segment of --url)
  --url <tweet-url>         Direct link to the announcement
  --type <regular|banked>   Reset type (default: regular)
  --author <handle>         Author handle (default: thsottiaux)
  --json                    Machine-readable mode. stdout carries ONE JSON
                            document and nothing else; all human-readable
                            output goes to stderr. Used by the Actions
                            notifier to build the Feishu message.
  -h, --help                Show this message

Exit codes: 0 ok / 1 fatal / 3 records await confirmation
`);
    process.exit(0);
  }

  let localResets;
  try {
    localResets = await readLocalResets();
  } catch (err) {
    console.error(`❌ [SYNC] Cannot read fallback-resets.json: ${err.message}`);
    process.exit(1);
  }

  const localIds = new Set(localResets.map((r) => String(r.id)));

  // ---- Mode 2: human-confirmed ingestion (write path) -----------------------
  if (options.addTweet) {
    // An explicit --id wins. The confirmation flow signs the record id the
    // upstream API used, and the idempotency check ("is this already
    // ingested?") compares against that same id — deriving it from the URL
    // instead would let a record slip in twice under two different ids.
    const tweetId =
      options.tweetId ||
      (options.tweetUrl
        ? options.tweetUrl.split("/").filter(Boolean).pop()
        : `manual-${Date.now()}`);

    if (localIds.has(String(tweetId))) {
      console.log(`⚠️  Record id=${tweetId} already present. Nothing written.`);
      markerLine({ mode: "ingest", written: false, id: tweetId, reason: "duplicate" }, options.json);
      process.exit(0);
    }

    const announcedAt = options.tweetAt ? new Date(options.tweetAt) : new Date();
    if (Number.isNaN(announcedAt.getTime())) {
      console.error(`❌ [SYNC] --at is not a valid timestamp: ${options.tweetAt}`);
      process.exit(1);
    }

    const newReset = {
      id: tweetId,
      reset_type: options.tweetType === "banked" ? "banked" : "regular",
      announced_at: announcedAt.toISOString(),
      text: options.addTweet,
      source: {
        type: "x_post",
        author: options.author,
        url: options.tweetUrl || `https://x.com/${options.author}`,
      },
      // Human-confirmed: this record exists because a person checked the
      // announcement, not because an API asserted it.
      provenance: PROVENANCE.manual,
    };

    if (!options.dryRun) {
      const next = sortDescending([newReset, ...localResets]);
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify(next, null, 2) + "\n", "utf-8");
    }

    console.log(
      `${options.dryRun ? "🔍 [DRY RUN] Would ingest" : "✅ [INGESTED]"} id=${tweetId} type=${newReset.reset_type} announced_at=${newReset.announced_at} provenance=manual`
    );
    markerLine(
      { mode: "ingest", written: !options.dryRun, id: tweetId, total: localResets.length + 1 },
      options.json
    );
    process.exit(0);
  }

  // ---- Mode 1: probe (read-only) -------------------------------------------
  const upstream = await fetchUpstream(UPSTREAM_RESETS_URL);

  if (!upstream.ok && upstream.blocked) {
    // Nothing was detected, but nothing was *disproved* either. Exit 4 so the
    // workflow stays green without recording "0 pending" as a fact — that
    // value is what closes the confirmation issue.
    console.error(`⚠️  [SYNC] Upstream not reachable from this network: ${upstream.error}`);
    console.error(`   url: ${UPSTREAM_RESETS_URL}`);
    console.error("   Probing is degraded; pending records, if any, are unknown.");
    if (options.json) {
      process.stdout.write(
        `${JSON.stringify({ mode: "probe", ok: false, blocked: true, error: upstream.error })}\n`
      );
    } else {
      console.log(`::probe::${JSON.stringify({ mode: "probe", ok: false, blocked: true, error: upstream.error })}`);
    }
    process.exit(4);
  }

  if (!upstream.ok) {
    // The whole point of this branch: an unreachable upstream is a RED LIGHT.
    // The previous version returned an empty list here and printed "everything
    // up to date", so a broken pipeline looked exactly like a quiet one.
    console.error(`❌ [SYNC] Upstream unreachable: ${upstream.error}`);
    console.error(`   url: ${UPSTREAM_RESETS_URL}`);
    console.error("   The site keeps serving the local dataset; the pipeline is NOT healthy.");
    if (options.json) {
      process.stdout.write(
        `${JSON.stringify({ mode: "probe", ok: false, error: upstream.error })}\n`
      );
    } else {
      console.log(`::probe::${JSON.stringify({ mode: "probe", ok: false, error: upstream.error })}`);
    }
    process.exit(1);
  }

  const pending = sortDescending(
    upstream.items.filter((item) => item?.id && !localIds.has(String(item.id)))
  );

  if (!options.json) {
    console.log("================================================================");
    console.log("  WHENRESET RADAR // UPSTREAM PROBE (read-only)");
    console.log("================================================================");
    console.log(`  Local records          : ${localResets.length}`);
    console.log(`  Upstream records       : ${upstream.items.length}`);
    console.log(`  Awaiting confirmation  : ${pending.length}`);
    console.log("----------------------------------------------------------------");
    for (const item of pending.slice(0, 5)) {
      console.log(`  • id=${item.id}  ${item.announced_at}`);
      console.log(`    "${String(item.text || "").replace(/\n/g, " ").slice(0, 70)}"`);
      console.log(`    ${item.source?.url || "(no source url)"}`);
    }
    if (pending.length > 5) console.log(`  … and ${pending.length - 5} more`);
    if (pending.length > 0) {
      console.log("----------------------------------------------------------------");
      console.log("  These are NOT written automatically. Confirm one with:");
      console.log('    node scripts/sync-tibo.mjs --add-tweet "<text>" \\');
      console.log('      --url <tweet-url> --at <iso-timestamp> [--type banked]');
    }
    console.log("================================================================");
  } else {
    // Machine-readable mode: stdout carries exactly one JSON document so the
    // caller can pipe it straight into the notifier. `human()` below keeps the
    // marker line out of that stream.
    process.stdout.write(
      `${JSON.stringify({
        mode: "probe",
        ok: true,
        local: localResets.length,
        upstream: upstream.items.length,
        pending: pending.length,
        generated_at: new Date().toISOString(),
        records: pending.slice(0, MAX_JSON_RECORDS).map((item) => ({
          id: String(item.id),
          announced_at: String(item.announced_at || ""),
          // Capped: this text rides inside a signed confirm token, and a token
          // that outgrows a URL is a token that cannot be clicked. The record
          // always keeps its source link, so nothing is lost that matters.
          text: String(item.text || "").slice(0, MAX_TEXT_CHARS),
          text_truncated: String(item.text || "").length > MAX_TEXT_CHARS,
          url: String(item.source?.url || ""),
          type: item.reset_type === "banked" ? "banked" : "regular",
        })),
      })}\n`
    );
    if (pending.length > MAX_JSON_RECORDS) {
      console.error(
        `… ${pending.length - MAX_JSON_RECORDS} further records omitted from the JSON payload`
      );
    }
  }

  const marker = JSON.stringify({
    mode: "probe",
    ok: true,
    local: localResets.length,
    upstream: upstream.items.length,
    pending: pending.length,
    pendingIds: pending.slice(0, 10).map((i) => String(i.id)),
  });
  if (options.json) {
    console.error(`::probe::${marker}`);
  } else {
    console.log(`::probe::${marker}`);
  }

  process.exit(pending.length > 0 ? 3 : 0);
}

main().catch((err) => {
  console.error("💥 [SYNC] Fatal error:", err);
  process.exit(1);
});
