/**
 * src/lib/feishu-sign.ts
 *
 * Feishu custom-bot signature verification.
 *
 * Algorithm (confirmed against the official docs for
 * `open.feishu.cn/document/client-docs/bot-v3/add-custom-bot`):
 *
 *   sign = base64( HMAC-SHA256( key = `${timestamp}\n${secret}`, msg = "" ) )
 *
 * Two details that are easy to get wrong and are therefore spelled out:
 *   - the secret is part of the HMAC **key**, not the message;
 *   - the signed message is the **empty string**.
 *
 * `timestamp` is Unix **seconds** and must be within one hour of the server's
 * clock, or Feishu answers `{"code":19021}`. The timestamp and signature ride
 * alongside `msg_type`/`content` in the request body.
 *
 * Web Crypto is used rather than `node:crypto` so this module stays usable from
 * both the Node and the Edge runtime.
 *
 * Scope note: signature verification is only ever applied to the **admin**
 * channel. `/api/push` serves user-supplied webhook URLs and the server has no
 * way to obtain those users' bot secrets, so a user who enables signing on
 * their own bot cannot be proxied by `/api/push` — that is a known limitation,
 * not a bug. See cards/when-20260915-07.md.
 */

const encoder = new TextEncoder();

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

/**
 * Feishu wants Unix seconds. Kept as its own function so callers cannot
 * accidentally pass milliseconds (which fails the one-hour window check).
 */
export function feishuTimestampSeconds(nowMs: number = Date.now()): number {
  return Math.floor(nowMs / 1000);
}

export async function computeFeishuSign(
  secret: string,
  timestampSeconds: number
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(`${timestampSeconds}\n${secret}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, new Uint8Array(0));
  return bytesToBase64(new Uint8Array(mac));
}

/**
 * Add `timestamp` + `sign` to an already-shaped payload.
 *
 * Returns the payload untouched when no secret is configured: a bot with no
 * security setting accepts unsigned requests, so a missing secret must mean
 * "send anyway", never "refuse to notify".
 */
export async function withFeishuSign<T extends Record<string, unknown>>(
  payload: T,
  secret: string | undefined,
  nowMs: number = Date.now()
): Promise<T & { timestamp?: string; sign?: string }> {
  if (!secret) return payload;
  const timestamp = feishuTimestampSeconds(nowMs);
  const sign = await computeFeishuSign(secret, timestamp);
  return { ...payload, timestamp: String(timestamp), sign };
}
