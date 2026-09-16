import { track } from "@vercel/analytics";
import type { AnalyticsEvent } from "./analytics-events";

/**
 * Universal event tracker for WhenReset.
 * Supports Vercel Analytics custom events with safe SSR guards and dev logging.
 *
 * `eventName` is intentionally typed as `AnalyticsEvent` rather than `string`:
 * the union lives in `analytics-events.ts`, so a typo at a call site is a
 * compile error instead of an event that silently never matches anything.
 */
export function trackEvent(
  eventName: AnalyticsEvent,
  properties?: Record<string, string | number | boolean | null | undefined>
) {
  if (typeof window === "undefined") return;

  try {
    // 1. Vercel Analytics custom event
    track(eventName, properties);

    // 2. Fallback / extension for Google Analytics if present in window
    const win = window as unknown as {
      gtag?: (
        command: string,
        eventName: string,
        params?: Record<string, unknown>
      ) => void;
    };
    if (typeof win.gtag === "function") {
      win.gtag("event", eventName, properties);
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`📊 [Analytics] ${eventName}`, properties || {});
    }
  } catch (err) {
    // Analytics should never break user interactions
    console.debug(`[Analytics error: ${eventName}]`, err);
  }
}
