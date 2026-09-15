"use client";

import React from "react";
import { ResetItem } from "@/lib/types";
import { IncidentSignal, ForecastResult } from "@/lib/forecast";
import { formatRelativeTime } from "@/lib/utils";
import {
  Radio,
  AlertTriangle,
  MessageSquareQuote,
  PieChart,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

interface SignalDeskProps {
  latestReset: ResetItem | undefined;
  resets: ResetItem[];
  forecast: ForecastResult;
  incident: IncidentSignal | null;
  lang: "en" | "zh";
}

export const SignalDesk: React.FC<SignalDeskProps> = ({
  latestReset,
  resets,
  forecast,
  incident,
  lang,
}) => {
  const isZh = lang === "zh";

  const incidentKnown = incident && !incident.is_fallback;
  const activeCount = incident?.total_active ?? 0;
  const recentCount = incident?.recent_incidents_48h ?? 0;
  const degradedCount = incident?.degraded_components?.length ?? 0;
  const incidentHeadline = incidentKnown
    ? activeCount > 0
      ? `${activeCount} ${isZh ? "起进行中" : "active"}`
      : isZh
      ? "暂无进行中事故"
      : "No active incidents"
    : isZh
    ? "状态接口暂不可用"
    : "Status feed unavailable";

  const totalResets = resets.length || 1;
  const bankedCount = resets.filter((r) => r.reset_type === "banked").length;
  const bankedShare = Math.round((bankedCount / totalResets) * 100);

  return (
    <div className="rounded-2xl glass-panel p-6 sm:p-8 mb-8 border border-white/10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4 mb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <Radio className="h-4 w-4" />
            <span>{isZh ? "实时信号雷达 (Signal Desk)" : "THE SIGNAL DESK"}</span>
          </div>
          <p className="text-sm text-slate-300 mt-1">
            {isZh
              ? "预测依据全部来自可核验的公开数据：官方推文、OpenAI 状态与实际冷却时长"
              : "Every input comes from verifiable public data: official posts, OpenAI status, and elapsed cooldown"}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {incident && incident.updated_at && (
            <span className="text-[10px] font-mono text-slate-500">
              {isZh ? "状态同步于 " : "status synced "}
              {formatRelativeTime(incident.updated_at, lang)}
            </span>
          )}
          <a
            href="https://status.openai.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <span>{isZh ? "OpenAI 服务状态台" : "OpenAI Status"}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* 4 Signals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Signal 01: Incidents (live from status.openai.com) */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
              <span>01 / {isZh ? "服务故障" : "INCIDENTS"}</span>
              <AlertTriangle
                className={`h-3.5 w-3.5 ${
                  incidentKnown && activeCount > 0 ? "text-rose-400" : "text-emerald-400"
                }`}
              />
            </div>
            <div className="text-sm font-semibold text-white mb-1.5">{incidentHeadline}</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {incidentKnown
                ? isZh
                  ? `近 48 小时 ${recentCount} 起事件，${degradedCount} 个组件非满血运行。`
                  : `${recentCount} incidents in 48h, ${degradedCount} component(s) degraded.`
                : isZh
                ? "无法读取官方状态接口时不参与加权，预测仅按冷却周期计算。"
                : "Unreachable status feed contributes nothing. Forecast falls back to cooldown only."}
            </p>
            {incidentKnown && incident.active_incidents.length > 0 && (
              <a
                href={incident.active_incidents[0].url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center space-x-1 text-[11px] text-blue-400 hover:text-blue-300"
              >
                <span className="line-clamp-1">{incident.active_incidents[0].name}</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
            <span>{isZh ? "权重加成" : "Risk modifier"}</span>
            <span
              className={`font-medium ${
                forecast.incidentBoost > 0 ? "text-rose-400" : "text-emerald-400"
              }`}
            >
              +{forecast.incidentBoost}%
            </span>
          </div>
        </div>

        {/* Signal 02: Team posts */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
              <span>02 / {isZh ? "官方推文" : "TEAM SIGNALS"}</span>
              <MessageSquareQuote className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <div className="text-sm font-semibold text-white mb-1.5 flex items-center space-x-1.5">
              <span>@{latestReset?.source?.author || "thsottiaux"}</span>
            </div>
            <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
              {latestReset
                ? latestReset.text
                : isZh
                ? "正在监听最新推文..."
                : "Listening for signals..."}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
            <span>{isZh ? "已验证信号" : "Verified Source"}</span>
            {latestReset?.source?.url ? (
              <a
                href={latestReset.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-blue-400 font-medium"
              >
                <span>{isZh ? "原文" : "Source"}</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            ) : (
              <span className="text-slate-500 font-medium">--</span>
            )}
          </div>
        </div>

        {/* Signal 03: Historical reset mix */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
              <span>03 / {isZh ? "重置类型分布" : "RESET MIX"}</span>
              <PieChart className="h-3.5 w-3.5 text-purple-400" />
            </div>
            <div className="text-sm font-semibold text-white mb-1.5 font-mono">
              {bankedShare}% {isZh ? "补偿卡" : "banked"}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isZh
                ? `历史 ${totalResets} 次记录中，${bankedCount} 次为定向补偿/重置卡，其余为全员重置。`
                : `${bankedCount} of ${totalResets} recorded drops were banked cards, the rest were global resets.`}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
            <span>{isZh ? "样本量" : "Sample size"}</span>
            <span className="text-purple-400 font-medium">{totalResets}</span>
          </div>
        </div>

        {/* Signal 04: Cooldown Window */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
              <span>04 / {isZh ? "冷却周期" : "COOLDOWN CYCLE"}</span>
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <div className="text-sm font-semibold text-white mb-1.5 font-mono">
              {forecast.daysSinceLast.toFixed(1)} {isZh ? "天前已重置" : "days elapsed"}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {forecast.cooldownRatio >= 1
                ? isZh
                  ? `已突破历史中位数 ${forecast.medianIntervalDays.toFixed(1)} 天，进入高概率开闸区间。`
                  : `Past the ${forecast.medianIntervalDays.toFixed(1)}d median gap. Window is open.`
                : isZh
                ? `尚在 ${forecast.medianIntervalDays.toFixed(1)} 天的历史中位数周期内，概率随时间累积。`
                : `Inside the ${forecast.medianIntervalDays.toFixed(1)}d median cycle. Likelihood accumulates with time.`}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
            <span>{isZh ? "窗口状态" : "Window"}</span>
            <span
              className={`font-medium ${
                forecast.cooldownRatio >= 1 ? "text-rose-400 font-bold" : "text-amber-400"
              }`}
            >
              {forecast.cooldownRatio >= 1
                ? isZh
                  ? "随时掉落"
                  : "Open"
                : isZh
                ? "蓄势中"
                : "Cooling"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
