"use client";

import React, { useState, useEffect, useMemo } from "react";
import fallbackResets from "@/data/fallback-resets.json";
import { ResetItem, ResetsResponse, StatusResponse } from "@/lib/types";
import { computeForecast, IncidentSignal } from "@/lib/forecast";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Calendar, ExternalLink } from "lucide-react";

/**
 * Live forecast block shared by the SEO landing pages so they are not
 * static filler - they render the same number the dashboard shows.
 */
export const LiveResetPanel: React.FC = () => {
  const { language } = useLanguage();
  const isZh = language === "zh";

  const [resets, setResets] = useState<ResetItem[]>(fallbackResets as ResetItem[]);
  const [statusData, setStatusData] = useState<StatusResponse["data"] | null>(null);
  const [incident, setIncident] = useState<IncidentSignal | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [r, s, i] = await Promise.allSettled([
          fetch("/api/resets"),
          fetch("/api/status"),
          fetch("/api/incidents"),
        ]);

        if (cancelled) return;

        if (r.status === "fulfilled" && r.value.ok) {
          const json: ResetsResponse = await r.value.json();
          if (Array.isArray(json?.data) && json.data.length > 0) setResets(json.data);
        }
        if (s.status === "fulfilled" && s.value.ok) {
          const json: StatusResponse = await s.value.json();
          if (json?.data) setStatusData(json.data);
        }
        if (i.status === "fulfilled" && i.value.ok) {
          const json = await i.value.json();
          if (json?.data) setIncident(json.data as IncidentSignal);
        }
      } catch {
        // keep the bundled fallback dataset
      }
    };

    load();
    const timer = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const forecast = useMemo(
    () =>
      computeForecast({
        resets,
        stats: statusData?.stats ?? null,
        scheduled: statusData?.scheduled_reset ?? null,
        incident,
      }),
    [resets, statusData, incident]
  );

  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const diffMs = forecast.targetDate.getTime() - now;
  const overdue = diffMs <= 0;
  const abs = Math.abs(diffMs);
  const days = Math.floor(abs / 86400000);
  const hours = Math.floor((abs / 3600000) % 24);
  const minutes = Math.floor((abs / 60000) % 60);

  const tone =
    forecast.likelihood >= 80
      ? "text-rose-400"
      : forecast.likelihood >= 60
      ? "text-amber-400"
      : "text-emerald-400";

  return (
    <div className="rounded-2xl glass-panel border border-white/10 p-6 sm:p-7 mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4 mb-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            {isZh ? "实时预测（与首页同源）" : "LIVE FORECAST (SAME SOURCE AS HOME)"}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isZh
              ? "由历史掉落中位数、冷却衰减与 OpenAI 实时故障信号合成"
              : "Built from the median drop interval, cooldown decay and live OpenAI incidents"}
          </p>
        </div>
        <a
          href="/api/calendar.ics"
          className="inline-flex items-center space-x-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white"
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>{isZh ? "订阅重置日历" : "Subscribe .ics"}</span>
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <div className="text-[11px] uppercase text-slate-400 font-semibold">
            {isZh ? "重置概率" : "Reset likelihood"}
          </div>
          <div className={`text-4xl font-bold font-mono mt-1 ${tone}`}>
            {forecast.likelihood}%
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase text-slate-400 font-semibold">
            {isZh ? "预计倒计时" : "Countdown"}
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-white">
            {overdue ? "+" : "-"}
            {days}d {hours}h {minutes}m
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase text-slate-400 font-semibold">
            {isZh ? "周期中位数" : "Median cadence"}
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-white">
            {forecast.medianIntervalDays.toFixed(1)}d
          </div>
        </div>
      </div>

      {statusData?.latest_reset?.source?.url && (
        <a
          href={statusData.latest_reset.source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center space-x-1.5 text-xs text-blue-400 hover:text-blue-300"
        >
          <span>
            {isZh ? "最近一次官方公告原文" : "Latest official announcement"}
          </span>
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
};
