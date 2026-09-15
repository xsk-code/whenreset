/**
 * src/app/api/confirm/route.ts
 *
 * The no-login confirmation endpoint.
 *
 * Background: the write path into the dataset is deliberately human-gated
 * (`scripts/sync-tibo.mjs --add-tweet`), and its original trigger was a GitHub
 * `workflow_dispatch` — which requires being logged into GitHub. The person who
 * has to confirm does not live in GitHub, and the moment a real reset lands is
 * exactly the moment the site needs the freshest data. So confirmation moved
 * here.
 *
 * Design constraints, all of them load-bearing:
 *
 * - **GET never writes.** Its only job is to describe the token. Chat apps,
 *   mail clients and security scanners all prefetch links with GET; if GET were
 *   the write, every prefetcher would auto-confirm every notification.
 * - **POST takes no free input.** The body carries the signed token and nothing
 *   else. The record is replayed from inside the token, so a leaked link can
 *   only inject a record upstream had already surfaced.
 * - **The dataset is the ledger.** There is no KV store in this project (by
 *   design). "Has this already been ingested?" is answered by looking for the
 *   record id in `src/data/fallback-resets.json`. The ingest script is
 *   independently idempotent too, so a double dispatch cannot double-write.
 * - **Missing keys degrade honestly.** With no `CONFIRM_SECRET` or
 *   `GITHUB_DISPATCH_TOKEN`, this returns `configured: false` rather than
 *   erroring, matching the convention `/api/subscribe` already set.
 */

import { NextResponse } from "next/server";
import fallbackResets from "@/data/fallback-resets.json";
import { ResetItem } from "@/lib/types";
import { SITE_CONFIG } from "@/lib/config";
import {
  isConfirmConfigured,
  verifyConfirmToken,
} from "@/lib/confirm-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WORKFLOW_FILE = "sync-radar.yml";

function isIngested(id: string): boolean {
  return (fallbackResets as ResetItem[]).some((item) => String(item.id) === id);
}

/** `https://github.com/owner/repo` -> `owner/repo` */
function repoSlug(): string | null {
  const match = SITE_CONFIG.githubUrl.match(
    /github\.com\/([^/]+\/[^/]+?)(?:\.git)?\/?$/
  );
  return match ? match[1] : null;
}

function wantsHtml(request: Request): boolean {
  return (request.headers.get("accept") || "").includes("text/html");
}

async function readToken(request: Request): Promise<string | null> {
  const contentType = request.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      const body = (await request.json()) as { t?: unknown };
      return typeof body?.t === "string" ? body.t : null;
    }
    if (contentType.includes("form")) {
      const value = (await request.formData()).get("t");
      return typeof value === "string" ? value : null;
    }
  } catch {
    return null;
  }
  return new URL(request.url).searchParams.get("t");
}

/** Read-only. Describes a token; never writes, never dispatches. */
export async function GET(request: Request) {
  if (!isConfirmConfigured()) {
    return NextResponse.json(
      {
        configured: false,
        reason: "not_configured",
        hint: "CONFIRM_SECRET is not set on this deployment.",
      },
      { status: 200 }
    );
  }

  const token = new URL(request.url).searchParams.get("t");
  const result = await verifyConfirmToken(token);

  if (!result.ok) {
    return NextResponse.json(
      { configured: true, valid: false, reason: result.reason },
      { status: 200 }
    );
  }

  return NextResponse.json(
    {
      configured: true,
      valid: true,
      already_ingested: isIngested(result.payload.id),
      record: {
        id: result.payload.id,
        reset_type: result.payload.type,
        announced_at: result.payload.announced_at,
        text: result.payload.text,
        source_url: result.payload.url,
      },
    },
    { status: 200 }
  );
}

export async function POST(request: Request) {
  const token = await readToken(request);
  const html = wantsHtml(request);

  const fail = (reason: string, status = 200) =>
    html && token
      ? NextResponse.redirect(
          new URL(
            `/confirm?t=${encodeURIComponent(token)}&state=${reason}`,
            request.url
          ),
          303
        )
      : NextResponse.json({ configured: true, ok: false, reason }, { status });

  if (!isConfirmConfigured()) {
    return NextResponse.json(
      {
        configured: false,
        ok: false,
        reason: "not_configured",
        hint: "CONFIRM_SECRET is not set on this deployment.",
      },
      { status: 200 }
    );
  }

  const dispatchToken = process.env.GITHUB_DISPATCH_TOKEN;
  if (!dispatchToken) {
    return NextResponse.json(
      {
        configured: false,
        ok: false,
        reason: "dispatch_not_configured",
        hint: "GITHUB_DISPATCH_TOKEN is not set on this deployment.",
      },
      { status: 200 }
    );
  }

  const result = await verifyConfirmToken(token);
  if (!result.ok) return fail(result.reason);

  const { payload } = result;

  // Already in the dataset: report success without dispatching again.
  if (isIngested(payload.id)) {
    return html
      ? NextResponse.redirect(
          new URL("/confirm?t=" + encodeURIComponent(token!) + "&state=already", request.url),
          303
        )
      : NextResponse.json(
          {
            configured: true,
            ok: true,
            already_ingested: true,
            id: payload.id,
            note: "This record is already in the dataset. Nothing was dispatched.",
          },
          { status: 200 }
        );
  }

  const repo = repoSlug();
  if (!repo) {
    return fail("repo_unresolved", 500);
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/actions/workflows/${WORKFLOW_FILE}/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${dispatchToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
          "User-Agent": "WhenReset-Confirm/1.0",
        },
        body: JSON.stringify({
          // Must be the branch that actually carries the workflow file; a
          // dispatch against a ref without it answers 404.
          ref: process.env.GITHUB_DISPATCH_REF || "main",
          inputs: {
            tweet_text: payload.text,
            tweet_url: payload.url,
            tweet_at: payload.announced_at,
            tweet_type: payload.type,
            tweet_id: payload.id,
          },
        }),
      }
    );

    // GitHub answers 204 No Content on a successful dispatch.
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return fail(
        `dispatch_failed_${res.status}${detail ? `:${detail.slice(0, 160)}` : ""}`,
        res.status
      );
    }
  } catch (err) {
    return fail(
      `dispatch_error:${err instanceof Error ? err.message : "unknown"}`,
      502
    );
  }

  return html
    ? NextResponse.redirect(
        new URL("/confirm?t=" + encodeURIComponent(token!) + "&state=dispatched", request.url),
        303
      )
    : NextResponse.json(
        {
          configured: true,
          ok: true,
          dispatched: true,
          id: payload.id,
          note: "The ingest workflow was dispatched. The dataset updates when it finishes.",
        },
        { status: 200 }
      );
}
