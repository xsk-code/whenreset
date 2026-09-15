import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { collectIntervals, median } from "./forecast";
import { ResetItem, StatusStats } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(dateString: string, lang: "en" | "zh" = "en"): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (lang === "zh") {
    if (diffDay > 0) return `${diffDay} 天前`;
    if (diffHour > 0) return `${diffHour} 小时前`;
    if (diffMin > 0) return `${diffMin} 分钟前`;
    return "刚刚";
  }

  if (diffDay > 0) {
    return diffDay === 1 ? "1 day ago" : `${diffDay} days ago`;
  }
  if (diffHour > 0) {
    return diffHour === 1 ? "1 hour ago" : `${diffHour} hours ago`;
  }
  if (diffMin > 0) {
    return diffMin === 1 ? "1 min ago" : `${diffMin} mins ago`;
  }
  return "just now";
}

export function formatUtcTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toUTCString().replace("GMT", "UTC");
}

function round1(value: number): number {
  return Number(value.toFixed(1));
}

/**
 * Dataset statistics for `/api/status`.
 *
 * Two disclosures this function is required to honour:
 *
 * 1. **Never invent a number.** Earlier revisions returned hardcoded `6.9` /
 *    `67.7` for an empty dataset, and floored the drought record at
 *    `Math.max(wait, 67.7)`. Both leaked fabricated values into the public API
 *    and the page, contradicting the product's "no fake data" claim. An empty
 *    or unmeasurable dataset now reports `0`.
 *
 * 2. **One cadence definition.** `median_interval_days` reuses
 *    `collectIntervals()` from `forecast.ts` — the exact function the forecast
 *    is built from — so the number reported by the API can never drift from
 *    the number rendered on the page. `avg_interval_days` is kept as a plain
 *    arithmetic mean (droughts included) because that is what its name says;
 *    it is not used as a stand-in for the median anywhere.
 */
export function calculateStats(resets: ResetItem[]): StatusStats {
  if (!resets || resets.length === 0) {
    return {
      total: 0,
      last_reset_at: new Date().toISOString(),
      days_since_last: 0,
      avg_interval_days: 0,
      median_interval_days: 0,
      longest_wait_days: 0,
    };
  }

  // Sorted descending by announced_at
  const sorted = [...resets].sort(
    (a, b) => new Date(b.announced_at).getTime() - new Date(a.announced_at).getTime()
  );

  const latest = sorted[0];
  const now = Date.now();
  const daysSinceLast = Math.max(
    0,
    round1((now - new Date(latest.announced_at).getTime()) / DAY_MS)
  );

  // Every non-negative gap, droughts included: for a mean and a "longest
  // recorded wait", the outliers are the measurement, not noise.
  const allIntervals: number[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const tCurrent = new Date(sorted[i].announced_at).getTime();
    const tPrevious = new Date(sorted[i + 1].announced_at).getTime();
    const diffDays = (tCurrent - tPrevious) / DAY_MS;
    if (diffDays >= 0) {
      allIntervals.push(diffDays);
    }
  }

  // Shared with the forecast: gaps in (0, 90) days.
  const forecastIntervals = collectIntervals(resets);

  const avgInterval =
    allIntervals.length > 0
      ? round1(allIntervals.reduce((a, b) => a + b, 0) / allIntervals.length)
      : 0;

  const medianInterval =
    forecastIntervals.length > 0 ? round1(median(forecastIntervals)) : 0;

  const longestWait = allIntervals.length > 0 ? round1(Math.max(...allIntervals)) : 0;

  return {
    total: resets.length,
    last_reset_at: latest.announced_at,
    days_since_last: daysSinceLast,
    avg_interval_days: avgInterval,
    median_interval_days: medianInterval,
    // Reported as measured. No floor.
    longest_wait_days: longestWait,
  };
}

export function triggerHaptic(duration = 14) {
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(duration);
    } catch {
      // Ignore vibration errors
    }
  }
}
