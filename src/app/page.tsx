"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import fallbackResets from "@/data/fallback-resets.json";
import { ResetItem, ResetsResponse, StatusData, StatusResponse } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { computeForecast, IncidentSignal } from "@/lib/forecast";
import { useAlertGuardian } from "@/lib/useAlertGuardian";
import { Header } from "@/components/dashboard/Header";
import { ForecastHero } from "@/components/dashboard/ForecastHero";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { SignalDesk } from "@/components/dashboard/SignalDesk";
import { HistoryTable } from "@/components/dashboard/HistoryTable";
import { FAQSection } from "@/components/dashboard/FAQSection";
import { TopicMatrix } from "@/components/dashboard/TopicMatrix";
import { Footer } from "@/components/dashboard/Footer";
import { AlertModal } from "@/components/dashboard/AlertModal";
import { ShareModal } from "@/components/dashboard/ShareModal";

export default function Home() {
  const { language, toggleLanguage } = useLanguage();
  const [resets, setResets] = useState<ResetItem[]>(() => fallbackResets as ResetItem[]);
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [incidentSignal, setIncidentSignal] = useState<IncidentSignal | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [activeModel, setActiveModel] = useState<string>("codex");

  // Modals state
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);

  // Fetch live resets, status and OpenAI incidents concurrently
  const fetchData = useCallback(async () => {
    try {
      const cacheBuster = `_t=${Date.now()}`;
      const [resetsRes, statusRes, incidentRes] = await Promise.allSettled([
        fetch(`/api/resets?${cacheBuster}`),
        fetch(`/api/status?${cacheBuster}`),
        fetch(`/api/incidents?${cacheBuster}`),
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

      if (incidentRes.status === "fulfilled" && incidentRes.value.ok) {
        const incidentJson = await incidentRes.value.json();
        if (incidentJson?.data) {
          setIncidentSignal(incidentJson.data as IncidentSignal);
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

  // Single source of truth for every prediction rendered on this page
  const forecast = useMemo(() => {
    return computeForecast({
      resets,
      stats: statusData?.stats ?? null,
      scheduled: statusData?.scheduled_reset ?? null,
      incident: incidentSignal,
    });
  }, [resets, statusData, incidentSignal]);

  // Fires the configured Bark / Webhook channels when thresholds are crossed
  useAlertGuardian({
    enabled: true,
    forecastLikelihood: forecast.likelihood,
    latestResetId: resets[0]?.id ?? null,
    latestResetUrl: resets[0]?.source?.url ?? "",
    lang: language,
  });

  const estimatedNextDateStr = useMemo(() => {
    return forecast.targetDate.toLocaleDateString(language === "zh" ? "zh-CN" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [forecast.targetDate, language]);

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
          resets={resets}
          forecast={forecast}
          lang={language}
          onOpenAlerts={() => setIsAlertsOpen(true)}
          onOpenShare={() => setIsShareOpen(true)}
        />

        {/* 4 Key Metrics */}
        <MetricsGrid
          stats={statusData?.stats ?? null}
          resets={resets}
          forecast={forecast}
          lang={language}
        />

        {/* Signal Desk */}
        <SignalDesk
          latestReset={resets[0]}
          resets={resets}
          forecast={forecast}
          incident={incidentSignal}
          lang={language}
        />

        {/* Filterable History Table */}
        <HistoryTable resets={resets} lang={language} />

        {/* SEO FAQ Section with JSON-LD */}
        <FAQSection lang={language} />

        {/* Internal topic pages for Programmatic SEO */}
        <TopicMatrix lang={language} />
      </main>

      {/* Footer */}
      <Footer lang={language} lastSyncTime={lastSyncTime} />

      {/* Developer Alert Hub Modal */}
      <AlertModal isOpen={isAlertsOpen} onClose={() => setIsAlertsOpen(false)} lang={language} />

      {/* Social Share Card Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        lang={language}
        likelihood={forecast.likelihood}
        daysSinceLast={forecast.daysSinceLast}
        estimatedNextDate={estimatedNextDateStr}
      />
    </div>
  );
}
