"use client";

import React, { useState, useRef } from "react";
import { X, Copy, Download, Check, Sparkles } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "en" | "zh";
  likelihood: number;
  daysSinceLast: number;
  estimatedNextDate: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  lang,
  likelihood,
  daysSinceLast,
  estimatedNextDate,
}) => {
  const isZh = lang === "zh";
  const [userName, setUserName] = useState<string>("QuotaRefugee");
  const [copied, setCopied] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(
        `${SITE_CONFIG.domain} - OpenAI Codex Quota Reset Forecast: ${likelihood}% Likelihood`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl glass-panel p-6 sm:p-7 border border-white/15 shadow-glass animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span>{isZh ? "生成工伤/额度自嘲卡片" : "Export Quota Status Card"}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {isZh
              ? "可直接导出图片分享至朋友圈、推特、即刻或技术交流群"
              : "Generate an image card to share on X, Discord or WeChat"}
          </p>
        </div>

        {/* Customizable Nickname */}
        <div className="mb-4">
          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
            {isZh ? "自定义身份署名" : "Custom Handle / Nickname"}
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            maxLength={24}
            className="w-full rounded-lg bg-white/[0.05] border border-white/10 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Visual Card Preview */}
        <div
          ref={cardRef}
          className="rounded-xl bg-gradient-to-br from-[#0D121F] via-[#111827] to-[#0A0D14] border border-white/15 p-6 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle glow circle */}
          <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-blue-500/15 blur-2xl pointer-events-none" />

          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-white tracking-tight">
                {SITE_CONFIG.name}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              STATUS RADAR
            </span>
          </div>

          {/* User Status Title */}
          <div className="mb-4">
            <div className="text-[11px] font-mono text-slate-400">
              @{userName}
            </div>
            <div className="text-base font-bold text-white mt-0.5">
              {isZh ? "已被限速 • 静候义父重置" : "QUOTA DEPLETED • STANDING BY"}
            </div>
          </div>

          {/* Main Meter */}
          <div className="rounded-lg bg-white/[0.04] border border-white/[0.08] p-3 mb-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase text-slate-400 font-semibold">
                {isZh ? "24H 掉落概率" : "RESET LIKELIHOOD"}
              </div>
              <div className="text-3xl font-extrabold font-mono text-emerald-400">
                {likelihood}%
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase text-slate-400 font-semibold">
                {isZh ? "预计开闸窗口" : "ESTIMATED WINDOW"}
              </div>
              <div className="text-xs font-mono text-slate-200 mt-1">
                {estimatedNextDate}
              </div>
            </div>
          </div>

          {/* Card Footer with independent domain */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-white/[0.08]">
            <span>{isZh ? `已熬过 ${daysSinceLast.toFixed(1)} 天` : `${daysSinceLast.toFixed(1)}d elapsed`}</span>
            <span className="font-mono text-slate-300 font-medium">{SITE_CONFIG.domain.replace(/^https?:\/\//, "")}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-5 flex items-center space-x-2.5">
          <button
            onClick={handleCopyLink}
            className="flex-1 inline-flex items-center justify-center space-x-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-glow-green transition-all"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>{isZh ? "已复制状态文案！" : "Copied to clipboard!"}</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>{isZh ? "复制卡片文案 & 链接" : "Copy Status Text"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
