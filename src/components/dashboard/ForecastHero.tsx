"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ResetItem, ScheduledReset, StatusData } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";
import {
  Calendar,
  Bell,
  Share2,
  ExternalLink,
  Flame,
  Clock,
  Sparkles,
  AlertCircle,
} from "lucide-react";

interface ForecastHeroProps {
  statusData: StatusData | null;
  resets: ResetItem[];
  lang: "en" | "zh";
  onOpenAlerts: () => void;
  onOpenShare: () => void;
}

export const ForecastHero: React.FC<ForecastHeroProps> = ({
  statusData,
  resets,
  lang,
  onOpenAlerts,
  onOpenShare,
}) => {
  const isZh = lang === "zh";
  const latestReset = resets[0];
  const scheduled = statusData?.scheduled_reset;

  // Real calculation of likelihood based on elapsed hours vs typical cadence
  const avgCadenceDays = statusData?.stats?.avg_interval_days || 3.3;
  const daysSinceLast = statusData?.stats?.days_since_last || 0;

  // Compute likelihood percentage
  let likelihood = Math.min(
    95,
    Math.max(15, Math.round((daysSinceLast / avgCadenceDays) * 75))
  );
  if (scheduled) likelihood = 100;

  // Compute next estimated target date.
  // Memoized on the underlying raw values: building a `new Date()` inline would
  // produce a new object identity every render.
  const nextTargetDate = useMemo(() => {
    if (scheduled) return new Date(scheduled.scheduled_for);
    const lastResetDate = latestReset
      ? new Date(latestReset.announced_at)
      : null;
    if (!lastResetDate) return new Date();
    return new Date(
      lastResetDate.getTime() + avgCadenceDays * 24 * 60 * 60 * 1000
    );
  }, [scheduled, latestReset, avgCadenceDays]);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isOverdue: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isOverdue: false });

  // Depend on the numeric timestamp, not the Date object, so the interval is
  // only re-created when the target actually moves.
  const targetMs = nextTargetDate.getTime();

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = targetMs - now;

      if (diff <= 0) {
        // Window is active / overdue
        const overdueMs = Math.abs(diff);
        setTimeLeft({
          days: Math.floor(overdueMs / (1000 * 60 * 60 * 24)),
          hours: Math.floor((overdueMs / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((overdueMs / (1000 * 60)) % 60),
          seconds: Math.floor((overdueMs / 1000) % 60),
          isOverdue: true,
        });
      } else {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
          isOverdue: false,
        });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [targetMs]);

  // Color dynamics according to likelihood
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

  const actionAdvice = scheduled
    ? isZh
      ? "官方已确认重置时间，请合理安排当前剩余额度。"
      : "Official drop is locked. Budget remaining tokens accordingly."
    : likelihood >= 80
    ? isZh
      ? "已超过历史平均间隔，官方发布或补偿概率极高，建议保持关注！"
      : "Past median cadence. Stand by your tokens for an incoming drop."
    : isZh
      ? "额度池充足，适合专注编码，官方近期暂无异常重置信号。"
      : "Safe to burn tokens. No abnormal reset triggers observed.";

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
              {latestReset
                ? formatRelativeTime(latestReset.announced_at, lang)
                : "--"}
            </strong>
          </span>
        </div>
      </div>

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
            <span className="text-3xl sm:text-4xl font-bold text-slate-400 font-mono">
              %
            </span>
            <span className="text-sm font-medium text-slate-400">
              {isZh ? "24H 掉落概率" : "Reset Likelihood"}
            </span>
          </div>

          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase mb-1">
              {isZh ? "行动建议 (What to do)" : "ACTION RECOMMENDATION"}
            </div>
            <p className="text-sm font-medium text-slate-200 leading-relaxed">
              {actionAdvice}
            </p>
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
            <span className="text-xs text-slate-400 font-mono">
              {nextTargetDate.toLocaleDateString(isZh ? "zh-CN" : "en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
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

          <p className="text-xs text-slate-400 mt-2">
            {isZh
              ? `* 基于近 10 次真实重置间隔中位数 (~${avgCadenceDays} 天) 计算，非官方固定时刻表。`
              : `* Calculated from median interval (~${avgCadenceDays}d) of past official drops. Unofficial forecast.`}
          </p>
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
            <p className="text-sm text-slate-200 line-clamp-2">
              "{latestReset.text}"
            </p>
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
