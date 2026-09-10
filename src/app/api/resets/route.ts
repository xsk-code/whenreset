import { NextResponse } from "next/server";
import fallbackResets from "@/data/fallback-resets.json";
import { ResetItem, ResetsResponse } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");

  try {
    const upstreamUrl = new URL("https://codex-resets.com/api/v1/resets");
    if (cursor) {
      upstreamUrl.searchParams.set("cursor", cursor);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const upstreamRes = await fetch(upstreamUrl.toString(), {
      signal: controller.signal,
      next: { revalidate: 60 },
      headers: {
        "User-Agent": "WhenReset-Mario-Tracker/1.0",
        Accept: "application/json",
      },
    });
    clearTimeout(timeoutId);

    if (upstreamRes.ok) {
      const data: ResetsResponse = await upstreamRes.json();
      return NextResponse.json(data, {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
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
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
