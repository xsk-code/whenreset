"use client";

import React, { useState, useMemo, useCallback } from "react";
import { ResetItem } from "@/lib/types";
import { playMarioCoinSound, triggerHaptic, cn } from "@/lib/utils";
import { Calendar, ExternalLink, Sparkles, HelpCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface MarioHeatmapProps {
  resets: ResetItem[];
}

interface DayCell {
  dateStr: string; // YYYY-MM-DD
  dayOfWeek: number; // 0 = Sun, 6 = Sat
  weekIndex: number;
  month: string; // "JAN", "FEB", etc.
  dayOfMonth: number;
  resets: ResetItem[];
  hasReset: boolean;
  hasBanked: boolean;
  hasRegular: boolean;
  isToday: boolean;
}

const MONTH_NAMES = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
];

// Fixed end date anchor: Saturday 2026-09-12 (aligns with latest dataset reset)
const ANCHOR_END_DATE_UTC = new Date(Date.UTC(2026, 8, 12));

export function MarioHeatmap({ resets }: MarioHeatmapProps) {
  const { t } = useLanguage();
  const [viewWeeks, setViewWeeks] = useState<26 | 52>(26);
  const [hoveredCell, setHoveredCell] = useState<DayCell | null>(null);
  const [selectedCell, setSelectedCell] = useState<DayCell | null>(null);

  // Group resets by YYYY-MM-DD
  const resetMap = useMemo(() => {
    const map = new Map<string, ResetItem[]>();
    for (const r of resets) {
      const dateKey = r.announced_at.slice(0, 10);
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(r);
    }
    return map;
  }, [resets]);

  // Generate grid matrix of days
  const { weeks, monthLabels, totalResetsInView, bankedCount, regularCount } = useMemo(() => {
    const totalDays = viewWeeks * 7;
    const startMs = ANCHOR_END_DATE_UTC.getTime() - (totalDays - 1) * 24 * 3600 * 1000;
    const startDate = new Date(startMs);

    const matrix: DayCell[][] = [];
    let inViewCount = 0;
    let bCount = 0;
    let rCount = 0;

    const monthHeaders: { label: string; weekIndex: number }[] = [];
    let lastSeenMonth = -1;

    for (let w = 0; w < viewWeeks; w++) {
      const currentWeek: DayCell[] = [];
      for (let d = 0; d < 7; d++) {
        const dayOffset = w * 7 + d;
        const cellDate = new Date(startDate.getTime() + dayOffset * 24 * 3600 * 1000);
        const dateStr = cellDate.toISOString().slice(0, 10);
        const dayOfWeek = cellDate.getUTCDay();
        const mIdx = cellDate.getUTCMonth();
        const dayOfMonth = cellDate.getUTCDate();

        const dayResets = resetMap.get(dateStr) || [];
        const hasReset = dayResets.length > 0;
        const hasBanked = dayResets.some((item) => item.reset_type === "banked");
        const hasRegular = dayResets.some((item) => item.reset_type === "regular");

        if (hasReset) {
          inViewCount += dayResets.length;
          if (hasBanked) bCount += dayResets.filter((x) => x.reset_type === "banked").length;
          if (hasRegular) rCount += dayResets.filter((x) => x.reset_type === "regular").length;
        }

        if (d === 0 && mIdx !== lastSeenMonth) {
          monthHeaders.push({ label: MONTH_NAMES[mIdx], weekIndex: w });
          lastSeenMonth = mIdx;
        }

        currentWeek.push({
          dateStr,
          dayOfWeek,
          weekIndex: w,
          month: MONTH_NAMES[mIdx],
          dayOfMonth,
          resets: dayResets,
          hasReset,
          hasBanked,
          hasRegular,
          isToday: dateStr === "2026-09-10",
        });
      }
      matrix.push(currentWeek);
    }

    return {
      weeks: matrix,
      monthLabels: monthHeaders,
      totalResetsInView: inViewCount,
      bankedCount: bCount,
      regularCount: rCount,
    };
  }, [viewWeeks, resetMap]);

  // Active cell to inspect in the bottom panel (defaults to latest reset or selected cell)
  const activeInspection = useMemo(() => {
    if (selectedCell) return selectedCell;
    if (hoveredCell) return hoveredCell;
    // Find the latest reset in the grid to display as initial highlight
    for (let w = weeks.length - 1; w >= 0; w--) {
      for (let d = 6; d >= 0; d--) {
        if (weeks[w][d]?.hasReset) {
          return weeks[w][d];
        }
      }
    }
    return weeks[weeks.length - 1]?.[6] || null;
  }, [selectedCell, hoveredCell, weeks]);

  // Handle clicking a cell
  const handleCellClick = useCallback((cell: DayCell) => {
    setSelectedCell(cell);
    if (cell.hasReset) {
      playMarioCoinSound();
    }
    triggerHaptic(14);
  }, []);

  return (
    <section className="w-full max-w-5xl my-4">
      <div className="border-2 border-black bg-mario-darkCard p-4 sm:p-6 md:p-8 shadow-pixel rounded-none">
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between border-b border-zinc-800/80 pb-4 mb-6 gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl select-none">🗺️</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-pixel text-xs sm:text-sm md:text-base text-mario-coin">
                  {t.heatmap.title}
                </h2>
              </div>
              <p className="font-mono text-[11px] text-zinc-400 mt-1">
                {t.heatmap.subtitle}
              </p>
            </div>
          </div>

          {/* View Mode Toggle: 26 Weeks (Default) vs 52 Weeks (All-time) */}
          <div className="flex items-center gap-1 border-2 border-black bg-[#0F111A] p-1 shadow-pixel-sm rounded-none">
            <button
              onClick={() => {
                setViewWeeks(26);
                triggerHaptic(10);
              }}
              className={cn(
                "font-pixel text-[9px] sm:text-[10px] px-2.5 py-1.5 transition-all rounded-none",
                viewWeeks === 26
                  ? "bg-mario-coin text-black font-bold shadow-pixel-sm"
                  : "text-gray-400 hover:text-white"
              )}
            >
              {t.heatmap.view26}
            </button>
            <button
              onClick={() => {
                setViewWeeks(52);
                triggerHaptic(10);
              }}
              className={cn(
                "font-pixel text-[9px] sm:text-[10px] px-2.5 py-1.5 transition-all rounded-none",
                viewWeeks === 52
                  ? "bg-mario-coin text-black font-bold shadow-pixel-sm"
                  : "text-gray-400 hover:text-white"
              )}
            >
              {t.heatmap.view52}
            </button>
          </div>
        </div>

        {/* Heatmap Matrix Container (Horizontally scrollable on mobile) */}
        <div className="w-full overflow-x-auto pixel-scrollbar pb-3 pt-1">
          <div
            className={cn(
              "inline-block select-none",
              viewWeeks === 26 ? "min-w-[660px]" : "min-w-[1020px]"
            )}
          >
            {/* Month Labels Header */}
            <div className="flex text-[10px] font-pixel text-gray-400 mb-2 pl-8 sm:pl-10">
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${viewWeeks}, minmax(0, 1fr))`,
                  width: "100%",
                }}
              >
                {monthLabels.map((m, idx) => (
                  <div
                    key={`${m.label}-${idx}`}
                    style={{ gridColumnStart: m.weekIndex + 1 }}
                    className="text-mario-coin font-bold tracking-wider"
                  >
                    {m.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Grid with Day of Week Rows (Sun..Sat) */}
            <div className="flex">
              {/* Day Labels on the Left */}
              <div className="flex flex-col justify-between pr-2 sm:pr-3 text-[9px] font-pixel text-gray-500 w-8 sm:w-10 text-right">
                {t.heatmap.dayLabels.map((d, i) => (
                  <span
                    key={d}
                    className={cn(
                      "h-5 sm:h-6 flex items-center justify-end",
                      i % 2 === 1 ? "text-gray-400" : "text-gray-600"
                    )}
                  >
                    {d}
                  </span>
                ))}
              </div>

              {/* Week Columns Grid */}
              <div
                className="grid gap-1 flex-1"
                style={{
                  gridTemplateColumns: `repeat(${viewWeeks}, minmax(0, 1fr))`,
                }}
              >
                {weeks.map((week, wIdx) => (
                  <div key={`week-${wIdx}`} className="flex flex-col gap-1">
                    {week.map((cell) => {
                      const isSelected = selectedCell?.dateStr === cell.dateStr;
                      const isHovered = hoveredCell?.dateStr === cell.dateStr;

                      return (
                        <div
                          key={cell.dateStr}
                          role="button"
                          tabIndex={0}
                          aria-label={`${cell.dateStr}: ${
                            cell.hasReset
                              ? `${cell.resets.length} reset(s)`
                              : "No reset"
                          }`}
                          onMouseEnter={() => setHoveredCell(cell)}
                          onMouseLeave={() => setHoveredCell(null)}
                          onClick={() => handleCellClick(cell)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleCellClick(cell);
                            }
                          }}
                          className={cn(
                            "h-5 sm:h-6 w-full rounded-none border transition-all cursor-pointer relative flex items-center justify-center font-pixel text-[8px]",
                            // Cell Colors
                            cell.hasBanked
                              ? "bg-mario-coin text-black border-2 border-black shadow-pixel-sm font-bold animate-question-glow hover:brightness-125"
                              : cell.hasRegular
                              ? "bg-mario-green text-black border-2 border-black shadow-pixel-sm font-bold hover:brightness-125"
                              : "bg-[#12141F] border-[#222738] hover:bg-[#1E2333] hover:border-gray-500",
                            // Selected / Hovered outline
                            (isSelected || isHovered) &&
                              "ring-2 ring-white z-20 scale-110",
                            cell.isToday && "outline outline-1 outline-blue-400"
                          )}
                        >
                          {/* Inner Cell Pixel Sprites */}
                          {cell.hasBanked ? (
                            <span className="font-bold select-none drop-shadow-[1px_1px_0px_#B84418]">
                              ?
                            </span>
                          ) : cell.hasRegular ? (
                            <span className="text-[7px] select-none">★</span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Legend & 26-Week Total Metric Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-zinc-800/80 text-xs font-mono">
          {/* Legend Items */}
          <div className="flex flex-wrap items-center gap-4 text-zinc-300">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-[#12141D] border border-zinc-800 inline-block" />
              <span className="text-zinc-400 text-[11px]">{t.heatmap.noReset}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-mario-green border border-black inline-flex items-center justify-center text-[7px] text-black font-pixel font-bold">
                ★
              </span>
              <span className="text-mario-green text-[11px] font-bold">
                {t.heatmap.regularReset(regularCount)}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-mario-coin border border-black inline-flex items-center justify-center text-[7px] text-black font-pixel font-bold">
                ?
              </span>
              <span className="text-mario-coin text-[11px] font-bold">
                {t.heatmap.bankedReset(bankedCount)}
              </span>
            </div>
          </div>

          {/* Indicator Count */}
          <div className="flex items-center gap-2 font-pixel text-[10px] text-zinc-300 bg-[#12141D] px-3 py-1.5 border border-black">
            <span>{t.heatmap.windowResets}</span>
            <span className="text-mario-coin font-bold">{totalResetsInView}</span>
            <span className="text-zinc-500">|</span>
            <span>{t.heatmap.allTime}</span>
            <span className="text-mario-green font-bold">{resets.length}</span>
          </div>
        </div>

        {/* Inspected Block Intel Card (Accessible for both hover & mobile click) */}
        {activeInspection && (
          <div className="mt-5 border-2 border-black bg-[#141622] p-4 rounded-none shadow-pixel-sm transition-all">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-3 mb-3">
              <div className="flex items-center gap-2.5 font-pixel text-xs text-zinc-200">
                <Calendar size={14} className="text-mario-coin" />
                <span>
                  {activeInspection.dateStr} (
                  {t.heatmap.dayLabels[activeInspection.dayOfWeek]})
                </span>
                {activeInspection.isToday && (
                  <span className="bg-blue-600 text-white font-pixel text-[9px] px-1.5 py-0.5 border border-black">
                    {t.heatmap.today}
                  </span>
                )}
              </div>

              {/* Status Badge */}
              <div>
                {activeInspection.hasBanked ? (
                  <span className="bg-mario-coin text-black font-pixel text-[10px] px-2 py-0.5 border border-black flex items-center gap-1">
                    <HelpCircle size={11} /> {t.heatmap.bankedBadge}
                  </span>
                ) : activeInspection.hasRegular ? (
                  <span className="bg-mario-green text-black font-pixel text-[10px] px-2 py-0.5 border border-black flex items-center gap-1">
                    <Sparkles size={11} /> {t.heatmap.regularBadge}
                  </span>
                ) : (
                  <span className="bg-zinc-800 text-zinc-400 font-pixel text-[10px] px-2 py-0.5 border border-zinc-700">
                    {t.heatmap.emptyBadge}
                  </span>
                )}
              </div>
            </div>

            {/* Reset Intel Body */}
            {activeInspection.hasReset ? (
              <div className="space-y-3">
                {activeInspection.resets.map((r, i) => (
                  <div
                    key={r.id || i}
                    className="border border-zinc-800 bg-[#191C28] p-3 rounded-none"
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-zinc-400 mb-1">
                      <span>
                        {t.heatmap.announced}{" "}
                        <span className="text-zinc-200 font-bold">
                          {new Date(r.announced_at).toUTCString()}
                        </span>
                      </span>
                      {r.source?.url && (
                        <a
                          href={r.source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-pixel text-[9px] text-blue-400 hover:text-blue-300 flex items-center gap-1 underline"
                        >
                          <span>{t.heatmap.viewTweet}</span>
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                    <p className="font-mono text-xs sm:text-sm text-zinc-200 italic leading-relaxed">
                      &ldquo;{r.text}&rdquo;
                    </p>
                    {r.source?.author && (
                      <div className="text-[11px] font-mono text-zinc-400 mt-1">
                        {t.heatmap.author} @{r.source.author}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-mono text-xs text-zinc-400 italic">
                {t.heatmap.quietDungeon}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
