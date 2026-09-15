"use client";

import React from "react";
import Link from "next/link";
import { ERROR_PAGES } from "@/lib/error-pages";
import { RULES } from "@/lib/rules-data";
import { BookOpen, LifeBuoy, ArrowRight } from "lucide-react";

interface TopicMatrixProps {
  lang: "en" | "zh";
}

export const TopicMatrix: React.FC<TopicMatrixProps> = ({ lang }) => {
  const isZh = lang === "zh";
  const pick = (b: { en: string; zh: string }) => (isZh ? b.zh : b.en);

  return (
    <section className="rounded-2xl glass-panel p-6 sm:p-8 mb-8 border border-white/10">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4 mb-6">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            {isZh ? "专题矩阵 · 直接解决报错" : "TOPIC MATRIX"}
          </div>
          <p className="text-sm text-slate-300 mt-1">
            {isZh
              ? "针对具体报错与规则疑问的独立页面，均内置同一个实时预测引擎"
              : "Dedicated pages for concrete errors and rule questions, all running the same forecast engine"}
          </p>
        </div>
        <Link
          href="/wiki/rules"
          className="inline-flex items-center space-x-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
        >
          <BookOpen className="h-3.5 w-3.5 text-blue-400" />
          <span>{isZh ? "规则百科" : "Rules wiki"}</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ERROR_PAGES.map((entry) => (
          <Link
            key={entry.slug}
            href={`/errors/${entry.slug}`}
            className="group rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 hover:border-white/20 hover:bg-white/[0.06] transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-300">
                <LifeBuoy className="h-3.5 w-3.5 text-amber-400" />
                <span>{entry.platform}</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-white transition-colors" />
            </div>
            <div className="text-sm font-semibold text-white mb-1">
              {isZh ? `${entry.platform} 触发使用上限怎么办` : `Fixing the ${entry.platform} limit error`}
            </div>
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {pick(entry.meaning)}
            </p>
          </Link>
        ))}
      </div>

      {/* Rule anchors */}
      <div className="mt-5 flex flex-wrap gap-2">
        {RULES.map((rule) => (
          <Link
            key={rule.id}
            href={`/wiki/rules#${rule.id}`}
            className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            {pick(rule.title)}
          </Link>
        ))}
      </div>
    </section>
  );
};
