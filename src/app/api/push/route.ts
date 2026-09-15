import { NextResponse } from "next/server";

export const runtime = "edge";

const ALLOWED_HOSTS = [
  "api.day.app",
  "qyapi.weixin.qq.com",
  "open.feishu.cn",
  "open.larksuite.com",
  "discord.com",
  "discordapp.com",
  "hooks.slack.com",
  "api.day.app:443",
];

interface PushBody {
  channel?: string;
  target?: string;
  level?: string;
  title?: string;
  body?: string;
  url?: string;
}

function hostOf(raw: string): string | null {
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}

function payloadFor(host: string, title: string, body: string, url?: string) {
  const full = url ? `${body}\n${url}` : body;
  if (host.startsWith("qyapi.weixin.qq.com")) {
    return { msgtype: "text", text: { content: `${title}\n${full}` } };
  }
  if (host.startsWith("open.feishu.cn") || host.startsWith("open.larksuite.com")) {
    return { msg_type: "text", content: { text: `${title}\n${full}` } };
  }
  if (host.includes("discord") || host.includes("slack")) {
    return { content: `${title}\n${full}` };
  }
  return { text: `${title}\n${full}`, content: `${title}\n${full}` };
}

export async function POST(request: Request) {
  let body: PushBody;
  try {
    body = (await request.json()) as PushBody;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { channel, target, level, title, body: text } = body;
  if (!channel || !target || !title) {
    return NextResponse.json({ error: "missing channel/target/title" }, { status: 400 });
  }

  const titleSafe = encodeURIComponent(title).slice(0, 120);
  const bodySafe = encodeURIComponent(text ?? "").slice(0, 900);

  try {
    if (channel === "bark") {
      const key = target.replace(/^https?:\/\/api\.day\.app\//, "").replace(/\/+$/, "");
      if (!/^[A-Za-z0-9_-]{6,}$/.test(key)) {
        return NextResponse.json({ error: "invalid bark key" }, { status: 400 });
      }
      const levelParam = level === "active" ? "active" : "timeSensitive";
      const res = await fetch(
        `https://api.day.app/${key}/${titleSafe}/${bodySafe}?level=${levelParam}&isArchive=1`,
        { method: "GET" }
      );
      return NextResponse.json({ ok: res.ok, upstream: res.status });
    }

    if (channel === "webhook") {
      const host = hostOf(target);
      if (!host) return NextResponse.json({ error: "invalid webhook url" }, { status: 400 });
      if (!ALLOWED_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`))) {
        return NextResponse.json(
          { error: "destination host not allowed" },
          { status: 403 }
        );
      }
      const payload = payloadFor(host, title, text ?? "", body.url);
      const res = await fetch(target, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return NextResponse.json({ ok: res.ok, upstream: res.status });
    }

    return NextResponse.json({ error: "unsupported channel" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "push failed" },
      { status: 502 }
    );
  }
}
