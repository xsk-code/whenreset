"use client";

import React, { useState, useMemo } from "react";
import { ResetItem } from "@/lib/types";
import {
  formatRelativeTime,
  formatUtcTime,
  playMarioCoinSound,
  triggerHaptic,
  cn,
} from "@/lib/utils";
import { ExternalLink, ChevronDown, ChevronUp, ScrollText, RefreshCw } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface MarioLogProps {
  resets: ResetItem[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function MarioLog({ resets, onRefresh, isRefreshing }: MarioLogProps) {
  const { language, t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<"all" | "regular" | "banked">("all");

  // Ensure descending sort by announced_at
  const sortedResets = useMemo(() => {
    return [...resets].sort(
      (a, b) => new Date(b.announced_at).getTime() - new Date(a.announced_at).getTime()
    );
  }, [resets]);

  // Filter if user selects a tab
  const filteredResets = useMemo(() => {
    if (filterType === "all") return sortedResets;
    return sortedResets.filter((r) => r.reset_type === filterType);
  }, [sortedResets, filterType]);

  const displayCount = isExpanded ? filteredResets.length : Math.min(10, filteredResets.length);
  const visibleResets = filteredResets.slice(0, displayCount);
  const hasMore = filteredResets.length > 10;

  const handleToggleExpand = () => {
    playMarioCoinSound();
    triggerHaptic();
    setIsExpanded((prev) => !prev);
  };

  const handleFilterChange = (type: "all" | "regular" | "banked") => {
    playMarioCoinSound();
    triggerHaptic(10);
    setFilterType(type);
  };

  return (
    <section className="w-full max-w-5xl my-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 border-b border-zinc-800/80 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-mario-coin text-base">📜</span>
          <h2 className="font-pixel text-xs sm:text-sm text-mario-coin tracking-wide">
            {t.log.title}
          </h2>
          <span className="font-pixel text-[10px] bg-black text-gray-300 px-2 py-0.5 border border-black shadow-pixel-sm">
            {t.log.total(resets.length)}
          </span>
          {onRefresh && (
            <button
              onClick={() => {
                playMarioCoinSound();
                triggerHaptic(12);
                onRefresh();
              }}
              disabled={isRefreshing}
              className={cn(
                "pixel-btn font-pixel text-[9px] px-2 py-1 border-2 border-black shadow-pixel-sm transition-all flex items-center gap-1.5 cursor-pointer rounded-none active:translate-x-[1px] active:translate-y-[1px]",
                isRefreshing
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-mario-coin text-black hover:bg-[#FED626] font-bold"
              )}
              title="Fetch latest Codex quota announcements"
            >
              <RefreshCw className={cn("w-2.5 h-2.5 shrink-0", isRefreshing && "animate-spin")} />
              <span>{isRefreshing ? t.log.refreshing : t.log.refreshIntel}</span>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 font-pixel text-[9px] sm:text-[10px]">
          <button
            onClick={() => handleFilterChange("all")}
            className={cn(
              "px-2 py-1 border-2 border-black rounded-none shadow-pixel-sm transition-all cursor-pointer",
              filterType === "all"
                ? "bg-mario-coin text-black font-bold"
                : "bg-[#12141D] text-zinc-400 hover:text-white"
            )}
          >
            {t.log.filterAll(sortedResets.length)}
          </button>
          <button
            onClick={() => handleFilterChange("regular")}
            className={cn(
              "px-2 py-1 border-2 border-black rounded-none shadow-pixel-sm transition-all cursor-pointer",
              filterType === "regular"
                ? "bg-mario-green text-black font-bold"
                : "bg-[#12141D] text-zinc-400 hover:text-white"
            )}
          >
            {t.log.filterRegular}
          </button>
          <button
            onClick={() => handleFilterChange("banked")}
            className={cn(
              "px-2 py-1 border-2 border-black rounded-none shadow-pixel-sm transition-all cursor-pointer",
              filterType === "banked"
                ? "bg-amber-400 text-black font-bold"
                : "bg-[#12141D] text-zinc-400 hover:text-white"
            )}
          >
            {t.log.filterBanked}
          </button>
        </div>
      </div>

      {/* Quests Stream List */}
      <div className="space-y-4">
        {visibleResets.map((reset, index) => {
          const questNumber = sortedResets.length - index;
          const isBanked = reset.reset_type === "banked";
          const author = reset.source?.author || "thsottiaux";

          return (
            <article
              key={reset.id || `${reset.announced_at}-${index}`}
              className="border-2 border-black bg-[#191C28] p-4 sm:p-5 shadow-pixel rounded-none relative transition-transform hover:-translate-y-0.5"
            >
              {/* Dialogue Box Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-zinc-800/80">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Quest Index Badge */}
                  <span className="font-pixel text-[10px] bg-[#12141D] text-zinc-300 px-2 py-0.5 border border-zinc-800 shadow-pixel-sm">
                    {t.log.questNum(questNumber.toString().padStart(2, "0"))}
                  </span>

                  {/* Type Badge */}
                  {isBanked ? (
                    <span className="font-pixel text-[9px] sm:text-[10px] bg-mario-coin text-black px-2 py-0.5 border-2 border-black font-bold shadow-pixel-sm flex items-center gap-1">
                      <span>?</span>
                      <span>{t.log.bankedReset}</span>
                    </span>
                  ) : (
                    <span className="font-pixel text-[9px] sm:text-[10px] bg-mario-green text-black px-2 py-0.5 border-2 border-black font-bold shadow-pixel-sm flex items-center gap-1">
                      <span>★</span>
                      <span>{t.log.regularReset}</span>
                    </span>
                  )}

                  {/* Author Badge */}
                  <div className="flex items-center gap-1 font-pixel text-[10px] text-zinc-300 bg-[#12141D] px-2 py-0.5 border border-black shadow-pixel-sm">
                    <span className="text-mario-coin">👑</span>
                    <span className="text-zinc-100">@{author}</span>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                  <span className="text-mario-coin font-pixel text-[9px]">
                    {formatRelativeTime(reset.announced_at, language)}
                  </span>
                  <span className="text-zinc-600 hidden md:inline">|</span>
                  <span className="text-[11px] text-zinc-400 hidden sm:inline">
                    {formatUtcTime(reset.announced_at)}
                  </span>
                </div>
              </div>

              {/* 8-bit Speech Bubble Content */}
              <div className="relative pl-1">
                <p className="font-mono text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap select-text">
                  {reset.text}
                </p>
              </div>

              {/* Footer Actions: Source Link */}
              <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between flex-wrap gap-2 text-[11px]">
                <div className="font-mono text-zinc-500 text-[10px]">
                  ID: <span className="text-zinc-400">{reset.id}</span>
                  {reset.source?.type && (
                    <span className="ml-2 uppercase text-zinc-500">[{reset.source.type}]</span>
                  )}
                </div>

                {reset.source?.url && (
                  <a
                    href={reset.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      playMarioCoinSound();
                      triggerHaptic(8);
                    }}
                    className="inline-flex items-center gap-1.5 font-pixel text-[9px] text-mario-coin bg-[#12141D] hover:bg-black px-2.5 py-1 border-2 border-black shadow-pixel-sm transition-all hover:text-white"
                  >
                    <span>{t.log.originalDispatch}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Expand / Collapse Button Bar */}
      {hasMore && (
        <div className="mt-5 text-center">
          <button
            onClick={handleToggleExpand}
            className="pixel-btn inline-flex items-center gap-2 font-pixel text-xs sm:text-sm px-6 py-3 bg-mario-coin text-black hover:bg-[#D97706] border-2 border-black shadow-pixel rounded-none cursor-pointer"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span>{t.log.collapse}</span>
              </>
            ) : (
              <>
                <ScrollText className="w-4 h-4" />
                <span>{t.log.expandAll(filteredResets.length)}</span>
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
