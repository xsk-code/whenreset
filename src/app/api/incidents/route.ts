import { NextResponse } from "next/server";
import { IncidentItem, IncidentSignal } from "@/lib/forecast";

export const runtime = "nodejs";
export const revalidate = 300;

const UPSTREAM = "https://status.openai.com/api/v2/summary.json";

interface SummaryComponent {
  name?: string;
  status?: string;
}

interface SummaryIncident {
  id?: string;
  name?: string;
  impact?: string;
  created_at?: string;
  started_at?: string;
  updated_at?: string;
  resolved_at?: string;
  shortlink?: string;
}

function buildFallback(reason: string): IncidentSignal {
  return {
    total_active: 0,
    active_incidents: [],
    degraded_components: [],
    recent_incidents_48h: 0,
    status_description: reason,
    updated_at: new Date().toISOString(),
    is_fallback: true,
  };
}

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(UPSTREAM, {
      signal: controller.signal,
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json(
        { data: buildFallback(`Upstream returned ${res.status}`), meta: { generated_at: new Date().toISOString() } },
        { status: 200, headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
      );
    }

    const json = await res.json();
    const nowMs = Date.now();
    const fortyEightHoursAgo = nowMs - 48 * 60 * 60 * 1000;

    const incidents: SummaryIncident[] = Array.isArray(json?.incidents) ? json.incidents : [];

    const mapped = incidents.slice(0, 20).map<IncidentItem>((inc) => ({
      id: inc.id ?? "unknown",
      name: inc.name ?? "OpenAI service incident",
      impact: inc.impact ?? "unknown",
      started_at: inc.started_at ?? inc.created_at ?? "",
      updated_at: inc.updated_at ?? "",
      url: inc.shortlink ?? "https://status.openai.com",
    }));

    const activeIncidents = mapped
      .filter((inc) => {
        const started = new Date(inc.started_at).getTime();
        if (Number.isNaN(started)) return false;
        return started >= fortyEightHoursAgo;
      })
      .slice(0, 5);

    const recentCount = mapped.filter((inc) => {
      const started = new Date(inc.started_at).getTime();
      return !Number.isNaN(started) && started >= fortyEightHoursAgo;
    }).length;

    const components: SummaryComponent[] = Array.isArray(json?.components)
      ? json.components
      : [];
    const degradedComponents = components
      .filter((c) => c.status && c.status !== "operational")
      .map((c) => c.name ?? "unknown")
      .slice(0, 8);

    const payload: IncidentSignal = {
      total_active: activeIncidents.length,
      active_incidents: activeIncidents,
      degraded_components: degradedComponents,
      recent_incidents_48h: recentCount,
      status_description: json?.status?.description ?? "Unknown",
      updated_at: new Date().toISOString(),
      is_fallback: false,
    };

    return NextResponse.json(
      { data: payload, meta: { generated_at: payload.updated_at, is_fallback: false } },
      { status: 200, headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
    );
  } catch (err) {
    console.warn("[/api/incidents] Upstream unreachable, returning neutral signal", err);
    const data = buildFallback("Upstream unreachable");
    return NextResponse.json(
      { data, meta: { generated_at: data.updated_at, is_fallback: true } },
      { status: 200, headers: { "Cache-Control": "public, s-maxage=60" } }
    );
  }
}
