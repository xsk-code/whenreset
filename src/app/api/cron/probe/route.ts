import { NextResponse } from "next/server";
import { dispatchRadarWorkflow } from "@/lib/github-dispatch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * External-scheduler entry point: trigger a radar probe.
 *
 * Why this exists. GitHub Actions' own `schedule` is explicitly best-effort —
 * the docs say queued jobs "may be dropped" under load and promise no
 * execution guarantee. Measured on this repository, a five-minute schedule
 * fired roughly once every 4.3 hours, about 2% of the expected triggers, and
 * the dropped ones leave no trace in the Actions UI. A cron on an external
 * service hits this endpoint on a real 5-minute cadence instead.
 *
 * Auth. `CRON_SECRET`, the same env var `/api/cron/dispatch` uses, so there is
 * one secret to rotate rather than two. Unlike that route, this one **fails
 * closed**: when `CRON_SECRET` is unset it answers 503 instead of running
 * unauthenticated. `/api/cron/dispatch` merely sends a digest, whereas an open
 * endpoint here would let anyone spend the project's Actions minutes at will.
 *
 * Accepts the secret either as `Authorization: Bearer <secret>` or as a `?key=`
 * query parameter, because not every scheduler offers custom headers on its
 * free tier.
 *
 * Writes nothing. A dispatch only starts a read-only probe; the write path
 * still requires a human-confirmed, signed link.
 */

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}

async function handle(request: Request): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      {
        ok: false,
        reason: "not_configured",
        hint: "CRON_SECRET is not set on this deployment; refusing to run unauthenticated.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const auth = request.headers.get("authorization") || "";
  const headerSecret = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const querySecret = new URL(request.url).searchParams.get("key");
  const presented = headerSecret ?? querySecret;

  if (presented !== secret) {
    return NextResponse.json(
      { ok: false, reason: "unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const result = await dispatchRadarWorkflow();
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, reason: result.detail },
      { status: result.status, headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      dispatched: true,
      note: "The radar probe workflow was dispatched. It writes nothing on its own.",
    },
    { status: 202, headers: { "Cache-Control": "no-store" } }
  );
}
