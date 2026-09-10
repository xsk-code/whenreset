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

interface MarioWatchProps {
  stats: StatusStats;
  latestReset?: ResetItem;
}

type BetChoice = "yes" | "no";

const LOCAL_STORAGE_KEY = "whenreset_watch_bet_choice";
const BASELINE_YES_VOTES = 724;
const BASELINE_NO_VOTES = 246;

export function MarioWatch({ stats, latestReset }: MarioWatchProps) {
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
    ? "THREAT LEVEL: CRITICAL SURGE"
    : isElevated
    ? "THREAT LEVEL: ELEVATED RUMBLE"
    : "THREAT LEVEL: LOW ACTIVITY";

  const threatColor = isCritical
    ? "text-mario-red"
    : isElevated
    ? "text-mario-coin"
    : "text-mario-green";

  // Twitter share intent text
  const shareText =
    `🏰 Bowser Castle Alert on WhenReset!\n\n` +
    `🔥 Quota Drop Probability: ${probability}% Chance\n` +
    `⏱️ Days Since Last Reset: ${stats.days_since_last.toFixed(1)}d (Avg Cadence: ~${stats.avg_interval_days.toFixed(1)}d)\n` +
    `🎲 Community Bet: ${yesPercentage}% YES vs ${noPercentage}% NO\n` +
    (userBet
      ? `🎯 My Bet: ${userBet === "yes" ? "🍄 IMMINENT (<24h)" : "👾 LONGER WAIT"}\n\n`
      : "\n") +
    `Track the 8-bit live radar:\nhttps://whenreset.com\n` +
    `#OpenAI #Codex #WhenReset #ChatGPT`;

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
          "border-[3px] bg-mario-darkCard p-4 sm:p-6 md:p-8 shadow-pixel rounded-none transition-all",
          isCritical
            ? "border-mario-red animate-castle-pulse"
            : "border-black"
        )}
      >
        {/* Header Ribbon */}
        <div className="flex flex-wrap items-center justify-between border-b-2 border-black pb-4 mb-6 gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl select-none animate-pixel-blink">🏰</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-pixel text-xs sm:text-sm md:text-base text-mario-red">
                  BOWSER CASTLE RADAR ALERT
                </h2>
                <span
                  className={cn(
                    "font-pixel text-[9px] sm:text-[10px] px-2 py-0.5 border border-black shadow-pixel-sm rounded-none",
                    isCritical
                      ? "bg-mario-red text-white animate-pixel-blink"
                      : isElevated
                      ? "bg-mario-coin text-black"
                      : "bg-mario-green text-black"
                  )}
                >
                  STAGE 1-2
                </span>
              </div>
              <p className="font-mono text-[11px] text-gray-400 mt-1">
                Dynamic quota refresh probability &amp; community prediction desk
              </p>
            </div>
          </div>

          {/* Castle Threat Status Badge */}
          <div className="flex items-center gap-2 border-2 border-black bg-[#0F111A] px-3 py-1.5 shadow-pixel-sm rounded-none">
            <span className="w-2.5 h-2.5 bg-mario-red animate-pixel-blink inline-block" />
            <span className={cn("font-pixel text-[10px] sm:text-xs", threatColor)}>
              {threatLabel}
            </span>
          </div>
        </div>

        {/* Dynamic Probability & Castle Radar Gauge */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center border-b-2 border-black pb-6 mb-6">
          {/* Left Column: Big Percentage Display */}
          <div className="lg:col-span-5 bg-[#0F111A] border-2 border-black p-4 sm:p-5 shadow-pixel-sm flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-2 text-xs font-pixel text-gray-400 mb-2">
              <Flame size={15} className="text-mario-red animate-bounce" />
              <span>REFRESH PROBABILITY</span>
            </div>

            <div className="flex items-baseline gap-1 my-1">
              <span
                className={cn(
                  "font-pixel text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight",
                  isCritical
                    ? "text-mario-red"
                    : isElevated
                    ? "text-mario-coin"
                    : "text-mario-green"
                )}
              >
                {probability}%
              </span>
              <span className="font-pixel text-sm sm:text-base text-gray-400">
                CHANCE
              </span>
            </div>

            <p className="font-mono text-xs text-gray-300 mt-2 max-w-xs leading-relaxed">
              {isCritical
                ? "Castle tremors detected! Quota refresh is statistically imminent."
                : isElevated
                ? "Lava heat rising. Quota refresh window is approaching average cycle."
                : "Dungeon calm. Quota was renewed recently; Bowser minions on patrol."}
            </p>

            {/* Quick Metrics Bar Under Big Chance */}
            <div className="mt-4 pt-3 border-t border-gray-800 w-full flex items-center justify-around font-mono text-[11px] text-gray-400">
              <div>
                <span className="text-gray-500 block">ELAPSED</span>
                <span className="text-white font-bold font-pixel text-[10px]">
                  {stats.days_since_last.toFixed(1)}d
                </span>
              </div>
              <div className="h-6 w-px bg-gray-800" />
              <div>
                <span className="text-gray-500 block">AVG CADENCE</span>
                <span className="text-mario-coin font-bold font-pixel text-[10px]">
                  ~{stats.avg_interval_days.toFixed(1)}d
                </span>
              </div>
              <div className="h-6 w-px bg-gray-800" />
              <div>
                <span className="text-gray-500 block">MAX RECORD</span>
                <span className="text-mario-red font-bold font-pixel text-[10px]">
                  {stats.longest_wait_days.toFixed(1)}d
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: 8-Bit Castle Radar Intel Breakdown */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-4">
            {/* Probability Progress Bar */}
            <div>
              <div className="flex items-center justify-between font-pixel text-[10px] text-gray-300 mb-2">
                <span>RADAR PROBABILITY GAUGE</span>
                <span className={threatColor}>{probability}% / 100%</span>
              </div>
              <div className="h-6 w-full border-[3px] border-black bg-[#0F111A] p-0.5 shadow-pixel-sm rounded-none">
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
              <div className="flex justify-between text-[10px] font-mono text-gray-500 mt-1">
                <span>0% Calm</span>
                <span>50% Mid-Cycle</span>
                <span>75% Target Window</span>
                <span>100% Red Alert</span>
              </div>
            </div>

            {/* Castle Intel Box */}
            <div className="border-2 border-black bg-[#0F111A] p-3 sm:p-4 rounded-none shadow-pixel-sm">
              <div className="flex items-center gap-2 font-pixel text-[11px] text-mario-coin mb-2">
                <AlertTriangle size={14} className="text-mario-coin" />
                <span>RADAR ANALYSIS &amp; CYCLE DRIFT</span>
              </div>
              <p className="font-mono text-xs text-gray-300 leading-relaxed">
                OpenAI Codex historically resets on an average cadence of{" "}
                <span className="text-mario-coin font-bold">
                  {stats.avg_interval_days.toFixed(1)} days
                </span>
                . With{" "}
                <span className="text-white font-bold">
                  {stats.days_since_last.toFixed(1)} days
                </span>{" "}
                elapsed since the last reset on{" "}
                <span className="text-gray-200">
                  {latestReset ? latestReset.announced_at.slice(0, 10) : "recently"}
                </span>
                , our 8-bit model projects a{" "}
                <span className={cn("font-bold", threatColor)}>
                  {probability}% likelihood
                </span>{" "}
                of quota drops occurring within the immediate operational window.
              </p>
            </div>
          </div>
        </div>

        {/* Community Interactive Prediction Bet Desk */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 font-pixel text-xs sm:text-sm text-mario-coin">
              <span>🎲</span>
              <span>COMMUNITY PROP BET: WILL QUOTA RESET IN &lt;24 HOURS?</span>
            </div>
            <span className="font-mono text-xs text-gray-400">
              Total Bets Cast:{" "}
              <span className="text-white font-bold">{totalVotes}</span>
            </span>
          </div>

          <p className="font-mono text-xs text-gray-400 mb-4">
            Pick your side and place your pixel token. Stored locally in your retro cart memory!
          </p>

          {/* Voting Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {/* YES Button */}
            <button
              onClick={() => handleVote("yes")}
              className={cn(
                "p-3 sm:p-4 border-[3px] border-black font-pixel text-xs sm:text-sm shadow-pixel rounded-none transition-all active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-between group",
                userBet === "yes"
                  ? "bg-mario-green text-black border-white ring-2 ring-mario-green"
                  : "bg-[#0F111A] text-gray-200 hover:bg-mario-green hover:text-black hover:border-black"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🍄</span>
                <div className="text-left">
                  <div className="font-bold">[ YES - IMMINENT (&lt;24h) ]</div>
                  <div className="font-mono text-[11px] opacity-80 mt-0.5">
                    Expect quota drop very soon
                  </div>
                </div>
              </div>
              {isClient && userBet === "yes" && (
                <span className="font-pixel text-[10px] bg-black text-mario-green px-2 py-1 border border-mario-green flex items-center gap-1">
                  <Check size={12} /> YOUR BET
                </span>
              )}
            </button>

            {/* NO Button */}
            <button
              onClick={() => handleVote("no")}
              className={cn(
                "p-3 sm:p-4 border-[3px] border-black font-pixel text-xs sm:text-sm shadow-pixel rounded-none transition-all active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-between group",
                userBet === "no"
                  ? "bg-mario-red text-white border-white ring-2 ring-mario-red"
                  : "bg-[#0F111A] text-gray-200 hover:bg-mario-red hover:text-white hover:border-black"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">👾</span>
                <div className="text-left">
                  <div className="font-bold">[ NO - LONGER WAIT ]</div>
                  <div className="font-mono text-[11px] opacity-80 mt-0.5">
                    Bowser will hold the gates
                  </div>
                </div>
              </div>
              {isClient && userBet === "no" && (
                <span className="font-pixel text-[10px] bg-black text-mario-red px-2 py-1 border border-mario-red flex items-center gap-1">
                  <Check size={12} /> YOUR BET
                </span>
              )}
            </button>
          </div>

          {/* Ratio Comparison Bar */}
          <div className="bg-[#0F111A] border-2 border-black p-3 sm:p-4 rounded-none shadow-pixel-sm mb-4">
            <div className="flex items-center justify-between font-pixel text-[10px] sm:text-xs mb-2">
              <span className="text-mario-green flex items-center gap-1">
                <span>🍄 YES:</span>
                <span>{yesPercentage}%</span>
                <span className="font-mono text-gray-400">({currentYesVotes})</span>
              </span>
              <span className="text-mario-red flex items-center gap-1">
                <span className="font-mono text-gray-400">({currentNoVotes})</span>
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
            <div className="text-xs font-mono text-gray-400">
              {isClient && userBet ? (
                <span className="text-mario-coin">
                  ★ Your prediction is locked: {userBet === "yes" ? "IMMINENT RESET" : "LONGER WAIT"}. Share it on X!
                </span>
              ) : (
                <span>Cast a vote to unlock your prediction card.</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="px-3 py-2 border-2 border-black bg-[#0F111A] font-pixel text-[10px] text-gray-300 hover:text-white shadow-pixel-sm rounded-none transition-all flex items-center gap-1.5"
                title="Copy Prediction Text"
              >
                {copiedLink ? <Check size={12} className="text-mario-green" /> : <Share2 size={12} />}
                <span>{copiedLink ? "COPIED!" : "COPY BET"}</span>
              </button>

              <a
                href={twitterIntentUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 border-2 border-black bg-[#1DA1F2] hover:bg-[#1a91da] font-pixel text-[10px] text-white shadow-pixel rounded-none transition-all flex items-center gap-2 active:translate-x-[1px] active:translate-y-[1px]"
              >
                <span>TWEET YOUR BET TO X</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
