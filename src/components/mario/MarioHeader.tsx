"use client";

import React from "react";
import { playMarioCoinSound, triggerHaptic } from "@/lib/utils";
import { Bell, Languages } from "lucide-react";
import { MarioLogo } from "./MarioLogo";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface MarioHeaderProps {
  totalResets: number;
  userCoins?: number;
  onOpenSubscribe: () => void;
}

export function MarioHeader({ totalResets, userCoins, onOpenSubscribe }: MarioHeaderProps) {
  const { language, toggleLanguage, t } = useLanguage();

  const handleNotifyClick = () => {
    playMarioCoinSound();
    triggerHaptic(14);
    onOpenSubscribe();
  };

  const handleLangToggle = () => {
    playMarioCoinSound();
    triggerHaptic(12);
    toggleLanguage();
  };

  return (
    <>
      <header className="w-full max-w-5xl border-[3px] border-black bg-[#181B26] p-3 sm:p-4 mb-4 shadow-pixel rounded-none">
        {/* Top Arcade HUD Stats Line */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-pixel">
          <div className="flex items-center gap-2">
            <span className="text-mario-red text-base">🍄</span>
            <span className="text-white tracking-widest">MARIO</span>
            <span className="text-mario-coin ml-1">004200</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 text-gray-300">
            {/* Coins counter */}
            <div className="flex items-center gap-1.5 text-mario-coin">
              <span>🪙</span>
              <span>x{(userCoins !== undefined ? userCoins : totalResets).toString().padStart(2, "0")}</span>
            </div>

            {/* World indicator */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400">{t.header.world}</span>
              <span className="text-white">1-3</span>
            </div>

            {/* Live Radar Pulsing Beacon */}
            <div className="flex items-center gap-1.5 bg-[#0F111A] px-2 py-0.5 border border-black shadow-pixel-sm">
              <span className="inline-block w-2 h-2 bg-mario-green animate-pixel-blink" />
              <span className="text-mario-green text-[9px] sm:text-[10px]">{t.header.liveRadar}</span>
            </div>
          </div>
        </div>

        {/* Arcade Title Marquee & Navigation / Action Bar */}
        <div className="mt-3 pt-3 border-t-2 border-black flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <MarioLogo size="md" />
            <div>
              <h1 className="font-pixel text-lg sm:text-2xl md:text-3xl text-mario-coin tracking-tight flex items-center gap-2">
                <span>WHENRESET</span>
                <span className="text-xs bg-mario-red text-white px-2 py-0.5 border border-black shadow-pixel-sm">
                  8-BIT
                </span>
              </h1>
              <p className="font-mono text-xs text-gray-400 mt-1">
                {t.header.subtitle}
              </p>
            </div>
          </div>

          {/* Action Controls & Endpoints */}
          <div className="flex flex-wrap items-center gap-2 font-pixel text-[10px]">
            {/* Language Switcher */}
            <button
              onClick={handleLangToggle}
              className="pixel-btn px-2.5 py-1.5 bg-[#0F111A] text-mario-coin border-2 border-black shadow-pixel-sm hover:bg-mario-coin hover:text-black flex items-center gap-1.5 font-bold cursor-pointer rounded-none transition-all"
              title={language === "zh" ? "Switch to English" : "切换为中文"}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>[ 🌐 {language === "zh" ? "EN" : "中文"} ]</span>
            </button>

            {/* Notify Me Trigger Button */}
            <button
              onClick={handleNotifyClick}
              className="pixel-btn px-3 py-1.5 bg-mario-coin text-black border-2 border-black shadow-pixel-sm hover:bg-[#FED626] flex items-center gap-1.5 font-bold cursor-pointer rounded-none"
            >
              <Bell className="w-3 h-3" />
              <span>{t.header.notifyMe}</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
