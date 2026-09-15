import { SITE_CONFIG } from "./config";

export type AlertChannel = "bark" | "webhook" | "email";

export interface StoredAlertConfig {
  barkKey: string;
  barkLevel: string;
  webhookUrl: string;
  email: string;
  threshold: number;
}

export const DEFAULT_THRESHOLD = 80;

export const STORAGE_KEYS = {
  barkKey: "whenreset_bark_key",
  barkLevel: "whenreset_bark_level",
  webhookUrl: "whenreset_webhook_url",
  email: "whenreset_email",
  threshold: "whenreset_alert_threshold",
  lastSeenReset: "whenreset_last_seen_reset",
};

export function readAlertConfig(): StoredAlertConfig {
  if (typeof window === "undefined") {
    return { barkKey: "", barkLevel: "timeSensitive", webhookUrl: "", email: "", threshold: DEFAULT_THRESHOLD };
  }
  try {
    return {
      barkKey: localStorage.getItem(STORAGE_KEYS.barkKey) || "",
      barkLevel: localStorage.getItem(STORAGE_KEYS.barkLevel) || "timeSensitive",
      webhookUrl: localStorage.getItem(STORAGE_KEYS.webhookUrl) || "",
      email: localStorage.getItem(STORAGE_KEYS.email) || "",
      threshold: Number(localStorage.getItem(STORAGE_KEYS.threshold) || DEFAULT_THRESHOLD),
    };
  } catch {
    return { barkKey: "", barkLevel: "timeSensitive", webhookUrl: "", email: "", threshold: DEFAULT_THRESHOLD };
  }
}

export function saveAlertConfig(patch: Partial<StoredAlertConfig>) {
  if (typeof window === "undefined") return;
  try {
    if (patch.barkKey !== undefined) localStorage.setItem(STORAGE_KEYS.barkKey, patch.barkKey);
    if (patch.barkLevel !== undefined) localStorage.setItem(STORAGE_KEYS.barkLevel, patch.barkLevel);
    if (patch.webhookUrl !== undefined) localStorage.setItem(STORAGE_KEYS.webhookUrl, patch.webhookUrl);
    if (patch.email !== undefined) localStorage.setItem(STORAGE_KEYS.email, patch.email);
    if (patch.threshold !== undefined) localStorage.setItem(STORAGE_KEYS.threshold, String(patch.threshold));
  } catch {
    // storage disabled, silently ignore
  }
}

export function hasAnyChannel(config: StoredAlertConfig): boolean {
  return Boolean(config.barkKey || config.webhookUrl || config.email);
}

export interface PushRequest {
  channel: Exclude<AlertChannel, "email">;
  target: string;
  level?: string;
  title: string;
  body: string;
  url?: string;
}

export interface PushResult {
  ok: boolean;
  error?: string;
}

/**
 * Always routes through our own /api/push edge proxy:
 * direct browser -> WeCom/Feishu webhooks is blocked by CORS, and the proxy
 * also enforces a destination allowlist so the endpoint cannot be abused as
 * an open SSRF relay.
 */
export async function pushNotification(req: PushRequest): Promise<PushResult> {
  try {
    const res = await fetch("/api/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: json?.error || `push failed (${res.status})` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "network error" };
  }
}

export interface SubscribeResult {
  ok: boolean;
  configured: boolean;
  error?: string;
}

export async function subscribeEmail(email: string): Promise<SubscribeResult> {
  try {
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json?.configured === false) {
      return { ok: false, configured: Boolean(json?.configured), error: json?.error };
    }
    return { ok: true, configured: true };
  } catch (err) {
    return {
      ok: false,
      configured: false,
      error: err instanceof Error ? err.message : "network error",
    };
  }
}

export function siteHostname(): string {
  return SITE_CONFIG.domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
}
