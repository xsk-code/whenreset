import { NextResponse } from "next/server";
import fallbackResets from "@/data/fallback-resets.json";
import fallbackScheduled from "@/data/fallback-scheduled.json";
import { ResetItem, ScheduledReset } from "@/lib/types";
import { calculateStats } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/config";

export const runtime = "nodejs";

function formatDateToICS(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export async function GET() {
  const resets = fallbackResets as ResetItem[];
  const scheduled = fallbackScheduled as ScheduledReset | null;
  const stats = calculateStats(resets);

  const now = new Date();
  let startTime: Date;
  let endTime: Date;
  let summary = `[WhenReset] OpenAI Codex Quota Reset`;
  let description = `Estimated AI usage limit reset window based on historical ${stats.avg_interval_days}-day cadence.\nOfficial Tracker: ${SITE_CONFIG.domain}`;

  if (scheduled && scheduled.scheduled_for) {
    startTime = new Date(scheduled.scheduled_for);
    endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour window
    summary = `[WhenReset] Scheduled Codex Reset: ${scheduled.text.slice(0, 50)}...`;
    description = `${scheduled.text}\n\nOfficial Source: ${scheduled.source.url}\nTracker: ${SITE_CONFIG.domain}`;
  } else {
    // Estimate: latest reset + avg_interval_days
    const latestTime = new Date(stats.last_reset_at).getTime();
    const nextMs = latestTime + stats.avg_interval_days * 24 * 60 * 60 * 1000;
    startTime = new Date(Math.max(now.getTime() + 2 * 60 * 60 * 1000, nextMs));
    endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
  }

  const dtStamp = formatDateToICS(now);
  const dtStart = formatDateToICS(startTime);
  const dtEnd = formatDateToICS(endTime);
  const uid = `whenreset-${startTime.getTime()}@whenreset.com`;

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//WhenReset//Quota Reset Radar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:WhenReset - AI Quota Reset Calendar`,
    "X-WR-TIMEZONE:UTC",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary.replace(/\n/g, " ")}`,
    `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
    `URL:${SITE_CONFIG.domain}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Quota Reset expected in 15 minutes",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(icsContent, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="whenreset-schedule.ics"`,
      "Cache-Control": "public, max-age=1800, stale-while-revalidate=3600",
    },
  });
}
