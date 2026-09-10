"use client";

import React from "react";
import { playMarioCoinSound, triggerHaptic } from "@/lib/utils";
import { ExternalLink, Sparkles, Plus } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface SponsorItem {
  id: string;
  icon: string;
  badgeColor: string;
  href?: string;
  isClaimSlot?: boolean;
}

const SPONSOR_BASE_ITEMS: SponsorItem[] = [
  {
    id: "mushroom",
    icon: "🍄",
    badgeColor: "bg-[#2A2E3D] text-gray-300 border-gray-600",
  },
  {
    id: "star",
    icon: "⭐",
    badgeColor: "bg-[#2A2E3D] text-gray-300 border-gray-600",
  },
  {
    id: "coinbox",
    icon: "🪙",
    badgeColor: "bg-[#2A2E3D] text-gray-300 border-gray-600",
  },
  {
    id: "claim",
    icon: "👾",
    badgeColor: "bg-purple-600 text-white animate-pixel-blink border-purple-400",
    href: "mailto:sponsor@whenreset.top?subject=Sponsorship%20Inquiry%20-%20WhenReset%20Item%20Shop",
    isClaimSlot: true,
  },
];

export function MarioSponsors() {
  const { t } = useLanguage();

  const handleItemClick = () => {
    playMarioCoinSound();
    triggerHaptic(12);
  };

  return (
    <section className="w-full max-w-5xl my-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 border-b-2 border-black pb-2">
        <div className="flex items-center gap-2">
          <span className="text-mario-coin text-base">🏪</span>
          <h2 className="font-pixel text-xs sm:text-sm text-mario-coin tracking-wide">
            {t.sponsors.title}
          </h2>
        </div>
        <div className="font-mono text-[11px] text-gray-400">
          {t.sponsors.subtitle}
        </div>
      </div>

      {/* Grid of Power-Ups */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SPONSOR_BASE_ITEMS.map((baseItem) => {
          const item = t.sponsors.items[baseItem.id];
          if (!item) return null;

          return (
            <div
              key={baseItem.id}
              className={`border-[3px] border-black bg-[#181B26] p-4 shadow-pixel rounded-none flex flex-col justify-between transition-all duration-150 hover:-translate-y-1 hover:shadow-pixel-lg ${
                baseItem.isClaimSlot
                  ? "border-purple-500/80 bg-[#1e172e]"
                  : ""
              }`}
            >
              {/* Item Top: Icon + Badge */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-12 h-12 bg-[#0F111A] border-2 border-black flex items-center justify-center text-2xl shadow-pixel-sm shrink-0">
                    <span>{baseItem.icon}</span>
                  </div>

                  <span
                    className={`font-pixel text-[8px] sm:text-[9px] px-1.5 py-1 border border-black shadow-pixel-sm uppercase font-bold text-right ${baseItem.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                </div>

                {/* Title & Category */}
                <div className="mb-2">
                  <div className="font-pixel text-[10px] text-mario-coin mb-1 truncate">
                    {item.name}
                  </div>
                  <div className="font-mono text-xs font-bold text-white tracking-tight">
                    {item.category}
                  </div>
                </div>

                {/* Power Stat */}
                <div className="font-pixel text-[8px] text-mario-green bg-black/60 px-2 py-1 border border-black/80 mb-3 inline-block">
                  ⚡ {item.power}
                </div>

                {/* Description */}
                <p className="font-mono text-xs text-gray-300 leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-black/50">
                {baseItem.href ? (
                  <a
                    href={baseItem.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleItemClick}
                    className="w-full py-2 px-3 font-pixel text-[9px] border-2 border-black flex items-center justify-center gap-1.5 shadow-pixel-sm transition-all rounded-none text-center bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer"
                  >
                    <Plus className="w-3 h-3 shrink-0" />
                    <span>{item.ctaText}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ) : (
                  <div
                    className="w-full py-2 px-3 font-pixel text-[9px] border-2 border-dashed border-gray-600/70 flex items-center justify-center gap-1.5 rounded-none text-center bg-[#0F111A]/60 text-gray-500 select-none"
                  >
                    <span>[ {item.ctaText} ]</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
