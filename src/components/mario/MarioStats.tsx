"use client";

import React from "react";
import { StatusStats } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface MarioStatsProps {
  stats: StatusStats;
}

export function MarioStats({ stats }: MarioStatsProps) {
  const { t } = useLanguage();

  const statCards = [
    {
      id: "total_resets",
      label: t.stats.totalResets.label,
      value: stats.total.toString(),
      unit: "",
      icon: "🪙",
      accentColor: "text-amber-400",
      badge: t.stats.totalResets.badge,
      badgeColor: "bg-[#241A10] text-amber-300 border border-amber-700/60",
      desc: t.stats.totalResets.desc,
      footer: t.stats.totalResets.footer,
    },
    {
      id: "avg_interval",
      label: t.stats.avgInterval.label,
      value: `${stats.avg_interval_days.toFixed(1)}`,
      unit: t.stats.avgInterval.unit,
      icon: "🍄",
      accentColor: "text-emerald-400",
      badge: t.stats.avgInterval.badge,
      badgeColor: "bg-[#102016] text-emerald-300 border border-emerald-700/60",
      desc: t.stats.avgInterval.desc,
      footer: t.stats.avgInterval.footer,
    },
    {
      id: "longest_wait",
      label: t.stats.longestWait.label,
      value: `${stats.longest_wait_days.toFixed(1)}`,
      unit: t.stats.longestWait.unit,
      icon: "🏰",
      accentColor: "text-red-400",
      badge: t.stats.longestWait.badge,
      badgeColor: "bg-[#2A1515] text-red-300 border border-red-800/60",
      desc: t.stats.longestWait.desc,
      footer: t.stats.longestWait.footer,
    },
  ];

  return (
    <section className="w-full max-w-5xl my-4">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 border-b border-zinc-800/80 pb-2">
        <div className="flex items-center gap-2 font-pixel text-xs sm:text-sm text-mario-coin">
          <span>⭐</span>
          <span>{t.stats.title}</span>
        </div>
        <span className="font-pixel text-[10px] text-zinc-400">
          {t.stats.subtitle}
        </span>
      </div>

      {/* 3 Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {statCards.map((card) => (
          <div
            key={card.id}
            className="border-2 border-black bg-mario-darkCard p-5 sm:p-6 shadow-pixel rounded-none transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-pixel-lg group"
          >
            {/* Top Bar: Icon + Pixel Badge */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-4">
              <span className="text-2xl select-none" role="img" aria-label={card.label}>
                {card.icon}
              </span>
              <span
                className={`font-pixel text-[10px] px-2 py-0.5 shadow-pixel-sm rounded-none ${card.badgeColor}`}
              >
                {card.badge}
              </span>
            </div>

            {/* Metric Label */}
            <h3 className="font-pixel text-xs text-zinc-400 mb-2 tracking-wide">
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
                <span className="font-pixel text-xs text-zinc-400">
                  {card.unit}
                </span>
              )}
            </div>

            {/* Micro Details & Footnote */}
            <div className="border-t border-zinc-800 pt-3 text-xs font-mono">
              <div className="text-zinc-300">{card.desc}</div>
              <div className="text-[11px] text-zinc-500 mt-1">{card.footer}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
