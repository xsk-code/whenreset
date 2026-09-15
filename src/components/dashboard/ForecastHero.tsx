"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ResetItem } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";
import { ForecastResult } from "@/lib/forecast";
import {
  formatZoneOffset,
  formatZonedTime,
  isValidTimeZone,
  orderZones,
  type ResetZone,
} from "@/lib/timezones";
import {
  Calendar,
  Bell,
  Share2,
  ExternalLink,
  Flame,
  Clock,
  Sparkles,
  AlertCircle,
  Activity,
  Globe,
} from "lucide-react";

interface ForecastHeroProps {
  statusTitleHint?: string;
  resets: ResetItem[];
  forecast: ForecastResult;
  lang: "en" | "zh";
  onOpenAlerts: () => void;
  onOpenShare: () => void;
}

/**
 * Advice severity is derived from the forecast, never authored by hand, so the
 * copy can never claim more certainty than the number it sits next to.
 * "scheduled" is the only tier backed by an official timestamp.
 */
type AdviceTier = "scheduled" | "critical" | "elevated" | "calm";

interface AdviceCopy {
  tier: AdviceTier;
  label: { en: string; zh: string };
  headline: { en: string; zh: string };
  body: { en: string; zh: string };
}

const TIER_SKIN: Record<
  AdviceTier,
  { wrap: string; label: string; headline: string; body: string; dot: string }
> = {
  scheduled: {
    wrap: "border-2 border-rose-500/60 bg-rose-500/[0.14] shadow-glow-amber",
    label: "text-rose-300",
    headline: "text-rose-100",
    body: "text-rose-100/90",
    dot: "bg-rose-400",
  },
  critical: {
    wrap: "border border-amber-500/45 bg-amber-500/[0.10]",
    label: "text-amber-300",
    headline: "text-amber-100",
    body: "text-amber-100/85",
    dot: "bg-amber-400",
  },
  elevated: {
    wrap: "border border-blue-500/35 bg-blue-500/[0.07]",
    label: "text-blue-300",
    headline: "text-blue-100",
    body: "text-blue-100/85",
    dot: "bg-blue-400",
  },
  calm: {
    wrap: "border border-white/[0.06] bg-white/[0.03]",
    label: "text-slate-400",
    headline: "text-slate-200",
    body: "text-slate-300",
    dot: "bg-emerald-400",
  },
};

