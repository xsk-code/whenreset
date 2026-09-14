"use client";

import React from "react";
import { SITE_CONFIG } from "@/lib/config";
import { Terminal, Code2, ExternalLink } from "lucide-react";

interface FooterProps {
  lang: "en" | "zh";
  lastSyncTime: Date | null;
}

export const Footer: React.FC<FooterProps> = ({ lang, lastSyncTime }) => {
  const isZh = lang === "zh";

  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#080B11]/60 py-10 mt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand and Description */}
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Terminal className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-bold text-white tracking-tight">
                {SITE_CONFIG.name}
              </span>
              <span className="text-xs text-slate-400">v2.0</span>
            </div>
            <p className="text-xs text-slate-400 max-w-md">
              {isZh
                ? "开源 AI 额度气象台。数据来自官方推文与公开状态监控，为全球开发者提供毫秒级重置雷达与日历订阅。"
                : "Open-source AI Quota Meteorology station. Community-built for developers tracking OpenAI Codex and Claude limits."}
            </p>
          </div>

          {/* Developer links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <a
              href="/api/calendar.ics"
              className="hover:text-emerald-400 transition-colors flex items-center space-x-1"
            >
              <span>{isZh ? "日历订阅 (.ics)" : "Calendar (.ics)"}</span>
            </a>
            <span className="text-white/20">•</span>
            <a
              href="/api/resets"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors flex items-center space-x-1"
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>JSON API</span>
            </a>
            <span className="text-white/20">•</span>
            <a
              href="https://x.com/thsottiaux"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors flex items-center space-x-1"
            >
              <span>@thsottiaux on X</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <span className="text-white/20">•</span>
            <a
              href="https://status.openai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors flex items-center space-x-1"
            >
              <span>OpenAI Status</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Disclaimer row */}
        <div className="mt-8 pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <div>
            {isZh
              ? "本站为独立社区项目，与 OpenAI 或 Anthropic 官方无隶属关系。"
              : "Independent community tracker. Not affiliated with OpenAI or Anthropic."}
          </div>
          <div>
            {lastSyncTime && (
              <span>
                {isZh ? "最近数据同步：" : "Last synced: "}
                {lastSyncTime.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
