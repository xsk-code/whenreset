"use client";

import React, { useState } from "react";
import fallbackResets from "@/data/fallback-resets.json";
import { calculateStats } from "@/lib/utils";
import { ResetItem } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { MarioHeader } from "@/components/mario/MarioHeader";
import { MarioLogo } from "@/components/mario/MarioLogo";
import { MarioHero } from "@/components/mario/MarioHero";
import { MarioStats } from "@/components/mario/MarioStats";
import { MarioWatch } from "@/components/mario/MarioWatch";
import { MarioHeatmap } from "@/components/mario/MarioHeatmap";
import { MarioLog } from "@/components/mario/MarioLog";
import { MarioSponsors } from "@/components/mario/MarioSponsors";
import { MarioSubscribe } from "@/components/mario/MarioSubscribe";

export default function Home() {
  const [isSubscribeOpen, setIsSubscribeOpen] = useState<boolean>(false);
  const { t } = useLanguage();

  const resets = fallbackResets as ResetItem[];
  const stats = calculateStats(resets);
  const latest = resets[0];

  return (
    <main className="min-h-screen bg-mario-dark text-white p-3 sm:p-6 md:p-10 flex flex-col items-center selection:bg-mario-coin selection:text-black">
      {/* Decoupled Retro Top Arcade HUD */}
      <MarioHeader
        totalResets={stats.total}
        onOpenSubscribe={() => setIsSubscribeOpen(true)}
      />

      {/* Main Hero: Question Block & Giant Countdown Clock */}
      {latest && <MarioHero latestReset={latest} />}

      {/* Statistics Section: 3 Classic NES Metric Blocks */}
      <MarioStats stats={stats} />

      {/* Stage 1-2: Bowser Castle Radar Watch & Community Bet */}
      <MarioWatch stats={stats} latestReset={latest} />

      {/* Stage 1-2: 26-Week Super Stage Pixel Heatmap */}
      <MarioHeatmap resets={resets} />

      {/* Stage 1-3: Full Quests Stream Timeline */}
      <MarioLog resets={resets} />

      {/* Stage 1-3: 8-Bit Item Shop & Power-Up Rail */}
      <MarioSponsors />

      {/* Level Map / Stage Progression Road */}
      <section className="w-full max-w-5xl my-4 border-2 border-black bg-[#181B26] p-4 shadow-pixel rounded-none">
        <div className="flex items-center justify-between mb-3 border-b border-gray-800 pb-2">
          <div className="font-pixel text-xs text-mario-coin flex items-center gap-2">
            <span>🗺️</span>
            <span>{t.progression.title}</span>
          </div>
          <span className="font-pixel text-[10px] text-mario-green bg-black px-2 py-0.5 border border-mario-green">
            {t.progression.statusCleared}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-pixel text-[10px]">
          <div className="border-2 border-mario-green bg-[#0F111A] p-3 text-mario-green shadow-pixel-sm">
            <div className="font-bold text-xs mb-1">{t.progression.stage1Title}</div>
            <div className="text-white font-mono text-xs">{t.progression.stage1Desc}</div>
            <div className="mt-2 text-[10px] text-mario-green">{t.progression.complete}</div>
          </div>
          <div className="border-2 border-mario-green bg-[#0F111A] p-3 text-mario-green shadow-pixel-sm">
            <div className="font-bold text-xs mb-1 text-mario-red">{t.progression.stage2Title}</div>
            <div className="text-white font-mono text-xs">{t.progression.stage2Desc}</div>
            <div className="mt-2 text-[10px] text-mario-green">{t.progression.complete}</div>
          </div>
          <div className="border-2 border-mario-green bg-[#0F111A] p-3 text-mario-green shadow-pixel-sm">
            <div className="font-bold text-xs mb-1 text-mario-coin">{t.progression.stage3Title}</div>
            <div className="text-white font-mono text-xs">{t.progression.stage3Desc}</div>
            <div className="mt-2 text-[10px] text-mario-green">{t.progression.complete}</div>
          </div>
        </div>
      </section>

      {/* NES Retro Footer */}
      <footer className="w-full max-w-5xl mt-6 mb-8 flex flex-col items-center text-center text-xs font-mono text-gray-400 border-t-2 border-black pt-6">
        <div className="mb-3">
          <MarioLogo size="sm" />
        </div>
        <p className="font-pixel text-[10px] text-mario-coin mb-2">
          {t.footer.quote}
        </p>
        <p className="text-[11px] text-gray-500">
          {t.footer.disclaimer}
        </p>
      </footer>

      {/* Toad Comm Station Modal (Controlled) */}
      <MarioSubscribe
        isOpen={isSubscribeOpen}
        onClose={() => setIsSubscribeOpen(false)}
      />
    </main>
  );
}
