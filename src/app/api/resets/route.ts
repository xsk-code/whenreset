import { NextResponse } from "next/server";
import fallbackResets from "@/data/fallback-resets.json";
import { ResetItem, ResetsResponse } from "@/lib/types";
import { UPSTREAM_RESETS_URL, reconcileResets } from "@/lib/radar-snapshot";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");

  try {
    const upstreamUrl = new URL(UPSTREAM_RESETS_URL);
    if (cursor) {
      upstreamUrl.searchParams.set("cursor", cursor);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const upstreamRes = await fetch(upstreamUrl.toString(), {
      signal: controller.signal,
      next: { revalidate: 10 },
      headers: {
        "User-Agent": "WhenReset-Radar/1.0",
        Accept: "application/json",
      },
    });
    clearTimeout(timeoutId);

    if (upstreamRes.ok) {
      const data: ResetsResponse = await upstreamRes.json();
      const upstreamItems = Array.isArray(data?.data) ? data.data : [];
      const localItems = fallbackResets as ResetItem[];

      // Same arbitration as /api/status and /api/badge: dedupe by id, and when
      // both sources hold the same record let the later `announced_at` win.
      // The previous implementation only deduped — an upstream copy always
      // displaced the local one — so this endpoint and /api/status could
      // disagree about which revision of a record was the current one.
      data.data = reconcileResets(localItems, upstreamItems).resets;

      return NextResponse.json(data, {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
        },
      });
    }
  } catch (err) {
    console.warn("[/api/resets] Upstream failed or timed out, using fallback data", err);
  }

  // Fallback data
  const resets = fallbackResets as ResetItem[];
  const response: ResetsResponse = {
    data: resets,
    pagination: {
      has_more: false,
      next_cursor: null,
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
      "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
    },
  });
}
