#!/usr/bin/env node

/**
 * scripts/generate-tweet.mjs
 * 
 * Developer Telemetry Twitter / X Copy Generator for WhenReset.
 * Calculates real-time reset probability or accepts CLI arguments,
 * generating viral geek tweet drafts strictly within the 280-char limit.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE_PATH = path.resolve(__dirname, "../src/data/fallback-resets.json");

/**
 * Parse CLI args
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    prob: null,
    days: null,
    type: null,
    style: "all",
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--prob" && args[i + 1]) {
      options.prob = parseFloat(args[++i]);
    } else if (arg === "--days" && args[i + 1]) {
      options.days = parseFloat(args[++i]);
    } else if (arg === "--type" && args[i + 1]) {
      options.type = args[++i];
    } else if (arg === "--style" && args[i + 1]) {
      options.style = args[++i];
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    }
  }

  return options;
}

/**
 * Read local dataset and compute fallback stats
 */
async function getStatusData() {
  try {
    const raw = await fs.readFile(DATA_FILE_PATH, "utf-8");
    const resets = JSON.parse(raw);

    if (!Array.isArray(resets) || resets.length === 0) {
      return {
        daysSinceLast: 1.0,
        avgInterval: 6.9,
        latest: { reset_type: "banked", announced_at: new Date().toISOString() },
      };
    }

    const sorted = [...resets].sort(
      (a, b) => new Date(b.announced_at).getTime() - new Date(a.announced_at).getTime()
    );

    const latest = sorted[0];
    const now = Date.now();
    const diffDays = Math.max(
      0,
      Number(((now - new Date(latest.announced_at).getTime()) / (1000 * 60 * 60 * 24)).toFixed(1))
    );

    const intervals = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const t1 = new Date(sorted[i].announced_at).getTime();
      const t2 = new Date(sorted[i + 1].announced_at).getTime();
      const diff = (t1 - t2) / (1000 * 60 * 60 * 24);
      if (diff >= 0) intervals.push(diff);
    }

    const avgInterval =
      intervals.length > 0
        ? Number((intervals.reduce((a, b) => a + b, 0) / intervals.length).toFixed(1))
        : 6.9;

    return {
      daysSinceLast: diffDays,
      avgInterval,
      latest,
      totalResets: resets.length,
    };
  } catch (err) {
    return {
      daysSinceLast: 1.0,
      avgInterval: 6.9,
      latest: { reset_type: "banked", announced_at: new Date().toISOString() },
      totalResets: 50,
    };
  }
}

/**
 * Calculate probability following Mario Radar logic
 */
function calculateProbability(days, avg) {
  if (avg <= 0) return 50;
  const raw = Math.round((days / avg) * 75);
  return Math.min(99, Math.max(10, raw));
}

function generateDrafts({ prob, days, avg, type }) {
  const isCastleAlert = prob >= 75;
  const isMidZone = prob >= 40 && prob < 75;

  const header = isCastleAlert
    ? "🍄🚨 [WORLD 8-4 CASTLE ALERT] 🚨🍄"
    : isMidZone
    ? "🍄⭐ [WORLD 4-1 WARP ZONE] ⭐🍄"
    : "🍄🏁 [WORLD 1-1 CHECKPOINT] 🏁🍄";

  const statusNote = isCastleAlert
    ? "🏰 Castle lava rising, reset imminent!"
    : isMidZone
    ? "🪙 Token meters heating up!"
    : "👾 Tokens running fresh!";

  // 1. Classic Retro Arcade Style (<= 280 chars)
  const retro = [
    header,
    `Codex Reset Probability: ${prob}%!`,
    "",
    `⏱️ ${days}d since last ${type} refill`,
    `🪙 Cadence: ~${avg}d average`,
    statusNote,
    "",
    "⚡ Live Radar: https://whenreset.top",
    "#OpenAI #Codex #WhenReset #ChatGPT",
  ].join("\n");

  // 2. Punchy Fast-Paced Style (<= 280 chars)
  const punchy = [
    `⚡ WHEN RESET? RADAR: ${prob}% CHANCE`,
    "",
    `It's been ${days} days since @thsottiaux pressed reset.`,
    `Historical average is ${avg} days.`,
    "",
    isCastleAlert ? "🔥 Reset could drop any moment!" : "⚡ Keep building, tokens flowing!",
    "",
    "Live tracker: https://whenreset.top",
    "#OpenAI #Codex #WhenReset #AI",
  ].join("\n");

  // 3. Geek Telemetry Style (<= 280 chars)
  const meter = "█".repeat(Math.min(10, Math.floor(prob / 10))) + "░".repeat(Math.max(0, 10 - Math.floor(prob / 10)));
  const dramatic = [
    `⚡ [CODEX WATCH] LIVE TELEMETRY`,
    `Probability: [${meter}] ${prob}%`,
    `Elapsed: ${days}d / Cadence: ${avg}d`,
    `Last Mode: ${type.toUpperCase()}`,
    "",
    "Ready your prompt pipelines:",
    "⚡ https://whenreset.top",
    "",
    "#OpenAI #Codex #WhenReset #AI",
  ].join("\n");

  return { retro, punchy, dramatic };
}

async function main() {
  const options = parseArgs();

  if (options.help) {
    console.log(`
Usage: node scripts/generate-tweet.mjs [options]

Options:
  --prob <number>    Override reset probability (e.g. 85)
  --days <number>    Override days elapsed since last reset (e.g. 3.2)
  --type <string>    Override reset type ('regular' | 'banked')
  --style <name>     Filter style: 'retro' | 'punchy' | 'dramatic' | 'all' (default)
  -h, --help         Show this help message
`);
    process.exit(0);
  }

  const data = await getStatusData();
  const days = options.days !== null ? options.days : data.daysSinceLast;
  const avg = data.avgInterval;
  const prob = options.prob !== null ? options.prob : calculateProbability(days, avg);
  const type = options.type || data.latest?.reset_type || "regular";

  const drafts = generateDrafts({
    prob,
    days,
    avg,
    type,
  });

  console.log("================================================================");
  console.log("  ⚡ WHENRESET // AI TELEMETRY TWEET GENERATOR ⚡");
  console.log("================================================================");
  console.log(`  State: Probability = ${prob}% | Days Elapsed = ${days}d | Cadence = ${avg}d`);
  console.log("================================================================\n");

  if (options.style === "all" || options.style === "retro") {
    console.log("--- 🍄 DRAFT 1: RETRO ARCADE (Recommended) ---");
    console.log(drafts.retro);
    console.log(`\n[Char Count: ${drafts.retro.length} / 280]\n`);
  }

  if (options.style === "all" || options.style === "punchy") {
    console.log("--- ⚡ DRAFT 2: FAST & PUNCHY ---");
    console.log(drafts.punchy);
    console.log(`\n[Char Count: ${drafts.punchy.length} / 280]\n`);
  }

  if (options.style === "all" || options.style === "dramatic") {
    console.log("--- 🎮 DRAFT 3: GEEK TELEMETRY ---");
    console.log(drafts.dramatic);
    console.log(`\n[Char Count: ${drafts.dramatic.length} / 280]\n`);
  }

  console.log("✨ Ready to copy & broadcast on Twitter/X!");
}

main().catch((err) => {
  console.error("💥 Error generating tweet:", err);
  process.exit(1);
});
