#!/usr/bin/env node

/**
 * scripts/sync-upstream.mjs
 *
 * Cross-check between the local dataset and the upstream API. READ-ONLY.
 *
 * This script used to merge upstream rows into `src/data/fallback-resets.json`
 * and write the file. It no longer does, on purpose: upstream is a detector
 * and a cross-check source, never an authority. Writing to the authoritative
 * dataset is restricted to human-confirmed ingestion
 * (`node scripts/sync-tibo.mjs --add-tweet ...`).
 *
 * What it reports:
 *   • divergences   — same id, different `announced_at` (the arbitration rule
 *                     is "later timestamp wins", so these change what the site
 *                     would show)
 *   • upstream-only — records upstream knows that we do not (candidates for
 *                     human confirmation)
 *   • local-only    — records we hold that upstream dropped (we never delete
 *                     history on upstream's word)
 *
 * Cadence is reported as a MEDIAN over gaps in (0, 90) days — the same window
 * and statistic the site's forecast uses. The old health report quoted an
 * arithmetic mean, which is where the "6.9 day average cadence" in the
 * marketing material came from while the site itself displayed ~3.0d.
 *
 * Exit codes: 0 clean / 1 fatal (dataset unreadable, upstream failing for a
 * reason we can act on) / 4 upstream blocked by a Cloudflare edge challenge —
 * the cross-check simply could not run, which is not the same as "no changes".
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BLOCKED_EXPLANATION, DEFAULT_UPSTREAM_URL, fetchUpstreamResets } from "./lib/upstream.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE_PATH = path.resolve(__dirname, "../src/data/fallback-resets.json");

const TIMEOUT_MS = 6000;
const MAX_RETRIES = 2;
const DAY_MS = 24 * 60 * 60 * 1000;

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    upstreamUrl: process.env.UPSTREAM_RESETS_URL || DEFAULT_UPSTREAM_URL,
    json: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--upstream" && args[i + 1]) {
      options.upstreamUrl = args[++i];
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--dry-run" || arg === "-d") {
      // Kept for CLI compatibility: this script has no write path any more.
      options.dryRun = true;
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    }
  }

  return options;
}

/**
 * @returns {Promise<{ok: true, items: unknown[]} | {ok: false, blocked: boolean, error: string}>}
 */
async function fetchUpstreamResetsWithRetry(url) {
  const result = await fetchUpstreamResets(url, {
    ua: "WhenReset-Radar-Crosscheck/1.0",
    timeoutMs: TIMEOUT_MS,
    retries: MAX_RETRIES,
  });
  if (result.ok) return { ok: true, items: result.items };
  return { ok: false, blocked: result.blocked, error: result.detail };
}

/** Gaps in (0, 90) days — identical to collectIntervals() in src/lib/forecast.ts. */
function collectIntervals(resets) {
  const sorted = [...resets].sort(
    (a, b) => new Date(b.announced_at).getTime() - new Date(a.announced_at).getTime()
  );
  const intervals = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const diff =
      (new Date(sorted[i].announced_at).getTime() -
        new Date(sorted[i + 1].announced_at).getTime()) /
      DAY_MS;
    if (diff > 0 && diff < 90) intervals.push(diff);
  }
  return intervals;
}

