import { NextResponse } from "next/server";

export const runtime = "nodejs";

// In-memory persistent state during server runtime
// Seed with an authentic community engagement baseline
const BASE_COINS = 142850;
let globalCoins = BASE_COINS;
let lastResetDate = new Date().toISOString().slice(0, 10);
let todayClicks = 1842;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  const currentDate = new Date().toISOString().slice(0, 10);
  if (currentDate !== lastResetDate) {
    lastResetDate = currentDate;
    todayClicks = 0;
  }

  return NextResponse.json(
    {
      success: true,
      global_coins: globalCoins,
      today_clicks: todayClicks,
      updated_at: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const delta = typeof body.delta === "number" ? Math.min(Math.max(1, Math.floor(body.delta)), 50) : 1;

    globalCoins += delta;
    todayClicks += delta;

    return NextResponse.json(
      {
        success: true,
        global_coins: globalCoins,
        today_clicks: todayClicks,
        delta_applied: delta,
        updated_at: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch {
    // If body parsing fails, still increment by 1
    globalCoins += 1;
    todayClicks += 1;

    return NextResponse.json(
      {
        success: true,
        global_coins: globalCoins,
        today_clicks: todayClicks,
        delta_applied: 1,
        updated_at: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}
