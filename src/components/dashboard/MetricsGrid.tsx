"use client";

import React from "react";
import { StatusStats } from "@/lib/types";
import { History, CalendarDays, TrendingUp, Users } from "lucide-react";

interface MetricsGridProps {
  stats: StatusStats | null;
  lang: "en" | "zh";
  totalResetsCount: number;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  stats,
  lang,
  totalResetsCount,
}) => {
  const isZh = lang === "zh";

  const daysSince = stats?.days_since_last ?? 2.3;
  const avgCadence = stats?.avg_interval_days ?? 3.3;
  const longestWait = stats?.longest_wait_days ?? 67.7;
  const total = stats?.total ?? totalResetsCount;

  // Format days and hours
  const fullDays = Math.floor(daysSince);
  const remainingHours = Math.round((daysSince - fullDays) * 24);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Metric 1: Since Last Reset */}
      <div className="rounded-xl glass-panel p-5 border border-white/[0.08] hover:border-white/20 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">
            {isZh ? "距离上次重置已过" : "TIME SINCE LAST RESET"}
          </span>
          <History className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline space-x-1.5 my-1 font-mono">
          <span className="text-3xl font-bold text-white">{fullDays}</span>
          <span className="text-sm font-medium text-slate-400">
            {isZh ? "天" : "d"}
          </span>
          <span className="text-3xl font-bold text-white ml-2">
            {remainingHours}
          </span>
          <span className="text-sm font-medium text-slate-400">
            {isZh ? "小时" : "h"}
          </span>
        </div>
        <div className="text-xs text-slate-400 mt-2">
          {isZh ? "持续消耗中 • 官方额度待刷新" : "Ongoing consumption window"}
        </div>
      </div>

      {/* Metric 2: Resets in 30 Days */}
      <div className="rounded-xl glass-panel p-5 border border-white/[0.08] hover:border-white/20 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">
            {isZh ? "近 30 天掉落频次" : "RESETS IN 30 DAYS"}
          </span>
          <CalendarDays className="h-4 w-4 text-blue-400" />
        </div>
        <div className="flex items-baseline space-x-2 my-1 font-mono">
          <span className="text-3xl font-bold text-white">6</span>
          <span className="text-sm font-medium text-slate-400">
            {isZh ? "次全员" : "drops"}
          </span>
          <span className="text-xs font-semibold rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 ml-1">
            +4 {isZh ? "张补偿卡" : "cards"}
          </span>
        </div>
        <div className="text-xs text-slate-400 mt-2">
          {isZh ? "历史累计已记录 " + total + " 次" : `Historical total: ${total} events`}
        </div>
      </div>

      {/* Metric 3: Typical Interval */}
      <div className="rounded-xl glass-panel p-5 border border-white/[0.08] hover:border-white/20 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">
            {isZh ? "历史平均掉落周期" : "TYPICAL CADENCE GAP"}
          </span>
          <TrendingUp className="h-4 w-4 text-amber-400" />
        </div>
        <div className="flex items-baseline space-x-1.5 my-1 font-mono">
          <span className="text-3xl font-bold text-white">{avgCadence}</span>
          <span className="text-sm font-medium text-slate-400">
            {isZh ? "天 / 次" : "days"}
          </span>
        </div>
        <div className="text-xs text-slate-400 mt-2">
          {isZh
            ? `历史最长干旱期：${longestWait} 天`
            : `Longest drought recorded: ${longestWait}d`}
        </div>
      </div>

      {/* Metric 4: Target Audience Scope */}
      <div className="rounded-xl glass-panel p-5 border border-white/[0.08] hover:border-white/20 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">
            {isZh ? "当前生效受众" : "AUDIENCE SCOPE"}
          </span>
          <Users className="h-4 w-4 text-purple-400" />
        </div>
        <div className="my-1">
          <span className="text-lg font-bold text-white">
            {isZh ? "全部付费会员" : "All Paid Plans"}
          </span>
        </div>
        <div className="text-xs text-slate-400 mt-2">
          Plus, Pro, Business & Codex CLI
        </div>
      </div>
    </div>
  );
};
