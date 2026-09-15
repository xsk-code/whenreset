import { NextResponse } from "next/server";
import fallbackResets from "@/data/fallback-resets.json";
import { ResetItem } from "@/lib/types";
import { computeForecast, IncidentSignal } from "@/lib/forecast";
import { SITE_CONFIG } from "@/lib/config";
import { hostOf, isFeishuHost, payloadFor } from "@/lib/notify-payload";
import { withFeishuSign } from "@/lib/feishu-sign";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Scheduled digest. Vercel Cron hits this once a day and it forwards the
 * current forecast to whatever channels the deployment owner configured via
 * env vars. Per-user pushes are handled client-side by useAlertGuardian.
 *
 * Env vars:
 *   CRON_SECRET            - required bearer token for the request
 *   ADMIN_BARK_KEY         - Bark key that receives the digest
 *   ADMIN_WEBHOOK_URL      - WeCom/Feishu/Discord/Slack webhook for the digest
 *   FEISHU_WEBHOOK_SECRET  - optional; signs the request when ADMIN_WEBHOOK_URL
 *                            points at a Feishu bot with signature verification
 *
 * The payload shape comes from `@/lib/notify-payload` — the same module
 * `/api/push` uses. This route used to hardcode WeCom's `{msgtype,text}` shape
 * for any destination, so a Feishu webhook here silently failed to deliver.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization") || "";
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const incident = await fetchIncident();
  const resets = fallbackResets as ResetItem[];
  const forecast = computeForecast({ resets, incident });

  const summary = {
    likelihood: forecast.likelihood,
    scheduled: forecast.scheduled,
    medianIntervalDays: Number(forecast.medianIntervalDays.toFixed(1)),
    daysSinceLast: Number(forecast.daysSinceLast.toFixed(1)),
    targetDate: forecast.targetDate.toISOString(),
    incidentBoost: forecast.incidentBoost,
  };

  const results: Record<string, unknown> = {};

  const title = `[WhenReset] Daily digest: ${forecast.likelihood}% reset likelihood`;
  const body = [
    `Predicted window: ${forecast.windowStart.toISOString()} -> ${forecast.windowEnd.toISOString()}`,
    `Median cadence ${summary.medianIntervalDays}d over ${forecast.sampleSize} intervals`,
    `${summary.daysSinceLast}d elapsed since the last official drop`,
    `Incident contribution: +${forecast.incidentBoost}%`,
    SITE_CONFIG.domain,
  ].join("\n");

  const barkKey = process.env.ADMIN_BARK_KEY;
  if (barkKey) {
    try {
      const res = await fetch(
        `https://api.day.app/${barkKey}/${encodeURIComponent(title)}/${encodeURIComponent(
          body
        )}?level=timeSensitive`,
        { method: "GET" }
      );
      results.bark = res.status;
    } catch (err) {
      results.bark = err instanceof Error ? err.message : "failed";
    }
  }

  const webhook = process.env.ADMIN_WEBHOOK_URL;
  if (webhook) {
    try {
      const host = hostOf(webhook);
      results.webhookTarget = host ?? "unparseable-url";

      let payload = payloadFor(host ?? "", title, body);
      if (host && isFeishuHost(host)) {
        payload = await withFeishuSign(payload, process.env.FEISHU_WEBHOOK_SECRET);
      }

      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      results.webhook = res.status;

      // Feishu answers HTTP 200 even when it rejects the request
      // (19021 = signature or timestamp rejected). Reporting only `res.status`
      // would call that a success, so the business code is surfaced as well.
      if (host && isFeishuHost(host)) {
        const echoed = (await res.json().catch(() => null)) as { code?: number } | null;
        results.webhookCode = echoed?.code ?? "unreadable-response";
      }
    } catch (err) {
      results.webhook = err instanceof Error ? err.message : "failed";
    }
  }

  if (!barkKey && !webhook) {
    results.note = "no admin channel configured (ADMIN_BARK_KEY / ADMIN_WEBHOOK_URL)";
  }

  return NextResponse.json({ ok: true, summary, results }, { status: 200 });
}

async function fetchIncident(): Promise<IncidentSignal | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch("https://status.openai.com/api/v2/summary.json", {
      signal: controller.signal,
      next: { revalidate: 600 },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const json = await res.json();
    const incidents = Array.isArray(json?.incidents) ? json.incidents.slice(0, 10) : [];
    const cutoff = Date.now() - 48 * 60 * 60 * 1000;
    const active = incidents.filter((inc: Record<string, string>) => {
      const started = new Date(inc.started_at || inc.created_at || 0).getTime();
      return started >= cutoff;
    });
    return {
      total_active: active.length,
      active_incidents: active.map((inc: Record<string, string>) => ({
        id: inc.id || "unknown",
        name: inc.name || "OpenAI incident",
        impact: inc.impact || "unknown",
        started_at: inc.started_at || inc.created_at || "",
        updated_at: inc.updated_at || "",
        url: inc.shortlink || "https://status.openai.com",
      })),
      degraded_components: (Array.isArray(json?.components) ? json.components : [])
        .filter((c: Record<string, string>) => c.status && c.status !== "operational")
        .map((c: Record<string, string>) => c.name || "unknown"),
      recent_incidents_48h: active.length,
      status_description: json?.status?.description ?? "Unknown",
      updated_at: new Date().toISOString(),
      is_fallback: false,
    };
  } catch {
    return null;
  }
}
