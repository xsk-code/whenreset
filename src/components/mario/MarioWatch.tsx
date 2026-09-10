"use client";

import React, { useState, useEffect, useCallback } from "react";
import { StatusStats, ResetItem } from "@/lib/types";
import {
  calculateWatchProbability,
  playMarioCoinSound,
  triggerHaptic,
  cn,
} from "@/lib/utils";
import { Flame, AlertTriangle, Share2, Check, ExternalLink } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface MarioWatchProps {
  stats: StatusStats;
  latestReset?: ResetItem;
}

type BetChoice = "yes" | "no";

const LOCAL_STORAGE_KEY = "whenreset_watch_bet_choice";
const BASELINE_YES_VOTES = 724;
const BASELINE_NO_VOTES = 246;

export function MarioWatch({ stats, latestReset }: MarioWatchProps) {
  const { t } = useLanguage();
  const [userBet, setUserBet] = useState<BetChoice | null>(null);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Dynamic probability calculation
  const probability = calculateWatchProbability(
    stats.days_since_last,
    stats.avg_interval_days
  );

  // Load vote from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY) as BetChoice | null;
      if (saved === "yes" || saved === "no") {
        setUserBet(saved);
      }
    } catch {
      // LocalStorage access might fail in restricted environments
    }
  }, []);

  // Compute live vote counts including user's bet
  const currentYesVotes = BASELINE_YES_VOTES + (userBet === "yes" ? 1 : 0);
  const currentNoVotes = BASELINE_NO_VOTES + (userBet === "no" ? 1 : 0);
  const totalVotes = currentYesVotes + currentNoVotes;
  const yesPercentage = Math.round((currentYesVotes / totalVotes) * 100);
  const noPercentage = 100 - yesPercentage;

  // Handle user casting bet
  const handleVote = useCallback((choice: BetChoice) => {
    // Sound & haptic feedback
    playMarioCoinSound();
    triggerHaptic(20);

    setUserBet(choice);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, choice);
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Threat level classification
  const isCritical = probability >= 75;
  const isElevated = probability >= 45 && probability < 75;

  const threatLabel = isCritical
    ? t.watch.threatCritical
    : isElevated
    ? t.watch.threatElevated
    : t.watch.threatLow;

  const threatColor = isCritical
    ? "text-mario-red"
    : isElevated
    ? "text-mario-coin"
    : "text-mario-green";

  // Twitter share intent text
  const shareText = t.watch.shareText(
    probability,
    stats.days_since_last.toFixed(1),
    stats.avg_interval_days.toFixed(1),
    yesPercentage,
    noPercentage,
    userBet
  );

  const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}`;

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedLink(true);
      triggerHaptic(12);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <section className="w-full max-w-5xl my-4">
      {/* 8-bit Bowser Castle Alert Container */}
      <div
        className={cn(
          "border-2 bg-mario-darkCard p-4 sm:p-6 md:p-8 shadow-pixel rounded-none transition-all",
          isCritical
            ? "border-mario-red animate-castle-pulse"
            : "border-black"
        )}
      >
        {/* Header Ribbon */}
        <div className="flex flex-wrap items-center justify-between border-b border-zinc-800/80 pb-4 mb-6 gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl select-none">🏰</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-pixel text-xs sm:text-sm md:text-base text-red-400">
                  {t.watch.title}
                </h2>
              </div>
              <p className="font-mono text-[11px] text-zinc-400 mt-1">
                {t.watch.subtitle}
              </p>
            </div>
          </div>

          {/* Castle Threat Status Badge */}
          <div className="flex items-center gap-2 border-2 border-black bg-[#141622] px-3 py-1.5 shadow-pixel-sm rounded-none">
            <span className="w-2 h-2 bg-red-400 animate-pixel-blink inline-block" />
            <span className={cn("font-pixel text-[10px] sm:text-xs", threatColor)}>
              {threatLabel}
            </span>
          </div>
        </div>

        {/* Dynamic Probability & Castle Radar Gauge */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center border-b border-zinc-800/80 pb-6 mb-6">
          {/* Left Column: Big Percentage Display */}
          <div className="lg:col-span-5 bg-[#141622] border-2 border-black p-4 sm:p-5 shadow-pixel-sm flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-2 text-xs font-pixel text-zinc-400 mb-2">
              <Flame size={15} className="text-red-400" />
              <span>{t.watch.refreshProbability}</span>
            </div>

            <div className="flex items-baseline gap-1 my-1">
              <span
                className={cn(
                  "font-pixel text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight",
                  isCritical
                    ? "text-red-400"
                    : isElevated
                    ? "text-amber-400"
                    : "text-emerald-400"
                )}
              >
                {probability}%
              </span>
              <span className="font-pixel text-sm sm:text-base text-zinc-400">
                {t.watch.chance}
              </span>
            </div>

            <p className="font-mono text-xs text-zinc-300 mt-2 max-w-xs leading-relaxed">
              {isCritical
                ? t.watch.criticalDesc
                : isElevated
                ? t.watch.elevatedDesc
                : t.watch.lowDesc}
            </p>
          </div>

          {/* Right Column: 8-Bit Castle Radar Intel Breakdown */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-4">
            {/* Probability Progress Bar */}
            <div>
              <div className="flex items-center justify-between font-pixel text-[10px] text-zinc-300 mb-2">
                <span>{t.watch.radarGauge}</span>
                <span className={threatColor}>{probability}% / 100%</span>
              </div>
              <div className="h-6 w-full border-2 border-black bg-[#12141D] p-0.5 shadow-pixel-sm rounded-none">
                <div
                  className={cn(
                    "h-full transition-all duration-500 rounded-none",
                    isCritical
                      ? "bg-mario-red"
                      : isElevated
                      ? "bg-mario-coin"
                      : "bg-mario-green"
                  )}
                  style={{ width: `${probability}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
                <span>{t.watch.gaugeMarks.calm}</span>
                <span>{t.watch.gaugeMarks.mid}</span>
                <span>{t.watch.gaugeMarks.target}</span>
                <span>{t.watch.gaugeMarks.red}</span>
              </div>
            </div>

            {/* Castle Intel Box */}
            <div className="border-2 border-black bg-[#141622] p-3 sm:p-4 rounded-none shadow-pixel-sm">
              <div className="flex items-center gap-2 font-pixel text-[11px] text-mario-coin mb-2">
                <AlertTriangle size={14} className="text-mario-coin" />
                <span>{t.watch.radarAnalysisTitle}</span>
              </div>
              <p className="font-mono text-xs text-zinc-300 leading-relaxed">
                {t.watch.radarAnalysisText(
                  stats.avg_interval_days.toFixed(1),
                  stats.days_since_last.toFixed(1),
                  latestReset ? latestReset.announced_at.slice(0, 10) : "recently",
                  probability
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Community Interactive Prediction Bet Desk */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 font-pixel text-xs sm:text-sm text-mario-coin">
              <span>🎲</span>
              <span>{t.watch.betTitle}</span>
            </div>
            <span className="font-mono text-xs text-zinc-400">
              {t.watch.totalBets}{" "}
              <span className="text-zinc-100 font-bold">{totalVotes}</span>
            </span>
          </div>

          <p className="font-mono text-xs text-zinc-400 mb-4">
            {t.watch.betDesc}
          </p>

          {/* Voting Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {/* YES Button */}
            <button
              onClick={() => handleVote("yes")}
              className={cn(
                "p-3 sm:p-4 border-2 border-black font-pixel text-xs sm:text-sm shadow-pixel rounded-none transition-all active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-between group",
                userBet === "yes"
                  ? "bg-mario-green text-black border-white ring-2 ring-mario-green"
                  : "bg-[#141622] text-zinc-200 hover:bg-mario-green hover:text-black hover:border-black"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🍄</span>
                <div className="text-left">
                  <div className="font-bold">{t.watch.yesLabel}</div>
                  <div className="font-mono text-[11px] opacity-80 mt-0.5">
                    {t.watch.yesSub}
                  </div>
                </div>
              </div>
              {isClient && userBet === "yes" && (
                <span className="font-pixel text-[10px] bg-black text-mario-green px-2 py-1 border border-mario-green flex items-center gap-1">
                  <Check size={12} /> {t.watch.yourBet}
                </span>
              )}
            </button>

            {/* NO Button */}
            <button
              onClick={() => handleVote("no")}
              className={cn(
                "p-3 sm:p-4 border-2 border-black font-pixel text-xs sm:text-sm shadow-pixel rounded-none transition-all active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-between group",
                userBet === "no"
                  ? "bg-mario-red text-white border-white ring-2 ring-mario-red"
                  : "bg-[#141622] text-zinc-200 hover:bg-mario-red hover:text-white hover:border-black"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">👾</span>
                <div className="text-left">
                  <div className="font-bold">{t.watch.noLabel}</div>
                  <div className="font-mono text-[11px] opacity-80 mt-0.5">
                    {t.watch.noSub}
                  </div>
                </div>
              </div>
              {isClient && userBet === "no" && (
                <span className="font-pixel text-[10px] bg-black text-mario-red px-2 py-1 border border-mario-red flex items-center gap-1">
                  <Check size={12} /> {t.watch.yourBet}
                </span>
              )}
            </button>
          </div>

          {/* Ratio Comparison Bar */}
          <div className="bg-[#141622] border-2 border-black p-3 sm:p-4 rounded-none shadow-pixel-sm mb-4">
            <div className="flex items-center justify-between font-pixel text-[10px] sm:text-xs mb-2">
              <span className="text-mario-green flex items-center gap-1">
                <span>🍄 YES:</span>
                <span>{yesPercentage}%</span>
                <span className="font-mono text-zinc-400">({currentYesVotes})</span>
              </span>
              <span className="text-mario-red flex items-center gap-1">
                <span className="font-mono text-zinc-400">({currentNoVotes})</span>
                <span>{noPercentage}%</span>
                <span>:NO 👾</span>
              </span>
            </div>

            {/* Segmented Comparison Progress Bar */}
            <div className="h-5 w-full border-2 border-black bg-black p-0.5 flex rounded-none">
              <div
                className="h-full bg-mario-green transition-all duration-300"
                style={{ width: `${yesPercentage}%` }}
              />
              <div
                className="h-full bg-mario-red transition-all duration-300"
                style={{ width: `${noPercentage}%` }}
              />
            </div>
          </div>

          {/* Social Share & Virus Loop */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="text-xs font-mono text-zinc-400">
              {isClient && userBet ? (
                <span className="text-mario-coin">
                  {t.watch.betLocked(userBet === "yes" ? t.watch.yesLabel : t.watch.noLabel)}
                </span>
              ) : (
                <span>{t.watch.betPlaceholder}</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="px-3 py-2 border-2 border-black bg-[#141622] font-pixel text-[10px] text-zinc-300 hover:text-white shadow-pixel-sm rounded-none transition-all flex items-center gap-1.5"
                title="Copy Prediction Text"
              >
                {copiedLink ? <Check size={12} className="text-mario-green" /> : <Share2 size={12} />}
                <span>{copiedLink ? t.watch.copied : t.watch.copyBet}</span>
              </button>

              <a
                href={twitterIntentUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 border-2 border-black bg-[#1DA1F2] hover:bg-[#1a91da] font-pixel text-[10px] text-white shadow-pixel rounded-none transition-all flex items-center gap-2 active:translate-x-[1px] active:translate-y-[1px]"
              >
                <span>{t.watch.tweetBet}</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
