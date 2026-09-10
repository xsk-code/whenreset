import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ResetItem, StatusStats } from "./types";

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

export function calculateStats(resets: ResetItem[]): StatusStats {
  if (!resets || resets.length === 0) {
    return {
      total: 0,
      last_reset_at: new Date().toISOString(),
      days_since_last: 0,
      avg_interval_days: 6.9,
      longest_wait_days: 67.7,
    };
  }

  // Sorted descending by announced_at
  const sorted = [...resets].sort(
    (a, b) => new Date(b.announced_at).getTime() - new Date(a.announced_at).getTime()
  );

  const latest = sorted[0];
  const now = new Date().getTime();
  const daysSinceLast = Math.max(
    0,
    Number(((now - new Date(latest.announced_at).getTime()) / (1000 * 60 * 60 * 24)).toFixed(1))
  );

  // Intervals between consecutive resets
  const intervals: number[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const tCurrent = new Date(sorted[i].announced_at).getTime();
    const tPrevious = new Date(sorted[i + 1].announced_at).getTime();
    const diffDays = (tCurrent - tPrevious) / (1000 * 60 * 60 * 24);
    if (diffDays >= 0) {
      intervals.push(diffDays);
    }
  }

  const avgInterval =
    intervals.length > 0
      ? Number((intervals.reduce((a, b) => a + b, 0) / intervals.length).toFixed(1))
      : 6.9;

  const longestWait =
    intervals.length > 0
      ? Number(Math.max(...intervals).toFixed(1))
      : 67.7;

  return {
    total: resets.length,
    last_reset_at: latest.announced_at,
    days_since_last: daysSinceLast,
    avg_interval_days: avgInterval,
    longest_wait_days: Math.max(longestWait, 67.7),
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

/**
 * 8-bit retro Mario coin sound generated using Web Audio API square waves
 */
export function playMarioCoinSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";

    // Mario coin sound is two fast notes: B5 (987.77 Hz) to E6 (1318.51 Hz)
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(987.77, now);
    osc.frequency.setValueAtTime(1318.51, now + 0.08);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  } catch {
    // Ignore audio context errors
  }
}

/**
 * 8-bit Mario 1-UP / Powerup sound
 */
export function playMarioPowerupSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const notes = [330, 392, 659, 523, 587, 784]; // E4, G4, E5, C5, D5, G5
    const noteDuration = 0.06;
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, now + idx * noteDuration);

      gain.gain.setValueAtTime(0.12, now + idx * noteDuration);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (idx + 1) * noteDuration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * noteDuration);
      osc.stop(now + (idx + 1) * noteDuration);
    });
  } catch {
    // Ignore
  }
}

/**
 * Bowser castle probability calculation based on elapsed days vs average cadence
 */
export function calculateWatchProbability(daysSinceLast: number, avgInterval: number): number {
  if (avgInterval <= 0) return 50;
  // Approaching the average cadence yields ~75% chance
  const raw = Math.round((daysSinceLast / avgInterval) * 75);
  return Math.min(99, Math.max(10, raw));
}
