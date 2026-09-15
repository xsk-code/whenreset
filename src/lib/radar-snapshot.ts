import fallbackResets from "@/data/fallback-resets.json";
import fallbackScheduled from "@/data/fallback-scheduled.json";
import {
  EMPTY_INCIDENT_SIGNAL,
  ForecastResult,
  IncidentItem,
  IncidentSignal,
  computeForecast,
} from "./forecast";
import {
  ActiveWatch,
  ResetItem,
  ScheduledReset,
  StatusStats,
  StatusResponse,
} from "./types";
import { calculateStats } from "./utils";

/**
 * Single source of truth for reading the radar.
 *
 * Every consumer (`/api/status`, `/api/badge`, and later `/api/mcp`) must go
 * through here so that a number rendered in a README badge can never disagree
 * with the number on the homepage.
 *
 * Two things live here and only here:
 *   1. `reconcileResets()` — the arbitration rule between the local dataset and
 *      the upstream proxy.
 *   2. `loadRadarSnapshot()` — the assembled reading every consumer reads from.
 */

export const UPSTREAM_STATUS_URL = "https://codex-resets.com/api/v1/status";
export const UPSTREAM_RESETS_URL = "https://codex-resets.com/api/v1/resets";
export const INCIDENTS_URL = "https://status.openai.com/api/v2/summary.json";

export type DataOrigin = "local" | "upstream" | "none";

const FALLBACK_LATEST_RESET: ResetItem = {
  id: "fallback-latest",
  reset_type: "banked",
  announced_at: new Date().toISOString(),
  text: "Codex usage limits has been reset.",
  source: {
    type: "x_post",
    author: "thsottiaux",
    url: "https://x.com/thsottiaux",
  },
};

export interface Reconciliation {
  /** Deduplicated union, newest announcement first. */
  resets: ResetItem[];
  latestReset: ResetItem | null;
  /** Where the winning latest reset came from. */
  origin: DataOrigin;
  /** True when the local dataset holds a newer latest reset than upstream. */
  localLatestWins: boolean;
  /** Records present in both sources whose timestamps disagreed. */
  conflicts: number;
}

function timeOf(item: ResetItem | null | undefined): number {
  if (!item?.announced_at) return Number.NaN;
  return new Date(item.announced_at).getTime();
}

/**
 * Arbitration rule: when the local dataset and the upstream proxy disagree
 * about the same record, the **later `announced_at` wins**. No source is given
 * priority by rank.
 *
 * Rationale: the website must never prefer stale-but-owned data over fresher
 * data. Local is refreshed on a 5 minute cron, upstream on a 10 second cache,
 * so a blanket "local first" rule would make the site slower and staler. This
 * is why the rule is "newest wins" rather than "own source wins".
 *
 * On an exact tie the upstream copy is kept, which preserves the behaviour the
 * site had before this module existed.
 */
export function reconcileResets(
  local: ResetItem[],
  upstream: ResetItem[] | null
): Reconciliation {
  const byId = new Map<string, ResetItem>();
  const order: string[] = [];

  for (const item of local ?? []) {
    if (!item?.id) continue;
    const id = String(item.id);
    if (!byId.has(id)) order.push(id);
    byId.set(id, item);
  }

  let conflicts = 0;

  for (const item of upstream ?? []) {
    if (!item?.id) continue;
    const id = String(item.id);
    const existing = byId.get(id);

    if (!existing) {
      order.push(id);
      byId.set(id, item);
      continue;
    }

    const incomingTime = timeOf(item);
    const existingTime = timeOf(existing);
    const differs =
      Number.isFinite(incomingTime) &&
      Number.isFinite(existingTime) &&
      incomingTime !== existingTime;

    if (differs) conflicts += 1;

    // Later timestamp wins; on a tie keep the upstream copy (status quo).
    if (!Number.isFinite(existingTime) || incomingTime >= existingTime) {
      byId.set(id, item);
    }
  }

  const resets = order
    .map((id) => byId.get(id)!)
    .sort((a, b) => timeOf(b) - timeOf(a));

  const localLatest = latestByTime(local);
  const upstreamLatest = latestByTime(upstream);
  const latestReset = resets[0] ?? null;

  const localTime = timeOf(localLatest);
  const upstreamTime = timeOf(upstreamLatest);
  const localLatestWins =
    upstream !== null &&
    Number.isFinite(localTime) &&
    Number.isFinite(upstreamTime) &&
    localTime > upstreamTime;

  return {
    resets,
    latestReset,
    origin: upstream !== null ? "upstream" : "local",
    localLatestWins,
    conflicts,
  };
}

function latestByTime(items: ResetItem[] | null | undefined): ResetItem | null {
  let best: ResetItem | null = null;
  for (const item of items ?? []) {
    if (!Number.isFinite(timeOf(item))) continue;
    if (!best || timeOf(item) > timeOf(best)) best = item;
  }
  return best;
}

