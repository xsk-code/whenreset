import { NextResponse } from "next/server";

export const runtime = "edge";

const RESEND_ENDPOINT = "https://api.resend.com/contacts";

interface SubscribeBody {
  email?: string;
}

export async function POST(request: Request) {
  let body: SubscribeBody;
  try {
    body = (await request.json()) as SubscribeBody;
  } catch {
    return NextResponse.json({ configured: true, error: "invalid json" }, { status: 400 });
  }

  const email = (body.email || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ configured: true, error: "invalid email" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  // Honest degradation: without credentials there is no mailing backend.
  if (!apiKey) {
    return NextResponse.json(
      { configured: false, error: "email delivery is not configured on this deployment" },
      { status: 200 }
    );
  }

  try {
    const payload: Record<string, unknown> = {
      email,
      first_name: "WhenReset",
      unsubscribed: false,
    };
    if (audienceId) payload.audience_id = audienceId;

    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return NextResponse.json(
        { configured: true, error: `provider rejected (${res.status}) ${detail.slice(0, 120)}` },
        { status: 200 }
      );
    }

    return NextResponse.json({ configured: true, ok: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { configured: true, error: err instanceof Error ? err.message : "subscribe failed" },
      { status: 200 }
    );
  }
}
