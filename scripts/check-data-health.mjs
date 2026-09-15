#!/usr/bin/env node

/**
 * scripts/check-data-health.mjs
 *
 * Read-only health gate for the authoritative reset dataset
 * (`src/data/fallback-resets.json`).
 *
 * Why this exists: the sync scripts used to swallow upstream failures and exit
 * 0, so a broken pipeline was indistinguishable from a quiet one — GitHub
 * Actions stayed green while the dataset silently stopped updating. This
 * checker is the thing that goes red instead.
 *
 * It NEVER writes. Writing to the authoritative dataset is restricted to
 * human-confirmed paths (`sync-tibo.mjs --add-tweet`). The upstream API is
 * allowed to decide whether the site can still render; it is not allowed to
 * decide what is true.
 *
 * Checks, in order:
 *   1. The file parses and is an array.
 *   2. Every record carries the required fields and a parseable timestamp.
 *   3. No duplicate ids.
 *   4. Every record declares a recognised `provenance`.
 *   5. The newest record is not older than --max-staleness-days (default 14).
 *   6. Unless --skip-upstream, the upstream probe answers.
 *
 * Exit codes: 0 = healthy, 1 = unhealthy (details on stdout).
 *
 * Cadence statistic: `medianIntervalDays` uses the SAME window as the site's
 * forecast — gaps in (0, 90) days, median rather than mean. If
 * `collectIntervals()` in `src/lib/forecast.ts` ever changes, change this too;
 * a health report quoting a different cadence than the page is exactly the
 * disagreement this project keeps having to fix.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE_PATH = path.resolve(__dirname, "../src/data/fallback-resets.json");

const DEFAULT_UPSTREAM_URL =
  process.env.UPSTREAM_RESETS_URL || "https://codex-resets.com/api/v1/resets";
const DEFAULT_MAX_STALENESS_DAYS = 14;
const PROBE_TIMEOUT_MS = 6000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Mirrors the union accepted by the writers. */
const VALID_PROVENANCE = new Set(["manual", "upstream", "x_api", "official_status"]);

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    maxStalenessDays: DEFAULT_MAX_STALENESS_DAYS,
    upstreamUrl: DEFAULT_UPSTREAM_URL,
    skipUpstream: false,
    json: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--max-staleness-days" && args[i + 1]) {
      options.maxStalenessDays = Number(args[++i]);
    } else if (arg === "--upstream" && args[i + 1]) {
      options.upstreamUrl = args[++i];
    } else if (arg === "--skip-upstream") {
      options.skipUpstream = true;
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    }
  }

  return options;
}

/**
 * Gaps in (0, 90) days between consecutive announces, oldest-last.
 * Deliberately identical to `collectIntervals()` in src/lib/forecast.ts.
 */
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

function round1(value) {
  return Number(value.toFixed(1));
}

