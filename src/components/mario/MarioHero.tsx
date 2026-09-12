"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { ResetItem, ScheduledReset } from "@/lib/types";
import {
  formatRelativeTime,
  formatUtcTime,
  playMarioCoinSound,
  playMarioPowerupSound,
  triggerHaptic,
  cn,
} from "@/lib/utils";
import { Volume2, VolumeX, ExternalLink, Clock, Bell } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { trackEvent } from "@/lib/analytics";

interface MarioHeroProps {
  latestReset: ResetItem;
  scheduledReset?: ScheduledReset | null;
  onCoinChange?: (myCoins: number) => void;
  onOpenSubscribe?: () => void;
  avgIntervalDays?: number;
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

export function MarioHero({
  latestReset,
  scheduledReset,
  onCoinChange,
  onOpenSubscribe,
  avgIntervalDays = 7.0,
}: MarioHeroProps) {
  const { language, t } = useLanguage();
  const [elapsed, setElapsed] = useState<ElapsedTime>(() =>
    calculateElapsed(latestReset.announced_at)
  );
  const [coinCount, setCoinCount] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [worldCoins, setWorldCoins] = useState<number>(142850);
  const [isWorldPulsing, setIsWorldPulsing] = useState<boolean>(false);
  const [isHit, setIsHit] = useState<boolean>(false);
  const [floatingCoins, setFloatingCoins] = useState<FloatingCoin[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const pendingDeltaRef = useRef<number>(0);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initialize user's personal coins & score from localStorage
  useEffect(() => {
    try {
      const savedCoins = localStorage.getItem("whenreset_my_coins");
      const savedScore = localStorage.getItem("whenreset_my_score");
      if (savedCoins !== null) {
        const parsed = parseInt(savedCoins, 10);
        if (!isNaN(parsed) && parsed >= 0) {
          setCoinCount(parsed);
        }
      }
      if (savedScore !== null) {
        const parsed = parseInt(savedScore, 10);
        if (!isNaN(parsed) && parsed >= 0) {
          setScore(parsed);
        }
      }
    } catch {
      // Ignore storage access issues
    }
  }, []);

  // 2. Fetch and periodically sync real-time community coin pool
  const fetchWorldCoins = useCallback(async () => {
    try {
      const res = await fetch("/api/coins");
      if (res.ok) {
        const data = await res.json();
        if (typeof data.global_coins === "number") {
          setWorldCoins((prev) => {
            if (data.global_coins !== prev) {
              setIsWorldPulsing(true);
              setTimeout(() => setIsWorldPulsing(false), 450);
            }
            return Math.max(prev, data.global_coins);
          });
        }
      }
    } catch {
      // Fallback silently
    }
  }, []);

  useEffect(() => {
    fetchWorldCoins();
    const interval = setInterval(fetchWorldCoins, 8000);
    return () => clearInterval(interval);
  }, [fetchWorldCoins]);

  // Live timer tick every second
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(calculateElapsed(latestReset.announced_at));
    }, 1000);

