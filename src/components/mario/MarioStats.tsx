import React from "react";
import { StatusStats } from "@/lib/types";

interface MarioStatsProps {
  stats: StatusStats;
}

export function MarioStats({ stats }: MarioStatsProps) {
  const statCards = [
    {
      id: "total_resets",
      label: "TOTAL RESETS",
      value: stats.total.toString(),
      unit: "",
      icon: "🪙",
      accentColor: "text-mario-coin",
      badge: "CLEARED",
      badgeColor: "bg-mario-coin text-black",
      desc: "Total recorded quota resets to date",
      footer: "Historical all-time counter",
    },
    {
      id: "avg_interval",
      label: "AVG MIRACLE INTERVAL",
      value: `${stats.avg_interval_days.toFixed(1)}`,
      unit: "DAYS",
      icon: "🍄",
      accentColor: "text-mario-green",
      badge: "CYCLE ~7D",
      badgeColor: "bg-mario-green text-black",
      desc: "Mean interval between drops",
      footer: "Expected refresh cadence",
    },
    {
      id: "longest_wait",
      label: "LONGEST WAIT",
      value: `${stats.longest_wait_days.toFixed(1)}`,
      unit: "DAYS",
      icon: "🏰",
      accentColor: "text-mario-red",
      badge: "RECORD DROUGHT",
      badgeColor: "bg-mario-red text-white",
      desc: "Longest drought without quota drop",
      footer: "Historical maximum gap",
    },
  ];

  return (
    <section className="w-full max-w-5xl my-4">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-2">
        <div className="flex items-center gap-2 font-pixel text-xs sm:text-sm text-mario-coin">
          <span>⭐</span>
          <span>LEVEL 1-1 STATISTICS LOG</span>
        </div>
        <span className="font-pixel text-[10px] text-gray-400">
          ALL TIME METRICS
        </span>
      </div>

      {/* 3 Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {statCards.map((card) => (
          <div
            key={card.id}
            className="border-[3px] border-black bg-mario-darkCard p-5 sm:p-6 shadow-pixel rounded-none transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-pixel-lg group"
          >
            {/* Top Bar: Icon + Pixel Badge */}
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
              <span className="text-2xl select-none" role="img" aria-label={card.label}>
                {card.icon}
              </span>
              <span
                className={`font-pixel text-[10px] px-2 py-0.5 border-2 border-black shadow-pixel-sm rounded-none ${card.badgeColor}`}
              >
                {card.badge}
              </span>
            </div>

            {/* Metric Label */}
            <h3 className="font-pixel text-xs text-gray-400 mb-2 tracking-wide">
              {card.label}
            </h3>

            {/* Value Display */}
            <div className="flex items-baseline gap-2 mb-3">
              <span
                className={`font-pixel text-3xl sm:text-4xl font-extrabold tracking-tight ${card.accentColor}`}
              >
                {card.value}
              </span>
              {card.unit && (
                <span className="font-pixel text-xs text-gray-400">
                  {card.unit}
                </span>
              )}
            </div>

            {/* Micro Details & Footnote */}
            <div className="border-t border-gray-800 pt-3 text-xs font-mono">
              <div className="text-gray-200">{card.desc}</div>
              <div className="text-[11px] text-gray-400 mt-1">{card.footer}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
