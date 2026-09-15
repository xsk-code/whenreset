"use client";

import React from "react";
import Link from "next/link";
import { RULES } from "@/lib/rules-data";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LiveResetPanel } from "@/components/seo/LiveResetPanel";
import { Footer } from "@/components/dashboard/Footer";
import { BookOpen, ExternalLink } from "lucide-react";

export const RulesDoc: React.FC = () => {
  const { language } = useLanguage();
  const isZh = language === "zh";
  const pick = (b: { en: string; zh: string }) => (isZh ? b.zh : b.en);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: RULES.map((rule) => ({
      "@type": "Question",
      name: pick(rule.title),
      acceptedAnswer: {
        "@type": "Answer",
        text: pick(rule.summary),
      },
    })),
  };

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="inline-flex items-center space-x-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
        <BookOpen className="h-3.5 w-3.5" />
        <span>{isZh ? "规则百科" : "RULES WIKI"}</span>
      </div>

      <h1 className="mt-5 text-3xl sm:text-4xl font-bold text-white tracking-tight">
        {isZh ? "AI 编程额度规则百科" : "AI coding quota rules wiki"}
      </h1>
      <p className="mt-3 text-sm text-slate-400 leading-relaxed">
        {isZh
          ? "每条规则都给出可核验的官方来源；凡官方未公布的数值，我们会明确标注，不做虚构。"
          : "Every rule cites a verifiable source. Where an official number does not exist, we say so instead of inventing one."}
      </p>

      <div className="mt-10 space-y-8">
        {RULES.map((rule) => (
          <section
            key={rule.id}
            id={rule.id}
            className="rounded-2xl glass-panel border border-white/10 p-6 sm:p-7 scroll-mt-20"
          >
            <h2 className="text-xl font-bold text-white">{pick(rule.title)}</h2>
            <p className="mt-2 text-sm text-emerald-400">{pick(rule.summary)}</p>
            <ul className="mt-4 space-y-3">
              {rule.details.map((detail, index) => (
                <li key={index} className="flex items-start space-x-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-500 shrink-0" />
                  <span className="text-sm text-slate-300 leading-relaxed">{pick(detail)}</span>
                </li>
              ))}
            </ul>
            <a
              href={rule.source}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center space-x-1.5 text-xs text-blue-400 hover:text-blue-300"
            >
              <span>{pick(rule.sourceLabel)}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </section>
        ))}
      </div>

      <LiveResetPanel />

      <div className="mt-10 flex flex-wrap gap-2">
        <Link
          href="/"
          className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          {isZh ? "返回实时看板" : "Back to dashboard"}
        </Link>
        <Link
          href="/errors/codex-message-limit-reached"
          className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          Codex {isZh ? "上限错误页" : "limit error page"}
        </Link>
      </div>

      <Footer lang={language} lastSyncTime={null} />
    </main>
  );
};
