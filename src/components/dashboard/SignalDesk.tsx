"use client";

import React from "react";
import { ResetItem } from "@/lib/types";
import { Radio, AlertTriangle, MessageSquareQuote, Rocket, ShieldCheck, ExternalLink } from "lucide-react";

interface SignalDeskProps {
  latestReset: ResetItem | undefined;
  lang: "en" | "zh";
  daysSinceLast: number;
}

export const SignalDesk: React.FC<SignalDeskProps> = ({
  latestReset,
  lang,
  daysSinceLast,
}) => {
  const isZh = lang === "zh";

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
              ? "为什么预测这个概率？公开事件、团队推文与冷却周期的加权实时分析"
              : "Why the forecast moves: live analysis of announcements, incident logs, and cooldowns"}
          </p>
        </div>
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

      {/* 4 Signals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Signal 01: Incidents */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
              <span>01 / {isZh ? "服务故障" : "INCIDENTS"}</span>
              <AlertTriangle className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="text-sm font-semibold text-white mb-1.5">
              {isZh ? "系统运行平稳" : "Operational Stable"}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isZh
                ? "API 与 Codex 接口暂无大规模宕机。突发故障通常会触发官方补偿重置。"
                : "No major outages reported. Degradations often trigger compensation drops."}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
            <span>{isZh ? "权重加成" : "Risk modifier"}</span>
            <span className="text-emerald-400 font-medium">0%</span>
          </div>
        </div>

        {/* Signal 02: Tiboposting */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
              <span>02 / {isZh ? "官方推文" : "TEAM SIGNALS"}</span>
              <MessageSquareQuote className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <div className="text-sm font-semibold text-white mb-1.5 flex items-center space-x-1.5">
              <span>@thsottiaux</span>
              <span className="text-xs text-slate-400 font-normal">Tibo</span>
            </div>
            <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
              {latestReset ? latestReset.text : isZh ? "正在监听最新推文..." : "Listening for signals..."}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
            <span>{isZh ? "已验证信号" : "Verified Source"}</span>
            <span className="text-blue-400 font-medium">{isZh ? "有效" : "Active"}</span>
          </div>
        </div>

        {/* Signal 03: Launch Events */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
              <span>03 / {isZh ? "模型发布" : "LAUNCH NOISE"}</span>
              <Rocket className="h-3.5 w-3.5 text-purple-400" />
            </div>
            <div className="text-sm font-semibold text-white mb-1.5">
              Astra / GPT-6 Cycle
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isZh
                ? "大模型版本迭代期间，官方高频发放重置卡以保障用户体验与基准评测。"
                : "New model cycles coincide with frequent banked cards and compensation."}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
            <span>{isZh ? "近期活跃度" : "Activity level"}</span>
            <span className="text-purple-400 font-medium">{isZh ? "高频" : "Elevated"}</span>
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
              {daysSinceLast.toFixed(1)} {isZh ? "天前已重置" : "days elapsed"}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {daysSinceLast > 3.0
                ? isZh
                  ? "已突破中位数 3.3 天，进入极高概率开闸区间。"
                  : "Passed the 3.3-day median gap. Refresh window is wide open."
                : isZh
                ? "处于历史重置缓冲期，短期连续重置概率稍低。"
                : "Within typical refractory period. Likelihood scales with time."}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
            <span>{isZh ? "窗口状态" : "Window"}</span>
            <span
              className={`font-medium ${
                daysSinceLast > 3.0 ? "text-rose-400 font-bold" : "text-amber-400"
              }`}
            >
              {daysSinceLast > 3.0 ? (isZh ? "随时掉落" : "Open") : isZh ? "蓄势中" : "Cooling"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
