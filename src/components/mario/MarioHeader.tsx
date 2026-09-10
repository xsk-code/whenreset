"use client";

import React from "react";
import { playMarioCoinSound, triggerHaptic } from "@/lib/utils";
import { Bell, Languages } from "lucide-react";
import { MarioLogo } from "./MarioLogo";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { trackEvent } from "@/lib/analytics";

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
    trackEvent("subscribe_modal_opened", { source: "header_notify_btn" });
    onOpenSubscribe();
  };

  const handleLangToggle = () => {
    playMarioCoinSound();
    triggerHaptic(12);
    const targetLang = language === "zh" ? "en" : "zh";
    trackEvent("language_toggled", { target: targetLang });
    toggleLanguage();
  };

  return (
    <>
      <header className="w-full max-w-5xl border-2 border-black bg-mario-darkCard p-3 sm:p-4 mb-4 shadow-pixel rounded-none">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Brand Info & Live Beacon */}
          <div className="flex items-center gap-3">
            <MarioLogo size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-pixel text-lg sm:text-2xl md:text-3xl text-mario-coin tracking-tight flex items-center gap-2">
                  <span>WHENRESET</span>
                  <span className="text-[10px] sm:text-xs bg-[#2A1515] text-red-400 border border-red-900/60 px-2 py-0.5 shadow-pixel-sm">
                    8-BIT
                  </span>
                </h1>
                {/* Live Radar Beacon */}
                <div className="hidden sm:flex items-center gap-1.5 bg-[#12141D] px-2 py-0.5 border border-zinc-800 shadow-pixel-sm ml-1">
                  <span className="inline-block w-2 h-2 bg-mario-green animate-pixel-blink" />
                  <span className="text-mario-green font-pixel text-[9px]">{t.header.liveRadar}</span>
                </div>
              </div>
              <p className="font-mono text-xs text-zinc-400 mt-1">
                {t.header.subtitle}
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-2 font-pixel text-[10px]">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={handleLangToggle}
              className="pixel-btn px-2.5 py-1.5 bg-[#12141D] text-zinc-300 border-2 border-black shadow-pixel-sm hover:text-mario-coin hover:border-mario-coin flex items-center gap-1.5 font-bold cursor-pointer rounded-none transition-all"
              title={language === "zh" ? "Switch to English" : "切换为中文"}
            >
              <Languages className="w-3.5 h-3.5 text-zinc-400" />
              <span>[ 🌐 {language === "zh" ? "EN" : "中文"} ]</span>
            </button>

            {/* Notify Me Trigger Button */}
            <button
              type="button"
              onClick={handleNotifyClick}
              className="pixel-btn px-3 py-1.5 bg-mario-coin text-black border-2 border-black shadow-pixel-sm hover:bg-[#F59E0B] flex items-center gap-1.5 font-bold cursor-pointer rounded-none"
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