const AdviceBlock: React.FC<{
  advice: AdviceCopy;
  lang: "en" | "zh";
  full?: boolean;
}> = ({ advice, lang, full = false }) => {
  const isZh = lang === "zh";
  const skin = TIER_SKIN[advice.tier];
  const loud = advice.tier === "scheduled";

  return (
    <div className={`rounded-xl ${skin.wrap} ${loud ? "p-5 sm:p-6" : "p-4"}`}>
      <div
        className={`mb-1.5 flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider ${skin.label}`}
      >
        <span className="relative flex h-2.5 w-2.5">
          {loud && (
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${skin.dot}`}
            />
          )}
          <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${skin.dot}`} />
        </span>
        <span>{isZh ? advice.label.zh : advice.label.en}</span>
      </div>

      <p
        className={`font-bold ${skin.headline} ${
          loud
            ? "text-3xl leading-none tracking-tight sm:text-4xl"
            : full
            ? "text-xl leading-snug sm:text-2xl"
            : "text-base leading-snug"
        }`}
      >
        {isZh ? advice.headline.zh : advice.headline.en}
      </p>

      <p
        className={`mt-2 ${skin.body} ${
          loud ? "text-sm font-medium leading-relaxed sm:text-base" : "text-xs leading-relaxed sm:text-[13px]"
        }`}
      >
        {isZh ? advice.body.zh : advice.body.en}
      </p>
    </div>
  );
};

/**
 * One absolute instant, read off every region's clock.
 *
 * Rendered in both modes: inside a scheduled window the instant is official,
 * otherwise it is the forecast target. Only the framing changes — rose and
 * "official" wording when a real announcement backs the timestamp, neutral blue
 * with an explicit "this is a forecast" note when it does not. Keeping the strip
 * visible at all times means the layout never jumps when a reset gets scheduled.
 */
const ZoneClockStrip: React.FC<{
  target: Date;
  zones: ResetZone[];
  lang: "en" | "zh";
  scheduled: boolean;
}> = ({ target, zones, lang, scheduled }) => {
  const isZh = lang === "zh";

  const shell = scheduled
    ? "border-rose-500/25 bg-rose-500/[0.06]"
    : "border-white/[0.08] bg-white/[0.02]";
  const heading = scheduled ? "text-rose-300" : "text-slate-400";
  const localCell = scheduled
    ? "border-rose-400/60 bg-rose-500/15"
    : "border-blue-400/60 bg-blue-500/[0.15]";
  const localLabel = scheduled ? "text-rose-200" : "text-blue-200";
  const localBadge = scheduled ? "bg-rose-400/30 text-rose-50" : "bg-blue-400/30 text-blue-50";
  const localValue = scheduled ? "text-rose-100" : "text-blue-100";

  const title = scheduled
    ? isZh
      ? "官方时刻 · 各时区本地钟点"
      : "OFFICIAL TIME · LOCAL CLOCK BY ZONE"
    : isZh
    ? "预计时刻 · 各时区本地钟点"
    : "ESTIMATED TIME · LOCAL CLOCK BY ZONE";

  const footnote = scheduled
    ? isZh
      ? "同一个绝对时刻在各地时钟上的读数，换算取自 IANA 时区数据库，已包含夏令时。"
      : "One absolute instant, read off each local clock. Converted via the IANA time-zone database, DST included."
    : isZh
    ? "同一个绝对时刻在各地时钟上的读数，换算取自 IANA 时区数据库；该时刻为预测值，非官方时刻表。"
    : "One absolute instant, read off each local clock, converted via the IANA time-zone database. This instant is a forecast, not an official timetable.";

  return (
    <div className={`mt-4 rounded-lg border p-3 ${shell}`}>
      <div
        className={`mb-2 flex items-center space-x-1.5 text-[10px] font-semibold uppercase tracking-wider ${heading}`}
      >
        <Globe className="h-3 w-3" />
        <span>{title}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className={`rounded-md border px-2.5 py-1.5 ${
              zone.isLocal ? localCell : "border-white/10 bg-[#080B11]/60"
            }`}
          >
            <div className="flex items-center space-x-1">
              <span
                className={`text-[10px] font-semibold uppercase tracking-wide ${
                  zone.isLocal ? localLabel : "text-slate-400"
                }`}
              >
                {isZh ? zone.labelZh : zone.labelEn}
              </span>
              {zone.isLocal && (
                <span className={`rounded-sm px-1 text-[9px] font-bold ${localBadge}`}>
                  {isZh ? "你的" : "YOU"}
                </span>
              )}
            </div>
            <div
              className={`font-mono text-xs font-bold ${
                zone.isLocal ? localValue : "text-slate-200"
              }`}
            >
              {formatZonedTime(target, zone.id, lang)}
            </div>
            <div className="font-mono text-[9px] text-slate-500">
              {formatZoneOffset(target, zone.id)}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-slate-400">{footnote}</p>
    </div>
  );
};

export const ForecastHero: React.FC<ForecastHeroProps> = ({
  resets,
  forecast,
  lang,
  onOpenAlerts,
  onOpenShare,
}) => {
  const isZh = lang === "zh";
  const latestReset = resets[0];

  const { likelihood, scheduled, targetDate, breakdown } = forecast;

  // Depend on the numeric timestamp so the interval is only rebuilt when the
  // predicted target actually moves (not on every render).
  const targetMs = targetDate.getTime();

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isOverdue: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isOverdue: false });

  useEffect(() => {
    const updateCountdown = () => {
      const diff = targetMs - Date.now();
      const abs = Math.abs(diff);

      setTimeLeft({
        days: Math.floor(abs / (1000 * 60 * 60 * 24)),
        hours: Math.floor((abs / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((abs / (1000 * 60)) % 60),
        seconds: Math.floor((abs / 1000) % 60),
        isOverdue: diff <= 0,
      });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [targetMs]);

  // The viewer's zone is only knowable in the browser, so it starts null and
  // fills in after mount. Server and first client render therefore both fall
  // back to UTC and stay identical (no hydration mismatch), and because the
  // value is an explicit IANA id the clock reading itself is deterministic.
  const [localZone, setLocalZone] = useState<string | null>(null);

  useEffect(() => {
    try {
      const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (zone && isValidTimeZone(zone)) setLocalZone(zone);
    } catch {
      // Leave null: the list still renders, just without a highlighted row.
    }
  }, []);

  const zoneRows = useMemo(() => orderZones(localZone), [localZone]);
  const displayZone = localZone ?? "UTC";

  // A scheduled reset pins one absolute instant. The countdown below is already
  // that instant; this list adds the reading on each region's wall clock, which
  // is the only thing that genuinely differs by time zone.
  const displayOffset = formatZoneOffset(targetDate, displayZone);

  const likelihoodColor =
    likelihood >= 80
      ? "text-rose-400 border-rose-500/40 bg-rose-500/10 shadow-glow-amber"
      : likelihood >= 60
      ? "text-amber-400 border-amber-500/40 bg-amber-500/10 shadow-glow-amber"
      : "text-emerald-400 border-emerald-500/40 bg-emerald-500/10 shadow-glow-green";

  const statusTitle = scheduled
    ? isZh
      ? "官方已定档重置"
      : "OFFICIALLY SCHEDULED"
    : likelihood >= 80
    ? isZh
      ? "极高概率窗口 (随时可能掉落)"
      : "CRITICAL REFRESH WINDOW"
    : likelihood >= 60
    ? isZh
      ? "接近平均周期 (蓄势待发)"
      : "ELEVATED CADENCE WINDOW"
    : isZh
    ? "额度冷却中 (刚重置不久)"
    : "POST-RESET COOLDOWN";

  const confidenceLabel =
    forecast.confidence === "high"
      ? isZh
        ? "高置信"
        : "HIGH CONFIDENCE"
      : forecast.confidence === "medium"
      ? isZh
        ? "中置信"
        : "MEDIUM CONFIDENCE"
      : isZh
      ? "低置信 (样本较少)"
      : "LOW CONFIDENCE (SMALL SAMPLE)";

  // Wording deliberately never restates "past the median cadence": that claim
  // only holds when cooldownRatio > 1, while this tier can also be reached at a
  // lower ratio once the incident boost is added. The breakdown panel above is
  // the place that reports the actual ratio.
  const advice: AdviceCopy = scheduled
    ? {
        tier: "scheduled",
        label: { en: "Act now", zh: "立即行动" },
        headline: { en: "Burn it. Now.", zh: "快蹬！" },
        body: {
          en: "OpenAI has published an exact reset time, and unspent quota does not carry over — whatever you leave on the table is gone the moment the reset lands. Go drain it while it still counts.",
          zh: "官方已公布确切重置时刻，剩余额度不会结转到下一轮 —— 现在就去把它烧光，别把额度留给倒计时。手上没跑完的活，立刻开跑。",
        },
      }
    : likelihood >= 80
    ? {
        tier: "critical",
        label: { en: "Action recommendation", zh: "行动建议 (What to do)" },
        headline: {
          en: "High-probability window — a drop could land at any moment",
          zh: "已进入高概率窗口，随时可能掉落",
        },
        body: {
          en: "Start the long-running work now so the reset lands into active use, and avoid pinning a hard deadline to this window.",
          zh: "把耗时的长任务先开起来，让重置落在正在使用的额度上；也尽量别把硬性截止时间押在这个窗口里。",
        },
      }
    : likelihood >= 60
    ? {
        tier: "elevated",
        label: { en: "Action recommendation", zh: "行动建议 (What to do)" },
        headline: { en: "Approaching the typical cadence", zh: "正在接近历史平均周期" },
        body: {
          en: "Still inside the normal band. No need to hoard quota — keep your usual pace; nothing abnormal has been signalled yet.",
          zh: "仍在正常区间内，不必刻意留存额度，按平时节奏使用即可；官方目前没有异常重置信号。",
        },
      }
    : {
        tier: "calm",
        label: { en: "Action recommendation", zh: "行动建议 (What to do)" },
        headline: { en: "Quota pool is healthy — a good time to focus on coding", zh: "额度池充足，适合专注编码" },
        body: {
          en: "The last reset landed recently and no abnormal triggers are showing. Safe to spend freely.",
          zh: "距上次重置不久，官方近期暂无异常重置信号，可以放心把额度用掉。",
        },
      };

  return (
    <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-8 md:p-10 mb-8 border border-white/10">
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      {/* Top Eyebrow row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-5 mb-6">
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            {isZh ? "48小时额度天气预报 & 倒计时" : "48-HOUR QUOTA METEOROLOGY & COUNTDOWN"}
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Clock className="h-3.5 w-3.5 text-slate-500" />
          <span>
            {isZh ? "上次重置于：" : "Last Reset: "}
            <strong className="text-slate-200">
              {latestReset ? formatRelativeTime(latestReset.announced_at, lang) : "--"}
            </strong>
          </span>
        </div>
      </div>

      {/* A scheduled reset is the only tier backed by a real official timestamp and
          the one moment where burning quota actually matters, so it gets the loud
          full-width alert instead of the quiet side panel. */}
      {scheduled && (
        <div className="mb-6">
          <AdviceBlock advice={advice} lang={lang} full />
        </div>
      )}

      {/* Main Core Grid: Gauge & Countdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Reset Likelihood Gauge (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="flex items-center space-x-3">
            <span
              className={`inline-flex items-center space-x-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${likelihoodColor}`}
            >
              <Flame className="h-3.5 w-3.5" />
              <span>{statusTitle}</span>
            </span>
          </div>

          <div className="flex items-baseline space-x-3">
            <span className="text-6xl sm:text-7xl font-extrabold tracking-tight text-white font-mono">
              {likelihood}
            </span>
            <span className="text-3xl sm:text-4xl font-bold text-slate-400 font-mono">%</span>
            <span className="text-sm font-medium text-slate-400">
              {isZh ? "掉落概率" : "Reset Likelihood"}
            </span>
          </div>

          {/* Rendered above as a full-width alert when a reset is scheduled, so the
              side slot is skipped for that tier to avoid showing the copy twice. */}
          {!scheduled && <AdviceBlock advice={advice} lang={lang} />}

          {/* Provenance of the number - every factor is visible */}
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase flex items-center space-x-1.5">
                <Activity className="h-3.5 w-3.5 text-blue-400" />
                <span>{isZh ? "概率构成明细" : "FORECAST BREAKDOWN"}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">{confidenceLabel}</span>
            </div>
            <ul className="space-y-1.5">
              {breakdown.map((item) => (
                <li
                  key={item.key}
                  className="flex items-center justify-between text-[11px] font-mono"
                >
                  <span className="text-slate-400">
                    {isZh ? item.labelZh : item.labelEn}
                  </span>
                  <span className="flex items-center space-x-2">
                    <span className="text-slate-300">{item.value}</span>
                    {item.deltaLabel && (
                      <span className="text-emerald-400">{item.deltaLabel}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Side: Big Countdown to Next Window (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-center rounded-xl bg-white/[0.02] border border-white/[0.06] p-6 sm:p-7">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>
                {scheduled
                  ? isZh
                    ? "定档重置倒计时"
                    : "SCHEDULED RESET COUNTDOWN"
                  : timeLeft.isOverdue
                  ? isZh
                    ? "历史窗口已开启 (已进入加时区)"
                    : "WINDOW ACTIVE (OVERDUE TIME)"
                  : isZh
                  ? "下次预计重置倒计时"
                  : "ESTIMATED NEXT RESET COUNTDOWN"}
              </span>
            </span>
            <span className="flex flex-wrap items-center justify-end gap-1.5 font-mono text-xs text-slate-400">
              {scheduled && (
                <span className="rounded-sm border border-rose-500/45 bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-rose-300">
                  {isZh ? "官方时刻" : "OFFICIAL"}
                </span>
              )}
              <span className="text-slate-200">
                {formatZonedTime(targetDate, displayZone, lang)}
              </span>
              <span className="text-slate-500">{displayOffset || "UTC"}</span>
            </span>
          </div>

          {/* Big Digital Countdown HUD */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 my-3 text-center">
            <div className="rounded-lg bg-[#080B11]/70 border border-white/10 p-3">
              <div className="text-2xl sm:text-4xl font-bold text-white font-mono">
                {String(timeLeft.days).padStart(2, "0")}
              </div>
              <div className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase mt-1">
                {isZh ? "天 (Days)" : "Days"}
              </div>
            </div>
            <div className="rounded-lg bg-[#080B11]/70 border border-white/10 p-3">
              <div className="text-2xl sm:text-4xl font-bold text-white font-mono">
                {String(timeLeft.hours).padStart(2, "0")}
              </div>
              <div className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase mt-1">
                {isZh ? "时 (Hours)" : "Hours"}
              </div>
            </div>
            <div className="rounded-lg bg-[#080B11]/70 border border-white/10 p-3">
              <div className="text-2xl sm:text-4xl font-bold text-white font-mono">
                {String(timeLeft.minutes).padStart(2, "0")}
              </div>
              <div className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase mt-1">
                {isZh ? "分 (Mins)" : "Mins"}
              </div>
            </div>
            <div className="rounded-lg bg-[#080B11]/70 border border-white/10 p-3">
              <div className="text-2xl sm:text-4xl font-bold text-emerald-400 font-mono">
                {String(timeLeft.seconds).padStart(2, "0")}
              </div>
              <div className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase mt-1">
                {isZh ? "秒 (Secs)" : "Secs"}
              </div>
            </div>
          </div>

          {/* The ±hour forecast window only describes the unscheduled tiers, so
              it hides once an exact instant exists. The per-zone clock strip
              below stays visible in both modes. */}
          {!scheduled && (
            <p className="text-xs text-slate-400 mt-2">
              {isZh
                ? `* 预测窗口 ${forecast.windowStart.toLocaleString("zh-CN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    month: "short",
                    day: "numeric",
                  })} — ${forecast.windowEnd.toLocaleString("zh-CN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    month: "short",
                    day: "numeric",
                  })}，基于 ${forecast.sampleSize} 段真实重置间隔的中位数 ${forecast.medianIntervalDays.toFixed(
                    1
                  )} 天，非官方时刻表。`
                : `* Forecast window ${forecast.windowStart.toLocaleString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    month: "short",
                    day: "numeric",
                  })} — ${forecast.windowEnd.toLocaleString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    month: "short",
                    day: "numeric",
                  })}. Based on the ${forecast.medianIntervalDays.toFixed(
                    1
                  )}d median of ${forecast.sampleSize} real reset intervals. Unofficial.`}
            </p>
          )}

          <ZoneClockStrip
            target={targetDate}
            zones={zoneRows}
            lang={lang}
            scheduled={scheduled}
          />
        </div>
      </div>

      {/* Latest Official Verified Quote */}
      {latestReset && (
        <div className="mt-8 rounded-xl bg-white/[0.03] border border-white/[0.08] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-emerald-400 uppercase">
                {isZh ? "最新官方已生效公告" : "LATEST OFFICIAL ANNOUNCEMENT"}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-300">
                @{latestReset.source.author || "thsottiaux"}
              </span>
            </div>
            <p className="text-sm text-slate-200 line-clamp-2">&quot;{latestReset.text}&quot;</p>
          </div>
          {latestReset.source?.url && (
            <a
              href={latestReset.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 shrink-0 rounded-lg border border-white/10 bg-white/[0.05] px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
            >
              <span>{isZh ? "查看推特原文" : "Verify on X"}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}

      {/* Bottom CTA Action Bar */}
      <div className="mt-8 pt-6 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <a
            href="/api/calendar.ics"
            className="inline-flex items-center space-x-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-glow-green transition-all"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>{isZh ? "📅 订阅到日历 (.ics)" : "📅 Subscribe Calendar (.ics)"}</span>
          </a>

          <button
            onClick={onOpenAlerts}
            className="inline-flex items-center space-x-2 rounded-lg border border-white/10 bg-white/[0.05] hover:bg-white/10 px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white transition-all"
          >
            <Bell className="h-3.5 w-3.5 text-amber-400" />
            <span>{isZh ? "🔔 强提醒订阅 (Bark/邮件)" : "🔔 Instant Alerts"}</span>
          </button>

          <button
            onClick={onOpenShare}
            className="inline-flex items-center space-x-2 rounded-lg border border-white/10 bg-white/[0.05] hover:bg-white/10 px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white transition-all"
          >
            <Share2 className="h-3.5 w-3.5 text-blue-400" />
            <span>{isZh ? "📤 导出状态卡片" : "📤 Export Status Card"}</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 flex items-center space-x-1">
          <AlertCircle className="h-3.5 w-3.5 text-slate-400" />
          <span>{isZh ? "数据每 15 秒极速自同步" : "Auto-synced every 15s"}</span>
        </div>
      </div>
    </div>
  );
};
