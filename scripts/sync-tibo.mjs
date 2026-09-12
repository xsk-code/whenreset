#!/usr/bin/env node

/**
 * scripts/sync-tibo.mjs
 * 
 * Lightweight Tibo Tweet & Codex Reset Sync Tool for WhenReset.
 * 
 * Features:
 * 1. Automatic Upstream Sync: Fetches latest resets & status from upstream, deduplicating with local fallback-resets.json.
 * 2. Instant Manual Tweet Ingestion: Allows quick injection of a newly discovered Tibo tweet via CLI flags.
 * 3. 8-Bit NES ASCII Terminal Report: Displays full status report.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE_PATH = path.resolve(__dirname, "../src/data/fallback-resets.json");
const SCHEDULED_FILE_PATH = path.resolve(__dirname, "../src/data/fallback-scheduled.json");

const UPSTREAM_RESETS_URL = process.env.UPSTREAM_RESETS_URL || "https://codex-resets.com/api/v1/resets";
const UPSTREAM_STATUS_URL = process.env.UPSTREAM_STATUS_URL || "https://codex-resets.com/api/v1/status";
const TIMEOUT_MS = 6000;

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: false,
    addTweet: null,
    tweetType: "regular",
    tweetUrl: null,
    author: "thsottiaux",
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--dry-run" || arg === "-d") {
      options.dryRun = true;
    } else if (arg === "--add-tweet" && args[i + 1]) {
      options.addTweet = args[++i];
    } else if (arg === "--type" && args[i + 1]) {
      options.tweetType = args[++i].toLowerCase();
    } else if (arg === "--url" && args[i + 1]) {
      options.tweetUrl = args[++i];
    } else if (arg === "--author" && args[i + 1]) {
      options.author = args[++i];
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    }
  }

  return options;
}

async function fetchWithTimeout(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "WhenReset-Tibo-Radar/1.0",
        Accept: "application/json",
      },
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

async function main() {
  const options = parseArgs();

  if (options.help) {
    console.log(`
🍄 WhenReset Tibo Radar Sync Tool

Usage:
  node scripts/sync-tibo.mjs [options]

Options:
  -d, --dry-run             Fetch and verify without writing to file
  --add-tweet <text>        Manually append a newly detected reset tweet from Tibo
  --type <regular|banked>   Specify reset type (default: regular)
  --url <x_url>             URL of the tweet (e.g., https://x.com/thsottiaux/status/...)
  --author <handle>         Author handle (default: thsottiaux)
  -h, --help                Show this message
`);
    process.exit(0);
  }

  console.log("================================================================");
  console.log("  🍄 WHENRESET // TIBO RADAR & SYNC DISPATCHER 🍄");
  console.log("================================================================");

  // 1. Read local resets
  let localResets = [];
  try {
    const raw = await fs.readFile(DATA_FILE_PATH, "utf-8");
    localResets = JSON.parse(raw);
  } catch (err) {
    console.error("❌ Failed to read fallback-resets.json:", err.message);
    process.exit(1);
  }

  const localIds = new Set(localResets.map((r) => String(r.id)));
  let updated = false;

  // 2. Handle manual tweet ingestion if requested
  if (options.addTweet) {
    const tweetId = options.tweetUrl
      ? options.tweetUrl.split("/").filter(Boolean).pop()
      : `manual-${Date.now()}`;

    const newResetItem = {
      id: tweetId,
      reset_type: options.tweetType === "banked" ? "banked" : "regular",
      announced_at: new Date().toISOString(),
      text: options.addTweet,
      source: {
        type: "x_post",
        author: options.author,
        url: options.tweetUrl || `https://x.com/${options.author}`,
      },
    };

    if (!localIds.has(String(newResetItem.id))) {
      localResets.unshift(newResetItem);
      localIds.add(String(newResetItem.id));
      updated = true;
      console.log(`✨ Ingested manual tweet from @${options.author}: "${options.addTweet.slice(0, 50)}..."`);
    } else {
      console.log(`⚠️ Tweet id=${tweetId} already exists in local record.`);
    }
  }

  // 3. Sync from upstream resets & status
  console.log("📡 Checking upstream status & resets for Tibo signals...");
  const [resetsData, statusData] = await Promise.all([
    fetchWithTimeout(UPSTREAM_RESETS_URL),
    fetchWithTimeout(UPSTREAM_STATUS_URL),
  ]);

  const upstreamItems = Array.isArray(resetsData)
    ? resetsData
    : Array.isArray(resetsData?.data)
    ? resetsData.data
    : [];

  let newUpstreamCount = 0;
  for (const item of upstreamItems) {
    if (item?.id && !localIds.has(String(item.id))) {
      localResets.push(item);
      localIds.add(String(item.id));
      newUpstreamCount++;
    }
  }

  // Also check if status has an active scheduled_reset announced by Tibo
  const scheduledReset = statusData?.data?.scheduled_reset;
  if (scheduledReset && scheduledReset.id) {
    const scheduledItem = {
      id: String(scheduledReset.id),
      status: "scheduled",
      reset_type: scheduledReset.reset_type || "regular",
      announced_at: scheduledReset.announced_at || new Date().toISOString(),
      scheduled_for: scheduledReset.scheduled_for || "2026-09-12T07:00:00.000Z",
      text: scheduledReset.text || "And of course, a reset is also landing by midnight today.",
      source: scheduledReset.source || {
        type: "x_post",
        author: "thsottiaux",
        url: `https://x.com/thsottiaux/status/${scheduledReset.id}`,
      },
    };
    if (!options.dryRun) {
      await fs.writeFile(
        SCHEDULED_FILE_PATH,
        JSON.stringify(scheduledItem, null, 2) + "\n",
        "utf-8"
      );
    }
    console.log(`🚀 [UPCOMING RESET] Official reset scheduled by Tibo: id=${scheduledReset.id} (landing today)!`);
  }

  if (newUpstreamCount > 0) {
    updated = true;
    console.log(`🎉 Found ${newUpstreamCount} new reset(s) from upstream.`);
  }

  // Sort descending by date
  localResets.sort(
    (a, b) => new Date(b.announced_at).getTime() - new Date(a.announced_at).getTime()
  );

  // 4. Inspect Active Watch
  const activeWatch = statusData?.data?.active_watch;
  if (activeWatch && activeWatch.text) {
    console.log("\n----------------------------------------------------------------");
    console.log("  🚨 LIVE ACTIVE WATCH DETECTED FROM TIBO (@thsottiaux)");
    console.log("----------------------------------------------------------------");
    console.log(`  Level       : [${(activeWatch.level || "UNKNOWN").toUpperCase()}] (${activeWatch.reset_chance_percent || "?"}% chance)`);
    console.log(`  Forecast    : ${activeWatch.forecast_window || "Immediate Window"}`);
    console.log(`  Observed At : ${activeWatch.observed_at || "N/A"}`);
    console.log(`  Tweet Text  : "${activeWatch.text}"`);
    if (activeWatch.source?.url) {
      console.log(`  Tweet Link  : ${activeWatch.source.url}`);
    }
    console.log("----------------------------------------------------------------\n");
  } else {
    console.log("ℹ️  No elevated active watch tremors currently reported upstream.");
  }

  // 5. Write back if updated and not dry-run
  if (updated && !options.dryRun) {
    await fs.writeFile(
      DATA_FILE_PATH,
      JSON.stringify(localResets, null, 2) + "\n",
      "utf-8"
    );
    console.log(`💾 Saved updated dataset (${localResets.length} total entries) to fallback-resets.json.`);
  } else if (options.dryRun) {
    console.log("🔍 Dry run complete. No files modified.");
  } else {
    console.log("✨ Dataset is already synchronized. Everything up to date.");
  }

  const latest = localResets[0];
  if (latest) {
    const diffDays = ((Date.now() - new Date(latest.announced_at).getTime()) / (1000 * 60 * 60 * 24)).toFixed(1);
    console.log(`\n⭐ Latest Completed Reset: [${latest.announced_at}] (~${diffDays} days elapsed)`);
    console.log(`⭐ Completed Reset Type  : ${latest.reset_type.toUpperCase()} | ID: ${latest.id}`);
  }
  if (scheduledReset) {
    console.log(`⭐ Upcoming Scheduled    : Announced today at ${scheduledReset.announced_at} (Landing by midnight)`);
  }
}

main().catch((err) => {
  console.error("💥 Fatal sync error:", err);
  process.exit(1);
});
