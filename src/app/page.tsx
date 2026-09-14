"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import fallbackResets from "@/data/fallback-resets.json";
import { ResetItem, ResetsResponse, StatusData, StatusResponse } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Header } from "@/components/dashboard/Header";
import { ForecastHero } from "@/components/dashboard/ForecastHero";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { SignalDesk } from "@/components/dashboard/SignalDesk";
import { HistoryTable } from "@/components/dashboard/HistoryTable";
import { FAQSection } from "@/components/dashboard/FAQSection";
import { Footer } from "@/components/dashboard/Footer";
import { AlertModal } from "@/components/dashboard/AlertModal";
import { ShareModal } from "@/components/dashboard/ShareModal";

export default function Home() {
  const { language, toggleLanguage } = useLanguage();
  const [resets, setResets] = useState<ResetItem[]>(() => fallbackResets as ResetItem[]);
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [activeModel, setActiveModel] = useState<string>("codex");

  // Modals state
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);

  // Fetch live resets and status concurrently
  const fetchData = useCallback(async () => {
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
      setLastSyncTime(new Date());
    } catch (err) {
      console.warn("[WhenReset] Live sync check, maintaining local fallback dataset", err);
    }
  }, []);

  // Polling every 15s + instant sync on tab focus
  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 15000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchData();
      }
    };
    const handleWindowFocus = () => {
      fetchData();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [fetchData]);

  // Derived values for share modal
  const avgCadenceDays = statusData?.stats?.avg_interval_days || 3.3;
  const daysSinceLast = statusData?.stats?.days_since_last || 0;
  const scheduled = statusData?.scheduled_reset;

  const likelihood = useMemo(() => {
    if (scheduled) return 100;
    return Math.min(95, Math.max(15, Math.round((daysSinceLast / avgCadenceDays) * 75)));
  }, [scheduled, daysSinceLast, avgCadenceDays]);

  const estimatedNextDateStr = useMemo(() => {
    const latestReset = resets[0];
    const lastResetDate = latestReset ? new Date(latestReset.announced_at) : new Date();
    const target = scheduled
      ? new Date(scheduled.scheduled_for)
      : new Date(lastResetDate.getTime() + avgCadenceDays * 24 * 60 * 60 * 1000);

    return target.toLocaleDateString(language === "zh" ? "zh-CN" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [resets, scheduled, avgCadenceDays, language]);

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 bg-grid-pattern selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Navigation Header */}
      <Header
        currentLang={language}
        onToggleLang={toggleLanguage}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        activeModel={activeModel}
        onChangeModel={setActiveModel}
      />

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Core Hero Forecast */}
        <ForecastHero
          statusData={statusData}
          resets={resets}
          lang={language}
          onOpenAlerts={() => setIsAlertsOpen(true)}
          onOpenShare={() => setIsShareOpen(true)}
        />

        {/* 4 Key Metrics */}
        <MetricsGrid
          stats={statusData?.stats ?? null}
          lang={language}
          totalResetsCount={resets.length}
        />

        {/* Signal Desk */}
        <SignalDesk
          latestReset={resets[0]}
          lang={language}
          daysSinceLast={daysSinceLast}
        />

        {/* Filterable History Table */}
        <HistoryTable resets={resets} lang={language} />

        {/* SEO FAQ Section with JSON-LD */}
        <FAQSection lang={language} />
      </main>

      {/* Footer */}
      <Footer lang={language} lastSyncTime={lastSyncTime} />

      {/* Developer Alert Hub Modal */}
      <AlertModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        lang={language}
      />

      {/* Social Share Card Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        lang={language}
        likelihood={likelihood}
        daysSinceLast={daysSinceLast}
        estimatedNextDate={estimatedNextDateStr}
      />
    </div>
  );
}