    return () => clearInterval(interval);
  }, [latestReset.announced_at]);

  // Check if reset was within the last 24 hours
  const isRecentReset = elapsed.totalHours < 24;

  // Flush queued clicks to the /api/coins server endpoint
  const flushCoinSync = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      const delta = pendingDeltaRef.current;
      if (delta <= 0) return;
      pendingDeltaRef.current = 0;

      try {
        const res = await fetch("/api/coins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ delta }),
        });
        if (res.ok) {
          const data = await res.json();
          if (typeof data.global_coins === "number") {
            setWorldCoins((prev) => Math.max(prev, data.global_coins));
          }
        }
      } catch {
        // Retry silently next time
      }
    }, 800);
  }, []);

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

    // Track custom event for engagement
    trackEvent("mario_block_hit", { isBonus });

    // 3. Block bounce animation
    setIsHit(true);
    setTimeout(() => {
      setIsHit(false);
    }, 220);

    // 4. Update personal persistent counters
    setCoinCount((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem("whenreset_my_coins", next.toString());
      } catch {}
      onCoinChange?.(next);
      return next;
    });

    setScore((prev) => {
      const next = prev + (isBonus ? 1000 : 100);
      try {
        localStorage.setItem("whenreset_my_score", next.toString());
      } catch {}
      return next;
    });

    // 5. Update community total optimistically
    setWorldCoins((prev) => prev + 1);
    setIsWorldPulsing(true);
    setTimeout(() => setIsWorldPulsing(false), 300);

    // 6. Queue click for backend sync
    pendingDeltaRef.current += 1;
    flushCoinSync();

    // 7. Spawn floating coin animation particle
    const coinId = Date.now() + Math.random();
    const randomOffset = (Math.random() - 0.5) * 44;
    setFloatingCoins((prev) => [
      ...prev.slice(-12),
      { id: coinId, offset: randomOffset, isBonus },
    ]);

    setTimeout(() => {
      setFloatingCoins((prev) => prev.filter((c) => c.id !== coinId));
    }, 700);
  }, [coinCount, soundEnabled, onCoinChange, flushCoinSync]);

  // Cadence progress & cycle stats
  const cyclePercent = Math.min(
    100,
    Math.round((elapsed.totalHours / (avgIntervalDays * 24)) * 100)
  );
  const remainingHours = Math.max(0, avgIntervalDays * 24 - elapsed.totalHours);
  const remainingDays = (remainingHours / 24).toFixed(1);

  // Status judgement
  const isJustReset = elapsed.totalHours < 24;
  const isWindowOpen = elapsed.totalHours >= (avgIntervalDays - 1.5) * 24;

  let statusIcon = "🟢";
  let statusText = t.hero.statusStable;
  let statusContainerClass = "border-zinc-800 bg-[#151824] text-zinc-300";
  let statusBadgeClass = "bg-zinc-800 text-zinc-300 border-zinc-700";

  if (isJustReset) {
    statusIcon = "🟢";
    statusText = t.hero.statusJustReset;
    statusContainerClass = "border-emerald-700/60 bg-[#102016] text-emerald-300";
    statusBadgeClass = "bg-emerald-600 text-black";
  } else if (isWindowOpen) {
    statusIcon = "🟡";
    statusText = t.hero.statusWindow;
    statusContainerClass = "border-amber-700/60 bg-[#241A10] text-amber-300";
    statusBadgeClass = "bg-amber-500 text-black";
  }

  const handleOpenSubscribe = () => {
    playMarioCoinSound();
    triggerHaptic(14);
    trackEvent("subscribe_modal_opened", { source: "hero_cta_btn" });
    onOpenSubscribe?.();
  };

  return (
    <section className="w-full max-w-5xl border-2 border-black bg-mario-darkCard p-4 sm:p-6 md:p-8 shadow-pixel rounded-none my-6">
      {/* Official Scheduled Reset Announcement Banner */}
      {scheduledReset && (
        <div className="mb-5 border-2 border-dashed border-mario-green bg-[#102418] p-3 sm:p-4 rounded-none shadow-pixel flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-castle-pulse">
          <div className="flex items-start sm:items-center gap-2.5">
            <span className="text-xl sm:text-2xl animate-pixel-blink select-none">🚨</span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-pixel text-[10px] sm:text-xs text-mario-green font-bold">
                  [ OFFICIAL RESET SCHEDULED FOR TODAY! ]
                </span>
                {scheduledReset.announced_at && (
                  <span className="font-mono text-[10px] text-zinc-400 bg-black/60 px-1.5 py-0.5 border border-black">
                    {new Date(scheduledReset.announced_at).toISOString().replace("T", " ").slice(0, 16)} UTC
                  </span>
                )}
              </div>
              <p className="font-mono text-xs text-zinc-200 mt-1">
                Tibo announced: “And of course, a reset is also landing by midnight today.”
              </p>
            </div>
          </div>
          {scheduledReset.source?.url && (
            <a
              href={scheduledReset.source.url}
              target="_blank"
              rel="noreferrer"
              className="font-pixel text-[9px] px-3 py-1.5 border-2 border-black bg-mario-green text-black hover:bg-emerald-400 shadow-pixel-sm rounded-none flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
            >
              <span>[ VIEW TWEET ↗ ]</span>
              <ExternalLink size={10} />
            </a>
          )}
        </div>
      )}

      {/* Top Banner Row: Stage Header + SFX Toggle */}
      <div className="flex flex-wrap items-center justify-between border-b border-zinc-800/80 pb-3 mb-4 gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xl sm:text-2xl select-none">
            🍄
          </span>
          <div>
            <h2 className="font-pixel text-xs sm:text-sm md:text-base text-mario-coin">
              {t.hero.title}
            </h2>
          </div>
        </div>

        {/* Audio Toggle Button */}
        <button
          type="button"
          onClick={() => setSoundEnabled((prev) => !prev)}
          className="font-pixel text-[10px] px-3 py-1.5 border-2 border-black bg-[#141622] text-zinc-300 hover:text-mario-coin hover:border-mario-coin shadow-pixel-sm rounded-none flex items-center gap-2 transition-all active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
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

      {/* 1. Onboarding Status Banner: Instant Clarity on Quota Condition */}
      <div
        className={cn(
          "w-full border-2 border-black p-3 mb-6 shadow-pixel-sm rounded-none flex flex-wrap items-center justify-between gap-3 transition-colors",
          statusContainerClass
        )}
      >
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <span className="text-base sm:text-lg select-none">{statusIcon}</span>
          <span
            className={cn(
              "font-pixel text-[9px] sm:text-[10px] px-2 py-0.5 border shadow-pixel-sm font-bold",
              statusBadgeClass
            )}
          >
            {t.hero.statusPillLabel}
          </span>
          <span className="font-mono text-xs sm:text-sm font-bold tracking-wide">
            {statusText}
          </span>
        </div>

        <div className="font-mono text-[11px] text-zinc-400 flex items-center gap-2">
          <span>{t.hero.cycleRemaining(remainingDays)}</span>
        </div>
      </div>

      {/* 2. Main Grid: Left Primary Radar (8 cols) & Right Easter Egg (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        {/* Left: Giant Pixel Clock & Cadence Cycle Bar & Primary CTA (8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between order-1">
          {/* Giant Pixel Clock 4-Box Grid */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4">
            {/* DAYS */}
            <div className="border-2 border-black bg-[#141622] p-2.5 sm:p-4 text-center shadow-pixel-sm rounded-none">
              <div
                className="font-pixel text-2xl sm:text-3xl md:text-5xl text-amber-400 font-bold tracking-tight"
                suppressHydrationWarning
              >
                {elapsed.days.toString().padStart(2, "0")}
              </div>
              <div className="font-pixel text-[9px] sm:text-[10px] md:text-xs text-zinc-400 mt-2 uppercase">
                {t.hero.days}
              </div>
            </div>

            {/* HOURS */}
            <div className="border-2 border-black bg-[#141622] p-2.5 sm:p-4 text-center shadow-pixel-sm rounded-none">
              <div
                className="font-pixel text-2xl sm:text-3xl md:text-5xl text-amber-400 font-bold tracking-tight"
                suppressHydrationWarning
              >
                {elapsed.hours.toString().padStart(2, "0")}
              </div>
              <div className="font-pixel text-[9px] sm:text-[10px] md:text-xs text-zinc-400 mt-2 uppercase">
                {t.hero.hours}
              </div>
            </div>

            {/* MINUTES */}
            <div className="border-2 border-black bg-[#141622] p-2.5 sm:p-4 text-center shadow-pixel-sm rounded-none">
              <div
                className="font-pixel text-2xl sm:text-3xl md:text-5xl text-amber-400 font-bold tracking-tight"
                suppressHydrationWarning
              >
                {elapsed.minutes.toString().padStart(2, "0")}
              </div>
              <div className="font-pixel text-[9px] sm:text-[10px] md:text-xs text-zinc-400 mt-2 uppercase">
                {t.hero.mins}
              </div>
            </div>

            {/* SECONDS */}
            <div className="border-2 border-black bg-[#141622] p-2.5 sm:p-4 text-center shadow-pixel-sm rounded-none">
              <div
                className="font-pixel text-2xl sm:text-3xl md:text-5xl text-emerald-400 font-bold tracking-tight"
                suppressHydrationWarning
              >
                {elapsed.seconds.toString().padStart(2, "0")}
              </div>
              <div className="font-pixel text-[9px] sm:text-[10px] md:text-xs text-zinc-400 mt-2 uppercase">
                {t.hero.secs}
              </div>
            </div>
          </div>

          {/* 8-bit Cadence Cycle Progress Bar */}
          <div className="border-2 border-black bg-[#141622] p-3 sm:p-3.5 shadow-pixel-sm rounded-none mb-4">
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-pixel mb-2">
              <span className="flex items-center gap-1.5 text-mario-coin">
                <span>📊</span>
                <span>{t.hero.cycleProgressTitle(avgIntervalDays.toFixed(1))}</span>
              </span>
              <span className="font-mono text-emerald-400 font-bold">{cyclePercent}%</span>
            </div>
            {/* Outer bar */}
            <div className="w-full h-3 bg-black/60 border border-zinc-700/80 relative overflow-hidden rounded-none">
              <div
                className={cn(
                  "h-full transition-all duration-500",
                  cyclePercent >= 90
                    ? "bg-red-500"
                    : cyclePercent >= 70
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                )}
                style={{ width: `${cyclePercent}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] font-mono text-zinc-400">
              <span>0D</span>
              <span className="text-zinc-400">BENCHMARK ~{avgIntervalDays.toFixed(1)}D</span>
              <span>{Math.round(avgIntervalDays * 1.5)}D</span>
            </div>
          </div>

          {/* Primary Action CTA Bar */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <button
              type="button"
              onClick={handleOpenSubscribe}
              className="pixel-btn px-4 py-2.5 bg-mario-coin hover:bg-[#D97706] text-black font-pixel text-[11px] sm:text-xs border-2 border-black shadow-pixel flex items-center gap-2 rounded-none font-bold cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span>{t.hero.subscribeCta}</span>
            </button>

            <a
              href={latestReset.source.url}
              target="_blank"
              rel="noreferrer"
              className="pixel-btn px-3 py-2.5 bg-[#141622] hover:bg-zinc-800 text-zinc-200 font-pixel text-[10px] sm:text-[11px] border-2 border-black shadow-pixel-sm flex items-center gap-1.5 rounded-none cursor-pointer"
            >
              <span>📡</span>
              <span>{t.hero.xPost}</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            </a>
          </div>

          {/* Time Metadata & Reset Type Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/80 pt-3 pb-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-mario-coin font-bold">
                <Clock size={14} />
                <span suppressHydrationWarning>
                  {formatRelativeTime(latestReset.announced_at, language)}
                </span>
              </div>
              <div className="text-zinc-400">
                {t.common.utc}:{" "}
                <span className="text-zinc-200 font-mono font-bold">
                  {formatUtcTime(latestReset.announced_at)}
                </span>
              </div>
            </div>

            <div>
              {latestReset.reset_type === "banked" ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-[#2A1515] text-red-400 border border-red-900/60 font-pixel text-[10px] sm:text-xs px-2.5 py-1 shadow-pixel-sm rounded-none">
                    <span>🍄</span>
                    <span>{t.hero.bankedReset}</span>
                  </span>
                  <span className="hidden sm:inline font-mono text-[11px] text-zinc-400">
                    {t.hero.bankedDesc}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-[#122218] text-emerald-300 border border-emerald-800/60 font-pixel text-[10px] sm:text-xs px-2.5 py-1 shadow-pixel-sm rounded-none">
                    <span>⭐</span>
                    <span>{t.hero.regularReset}</span>
                  </span>
                  <span className="hidden sm:inline font-mono text-[11px] text-zinc-400">
                    {t.hero.regularDesc}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Latest Transmission Note */}
          <div className="mt-3 border-2 border-black bg-[#141622] p-3 sm:p-3.5 rounded-none shadow-pixel-sm">
            <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2 font-pixel text-[11px] text-mario-coin">
                <span>📡</span>
                <span>{t.hero.latestIntel}</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                @{latestReset.source.author || "OpenAI"}
              </span>
            </div>
            <p className="font-mono text-xs sm:text-sm text-zinc-300 leading-relaxed italic line-clamp-2">
              &ldquo;{latestReset.text}&rdquo;
            </p>
          </div>
        </div>

        {/* Right: The Interactive Question Block Easter Egg (4 cols) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 bg-[#141622] border-2 border-black shadow-pixel-sm rounded-none order-2">
          {/* Egg Purpose Badge */}
          <div className="mb-3 px-2.5 py-1 bg-[#191C28] border border-zinc-800 text-mario-coin font-pixel text-[9px] flex items-center gap-1.5 shadow-pixel-sm">
            <span>🪙</span>
            <span>{t.hero.prayEggTag}</span>
          </div>

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
                "relative w-28 h-28 sm:w-32 sm:h-32 md:w-32 md:h-32 rounded-none border-[3px] border-black bg-[#D97706] cursor-pointer select-none transition-all shadow-pixel flex flex-col items-center justify-center focus:outline-none focus:ring-2 focus:ring-mario-coin",
                isHit && "animate-block-hit shadow-pixel-pressed -translate-y-2",
                !isHit && "hover:-translate-y-1 hover:shadow-pixel-lg active:translate-y-1"
              )}
            >
              {/* NES 3D Inset Bevels - Soft Gold & Warm Amber */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-[#FCD34D] pointer-events-none" />
              <div className="absolute top-0 left-0 bottom-0 w-2 bg-[#FCD34D] pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#92400E] pointer-events-none" />
              <div className="absolute top-0 right-0 bottom-0 w-2 bg-[#92400E] pointer-events-none" />

              {/* 4 Corner Rivets */}
              <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-black pointer-events-none" />
              <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-black pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-black pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-black pointer-events-none" />

              {/* Center Icon */}
              <span className="font-pixel text-4xl sm:text-5xl text-black font-extrabold drop-shadow-[2px_2px_0px_rgba(0,0,0,0.25)] select-none">
                ?
              </span>

              {/* Floating Coins Popup Particles */}
              {floatingCoins.map((coin) => (
                <div
                  key={coin.id}
                  className="absolute pointer-events-none -top-6 left-1/2 font-pixel text-amber-400 text-xs sm:text-sm font-bold whitespace-nowrap animate-coin-pop flex items-center gap-1 z-30 drop-shadow-[2px_2px_0px_#000]"
                  style={{
                    transform: `translateX(calc(-50% + ${coin.offset}px))`,
                  }}
                >
                  {coin.isBonus ? (
                    <span className="text-emerald-400 bg-black px-1 border border-emerald-500">
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

            {/* Block Action Button */}
            <button
              type="button"
              onClick={handleHitBlock}
              className={cn(
                "mt-3 font-pixel text-[10px] sm:text-[11px] px-3 py-1.5 border-2 border-black rounded-none shadow-pixel-sm transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center gap-1.5 cursor-pointer",
                isRecentReset
                  ? "bg-emerald-500 text-black hover:bg-emerald-400"
                  : "bg-mario-coin text-black hover:bg-[#D97706]"
              )}
            >
              {isRecentReset ? t.hero.hitBlockButtonActive : t.hero.hitBlockButtonNormal}
            </button>

            {/* Coin Feedback Under Block */}
            <div className="mt-3 flex flex-col items-center gap-2 font-pixel text-[10px] text-zinc-400 w-full">
              <div className="flex items-center justify-center gap-2">
                <span className="flex items-center gap-1 text-mario-coin font-bold" title={t.hero.myCoins}>
                  <span>🪙</span>
                  <span>{t.hero.myCoins}: {coinCount.toString().padStart(2, "0")}</span>
                </span>
              </div>

              {/* Real-time World Coin Community Counter */}
              <div
                className={cn(
                  "flex items-center justify-between gap-2 px-2.5 py-1.5 bg-[#12141D] border shadow-pixel-sm text-[9px] w-full transition-all rounded-none",
                  isWorldPulsing ? "border-amber-500 bg-[#241A10] text-amber-300" : "border-zinc-800 text-zinc-400"
                )}
                title="Real-time global community clicks"
              >
                <div className="flex items-center gap-1 text-zinc-500">
                  <span className="inline-block w-1.5 h-1.5 rounded-none bg-mario-green animate-pixel-blink" />
                  <span className="text-[8px] tracking-tight">{t.hero.worldCoins}:</span>
                </div>
                <div className="flex items-center gap-1 font-bold text-mario-coin">
                  <span>🪙</span>
                  <span>{worldCoins.toLocaleString()}</span>
                  <span className="text-[8px] text-emerald-400 bg-black/60 px-1 border border-emerald-500/40 ml-0.5">
                    {t.hero.worldCoinsLive}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
