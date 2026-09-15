/**
 * src/lib/notify-payload.ts
 *
 * The single implementation of "what does an outbound notification look like".
 *
 * Why this module exists: `/api/push` (user-facing) and `/api/cron/dispatch`
 * (admin-facing) each had their own idea of the payload. `/api/push` dispatched
 * on the destination host correctly; `/api/cron/dispatch` hardcoded WeCom's
 * `{msgtype, text:{content}}` shape for whatever URL it was given, so pointing
 * `ADMIN_WEBHOOK_URL` at a Feishu bot silently failed to deliver. Same concern,
 * two implementations — and only one of them worked.
 *
 * Everything server-side that posts to a chat webhook goes through here.
 * The GitHub Actions notifier (`scripts/notify-feishu.mjs`) runs in a separate
 * process that cannot import TypeScript, so it mirrors `formatNotifyText()`
 * exactly and `scripts/verify-notify-parity.mjs` asserts the two agree
 * byte-for-byte. That test is what keeps this a single definition in practice.
 */

/**
 * Destinations a user-supplied webhook may point at.
 *
 * `/api/push` proxies whatever URL a visitor hands it, so the allowlist is what
 * stops the endpoint from being an open SSRF relay.
 */
export const NOTIFY_ALLOWED_HOSTS = [
  "api.day.app",
  "qyapi.weixin.qq.com",
  "open.feishu.cn",
  "open.larksuite.com",
  "discord.com",
  "discordapp.com",
  "hooks.slack.com",
  "api.day.app:443",
];

export function hostOf(raw: string): string | null {
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}

export function isFeishuHost(host: string): boolean {
  return (
    host.startsWith("open.feishu.cn") || host.startsWith("open.larksuite.com")
  );
}

export function isWeComHost(host: string): boolean {
  return host.startsWith("qyapi.weixin.qq.com");
}

/**
 * Title, body and link joined the one way every channel expects. Exported so
 * the Actions-side notifier and the parity test can share the exact rule.
 */
export function formatNotifyText(title: string, body: string, url?: string): string {
  const full = url ? `${body}\n${url}` : body;
  return `${title}\n${full}`;
}

/**
 * Shape the payload for whichever chat product lives at `host`.
 *
 * NOTE: this is byte-for-byte the function that used to be inline in
 * `/api/push`. Its output must not change — user-configured bots are already
 * pointed at it.
 */
export function payloadFor(
  host: string,
  title: string,
  body: string,
  url?: string
): Record<string, unknown> {
  const content = formatNotifyText(title, body, url);
  if (isWeComHost(host)) {
    return { msgtype: "text", text: { content } };
  }
  if (isFeishuHost(host)) {
    return { msg_type: "text", content: { text: content } };
  }
  if (host.includes("discord") || host.includes("slack")) {
    return { content };
  }
  return { text: content, content };
}
