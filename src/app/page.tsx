"use client";

import React, { useState, useEffect, useCallback } from "react";
import fallbackResets from "@/data/fallback-resets.json";
import { calculateStats, playMarioCoinSound, triggerHaptic } from "@/lib/utils";
import { ResetItem, ResetsResponse, StatusData, StatusResponse } from "@/lib/types";
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
import { trackEvent } from "@/lib/analytics";
import { Mail, Copy, Check, MessageSquare } from "lucide-react";

export default function Home() {
  const [isSubscribeOpen, setIsSubscribeOpen] = useState<boolean>(false);
  const [resets, setResets] = useState<ResetItem[]>(() => fallbackResets as ResetItem[]);
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [userCoins, setUserCoins] = useState<number>(0);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);
  const { t } = useLanguage();

  // Load initial saved coins for header HUD sync
  useEffect(() => {
    try {
      const savedCoins = localStorage.getItem("whenreset_my_coins");
      if (savedCoins !== null) {
        const parsed = parseInt(savedCoins, 10);
        if (!isNaN(parsed)) setUserCoins(parsed);
      }
    } catch {}
  }, []);

  const handleCoinChange = useCallback((coins: number) => {
    setUserCoins(coins);
  }, []);

  // Fetch latest resets & status from API endpoints concurrently
  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const cacheBuster = `_t=${Date.now()}`;
      const [resetsRes, statusRes] = await Promise.allSettled([
        fetch(`/api/resets?${cacheBuster}`),
        fetch(`/api/status?${cacheBuster}`),
      ]);

      if (resetsRes.status === "fulfilled" && resetsRes.value.ok) {
        const data: ResetsResponse = await resetsRes.value.json();
        if (Array.isArray(data?.data) && data.data.length > 0) {
          setResets(data.data);
        }
      }

      if (statusRes.status === "fulfilled" && statusRes.value.ok) {
        const statusJson: StatusResponse = await statusRes.value.json();
        if (statusJson?.data) {
          setStatusData(statusJson.data);
        }
      }
    } catch (err) {
      console.warn("[WhenReset] Failed to refresh live data, keeping current data", err);
    } finally {
      if (isManual) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  }, []);

  // Initial client fetch and 60-second polling
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchData]);

  const stats = calculateStats(resets);
  const latest = resets[0];

  return (
    <main className="min-h-screen bg-mario-dark text-zinc-200 p-3 sm:p-6 md:p-10 flex flex-col items-center selection:bg-mario-coin selection:text-black">
      {/* Decoupled Retro Top Arcade HUD */}
      <MarioHeader
        totalResets={stats.total}
        userCoins={userCoins}
        onOpenSubscribe={() => setIsSubscribeOpen(true)}
      />

      {/* Main Hero: Question Block & Giant Countdown Clock */}
      {latest && (
        <MarioHero
          latestReset={latest}
          scheduledReset={statusData?.scheduled_reset}
          onCoinChange={handleCoinChange}
          onOpenSubscribe={() => setIsSubscribeOpen(true)}
          avgIntervalDays={stats.avg_interval_days}
        />
      )}

      {/* Statistics Section: 3 Classic NES Metric Blocks */}
      <MarioStats stats={stats} />

      {/* Stage 1-2: Castle Radar Watch & Community Bet */}
      <MarioWatch
        stats={stats}
        latestReset={latest}
        activeWatch={statusData?.active_watch}
        scheduledReset={statusData?.scheduled_reset}
      />

      {/* Stage 1-2: 26-Week Super Stage Pixel Heatmap */}
      <MarioHeatmap resets={resets} />

      {/* Stage 1-3: Full Quests Stream Timeline with Live Refresh */}
      <MarioLog
        resets={resets}
        onRefresh={() => fetchData(true)}
        isRefreshing={isRefreshing}
      />

      {/* Stage 1-3: 8-Bit Item Shop & Power-Up Stand (Blanked / Ad Space Available) */}
      <MarioSponsors />

      {/* NES Retro Footer with Sponsorship & Contact Hub */}
      <footer className="w-full max-w-5xl mt-6 mb-8 flex flex-col items-center text-center text-xs font-mono text-zinc-400 border-t border-zinc-800/80 pt-6">
        {/* Retro 8-Bit Sponsorship & Developer Contact Box */}
        <div className="w-full max-w-xl border-2 border-black bg-mario-darkCard p-4 sm:p-5 shadow-pixel rounded-none mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <span className="text-base">👾</span>
            <h3 className="font-pixel text-xs text-mario-coin">
              {t.footer.sponsorTitle || "SPONSORSHIP & BUSINESS COOPERATION"}
            </h3>
          </div>
          <p className="font-mono text-xs text-zinc-300 mb-4 max-w-md mx-auto">
            {t.footer.sponsorSubtitle ||
              "Reach thousands of quota-weary AI engineers & developers worldwide."}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {/* Direct Mail Link */}
            <a
              href="mailto:sponsor@whenreset.top?subject=Sponsorship%20Inquiry%20-%20WhenReset"
              onClick={() => {
                playMarioCoinSound();
                triggerHaptic(8);
                trackEvent("footer_sponsor_mail_clicked");
              }}
              className="pixel-btn px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white font-pixel text-[9px] border-2 border-black shadow-pixel-sm flex items-center gap-1.5 rounded-none cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>sponsor@whenreset.top</span>
            </a>

            {/* Copy Email Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (typeof navigator !== "undefined" && navigator.clipboard) {
                  navigator.clipboard.writeText("sponsor@whenreset.top");
                  setCopiedEmail(true);
                  playMarioCoinSound();
                  triggerHaptic(12);
                  trackEvent("footer_sponsor_email_copied");
                  setTimeout(() => setCopiedEmail(false), 2500);
                }
              }}
              className="pixel-btn px-3 py-2 bg-[#12141D] hover:bg-black text-zinc-300 font-pixel text-[9px] border-2 border-black shadow-pixel-sm flex items-center gap-1.5 rounded-none cursor-pointer"
              title="Copy sponsor email"
            >
              {copiedEmail ? (
                <>
                  <Check className="w-3.5 h-3.5 text-mario-green" />
                  <span className="text-mario-green">
                    {t.footer.sponsorEmailCopied || "COPIED!"}
                  </span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>[ COPY ]</span>
                </>
              )}
            </button>

            {/* Feedback Button */}
            <a
              href="mailto:sponsor@whenreset.top?subject=WhenReset%20Feedback%20%26%20Suggestion"
              onClick={() => {
                playMarioCoinSound();
                triggerHaptic(8);
                trackEvent("footer_feedback_clicked");
              }}
              className="pixel-btn px-2.5 py-2 bg-[#12141D] hover:bg-[#1c2130] text-zinc-400 hover:text-white font-pixel text-[9px] border-2 border-black shadow-pixel-sm flex items-center gap-1.5 rounded-none cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{t.footer.feedbackCta || "[ 💬 FEEDBACK ]"}</span>
            </a>
          </div>
        </div>

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
