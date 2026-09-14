"use client";

import React from "react";
import { SITE_CONFIG } from "@/lib/config";
import { Bell, Calendar, Globe, Share2, Terminal } from "lucide-react";

interface HeaderProps {
  currentLang: "en" | "zh";
  onToggleLang: () => void;
  onOpenAlerts: () => void;
  onOpenShare: () => void;
  activeModel: string;
  onChangeModel: (model: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onToggleLang,
  onOpenAlerts,
  onOpenShare,
  activeModel,
  onChangeModel,
}) => {
  const isZh = currentLang === "zh";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#080B11]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Live status */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Terminal className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              {SITE_CONFIG.name}
            </span>
            <span className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isZh ? "实时监控" : "LIVE RADAR"}</span>
            </span>
          </div>

          {/* Model Switcher Tabs */}
          <nav className="hidden md:flex items-center space-x-1 rounded-lg bg-white/[0.04] p-1 border border-white/[0.06]">
            <button
              onClick={() => onChangeModel("codex")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                activeModel === "codex"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              OpenAI Codex
            </button>
            <button
              onClick={() => onChangeModel("claude")}
              className={`flex items-center space-x-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
                activeModel === "claude"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Claude Code</span>
              <span className="rounded bg-white/10 px-1 py-0.2 text-[10px] text-slate-300">Soon</span>
            </button>
            <button
              onClick={() => onChangeModel("grok")}
              className={`flex items-center space-x-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
                activeModel === "grok"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Grok</span>
              <span className="rounded bg-white/10 px-1 py-0.2 text-[10px] text-slate-300">Soon</span>
            </button>
          </nav>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Quick Calendar Download */}
          <a
            href="/api/calendar.ics"
            className="hidden sm:inline-flex items-center space-x-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors"
            title={isZh ? "添加到系统日历" : "Subscribe to Calendar (.ics)"}
          >
            <Calendar className="h-3.5 w-3.5 text-emerald-400" />
            <span>.ICS</span>
          </a>

          {/* Share Card Modal Trigger */}
          <button
            onClick={onOpenShare}
            className="inline-flex items-center space-x-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors"
            title={isZh ? "生成分享海报" : "Share Status Card"}
          >
            <Share2 className="h-3.5 w-3.5 text-blue-400" />
            <span className="hidden sm:inline">{isZh ? "分享卡片" : "Share"}</span>
          </button>

          {/* Alert Hub Trigger */}
          <button
            onClick={onOpenAlerts}
            className="inline-flex items-center space-x-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors shadow-glow-green"
          >
            <Bell className="h-3.5 w-3.5" />
            <span>{isZh ? "强提醒订阅" : "Alert Hub"}</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            className="inline-flex items-center space-x-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors"
            aria-label="Toggle language"
          >
            <Globe className="h-3.5 w-3.5 text-slate-400" />
            <span>{isZh ? "EN" : "中"}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
