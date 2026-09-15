/**
 * Ask GitHub to run the radar probe workflow.
 *
 * Separated from the routes that call it because there is now more than one
 * caller: `/api/confirm` dispatches with the human-confirmed record as inputs,
 * and `/api/cron/probe` dispatches with no inputs at all (a bare probe). Both
 * need the same URL shape, headers and API version, and a drift between them
 * would fail silently — GitHub answers 404 for a ref that does not carry the
 * workflow file, which reads like "not found" rather than "wrong ref".
 *
 * The write path is unaffected: a dispatch only *starts* the workflow, and the
 * workflow itself refuses to write anything without a human-confirmed record.
 */

import { SITE_CONFIG } from "@/lib/config";

/** Must match the file in `.github/workflows/`. */
export const WORKFLOW_FILE = "sync-radar.yml";

/** `https://github.com/owner/repo` -> `owner/repo` */
export function repoSlug(): string | null {
  const match = SITE_CONFIG.githubUrl.match(
    /github\.com\/([^/]+\/[^/]+?)(?:\.git)?\/?$/
  );
  return match ? match[1] : null;
}

export type DispatchResult =
  | { ok: true }
  | { ok: false; status: number; detail: string };

/**
 * Fire a `workflow_dispatch`.
 *
 * `inputs` is omitted entirely when empty rather than sent as `{}`: the probe
 * route must not look like a half-filled confirmation, because the workflow
 * treats a non-empty `tweet_text` as "ingest this record".
 */
export async function dispatchRadarWorkflow(
  inputs?: Record<string, string>
): Promise<DispatchResult> {
  const token = process.env.GITHUB_DISPATCH_TOKEN;
  if (!token) {
    return {
      ok: false,
      status: 503,
      detail:
        "dispatch_not_configured: GITHUB_DISPATCH_TOKEN is not set on this deployment.",
    };
  }

  const repo = repoSlug();
  if (!repo) {
    return { ok: false, status: 500, detail: "repo_unresolved" };
  }

  const body: Record<string, unknown> = {
    // Must be the branch that actually carries the workflow file; a dispatch
    // against a ref without it answers 404.
    ref: process.env.GITHUB_DISPATCH_REF || "main",
  };
  if (inputs && Object.keys(inputs).length > 0) body.inputs = inputs;

  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/actions/workflows/${WORKFLOW_FILE}/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
          "User-Agent": "WhenReset-Dispatch/1.0",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );

    // GitHub answers 204 No Content on a successful dispatch.
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return {
        ok: false,
        status: res.status,
        detail: `dispatch_failed_${res.status}${
          detail ? `:${detail.slice(0, 160)}` : ""
        }`,
      };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      status: 502,
      detail: `dispatch_error:${err instanceof Error ? err.message : "unknown"}`,
    };
  }
}
