import { NextResponse } from "next/server";
import fallbackResets from "@/data/fallback-resets.json";
import fallbackScheduled from "@/data/fallback-scheduled.json";
import { ResetItem, ScheduledReset } from "@/lib/types";
import { computeForecast, IncidentSignal } from "@/lib/forecast";
import { SITE_CONFIG } from "@/lib/config";

export const runtime = "nodejs";
export const revalidate = 1800;

function formatDateToICS(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/** Fold lines longer than 75 octets per RFC 5545, otherwise clients reject the feed. */
function fold(line: string): string {
  const chunks: string[] = [];
  let rest = line;
  while (rest.length > 73) {
    chunks.push(rest.slice(0, 73));
    rest = ` ${rest.slice(73)}`;
  }
  chunks.push(rest);
  return chunks.join("\r\n");
}

async function loadIncidentSignal(): Promise<IncidentSignal | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${SITE_CONFIG.domain.replace(/\/$/, "")}/api/incidents`, {
      signal: controller.signal,
      next: { revalidate: 600 },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data as IncidentSignal) ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  const resets = fallbackResets as ResetItem[];
  const scheduled = (fallbackScheduled as ScheduledReset | null) ?? null;
  const incident = await loadIncidentSignal();

  const forecast = computeForecast({ resets, scheduled, incident });

  const domain = SITE_CONFIG.domain.replace(/\/$/, "");
  const calendarHost = new URL(domain).hostname;
  const now = new Date();

  // If the historical estimate already elapsed, the drop can land any minute.
  // Publishing a past event would be useless, so we anchor the reminder to the
  // immediate future and say exactly that in the description.
  const overdue = forecast.targetDate.getTime() <= now.getTime();
  const windowStart = overdue ? new Date(now.getTime() + 15 * 60 * 1000) : forecast.windowStart;
  const windowEnd = overdue ? new Date(now.getTime() + 3 * 60 * 60 * 1000) : forecast.windowEnd;

  const summary = forecast.scheduled
    ? `[${SITE_CONFIG.name}] Scheduled Codex quota reset`
    : overdue
    ? `[${SITE_CONFIG.name}] Reset window overdue (${forecast.likelihood}%)`
    : `[${SITE_CONFIG.name}] Estimated Codex quota reset (${forecast.likelihood}%)`;

  const description = [
    forecast.scheduled
      ? "OpenAI has published an official reset time."
      : overdue
      ? `The ${forecast.medianIntervalDays.toFixed(
          1
        )}-day median window already elapsed ${forecast.daysSinceLast.toFixed(
          1
        )} days in, so this event marks the point from which a drop can land at any moment.`
      : `Forecast only. Derived from the ${forecast.medianIntervalDays.toFixed(
          1
        )}-day median of ${forecast.sampleSize} recorded drops plus a cooldown-decay curve.`,
    forecast.incidentBoost > 0
      ? `Includes +${forecast.incidentBoost}% from live OpenAI incident signals.`
      : "No active OpenAI incidents contributed at generation time.",
    "OpenAI alone decides when quotas reset; treat this as an estimate.",
    `Tracker: ${domain}`,
  ].join("\n");

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${SITE_CONFIG.name}//Quota Reset Radar//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    fold(`X-WR-CALNAME:${SITE_CONFIG.name} - AI Quota Reset Calendar`),
    "X-WR-TIMEZONE:UTC",
    "REFRESH-INTERVAL;VALUE=DURATION:PT30M",
    "BEGIN:VEVENT",
    `UID:next-reset-${windowStart.getTime()}@${calendarHost}`,
    `DTSTAMP:${formatDateToICS(now)}`,
    `DTSTART:${formatDateToICS(windowStart)}`,
    `DTEND:${formatDateToICS(windowEnd)}`,
    fold(`SUMMARY:${escapeText(summary)}`),
    fold(`DESCRIPTION:${escapeText(description)}`),
    `URL:${domain}`,
    forecast.scheduled ? "STATUS:CONFIRMED" : "STATUS:TENTATIVE",
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Predicted quota reset window opening in 15 minutes",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(icsContent, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${calendarHost}-reset-schedule.ics"`,
      "Cache-Control": "public, max-age=1800, stale-while-revalidate=3600",
    },
  });
}
