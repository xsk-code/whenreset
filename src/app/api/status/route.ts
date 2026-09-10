import { NextResponse } from "next/server";
import fallbackResets from "@/data/fallback-resets.json";
import { ResetItem, StatusResponse } from "@/lib/types";
import { calculateStats } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const upstreamRes = await fetch("https://codex-resets.com/api/v1/status", {
      signal: controller.signal,
      next: { revalidate: 60 },
      headers: {
        "User-Agent": "WhenReset-Mario-Tracker/1.0",
        Accept: "application/json",
      },
    });
    clearTimeout(timeoutId);

    if (upstreamRes.ok) {
      const data: StatusResponse = await upstreamRes.json();
      return NextResponse.json(data, {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      });
    }
  } catch (err) {
    console.warn("[/api/status] Upstream failed, using calculated fallback status", err);
  }

  // Fallback calculation
  const resets = fallbackResets as ResetItem[];
  const stats = calculateStats(resets);
  const latestReset = resets[0] || {
    id: "fallback-latest",
    reset_type: "banked",
    announced_at: new Date().toISOString(),
    text: "Codex usage limits has been reset.",
    source: {
      type: "x_post",
      author: "thsottiaux",
      url: "https://x.com/thsottiaux",
    },
  };

  const response: StatusResponse = {
    data: {
      latest_reset: latestReset,
      scheduled_reset: null,
      active_watch: null,
      stats,
    },
    meta: {
      api_version: "v1",
      generated_at: new Date().toISOString(),
      is_fallback: true,
    },
  };

  return NextResponse.json(response, {
    status: 200,
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
