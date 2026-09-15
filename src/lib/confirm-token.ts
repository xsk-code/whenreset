/**
 * src/lib/confirm-token.ts
 *
 * Signing and verification for the one-click confirmation link.
 *
 * The link has to survive a round trip through a chat app and then prove, on a
 * public endpoint, which upstream record a human meant to confirm. Two design
 * decisions are load-bearing:
 *
 * 1. **The token carries the record.** The payload is the record itself
 *    (`id`, `announced_at`, `text`, `url`, `type`), so `/api/confirm` never
 *    accepts free-form input from the caller — it can only replay what was
 *    signed. A leaked link is therefore worth, at worst, injecting a record the
 *    upstream API already reported. It cannot be used to write anything the
 *    pipeline had not already surfaced.
 *
 * 2. **HMAC, not asymmetric.** `GITHUB_DISPATCH_TOKEN` lives in the same Vercel
 *    environment as `CONFIRM_SECRET`. Anyone who can read that environment can
 *    already call the GitHub API directly, so Ed25519 would not change the
 *    threat model — it would only add key management. Symmetric is the honest
 *    choice at this size.
 *
 * `CONFIRM_SECRET` and `FEISHU_WEBHOOK_SECRET` are two independent keys and
 * must never be set to the same value: one authenticates *us to Feishu*, the
 * other authenticates *a link to us*.
 */

export const CONFIRM_TTL_MS = 24 * 60 * 60 * 1000;

/** Token payload. `exp` is Unix epoch milliseconds. */
export interface ConfirmPayload {
  id: string;
  announced_at: string;
  text: string;
  url: string;
  type: "regular" | "banked";
  exp: number;
}

export type VerifyResult =
  | { ok: true; payload: ConfirmPayload }
  | { ok: false; reason: "not_configured" | "malformed" | "bad_signature" | "expired" };

const encoder = new TextEncoder();

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmacBase64Url(secret: string, message: string): Promise<string> {
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

/** Constant-time-ish comparison; the lengths are fixed by SHA-256 anyway. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function isConfirmConfigured(
  secret: string | undefined = process.env.CONFIRM_SECRET
): boolean {
  return typeof secret === "string" && secret.length > 0;
}

export async function signConfirmToken(
  payload: Omit<ConfirmPayload, "exp"> & { exp?: number },
  secret: string,
  nowMs: number = Date.now()
): Promise<string> {
  const full: ConfirmPayload = {
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

export async function verifyConfirmToken(
  token: string | null | undefined,
  secret: string | undefined = process.env.CONFIRM_SECRET,
  nowMs: number = Date.now()
): Promise<VerifyResult> {
  if (!isConfirmConfigured(secret)) return { ok: false, reason: "not_configured" };
  if (!token) return { ok: false, reason: "malformed" };

  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { ok: false, reason: "malformed" };
  }

  const [body, signature] = parts;
  const expected = await hmacBase64Url(secret as string, body);
  // Signature is checked BEFORE the payload is parsed: a tampered payload must
  // never reach JSON.parse, let alone the record it describes.
  if (!safeEqual(expected, signature)) return { ok: false, reason: "bad_signature" };

  let parsed: ConfirmPayload;
  try {
    parsed = JSON.parse(new TextDecoder().decode(base64UrlToBytes(body))) as ConfirmPayload;
  } catch {
    return { ok: false, reason: "malformed" };
  }

  if (
    typeof parsed?.id !== "string" ||
    typeof parsed?.announced_at !== "string" ||
    typeof parsed?.text !== "string" ||
    typeof parsed?.exp !== "number"
  ) {
    return { ok: false, reason: "malformed" };
  }

  if (parsed.exp <= nowMs) return { ok: false, reason: "expired" };

  return { ok: true, payload: parsed };
}
