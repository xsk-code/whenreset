/**
 * scripts/lib/upstream.mjs
 *
 * Shared upstream fetch for every script that talks to the upstream reset API.
 *
 * ## Why this module exists
 *
 * The upstream API sits behind Cloudflare, and Cloudflare answers requests
 * from datacenter egress with a managed JS challenge — HTTP 403 carrying
 * `cf-mitigated: challenge` and a "Just a moment..." HTML body. Measured from
 * GitHub Actions on 2026-09-15: three different runner egress IPs
 * (20.98.142.138, 20.124.222.82, 134.33.71.43) all got 403, with and without a
 * full browser User-Agent, Accept, Accept-Language and Referer. A control
 * request to status.openai.com from the same runners returned 200. Vercel's
 * serverless egress is challenged the same way, which is why the site's
 * /api/resets reports `meta.is_fallback: true`.
 *
 * So this is not a bug we can fix with better headers: **server-side fetching
 * of this API is structurally unavailable from a datacenter.** Pretending
 * otherwise is what made the pipeline go red every five minutes.
 *
 * The distinction that matters operationally:
 *
 *   • blocked (edge challenge) — environmental, not actionable from CI. The
 *     dataset itself may be perfectly healthy. Report it loudly, do not fail.
 *   • failed  (5xx, timeout, malformed body, non-challenge 4xx) — actionable.
 *     This is a real alarm and must fail the run.
 *
 * Scripts surface `blocked` as **exit code 4**; 0 stays healthy, 1 stays fatal.
 */

/** Header Cloudflare sets when it serves a managed challenge. */
const CF_MITIGATED_HEADER = "cf-mitigated";

export const DEFAULT_UPSTREAM_URL = "https://codex-resets.com/api/v1/resets";

/**
 * @param {Response} res
 * @returns {string | null} a description of the edge challenge, or null when
 *   this response is not one.
 */
export function describeEdgeChallenge(res) {
  const mitigated = res?.headers?.get?.(CF_MITIGATED_HEADER);
  if (!mitigated) return null;
  return `HTTP ${res.status} — Cloudflare edge challenge (cf-mitigated: ${mitigated})`;
}

/**
 * Fetch and parse the upstream reset list.
 *
 * @returns {Promise<
 *   | { ok: true; items: unknown[]; blocked: false; detail: string }
 *   | { ok: false; blocked: boolean; detail: string }
 * >}
 */
export async function fetchUpstreamResets(url, options = {}) {
  const {
    ua = "WhenReset-Radar/1.0",
    timeoutMs = 6000,
    retries = 1,
  } = options;

  let lastResult = { ok: false, blocked: false, detail: "unreachable" };

  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { "User-Agent": ua, Accept: "application/json" },
      });

      const challenge = describeEdgeChallenge(res);
      if (challenge) {
        // Retrying is pointless: the answer depends on the egress IP, not on
        // timing or headers.
        return { ok: false, blocked: true, detail: challenge };
      }

      if (!res.ok) {
        lastResult = {
          ok: false,
          blocked: false,
          detail: `HTTP ${res.status} ${res.statusText}`,
        };
      } else {
        const json = await res.json();
        const items = Array.isArray(json) ? json : json?.data;
        if (!Array.isArray(items)) {
          lastResult = {
            ok: false,
            blocked: false,
            detail: "response is not an array",
          };
        } else {
          return {
            ok: true,
            blocked: false,
            items,
            detail: `${items.length} records`,
          };
        }
      }
    } catch (err) {
      lastResult = { ok: false, blocked: false, detail: err?.message || "unreachable" };
    } finally {
      clearTimeout(timeoutId);
    }

    if (attempt < retries) {
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }

  return lastResult;
}

/** Human-readable explanation, printed whenever a run is degraded by a block. */
export const BLOCKED_EXPLANATION = [
  "The upstream API answers datacenter egress with a Cloudflare JS challenge, so",
  "server-side fetching is unavailable from CI and from Vercel alike. This is an",
  "environment condition, not a dataset problem — the dataset below is still",
  "checked in full. To restore live probing, fetch from a non-datacenter egress",
  "(a local scheduler works — residential/office IPs are not challenged).",
].join("\n");
