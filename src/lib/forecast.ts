import { ResetItem, ScheduledReset, StatusStats } from "./types";

export type Lang = "en" | "zh";

export interface IncidentItem {
  id: string;
  name: string;
  impact: string;
  started_at: string;
  updated_at: string;
  url: string;
}

export interface IncidentSignal {
  total_active: number;
  active_incidents: IncidentItem[];
  degraded_components: string[];
  recent_incidents_48h: number;
  status_description: string;
  updated_at: string;
  is_fallback: boolean;
}

export const EMPTY_INCIDENT_SIGNAL: IncidentSignal = {
  total_active: 0,
  active_incidents: [],
  degraded_components: [],
  recent_incidents_48h: 0,
  status_description: "Unavailable",
  updated_at: "",
  is_fallback: true,
};

export interface BreakdownItem {
  key: string;
  labelEn: string;
  labelZh: string;
  value: string;
  deltaLabel?: string;
}

export interface ForecastResult {
  likelihood: number;
  scheduled: boolean;
  confidence: "low" | "medium" | "high";
  sampleSize: number;
  medianIntervalDays: number;
  daysSinceLast: number;
  cooldownRatio: number;
  incidentBoost: number;
  targetDate: Date;
  windowStart: Date;
  windowEnd: Date;
  breakdown: BreakdownItem[];
}

const DEFAULT_MEDIAN_DAYS = 3.3;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/**
 * Recent spacing between consecutive announces, oldest-last.
 * Used for the median cadence instead of a plain average so a single
 * outlier (e.g. the 67.7d drought) cannot skew the whole forecast.
 */
export function collectIntervals(resets: ResetItem[]): number[] {
  const sorted = [...resets].sort(
    (a, b) => new Date(b.announced_at).getTime() - new Date(a.announced_at).getTime()
  );

  const intervals: number[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const diff =
      (new Date(sorted[i].announced_at).getTime() -
        new Date(sorted[i + 1].announced_at).getTime()) /
      DAY_MS;
    if (diff > 0 && diff < 90) {
      intervals.push(diff);
    }
  }
  return intervals;
}

export function median(values: number[]): number {
  if (values.length === 0) return DEFAULT_MEDIAN_DAYS;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Incident-aware cooldown model.
 *
 * likelihood = base(ratio) + incidentBoost, capped at 97%.
 * base(ratio) is a saturating exponential so the number never claims
 * certainty, and every contributing term is surfaced in `breakdown`
 * so the UI can show the provenance of the number.
 */
export function computeForecast(params: {
  resets: ResetItem[];
  stats?: StatusStats | null;
  scheduled?: ScheduledReset | null;
  incident?: IncidentSignal | null;
  now?: Date;
}): ForecastResult {
  const { resets, stats, scheduled, incident } = params;
  const now = params.now ?? new Date();

  const intervals = collectIntervals(resets ?? []);
  const sampleSize = intervals.length;
  // With no measurable intervals, fall back to the median reported by
  // /api/status — never to `avg_interval_days`, which is an arithmetic mean
  // over a different interval window and would silently change the model's
  // cadence basis (6.9d vs the 3.0d median) whenever the dataset was thin.
  const medianIntervalDays =
    sampleSize > 0
      ? median(intervals)
      : stats?.median_interval_days || DEFAULT_MEDIAN_DAYS;

  const lastResetAt =
    stats?.last_reset_at ??
    (resets && resets[0] ? resets[0].announced_at : now.toISOString());
  const daysSinceLast = Math.max(
    0,
    (now.getTime() - new Date(lastResetAt).getTime()) / DAY_MS
  );

  const cooldownRatio = medianIntervalDays > 0 ? daysSinceLast / medianIntervalDays : 0;
  const baseLikelihood = Math.round(92 * (1 - Math.exp(-1.6 * cooldownRatio)));

  const activeCount = incident?.total_active ?? 0;
  const degradedCount = incident?.degraded_components?.length ?? 0;
  const recentCount = incident?.recent_incidents_48h ?? 0;

  let incidentBoost = 0;
  if (activeCount >= 2) incidentBoost += 12;
  else if (activeCount === 1) incidentBoost += 8;
  if (recentCount >= 1 && activeCount === 0) incidentBoost += 5;
  if (degradedCount >= 1) incidentBoost += 3;
  incidentBoost = Math.min(15, incidentBoost);

  // A scheduled reset only counts while it is still in the future; once its
  // timestamp passes it must not keep pinning likelihood at 100%.
  const scheduledTime = scheduled?.scheduled_for
    ? new Date(scheduled.scheduled_for).getTime()
    : 0;
  const isScheduled = Boolean(scheduled?.scheduled_for) && scheduledTime > now.getTime();

  const rawLikelihood = isScheduled
    ? 100
    : Math.min(97, Math.max(5, Math.round(baseLikelihood + incidentBoost)));

  const baseDate = isScheduled && scheduled ? new Date(scheduled.scheduled_for) : null;
  const targetDate =
    baseDate ??
    new Date(new Date(lastResetAt).getTime() + medianIntervalDays * DAY_MS);

  const windowHalf = isScheduled ? HOUR_MS : 3 * HOUR_MS;
  const windowStart = new Date(targetDate.getTime() - windowHalf);
  const windowEnd = new Date(targetDate.getTime() + windowHalf);

  const confidence: ForecastResult["confidence"] =
    sampleSize >= 8 ? "high" : sampleSize >= 4 ? "medium" : "low";

  const breakdown: BreakdownItem[] = [
    {
      key: "cadence",
      labelEn: "Median historical cadence",
      labelZh: "历史周期中位数",
      value: `${medianIntervalDays.toFixed(1)}d`,
      deltaLabel: `${sampleSize} samples`,
    },
    {
      key: "cooldown",
      labelEn: "Cooldown decay",
      labelZh: "冷却时间衰减",
      value: `${cooldownRatio.toFixed(2)}x`,
      deltaLabel: `+${baseLikelihood}%`,
    },
    {
      key: "incident",
      labelEn: "OpenAI incident signals",
      labelZh: "官方服务故障信号",
      value:
        incident?.is_fallback === false
          ? `${activeCount} active / ${recentCount} recent`
          : "unavailable",
      deltaLabel: incidentBoost > 0 ? `+${incidentBoost}%` : "+0%",
    },
  ];

  if (isScheduled && scheduled) {
    breakdown.push({
      key: "scheduled",
      labelEn: "Official scheduled reset",
      labelZh: "官方公告预定重置",
      value: new Date(scheduled.scheduled_for).toISOString().slice(0, 16).replace("T", " "),
      deltaLabel: "→ 100%",
    });
  }

  return {
    likelihood: rawLikelihood,
    scheduled: isScheduled,
    confidence,
    sampleSize,
    medianIntervalDays,
    daysSinceLast,
    cooldownRatio,
    incidentBoost,
    targetDate,
    windowStart,
    windowEnd,
    breakdown,
  };
}
