"use client";

import React from "react";
import Link from "next/link";
import { ErrorPageEntry } from "@/lib/error-pages";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LiveResetPanel } from "@/components/seo/LiveResetPanel";
import { Footer } from "@/components/dashboard/Footer";
import { AlertTriangle, Wrench, ArrowLeftRight, ExternalLink, CheckCircle2 } from "lucide-react";

interface ErrorDocProps {
  entry: ErrorPageEntry;
  related: { slug: string; platform: string }[];
}

export const ErrorDoc: React.FC<ErrorDocProps> = ({ entry, related }) => {
  const { language } = useLanguage();
  const isZh = language === "zh";
  const pick = (b: { en: string; zh: string }) => (isZh ? b.zh : b.en);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: isZh
          ? `${entry.platform} 提示额度用尽是什么意思？`
          : `What does the ${entry.platform} usage limit message mean?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: pick(entry.meaning),
        },
      },
      ...entry.fixes.map((fix) => ({
        "@type": "Question",
        name: isZh ? "现在能做什么？" : "What can I do right now?",
        acceptedAnswer: { "@type": "Answer", text: pick(fix) },
      })),
    ],
  };

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="inline-flex items-center space-x-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
        <AlertTriangle className="h-3.5 w-3.5" />
        <span>{entry.platform} · {isZh ? "错误码截流页" : "error reference"}</span>
      </div>

      <h1 className="mt-5 text-3xl sm:text-4xl font-bold text-white tracking-tight">
        {isZh
          ? `${entry.platform} 触发使用上限：现在该怎么办`
          : `${entry.platform} usage limit hit: what to do next`}
      </h1>

      <div className="mt-6 rounded-xl bg-white/[0.03] border border-white/[0.08] p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          {isZh ? "你会看到的提示" : "WHAT YOU SEE"}
        </div>
        <p className="text-sm text-slate-200 leading-relaxed">{pick(entry.errorText)}</p>
        <p className="text-xs text-slate-400 mt-3 leading-relaxed">
          {isZh ? "出现位置：" : "Where: "}
          {pick(entry.where)}
        </p>
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <span className="text-emerald-400">01</span>
          <span>{isZh ? "这意味着什么" : "What it actually means"}</span>
        </h2>
        <p className="mt-3 text-sm text-slate-300 leading-relaxed">{pick(entry.meaning)}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Wrench className="h-5 w-5 text-blue-400" />
          <span>{isZh ? "立刻可做的修复动作" : "Fixes you can apply now"}</span>
        </h2>
        <ul className="mt-4 space-y-3">
          {entry.fixes.map((fix, index) => (
            <li
              key={index}
              className="flex items-start space-x-3 rounded-xl bg-white/[0.03] border border-white/[0.06] p-4"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
              <span className="text-sm text-slate-200 leading-relaxed">{pick(fix)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <ArrowLeftRight className="h-5 w-5 text-purple-400" />
          <span>{isZh ? "被限期间的降级平替" : "Fallbacks while you are blocked"}</span>
        </h2>
        <ul className="mt-4 space-y-3">
          {entry.fallbacks.map((item, index) => (
            <li
              key={index}
              className="flex items-start space-x-3 rounded-xl bg-white/[0.03] border border-white/[0.06] p-4"
            >
              <span className="text-sm text-slate-200 leading-relaxed">{pick(item)}</span>
            </li>
          ))}
        </ul>
      </section>

      <LiveResetPanel />

      <section className="mt-10">
        <h2 className="text-lg font-bold text-white mb-3">
          {isZh ? "相关错误页" : "Related errors"}
        </h2>
        <div className="flex flex-wrap gap-2">
          {related.map((item) => (
            <Link
              key={item.slug}
              href={`/errors/${item.slug}`}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              {item.platform} · {item.slug}
            </Link>
          ))}
        </div>
      </section>

      <a
        href={entry.officialSource}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex items-center space-x-1.5 text-sm text-blue-400 hover:text-blue-300"
      >
        <span>{pick(entry.officialLabel)}</span>
        <ExternalLink className="h-3.5 w-3.5" />
      </a>

      <Footer lang={language} lastSyncTime={null} />
    </main>
  );
};