export interface RadarSnapshot {
  resets: ResetItem[];
  latestReset: ResetItem;
  scheduledReset: ScheduledReset | null;
  activeWatch: ActiveWatch | null;
  stats: StatusStats;
  incident: IncidentSignal;
  /** The one forecast every surface must render. */
  forecast: ForecastResult;
  meta: {
    resets_origin: DataOrigin;
    stats_origin: DataOrigin;
    upstream_status_ok: boolean;
    incident_ok: boolean;
    conflicts: number;
    generated_at: string;
  };
}

async function fetchJson<T>(
  url: string,
  { timeoutMs, revalidate }: { timeoutMs: number; revalidate: number }
): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate },
      headers: {
        "User-Agent": "WhenReset-Radar/1.0",
        Accept: "application/json",
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function fetchIncidentSignal(): Promise<IncidentSignal> {
  const json = await fetchJson<{
    incidents?: Array<Record<string, string | undefined>>;
    components?: Array<{ name?: string; status?: string }>;
    status?: { description?: string };
  }>(INCIDENTS_URL, { timeoutMs: 5000, revalidate: 300 });

  if (!json) return EMPTY_INCIDENT_SIGNAL;

  const cutoff = Date.now() - 48 * 60 * 60 * 1000;

  const mapped: IncidentItem[] = (Array.isArray(json.incidents) ? json.incidents : [])
    .slice(0, 20)
    .map((inc) => ({
      id: inc.id ?? "unknown",
      name: inc.name ?? "OpenAI service incident",
      impact: inc.impact ?? "unknown",
      started_at: inc.started_at ?? inc.created_at ?? "",
      updated_at: inc.updated_at ?? "",
      url: inc.shortlink ?? "https://status.openai.com",
    }));

  const recent = mapped.filter((inc) => {
    const started = new Date(inc.started_at).getTime();
    return !Number.isNaN(started) && started >= cutoff;
  });

  const degraded = (Array.isArray(json.components) ? json.components : [])
    .filter((c) => c.status && c.status !== "operational")
    .map((c) => c.name ?? "unknown")
    .slice(0, 8);

  return {
    total_active: recent.slice(0, 5).length,
    active_incidents: recent.slice(0, 5),
    degraded_components: degraded,
    recent_incidents_48h: recent.length,
    status_description: json.status?.description ?? "Unknown",
    updated_at: new Date().toISOString(),
    is_fallback: false,
  };
}

/**
 * Assemble one reading from the local dataset, the upstream proxy and the
 * public OpenAI status feed. Never throws: a dead upstream degrades to the
 * local dataset rather than blanking a surface.
 */
export async function loadRadarSnapshot(): Promise<RadarSnapshot> {
  const localResets = (fallbackResets as ResetItem[]) ?? [];
  const localScheduled = (fallbackScheduled as ScheduledReset) ?? null;

  const [statusPayload, upstreamResets, incident] = await Promise.all([
    fetchJson<StatusResponse>(UPSTREAM_STATUS_URL, { timeoutMs: 4000, revalidate: 10 }),
    fetchJson<{ data?: ResetItem[] } | ResetItem[]>(UPSTREAM_RESETS_URL, {
      timeoutMs: 4000,
      revalidate: 10,
    }),
    fetchIncidentSignal(),
  ]);

  const upstreamList: ResetItem[] | null = Array.isArray(upstreamResets)
    ? upstreamResets
    : Array.isArray(upstreamResets?.data)
    ? upstreamResets.data
    : null;

  const reconciliation = reconcileResets(localResets, upstreamList);
  const resets = reconciliation.resets;
  const latestReset = reconciliation.latestReset ?? FALLBACK_LATEST_RESET;

  const upstreamOk = Boolean(statusPayload?.data);

  // Prefer the upstream stats object unless the local dataset holds a newer
  // latest reset — the same precedence this endpoint had before the refactor.
  let stats: StatusStats;
  let statsOrigin: DataOrigin;
  if (upstreamOk && statusPayload?.data?.stats && !reconciliation.localLatestWins) {
    stats = statusPayload.data.stats;
    statsOrigin = "upstream";
  } else {
    stats = calculateStats(resets.length > 0 ? resets : localResets);
    statsOrigin = "local";
  }

  const scheduledReset = upstreamOk
    ? statusPayload?.data?.scheduled_reset ?? null
    : localScheduled;
  const activeWatch = upstreamOk ? statusPayload?.data?.active_watch ?? null : null;

  const forecast = computeForecast({
    resets,
    stats,
    scheduled: scheduledReset,
    incident,
  });

  return {
    resets,
    latestReset,
    scheduledReset,
    activeWatch,
    stats,
    incident,
    forecast,
    meta: {
      resets_origin: reconciliation.origin,
      stats_origin: statsOrigin,
      upstream_status_ok: upstreamOk,
      incident_ok: !incident.is_fallback,
      conflicts: reconciliation.conflicts,
      generated_at: new Date().toISOString(),
    },
  };
}
