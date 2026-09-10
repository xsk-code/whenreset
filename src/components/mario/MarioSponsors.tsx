"use client";

import React from "react";
import { playMarioCoinSound, triggerHaptic } from "@/lib/utils";
import { ExternalLink, Sparkles, Plus } from "lucide-react";

interface SponsorItem {
  id: string;
  icon: string;
  name: string;
  category: string;
  power: string;
  badge: string;
  badgeColor: string;
  description: string;
  ctaText: string;
  href: string;
  isClaimSlot?: boolean;
}

const SPONSOR_ITEMS: SponsorItem[] = [
  {
    id: "mushroom",
    icon: "🍄",
    name: "SUPER MUSHROOM",
    category: "AI CODING ASSISTANT",
    power: "+100X DEV SPEED",
    badge: "FEATURED POWER-UP",
    badgeColor: "bg-mario-red text-white",
    description: "Context-aware agentic code completion, multi-file refactoring, and automated bug squashing for quota-weary builders.",
    ctaText: "EQUIP ITEM",
    href: "https://cursor.com",
  },
  {
    id: "star",
    icon: "⭐",
    name: "SUPER STAR",
    category: "CLOUD GPU COMPUTE",
    power: "INVINCIBLE COMPUTE",
    badge: "WARP SPEED",
    badgeColor: "bg-mario-coin text-black",
    description: "Instant access to dedicated H100 & B200 GPU clusters with zero queue times and per-second microbilling.",
    ctaText: "EQUIP ITEM",
    href: "https://lambda.com",
  },
  {
    id: "coinbox",
    icon: "🪙",
    name: "COIN BOX",
    category: "API REVERSE PROXY",
    power: "MAX BANDWIDTH",
    badge: "INFINITE QUOTA",
    badgeColor: "bg-mario-green text-black",
    description: "Ultra-resilient OpenAI & Anthropic edge gateway with global routing, smart caching, and automatic model failover.",
    ctaText: "EQUIP ITEM",
    href: "https://openrouter.ai",
  },
  {
    id: "claim",
    icon: "👾",
    name: "MYSTERY BOX",
    category: "CLAIM THIS ITEM SLOT",
    power: "100K+ DEVELOPERS",
    badge: "$199 / MO",
    badgeColor: "bg-purple-600 text-white animate-pixel-blink",
    description: "Promote your devtool, AI framework or cloud infrastructure directly on the #1 Codex quota tracker.",
    ctaText: "CLAIM THIS ITEM SLOT ($199/MO)",
    href: "mailto:sponsor@whenreset.top?subject=Sponsorship%20Inquiry%20-%20WhenReset%20Item%20Shop",
    isClaimSlot: true,
  },
];

export function MarioSponsors() {
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
            8-BIT ITEM SHOP &amp; POWER-UP RAIL
          </h2>
        </div>
        <div className="font-mono text-[11px] text-gray-400">
          SPONSOR POWER-UPS KEEPING WHENRESET 100% FREE
        </div>
      </div>

      {/* Grid of Power-Ups */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SPONSOR_ITEMS.map((item) => {
          return (
            <div
              key={item.id}
              className={`border-[3px] border-black bg-[#181B26] p-4 shadow-pixel rounded-none flex flex-col justify-between transition-all duration-150 hover:-translate-y-1 hover:shadow-pixel-lg ${
                item.isClaimSlot
                  ? "border-purple-500/80 bg-[#1e172e]"
                  : ""
              }`}
            >
              {/* Item Top: Icon + Badge */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-12 h-12 bg-[#0F111A] border-2 border-black flex items-center justify-center text-2xl shadow-pixel-sm shrink-0">
                    <span>{item.icon}</span>
                  </div>

                  <span
                    className={`font-pixel text-[8px] sm:text-[9px] px-1.5 py-1 border border-black shadow-pixel-sm uppercase font-bold text-right ${item.badgeColor}`}
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
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleItemClick}
                  className={`w-full py-2 px-3 font-pixel text-[9px] border-2 border-black flex items-center justify-center gap-1.5 shadow-pixel-sm transition-all rounded-none text-center ${
                    item.isClaimSlot
                      ? "bg-purple-600 hover:bg-purple-500 text-white font-bold"
                      : "bg-[#0F111A] hover:bg-mario-coin text-gray-300 hover:text-black font-bold"
                  }`}
                >
                  {item.isClaimSlot ? (
                    <>
                      <Plus className="w-3 h-3 shrink-0" />
                      <span>{item.ctaText}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </>
                  ) : (
                    <>
                      <span>[ {item.ctaText} ]</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </>
                  )}
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