function median(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

async function main() {
  const options = parseArgs();

  if (options.help) {
    console.log(`
Usage: node scripts/sync-upstream.mjs [options]

Read-only cross-check between src/data/fallback-resets.json and upstream.
Writes nothing; exits non-zero only on a fatal condition.

Options:
  --upstream <url>  Override the upstream endpoint
  --json            Emit a machine-readable summary on the last line
  -h, --help        Show this message
`);
    process.exit(0);
  }

  let localResets;
  try {
    const raw = await fs.readFile(DATA_FILE_PATH, "utf-8");
    localResets = JSON.parse(raw);
    if (!Array.isArray(localResets)) throw new Error("not an array");
  } catch (err) {
    console.error(`❌ [CROSSCHECK] Cannot read dataset: ${err.message}`);
    process.exit(1);
  }

  console.log(`📡 Cross-checking upstream: ${options.upstreamUrl}`);
  const upstream = await fetchUpstreamResetsWithRetry(options.upstreamUrl);

  if (!upstream.ok && upstream.blocked) {
    // Not "no changes" — we genuinely do not know. Exit 4 so the workflow can
    // keep going without mistaking silence for agreement.
    console.warn(`⚠️  [CROSSCHECK] Cannot reach upstream from this network: ${upstream.error}`);
    console.warn(BLOCKED_EXPLANATION.split("\n").map((l) => `   ${l}`).join("\n"));
    console.log(`::crosscheck::${JSON.stringify({ ok: false, blocked: true, error: upstream.error })}`);
    process.exit(4);
  }

  if (!upstream.ok) {
    console.error(`❌ [CROSSCHECK] Upstream unreachable after ${MAX_RETRIES} attempts: ${upstream.error}`);
    console.error("   Reporting FAILURE rather than an empty diff. A dead upstream is not");
    console.error("   'no changes' — treating it as such is how the dataset silently stopped updating.");
    console.log(`::crosscheck::${JSON.stringify({ ok: false, blocked: false, error: upstream.error })}`);
    process.exit(1);
  }

  const localById = new Map(localResets.map((r) => [String(r.id), r]));
  const upstreamById = new Map(
    upstream.items.filter((i) => i?.id).map((i) => [String(i.id), i])
  );

  const divergences = [];
  for (const [id, up] of upstreamById) {
    const local = localById.get(id);
    if (!local) continue;
    const localTime = new Date(local.announced_at).getTime();
    const upTime = new Date(up.announced_at).getTime();
    if (Number.isFinite(localTime) && Number.isFinite(upTime) && localTime !== upTime) {
      divergences.push({ id, local: local.announced_at, upstream: up.announced_at });
    }
  }

  const upstreamOnly = [...upstreamById.keys()].filter((id) => !localById.has(id));
  const localOnly = [...localById.keys()].filter((id) => !upstreamById.has(id));

  const intervals = collectIntervals(localResets);
  const medianIntervalDays = Number(median(intervals).toFixed(1));
  const longestWaitDays = intervals.length > 0 ? Number(Math.max(...intervals).toFixed(1)) : 0;
  const latest = [...localResets].sort(
    (a, b) => new Date(b.announced_at).getTime() - new Date(a.announced_at).getTime()
  )[0];

  const byProvenance = {};
  for (const r of localResets) {
    const k = r?.provenance ?? "(none)";
    byProvenance[k] = (byProvenance[k] ?? 0) + 1;
  }

  // `localOnly` is expected, not a divergence: upstream paginates (it serves
  // the newest page only, 20 records at time of writing) while we keep the
  // full history. Flagging that as a divergence would train everyone to
  // ignore the report. Only a timestamp conflict, or a record we are missing,
  // is actionable.
  const clean = divergences.length === 0 && upstreamOnly.length === 0;

  if (!options.json) {
    console.log("");
    console.log("================================================================");
    console.log("  WHENRESET RADAR // UPSTREAM CROSS-CHECK (read-only)");
    console.log("================================================================");
    console.log(`  Local records        : ${localResets.length}  ${JSON.stringify(byProvenance)}`);
    console.log(`  Upstream records     : ${upstream.items.length}`);
    console.log(`  Latest local record  : ${latest?.announced_at ?? "n/a"}`);
    console.log(`  Median cadence       : ${medianIntervalDays}d  (same (0,90) window as the site)`);
    console.log(`  Longest recorded gap : ${longestWaitDays}d`);
    console.log("----------------------------------------------------------------");
    console.log(`  Divergences (same id, different timestamp) : ${divergences.length}`);
    for (const d of divergences.slice(0, 5)) {
      console.log(`    • id=${d.id}  local=${d.local}  upstream=${d.upstream}`);
    }
    console.log(`  Upstream-only (await human confirmation)   : ${upstreamOnly.length}`);
    for (const id of upstreamOnly.slice(0, 5)) console.log(`    • id=${id}`);
    console.log(`  Local-only (expected: upstream serves its newest page only) : ${localOnly.length}`);
    console.log("----------------------------------------------------------------");
    console.log(clean ? "  ✅ IN SYNC" : "  ⚠️  DIVERGENCE — review above (nothing was written)");
    console.log("================================================================");
  }

  console.log(
    `::crosscheck::${JSON.stringify({
      ok: true,
      local: localResets.length,
      upstream: upstream.items.length,
      divergences: divergences.length,
      upstreamOnly: upstreamOnly.length,
      localOnly: localOnly.length,
      medianIntervalDays,
      longestWaitDays,
      byProvenance,
      clean,
    })}`
  );

  process.exit(0);
}

main().catch((err) => {
  console.error("💥 [CROSSCHECK] Fatal error:", err);
  process.exit(1);
});
