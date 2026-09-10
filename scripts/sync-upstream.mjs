#!/usr/bin/env node

/**
 * scripts/sync-upstream.mjs
 * 
 * Lightweight ESM data synchronization script for WhenReset.
 * Fetches latest resets from public upstream, merges incrementally with deduplication,
 * and outputs an 8-bit Mario style data health check report.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE_PATH = path.resolve(__dirname, "../src/data/fallback-resets.json");

const DEFAULT_UPSTREAM_URL = "https://codex-resets.com/api/v1/resets";
const TIMEOUT_MS = 6000;
const MAX_RETRIES = 2;

/**
 * Parse CLI options
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: false,
    upstreamUrl: process.env.UPSTREAM_RESETS_URL || DEFAULT_UPSTREAM_URL,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--dry-run" || arg === "-d") {
      options.dryRun = true;
    } else if (arg === "--upstream" && args[i + 1]) {
      options.upstreamUrl = args[++i];
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    }
  }

  return options;
}

/**
 * Fetch with timeout and retry
 */
async function fetchUpstreamResets(url, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "WhenReset-Radar-Sync/1.0",
          Accept: "application/json",
        },
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }

      const json = await res.json();
      const items = Array.isArray(json) ? json : json.data;
      if (Array.isArray(items)) {
        return items;
      }
      throw new Error("Invalid response format: data is not an array");
    } catch (err) {
      if (attempt === retries) {
        console.warn(`[WARN] Upstream fetch failed after ${retries} attempts: ${err.message}`);
        return null;
      }
      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
  return null;
}

/**
 * Calculate health stats from resets dataset
 */
function computeHealthStats(resets) {
  if (!resets || resets.length === 0) {
    return {
      total: 0,
      latest: null,
      daysSinceLast: 0,
      avgIntervalDays: 0,
      longestWaitDays: 0,
    };
  }

  const sorted = [...resets].sort(
    (a, b) => new Date(b.announced_at).getTime() - new Date(a.announced_at).getTime()
  );

  const latest = sorted[0];
  const now = Date.now();
  const latestTime = new Date(latest.announced_at).getTime();
  const daysSinceLast = Math.max(0, Number(((now - latestTime) / (1000 * 60 * 60 * 24)).toFixed(1)));

  const intervals = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const tCurrent = new Date(sorted[i].announced_at).getTime();
    const tPrevious = new Date(sorted[i + 1].announced_at).getTime();
    const diffDays = (tCurrent - tPrevious) / (1000 * 60 * 60 * 24);
    if (diffDays >= 0) {
      intervals.push(diffDays);
    }
  }

  const avgIntervalDays =
    intervals.length > 0
      ? Number((intervals.reduce((a, b) => a + b, 0) / intervals.length).toFixed(1))
      : 0;

  const longestWaitDays =
    intervals.length > 0 ? Number(Math.max(...intervals).toFixed(1)) : 0;

  return {
    total: resets.length,
    latest,
    daysSinceLast,
    avgIntervalDays,
    longestWaitDays,
  };
}

/**
 * Main execution
 */
async function main() {
  const options = parseArgs();

  if (options.help) {
    console.log(`
Usage: node scripts/sync-upstream.mjs [options]

Options:
  -d, --dry-run     Check upstream and print health report without writing files
  --upstream <url>  Specify custom upstream API endpoint
  -h, --help        Show this help message
`);
    process.exit(0);
  }

  console.log("🍄 [WhenReset Radar] Starting upstream synchronization...");

  // 1. Read local dataset
  let localResets = [];
  try {
    const localContent = await fs.readFile(DATA_FILE_PATH, "utf-8");
    localResets = JSON.parse(localContent);
  } catch (err) {
    console.error(`[ERROR] Failed to read ${DATA_FILE_PATH}:`, err.message);
    process.exit(1);
  }

  const localIds = new Set(localResets.map((r) => String(r.id)));

  // 2. Fetch from upstream
  console.log(`📡 Connecting to upstream: ${options.upstreamUrl}`);
  const upstreamResets = await fetchUpstreamResets(options.upstreamUrl);

  const newItems = [];
  if (upstreamResets && Array.isArray(upstreamResets)) {
    for (const item of upstreamResets) {
      if (item && item.id && !localIds.has(String(item.id))) {
        newItems.push(item);
      }
    }
  }

  // 3. Merge & sort descending
  const mergedResets = [...newItems, ...localResets].sort(
    (a, b) => new Date(b.announced_at).getTime() - new Date(a.announced_at).getTime()
  );

  // 4. Compute statistics
  const stats = computeHealthStats(mergedResets);

  // 5. Print 8-bit Mario Data Health Check Report
  console.log("");
  console.log("================================================================");
  console.log("  🍄 WHENRESET RADAR // DATA HEALTH CHECK REPORT 🍄");
  console.log("================================================================");
  console.log(`  📊 Total Resets Tracked : ${stats.total}`);
  if (stats.latest) {
    const previewText = (stats.latest.text || "").replace(/\n/g, " ").slice(0, 60);
    console.log(`  ⭐ Latest Reset Time    : ${stats.latest.announced_at} (${stats.daysSinceLast}d ago)`);
    console.log(`  🪙 Reset Type & ID      : [${stats.latest.reset_type.toUpperCase()}] id=${stats.latest.id}`);
    console.log(`  📜 Latest Announcement  : "${previewText}..."`);
  }
  console.log(`  ⏱️  Average Cadence      : ${stats.avgIntervalDays} days between resets`);
  console.log(`  🏰 Longest Wait Record  : ${stats.longestWaitDays} days`);
  console.log(`  🆕 New Upstream Resets  : ${newItems.length} discovered`);
  console.log(`  ⚙️  Execution Mode       : ${options.dryRun ? "DRY-RUN (Safe Read-Only)" : "WRITE-ENABLED"}`);
  console.log("================================================================");

  // 6. Handle write
  if (options.dryRun) {
    console.log("✅ [Dry Run] Health check completed successfully. No changes written.");
  } else {
    if (newItems.length > 0) {
      await fs.writeFile(
        DATA_FILE_PATH,
        JSON.stringify(mergedResets, null, 2) + "\n",
        "utf-8"
      );
      console.log(`🎉 [Updated] Successfully merged ${newItems.length} new reset(s) into fallback-resets.json!`);
    } else {
      console.log("✨ [Up to Date] Local dataset is already synchronized with upstream.");
    }
  }
}

main().catch((err) => {
  console.error("💥 Fatal error during sync execution:", err);
  process.exit(1);
});
