"use client";

import { useEffect, useRef } from "react";
import {
  readAlertConfig,
  pushNotification,
  STORAGE_KEYS,
  hasAnyChannel,
} from "./notify";

interface GuardianParams {
  enabled: boolean;
  forecastLikelihood: number;
  latestResetId: string | null;
  latestResetUrl: string;
  lang: "en" | "zh";
}

const DEDUPE_WINDOW_MS = 6 * 60 * 60 * 1000;

function dedupeKey(kind: string, suffix: string): string {
  return `${STORAGE_KEYS.threshold}_fired_${kind}_${suffix}`;
}

function alreadyFired(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return false;
    return Date.now() - Number(raw) < DEDUPE_WINDOW_MS;
  } catch {
    return false;
  }
}

function markFired(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, String(Date.now()));
  } catch {
    // ignore
  }
}

/**
 * Background watcher that turns the saved alert config into real deliveries.
 *
 * Two triggers, both backed by verifiable state:
 *  1. a brand new official drop appears in the dataset
 *  2. the forecast crosses the user's likelihood threshold
 * Repeat pushes are suppressed inside a 6h window.
 */
export function useAlertGuardian({
  enabled,
  forecastLikelihood,
  latestResetId,
  latestResetUrl,
  lang,
}: GuardianParams) {
  const initialised = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    if (!latestResetId) return;

    const config = readAlertConfig();
    if (!hasAnyChannel(config)) {
      initialised.current = true;
      return;
    }

    let lastSeen: string | null = null;
    try {
      lastSeen = window.localStorage.getItem(STORAGE_KEYS.lastSeenReset);
    } catch {
      lastSeen = null;
    }

    // First ever run only records the baseline, it must not spam the user.
    if (!initialised.current || lastSeen === null) {
      initialised.current = true;
      try {
        window.localStorage.setItem(STORAGE_KEYS.lastSeenReset, latestResetId);
      } catch {
        // ignore
      }
      return;
    }

    const dispatch = async (title: string, body: string) => {
      if (config.barkKey) {
        await pushNotification({
          channel: "bark",
          target: config.barkKey,
          level: config.barkLevel,
          title,
          body,
          url: latestResetUrl || undefined,
        });
      }
      if (config.webhookUrl) {
        await pushNotification({
          channel: "webhook",
          target: config.webhookUrl,
          title,
          body,
          url: latestResetUrl || undefined,
        });
      }
    };

    const isZh = lang === "zh";

    // Trigger 1: a new official reset landed
    if (lastSeen !== latestResetId) {
      const key = dedupeKey("reset", latestResetId);
      if (!alreadyFired(key)) {
        markFired(key);
        dispatch(
          isZh ? "✅ 额度已重置 (WhenReset)" : "✅ Reset confirmed (WhenReset)",
          isZh
            ? `官方已发放重置，当前预测置信度 ${forecastLikelihood}%，可以回去接着烧 Token 了。`
            : `A new official drop landed. Forecast ${forecastLikelihood}% - time to burn tokens again.`
        );
        try {
          window.localStorage.setItem(STORAGE_KEYS.lastSeenReset, latestResetId);
        } catch {
          // ignore
        }
      }
      return;
    }

    // Trigger 2: likelihood crossed the user's threshold
    if (forecastLikelihood >= config.threshold) {
      const slot = Math.floor(Date.now() / DEDUPE_WINDOW_MS);
      const key = dedupeKey("threshold", String(slot));
      if (!alreadyFired(key)) {
        markFired(key);
        dispatch(
          isZh
            ? `⚡ 重置概率 ${forecastLikelihood}% 已达阈值`
            : `⚡ ${forecastLikelihood}% likelihood reached`,
          isZh
            ? `已越过你设置的 ${config.threshold}% 阈值，建议盯紧官方公告或先保存上下文。`
            : `Crossed your ${config.threshold}% threshold. Keep an eye on official channels and save your context.`
        );
      }
    }
  }, [enabled, forecastLikelihood, latestResetId, latestResetUrl, lang]);
}