async function probeUpstream(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "WhenReset-Radar-Health/1.0", Accept: "application/json" },
    });
    if (!res.ok) return { ok: false, detail: `HTTP ${res.status} ${res.statusText}` };
    const json = await res.json();
    const items = Array.isArray(json) ? json : json?.data;
    if (!Array.isArray(items)) return { ok: false, detail: "response is not an array" };
    return { ok: true, detail: `${items.length} records`, count: items.length };
  } catch (err) {
    return { ok: false, detail: err?.message || "unreachable" };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function main() {
  const options = parseArgs();

  if (options.help) {
    console.log(`
Usage: node scripts/check-data-health.mjs [options]

Read-only health gate for src/data/fallback-resets.json. Exits non-zero when
the dataset is malformed, unattributed, stale, or the upstream probe fails.

Options:
  --max-staleness-days <n>  Fail if the newest record is older than n days (default ${DEFAULT_MAX_STALENESS_DAYS})
  --upstream <url>          Override the upstream endpoint used for the probe
  --skip-upstream           Skip the network probe (offline / CI without egress)
  --json                    Emit a machine-readable summary on the last line
  -h, --help                Show this message
`);
    process.exit(0);
  }

  const failures = [];
  const warnings = [];

  let resets;
  try {
    const raw = await fs.readFile(DATA_FILE_PATH, "utf-8");
    resets = JSON.parse(raw);
  } catch (err) {
    console.error(`❌ [HEALTH] Cannot read dataset: ${err.message}`);
    process.exit(1);
  }

  if (!Array.isArray(resets)) {
    console.error("❌ [HEALTH] Dataset is not an array.");
    process.exit(1);
  }

  if (resets.length === 0) {
    failures.push("dataset is empty");
  }

  // --- structure & provenance ------------------------------------------------
  const seen = new Set();
  const duplicates = [];
  const missingProvenance = [];
  const unknownProvenance = [];

  resets.forEach((item, index) => {
    const where = `index ${index} (id=${item?.id ?? "?"})`;

    if (!item || typeof item !== "object") {
      failures.push(`${where}: not an object`);
      return;
    }
    for (const field of ["id", "announced_at", "reset_type", "text"]) {
      if (!item[field]) failures.push(`${where}: missing "${field}"`);
    }
    if (!Number.isFinite(new Date(item.announced_at).getTime())) {
      failures.push(`${where}: unparseable announced_at "${item.announced_at}"`);
    }
    if (!item.source?.url) failures.push(`${where}: missing source.url`);

    if (item.id) {
      const id = String(item.id);
      if (seen.has(id)) duplicates.push(id);
      seen.add(id);
    }

    if (!item.provenance) {
      missingProvenance.push(String(item.id ?? index));
    } else if (!VALID_PROVENANCE.has(item.provenance)) {
      unknownProvenance.push(`${item.id}=${item.provenance}`);
    }
  });

  if (duplicates.length > 0) {
    failures.push(`duplicate ids: ${duplicates.slice(0, 5).join(", ")}${duplicates.length > 5 ? ` (+${duplicates.length - 5} more)` : ""}`);
  }
  if (missingProvenance.length > 0) {
    failures.push(`${missingProvenance.length} record(s) missing provenance (first: ${missingProvenance.slice(0, 3).join(", ")})`);
  }
  if (unknownProvenance.length > 0) {
    failures.push(`unknown provenance values: ${unknownProvenance.slice(0, 3).join(", ")}`);
  }

  // --- cadence ---------------------------------------------------------------
  const intervals = collectIntervals(resets);
  const medianIntervalDays = round1(median(intervals));
  const longestWaitDays = intervals.length > 0 ? round1(Math.max(...intervals)) : 0;

  const byProvenance = {};
  for (const item of resets) {
    const key = item?.provenance ?? "(none)";
    byProvenance[key] = (byProvenance[key] ?? 0) + 1;
  }

  const unconfirmed = resets.filter((r) => r?.provenance === "upstream").length;
  if (unconfirmed > 0) {
    warnings.push(
      `${unconfirmed} record(s) still carry provenance=upstream, i.e. entered directly from the upstream API rather than a human-confirmed announcement`
    );
  }

  // --- staleness -------------------------------------------------------------
  const sorted = [...resets].sort(
    (a, b) => new Date(b.announced_at).getTime() - new Date(a.announced_at).getTime()
  );
  const latest = sorted[0];
  const daysSinceLatest = latest
    ? round1((Date.now() - new Date(latest.announced_at).getTime()) / DAY_MS)
    : null;

  if (daysSinceLatest !== null && daysSinceLatest > options.maxStalenessDays) {
    failures.push(
      `newest record is ${daysSinceLatest}d old, beyond the ${options.maxStalenessDays}d threshold — the dataset has stopped growing`
    );
  }

  // --- upstream probe --------------------------------------------------------
  let upstream = { ok: null, detail: "skipped" };
  if (!options.skipUpstream) {
    upstream = await probeUpstream(options.upstreamUrl);
    if (!upstream.ok) {
      failures.push(`upstream probe failed: ${upstream.detail}`);
    }
  }

  // --- report ----------------------------------------------------------------
  const healthy = failures.length === 0;

  if (!options.json) {
    console.log("================================================================");
    console.log("  WHENRESET RADAR // DATA HEALTH GATE");
    console.log("================================================================");
    console.log(`  Records             : ${resets.length}`);
    console.log(`  Sources             : ${Object.entries(byProvenance).map(([k, v]) => `${k}=${v}`).join("  ") || "(none)"}`);
    console.log(`  Newest record       : ${latest?.announced_at ?? "n/a"} (${daysSinceLatest ?? "?"}d ago)`);
    console.log(`  Median cadence      : ${medianIntervalDays}d  (same (0,90) window as the site)`);
    console.log(`  Longest recorded gap: ${longestWaitDays}d`);
    console.log(`  Upstream probe      : ${upstream.ok === null ? "skipped" : upstream.ok ? "OK" : "FAILED"} — ${upstream.detail}`);
    console.log(`  Staleness threshold : ${options.maxStalenessDays}d`);
    console.log("----------------------------------------------------------------");
    for (const w of warnings) console.log(`  ⚠️  ${w}`);
    for (const f of failures) console.log(`  ❌ ${f}`);
    if (healthy) console.log("  ✅ HEALTHY");
    console.log("================================================================");
  }

  console.log(
    `::health::${JSON.stringify({
      ok: healthy,
      total: resets.length,
      byProvenance,
      medianIntervalDays,
      longestWaitDays,
      daysSinceLatest,
      upstreamOk: upstream.ok,
      failures,
      warnings,
    })}`
  );

  process.exit(healthy ? 0 : 1);
}

main().catch((err) => {
  console.error("💥 [HEALTH] Fatal error:", err);
  process.exit(1);
});
