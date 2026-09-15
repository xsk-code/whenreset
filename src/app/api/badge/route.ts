import { NextResponse } from "next/server";
import { RadarSnapshot, loadRadarSnapshot } from "@/lib/radar-snapshot";

/**
 * Dynamic status badge, embeddable from any README, blog or docs site:
 *
 *   ![reset radar](https://whenreset.top/api/badge)
 *   ![reset radar](https://whenreset.top/api/badge?metric=elapsed&theme=light&lang=zh)
 *
 * Every embed is a link back to the site, and every value comes from
 * `loadRadarSnapshot()` so a badge can never disagree with the homepage.
 */

export const runtime = "nodejs";

type BadgeMetric = "likelihood" | "elapsed" | "cadence";
type BadgeTheme = "dark" | "light";
type BadgeLang = "en" | "zh";

const METRICS = ["likelihood", "elapsed", "cadence"] as const;
const THEMES = ["dark", "light"] as const;
const LANGS = ["en", "zh"] as const;

/**
 * Status tiers mirror ForecastHero exactly (>=80 critical, >=60 elevated,
 * otherwise calm). Do not invent new colours or thresholds here: a badge that
 * contradicts the site's own colour is worse than no badge.
 */
const COLOR = {
  calm: "#10B981",
  elevated: "#F59E0B",
  critical: "#F43F5E",
  neutral: "#3B82F6",
  unknown: "#5F5E5A",
} as const;

const SKIN: Record<BadgeTheme, { labelBg: string; labelFg: string; valueFg: string }> = {
  dark: { labelBg: "#0F1620", labelFg: "#94A3B8", valueFg: "#080B11" },
  light: { labelBg: "#F1EFE8", labelFg: "#5F5E5A", valueFg: "#080B11" },
};

const LABELS: Record<BadgeMetric, Record<BadgeLang, string>> = {
  likelihood: { en: "reset radar", zh: "重置雷达" },
  elapsed: { en: "since last reset", zh: "距上次重置" },
  cadence: { en: "median cadence", zh: "周期中位数" },
};

const FONT_SIZE = 11;
const ASCII_CHAR_W = 6.6;
const CJK_CHAR_W = 11;
const PAD_X = 5;
const HEIGHT = 20;
const FONT_STACK =
  "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";

function textWidth(text: string): number {
  let width = 0;
  for (const ch of text) {
    width += /[\u2e80-\u9fff\uff00-\uffef]/.test(ch) ? CJK_CHAR_W : ASCII_CHAR_W;
  }
  return width;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pick<T extends string>(
  raw: string | null,
  allowed: readonly T[],
  fallback: T
): T {
  const value = (raw ?? "").trim().toLowerCase();
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

interface BadgeParts {
  label: string;
  value: string;
  color: string;
}

function resolveParts(
  snapshot: RadarSnapshot,
  metric: BadgeMetric,
  lang: BadgeLang
): BadgeParts {
  const forecast = snapshot.forecast;

  if (metric === "elapsed") {
    return {
      label: LABELS.elapsed[lang],
      value: `${forecast.daysSinceLast.toFixed(1)}d`,
      color: COLOR.neutral,
    };
  }

  if (metric === "cadence") {
    return {
      label: LABELS.cadence[lang],
      value: `${forecast.medianIntervalDays.toFixed(1)}d`,
      color: COLOR.neutral,
    };
  }

  const tier =
    forecast.scheduled || forecast.likelihood >= 80
      ? COLOR.critical
      : forecast.likelihood >= 60
      ? COLOR.elevated
      : COLOR.calm;

  return {
    label: LABELS.likelihood[lang],
    value: `${forecast.likelihood}%`,
    color: tier,
  };
}

/**
 * Flat, two-segment badge. No gradients, no shadows, no animation, and
 * system monospace only — the SVG is proxied through GitHub's camo, so a web
 * font would never load.
 */
function renderBadge(parts: BadgeParts, theme: BadgeTheme): string {
  const skin = SKIN[theme];
  const labelW = Math.round(textWidth(parts.label)) + PAD_X * 2;
  const valueW = Math.round(textWidth(parts.value)) + PAD_X * 2;
  const total = labelW + valueW;
  const aria = `${parts.label}: ${parts.value}`;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${HEIGHT}" viewBox="0 0 ${total} ${HEIGHT}" role="img" aria-label="${escapeXml(aria)}">`,
    `<title>${escapeXml(aria)}</title>`,
    `<rect width="${labelW}" height="${HEIGHT}" fill="${skin.labelBg}"/>`,
    `<rect x="${labelW}" width="${valueW}" height="${HEIGHT}" fill="${parts.color}"/>`,
    `<g font-family="${FONT_STACK}" font-size="${FONT_SIZE}" font-weight="600">`,
    `<text x="${PAD_X}" y="14" fill="${skin.labelFg}">${escapeXml(parts.label)}</text>`,
    `<text x="${labelW + PAD_X}" y="14" fill="${skin.valueFg}">${escapeXml(parts.value)}</text>`,
    `</g>`,
    `</svg>`,
  ].join("");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Invalid parameters fall back to defaults rather than erroring: a broken
  // image is a worse outcome than a default-styled badge.
  const metric = pick(searchParams.get("metric"), METRICS, "likelihood");
  const theme = pick(searchParams.get("theme"), THEMES, "dark");
  const lang = pick(searchParams.get("lang"), LANGS, "en");

  let svg: string;

  try {
    svg = renderBadge(
      resolveParts(await loadRadarSnapshot(), metric, lang),
      theme
    );
  } catch {
    // Never 500 and never return an empty image.
    svg = renderBadge(
      { label: LABELS[metric][lang], value: "n/a", color: COLOR.unknown },
      theme
    );
  }

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
