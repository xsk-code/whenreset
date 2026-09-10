"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ResetItem } from "@/lib/types";
import {
  formatRelativeTime,
  formatUtcTime,
  playMarioCoinSound,
  playMarioPowerupSound,
  triggerHaptic,
  cn,
} from "@/lib/utils";
import { Volume2, VolumeX, ExternalLink, Clock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface MarioHeroProps {
  latestReset: ResetItem;
}

interface ElapsedTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalHours: number;
}

interface FloatingCoin {
  id: number;
  offset: number;
  isBonus?: boolean;
}

function calculateElapsed(announcedAt: string): ElapsedTime {
  const announced = new Date(announcedAt).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - announced);

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const totalHours = diff / (1000 * 60 * 60);

  return { days, hours, minutes, seconds, totalHours };
}

export function MarioHero({ latestReset }: MarioHeroProps) {
  const { language, t } = useLanguage();
  const [elapsed, setElapsed] = useState<ElapsedTime>(() =>
    calculateElapsed(latestReset.announced_at)
  );
  const [coinCount, setCoinCount] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [isHit, setIsHit] = useState<boolean>(false);
  const [floatingCoins, setFloatingCoins] = useState<FloatingCoin[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Live timer tick every second
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(calculateElapsed(latestReset.announced_at));
    }, 1000);

    return () => clearInterval(interval);
  }, [latestReset.announced_at]);

  // Check if reset was within the last 24 hours
  const isRecentReset = elapsed.totalHours < 24;

  // Handle Question Block Hit
  const handleHitBlock = useCallback(() => {
    // 1. Audio feedback
    const isBonus = (coinCount + 1) % 100 === 0;
    if (soundEnabled) {
      if (isBonus) {
        playMarioPowerupSound();
      } else {
        playMarioCoinSound();
      }
    }

    // 2. Mobile haptic vibration
    triggerHaptic(18);

    // 3. Block bounce animation
    setIsHit(true);
    setTimeout(() => {
      setIsHit(false);
    }, 220);

    // 4. Counters
    setCoinCount((prev) => prev + 1);
    setScore((prev) => prev + (isBonus ? 1000 : 100));

    // 5. Spawn floating coin animation particle
    const coinId = Date.now() + Math.random();
    const randomOffset = (Math.random() - 0.5) * 44;
    setFloatingCoins((prev) => [
      ...prev.slice(-12),
      { id: coinId, offset: randomOffset, isBonus },
    ]);

    setTimeout(() => {
      setFloatingCoins((prev) => prev.filter((c) => c.id !== coinId));
    }, 700);
  }, [coinCount, soundEnabled]);

  return (
    <section className="w-full max-w-5xl border-[3px] border-black bg-mario-darkCard p-4 sm:p-6 md:p-8 shadow-pixel rounded-none my-6">
      {/* Top Banner Row: Stage Header + SFX Toggle */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-black pb-4 mb-6 gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xl sm:text-2xl animate-pixel-blink select-none">
            🍄
          </span>
          <div>
            <h2 className="font-pixel text-xs sm:text-sm md:text-base text-mario-coin">
              {t.hero.title}
            </h2>
            <div className="text-[11px] font-mono text-gray-400 mt-0.5">
              {t.hero.stageTag}
            </div>
          </div>
        </div>

        {/* Audio Toggle Button */}
        <button
          onClick={() => setSoundEnabled((prev) => !prev)}
          className="font-pixel text-[10px] px-3 py-1.5 border-2 border-black bg-[#0F111A] text-gray-300 hover:text-mario-coin hover:border-mario-coin shadow-pixel-sm rounded-none flex items-center gap-2 transition-all active:translate-x-[1px] active:translate-y-[1px]"
          title={soundEnabled ? "Mute 8-bit Audio" : "Enable 8-bit Audio"}
        >
          {soundEnabled ? (
            <>
              <Volume2 size={13} className="text-mario-green" />
              <span>{t.hero.sfxOn}</span>
            </>
          ) : (
            <>
              <VolumeX size={13} className="text-mario-red" />
              <span>{t.hero.sfxOff}</span>
            </>
          )}
        </button>
      </div>

      {/* Main Grid: Interactive Block + Giant Clock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-center">
        {/* Left / Center on Mobile: The Interactive Question Block */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 bg-[#0F111A] border-2 border-black shadow-pixel-sm rounded-none">
          <div className="relative flex flex-col items-center">
            {/* The Question Mark Block */}
            <div
              role="button"
              tabIndex={0}
              aria-label={t.hero.hitBlockAria}
              onClick={handleHitBlock}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleHitBlock();
                }
              }}
              className={cn(
                "relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-none border-[4px] border-black bg-mario-coin cursor-pointer select-none transition-all shadow-pixel flex flex-col items-center justify-center focus:outline-none focus:ring-4 focus:ring-mario-coin",
                isHit && "animate-block-hit shadow-pixel-pressed -translate-y-2",
                !isHit && "hover:-translate-y-1 hover:shadow-pixel-lg active:translate-y-1"
              )}
            >
              {/* NES 3D Inset Bevels */}
              <div className="absolute top-0 left-0 right-0 h-2.5 bg-[#FFF587] pointer-events-none" />
              <div className="absolute top-0 left-0 bottom-0 w-2.5 bg-[#FFF587] pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-2.5 bg-[#B84418] pointer-events-none" />
              <div className="absolute top-0 right-0 bottom-0 w-2.5 bg-[#B84418] pointer-events-none" />

              {/* 4 Corner Rivets */}
              <div className="absolute top-2 left-2 w-2 h-2 bg-black pointer-events-none" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-black pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-2 h-2 bg-black pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-2 h-2 bg-black pointer-events-none" />

              {/* Center Icon */}
              <span className="font-pixel text-4xl sm:text-5xl md:text-6xl text-black font-extrabold drop-shadow-[2px_2px_0px_#B84418] animate-question-glow select-none">
                ?
              </span>

              {/* Floating Coins Popup Particles */}
              {floatingCoins.map((coin) => (
                <div
                  key={coin.id}
                  className="absolute pointer-events-none -top-6 left-1/2 font-pixel text-mario-coin text-xs sm:text-sm md:text-base font-bold whitespace-nowrap animate-coin-pop flex items-center gap-1 z-30 drop-shadow-[2px_2px_0px_#000]"
                  style={{
                    transform: `translateX(calc(-50% + ${coin.offset}px))`,
                  }}
                >
                  {coin.isBonus ? (
                    <span className="text-mario-green bg-black px-1 border border-mario-green">
                      {t.hero.bonusCoin}
                    </span>
                  ) : (
                    <>
                      <span>🪙</span>
                      <span>+1</span>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Block Action Button: [ 🍄 Thank You Tibo! ] or [ ❓ Hit for 1-UP ] */}
            <button
              onClick={handleHitBlock}
              className={cn(
                "mt-4 font-pixel text-[11px] sm:text-xs px-3 sm:px-4 py-2 border-2 border-black rounded-none shadow-pixel transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center gap-2",
                isRecentReset
                  ? "bg-mario-green text-black hover:bg-[#00c800]"
                  : "bg-mario-coin text-black hover:bg-[#fed626]"
              )}
            >
              {isRecentReset ? t.hero.hitBlockButtonActive : t.hero.hitBlockButtonNormal}
            </button>

            {/* Score & Coin HUD Under Block */}
            <div className="mt-3 flex items-center gap-4 font-pixel text-[10px] sm:text-xs text-gray-300">
              <span className="flex items-center gap-1 text-mario-coin font-bold">
                <span>🪙</span> x{coinCount.toString().padStart(2, "0")}
              </span>
              <span className="text-gray-400">
                {t.hero.score} {score.toString().padStart(6, "0")}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Giant Pixel Clock & Reset Status Badges */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          {/* Giant Pixel Clock 4-Box Grid */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4">
            {/* DAYS */}
            <div className="border-[3px] border-black bg-[#0F111A] p-2.5 sm:p-4 text-center shadow-pixel rounded-none">
              <div
                className="font-pixel text-2xl sm:text-3xl md:text-5xl text-mario-coin font-bold tracking-tight"
                suppressHydrationWarning
              >
                {elapsed.days.toString().padStart(2, "0")}
              </div>
              <div className="font-pixel text-[9px] sm:text-[10px] md:text-xs text-gray-400 mt-2 uppercase">
                {t.hero.days}
              </div>
            </div>

            {/* HOURS */}
            <div className="border-[3px] border-black bg-[#0F111A] p-2.5 sm:p-4 text-center shadow-pixel rounded-none">
              <div
                className="font-pixel text-2xl sm:text-3xl md:text-5xl text-mario-coin font-bold tracking-tight"
                suppressHydrationWarning
              >
                {elapsed.hours.toString().padStart(2, "0")}
              </div>
              <div className="font-pixel text-[9px] sm:text-[10px] md:text-xs text-gray-400 mt-2 uppercase">
                {t.hero.hours}
              </div>
            </div>

            {/* MINUTES */}
            <div className="border-[3px] border-black bg-[#0F111A] p-2.5 sm:p-4 text-center shadow-pixel rounded-none">
              <div
                className="font-pixel text-2xl sm:text-3xl md:text-5xl text-mario-coin font-bold tracking-tight"
                suppressHydrationWarning
              >
                {elapsed.minutes.toString().padStart(2, "0")}
              </div>
              <div className="font-pixel text-[9px] sm:text-[10px] md:text-xs text-gray-400 mt-2 uppercase">
                {t.hero.mins}
              </div>
            </div>

            {/* SECONDS */}
            <div className="border-[3px] border-black bg-[#0F111A] p-2.5 sm:p-4 text-center shadow-pixel rounded-none">
              <div
                className="font-pixel text-2xl sm:text-3xl md:text-5xl text-mario-green font-bold tracking-tight"
                suppressHydrationWarning
              >
                {elapsed.seconds.toString().padStart(2, "0")}
              </div>
              <div className="font-pixel text-[9px] sm:text-[10px] md:text-xs text-gray-400 mt-2 uppercase">
                {t.hero.secs}
              </div>
            </div>
          </div>

          {/* Time Metadata & Reset Type Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-black/50 pt-4 pb-1">
            {/* Relative & UTC Time */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-mario-coin font-bold">
                <Clock size={14} />
                <span suppressHydrationWarning>
                  {formatRelativeTime(latestReset.announced_at, language)}
                </span>
              </div>
              <div className="text-gray-400">
                {t.common.utc}:{" "}
                <span className="text-white font-mono font-bold">
                  {formatUtcTime(latestReset.announced_at)}
                </span>
              </div>
            </div>

            {/* Reset Property Badge (Regular vs Banked) */}
            <div>
              {latestReset.reset_type === "banked" ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-mario-red text-white border-2 border-black font-pixel text-[10px] sm:text-xs px-2.5 py-1 shadow-pixel-sm rounded-none">
                    <span>🍄</span>
                    <span>{t.hero.bankedReset}</span>
                  </span>
                  <span className="hidden sm:inline font-mono text-[11px] text-gray-400">
                    {t.hero.bankedDesc}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-mario-green text-black border-2 border-black font-pixel text-[10px] sm:text-xs px-2.5 py-1 shadow-pixel-sm rounded-none">
                    <span>⭐</span>
                    <span>{t.hero.regularReset}</span>
                  </span>
                  <span className="hidden sm:inline font-mono text-[11px] text-gray-400">
                    {t.hero.regularDesc}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Latest Transmission Note */}
          <div className="mt-4 border-2 border-black bg-[#0F111A] p-3 sm:p-4 rounded-none shadow-pixel-sm">
            <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-gray-800">
              <div className="flex items-center gap-2 font-pixel text-[11px] text-mario-coin">
                <span>📡</span>
                <span>{t.hero.latestIntel}</span>
              </div>
              <a
                href={latestReset.source.url}
                target="_blank"
                rel="noreferrer"
                className="font-pixel text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 underline"
              >
                <span>{t.hero.xPost}</span>
                <ExternalLink size={12} />
              </a>
            </div>
            <p className="font-mono text-xs sm:text-sm text-gray-200 leading-relaxed italic line-clamp-3">
              &ldquo;{latestReset.text}&rdquo;
            </p>
            <div className="mt-2 text-[11px] font-mono text-gray-400 flex items-center justify-between">
              <span>{t.hero.author}: @{latestReset.source.author || "OpenAI"}</span>
              <span className="text-gray-500">
                {t.hero.refId}: {latestReset.id.slice(0, 12)}...
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
