import type { Metadata } from "next";
import type { ReactNode } from "react";
import fallbackResets from "@/data/fallback-resets.json";
import { ResetItem } from "@/lib/types";
import { SITE_CONFIG } from "@/lib/config";
import { isConfirmConfigured, verifyConfirmToken } from "@/lib/confirm-token";

export const dynamic = "force-dynamic";

/**
 * Deliberately excluded from the index: the URL carries a signed token, and a
 * page that only exists to consume a token should never show up in search.
 */
export const metadata: Metadata = {
  title: "确认重置记录 · WhenReset",
  description: "确认上游报告的疑似重置记录是否入账。",
  robots: { index: false, follow: false },
};

function isIngested(id: string): boolean {
  return (fallbackResets as ResetItem[]).some((item) => String(item.id) === id);
}

/**
 * This page is a plain server component with a native `<form>` — no client
 * JavaScript at all. That is not minimalism for its own sake: it is what makes
 * "GET never writes" structurally true. The page only ever renders, and the
 * only write path is a POST a human has to press.
 *
 * It also means the confirmation still works when the visitor's JS bundle
 * fails to load, which matters for a link opened from a phone notification.
 */
export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const token = typeof params.t === "string" ? params.t : null;
  const state = typeof params.state === "string" ? params.state : null;

  const configured = isConfirmConfigured();
  const verified = configured ? await verifyConfirmToken(token) : null;
  const record = verified?.ok ? verified.payload : null;
  const failure = state && !["dispatched", "already"].includes(state) ? state : null;

  return (
    <main className="min-h-screen bg-grid-pattern flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl">
        <header className="mb-6 text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-slate-500 uppercase">
            {SITE_CONFIG.name} · Reset Confirmation
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-100">
            疑似重置记录确认
          </h1>
        </header>

        <section className="glass-panel rounded-2xl p-6 sm:p-8">
          {!configured && (
            <Notice tone="amber" title="此部署未启用确认功能">
              <p>
                服务端未配置 <Code>CONFIRM_SECRET</Code>
                ，因此无法校验确认链接。这是诚实降级，不是错误。
              </p>
              <p className="mt-2">
                请在 Vercel 环境变量中配置后重试；在那之前，请按 GitHub Issue 中的说明手动触发入库。
              </p>
            </Notice>
          )}

          {configured && state === "dispatched" && (
            <Notice tone="emerald" title="已提交入库">
              <p>
                入库 Workflow 已触发，数据集将在其执行完成后更新（通常不到一分钟）。
              </p>
              {record && (
                <p className="mt-3 font-mono text-xs text-slate-400">
                  id={record.id} · {record.announced_at}
                </p>
              )}
            </Notice>
          )}

          {configured && state !== "dispatched" && !record && (
            <Notice
              tone="rose"
              title={
                failure?.startsWith("dispatch_failed") || failure?.startsWith("dispatch_error")
                  ? "触发入库失败"
                  : "确认链接无效"
              }
            >
              <p>{describeFailure(failure, verified)}</p>
              <p className="mt-3 text-xs text-slate-400">
                请回到通知中重新打开链接，或按 GitHub Issue 中的说明手动触发入库。
              </p>
            </Notice>
          )}

          {configured && record && state !== "dispatched" && (
            <>
              <RecordCard record={record} />

              {isIngested(record.id) || state === "already" ? (
                <div className="mt-6 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  这条记录已经在数据集里了，无需再次确认。重复点击不会重复写入。
                </div>
              ) : (
                <form method="POST" action="/api/confirm" className="mt-6">
                  {/* The token is the only input this endpoint accepts: the
                      record itself travels inside it, so nothing here can be
                      edited into a different write. */}
                  <input type="hidden" name="t" value={token ?? ""} />
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-[#080B11] transition-colors hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                  >
                    确认入账
                  </button>
                  <p className="mt-3 text-center text-xs text-slate-500">
                    确认后由你本人触发写入。上游数据源没有写入权限。
                  </p>
                </form>
              )}
            </>
          )}
        </section>

        <footer className="mt-6 text-center text-xs text-slate-500">
          {SITE_CONFIG.domain.replace(/^https?:\/\//, "")} · 数据仅在人工确认后入账
        </footer>
      </div>
    </main>
  );
}

function Notice({
  tone,
  title,
  children,
}: {
  tone: "emerald" | "amber" | "rose";
  title: string;
  children: ReactNode;
}) {
  const tones = {
    emerald: "border-emerald-500/25 bg-emerald-500/10 text-emerald-200",
    amber: "border-amber-500/25 bg-amber-500/10 text-amber-200",
    rose: "border-rose-500/25 bg-rose-500/10 text-rose-200",
  } as const;
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${tones[tone]}`}>
      <p className="font-semibold">{title}</p>
      <div className="mt-2 text-slate-300">{children}</div>
    </div>
  );
}

function RecordCard({
  record,
}: {
  record: { id: string; type: string; announced_at: string; text: string; url: string };
}) {
  return (
    <div className="glass-panel-subtle rounded-xl p-5">
      <dl className="space-y-3 text-sm">
        <Row label="记录 ID">
          <span className="font-mono text-slate-200">{record.id}</span>
        </Row>
        <Row label="类型">
          <span className="font-mono text-slate-200">{record.type}</span>
        </Row>
        <Row label="上游报告时间">
          <span className="font-mono text-slate-200">{record.announced_at}</span>
        </Row>
        <Row label="摘要">
          <span className="text-slate-300">{record.text || "(无正文)"}</span>
        </Row>
        {record.url && (
          <Row label="原始公告">
            <a
              href={record.url}
              target="_blank"
              rel="noreferrer noopener"
              className="break-all text-blue-400 underline decoration-blue-400/40 hover:decoration-blue-400"
            >
              {record.url}
            </a>
          </Row>
        )}
      </dl>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-3">
      <dt className="font-mono text-xs tracking-wider text-slate-500">{label}</dt>
      <dd className="break-words">{children}</dd>
    </div>
  );
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-slate-200">
      {children}
    </code>
  );
}

function describeFailure(
  state: string | null,
  verified: Awaited<ReturnType<typeof verifyConfirmToken>> | null
): string {
  if (state?.startsWith("dispatch_failed")) {
    return `GitHub 拒绝了这次触发（${state.replace("dispatch_failed_", "")}）。常见原因是 Workflow 尚未存在于目标分支，或 GITHUB_DISPATCH_TOKEN 权限不足。`;
  }
  if (state?.startsWith("dispatch_error")) {
    return `调用 GitHub 时出错：${state.replace("dispatch_error:", "")}`;
  }
  if (state === "repo_unresolved") {
    return "无法从站点配置解析出 GitHub 仓库地址。";
  }

  const reason = verified && !verified.ok ? verified.reason : null;
  switch (reason) {
    case "expired":
      return "这个确认链接已超过 24 小时有效期。请等待下一次通知，或按 GitHub Issue 中的说明手动触发入库。";
    case "bad_signature":
      return "链接签名校验失败 —— 内容可能被改动过，或密钥已轮换。这条链接不会被接受。";
    case "malformed":
      return "链接格式不正确，缺少有效的 token。";
    default:
      return "链接无法识别或已失效。";
  }
}
