"use client";

import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
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

const CARD_WIDTH = 800;
const CARD_HEIGHT = 1000;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
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
  const [downloaded, setDownloaded] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const domain = SITE_CONFIG.domain.replace(/\/$/, "");

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    QRCode.toDataURL(domain, {
      width: 220,
      margin: 1,
      color: { dark: "#0B0F17", light: "#FFFFFF" },
    })
      .then((url: string) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, domain]);

  const drawCard = async (ctx: CanvasRenderingContext2D) => {
    const likelihoodValue = `${likelihood}%`;
    const host = domain.replace(/^https?:\/\//, "");

    // Background
    const gradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
    gradient.addColorStop(0, "#0D121F");
    gradient.addColorStop(0.5, "#111827");
    gradient.addColorStop(1, "#0A0D14");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    // Grid dots
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    for (let x = 32; x < CARD_WIDTH; x += 32) {
      for (let y = 32; y < CARD_HEIGHT; y += 32) {
        ctx.fillRect(x, y, 2, 2);
      }
    }

    // Header
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "700 34px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(SITE_CONFIG.name, 56, 90);
    ctx.fillStyle = "#10B981";
    ctx.beginPath();
    ctx.arc(40, 80, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#64748B";
    ctx.font = "500 20px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillText(isZh ? "实时额度雷达" : "QUOTA RESET RADAR", 56, 126);

    // Handle
    ctx.fillStyle = "#94A3B8";
    ctx.font = "500 26px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillText(`@${userName}`, 56, 210);

    ctx.fillStyle = "#F8FAFC";
    ctx.font = "700 46px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(
      isZh ? "已被限速 · 静候重置" : "QUOTA DEPLETED · STANDING BY",
      56,
      272
    );

    // Metric panel
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    roundRect(ctx, 56, 320, CARD_WIDTH - 112, 220, 20);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#94A3B8";
    ctx.font = "600 20px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillText(isZh ? "重置概率" : "RESET LIKELIHOOD", 88, 372);

    const metricColor = likelihood >= 80 ? "#F43F5E" : likelihood >= 60 ? "#F59E0B" : "#10B981";
    ctx.fillStyle = metricColor;
    ctx.font = "700 120px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillText(likelihoodValue, 88, 486);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "600 20px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillText(isZh ? "预计窗口" : "ESTIMATED WINDOW", 460, 372);
    ctx.fillStyle = "#E2E8F0";
    ctx.font = "600 28px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillText(estimatedNextDate, 460, 412);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "500 20px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillText(
      isZh
        ? `已熬过 ${daysSinceLast.toFixed(1)} 天`
        : `${daysSinceLast.toFixed(1)}d elapsed`,
      460,
      452
    );

    // QR block
    if (qrDataUrl) {
      const qrImage = new Image();
      await new Promise<void>((resolve) => {
        qrImage.onload = () => resolve();
        qrImage.onerror = () => resolve();
        qrImage.src = qrDataUrl;
      });
      ctx.fillStyle = "#FFFFFF";
      roundRect(ctx, 56, 600, 260, 260, 18);
      ctx.fill();
      ctx.drawImage(qrImage, 76, 620, 220, 220);
    }

    ctx.fillStyle = "#F8FAFC";
    ctx.font = "700 34px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(isZh ? "扫码查看实时预测" : "Scan for live forecast", 348, 660);
    ctx.fillStyle = "#94A3B8";
    ctx.font = "500 24px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillText(host, 348, 706);

    // Footer note
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(56, 900, CARD_WIDTH - 112, 2);
    ctx.fillStyle = "#64748B";
    ctx.font = "500 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(
      isZh
        ? "数据来自公开推特公告与 OpenAI 状态页 · 预测非承诺"
        : "Built from public announcements and OpenAI status · forecast, not a promise",
      56,
      950
    );
  };

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    void drawCard(ctx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userName, likelihood, estimatedNextDate, daysSinceLast, qrDataUrl, lang]);

  // Must stay below every hook: returning above the canvas effect made that
  // effect appear only on the open render, which broke the hook order.
  if (!isOpen) return null;

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `whenreset-status-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
    }, "image/png");
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(
        `${domain} - ${isZh ? "OpenAI Codex 额度重置预测" : "OpenAI Codex quota reset forecast"}: ${likelihood}%`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl glass-panel p-6 sm:p-7 border border-white/15 shadow-glass animate-in fade-in zoom-in duration-200">
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
            <span>{isZh ? "导出自嘲状态卡片" : "Export status card"}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {isZh
              ? "可保存为 PNG 分享，右下角二维码直达实时预测"
              : "Save as PNG; the QR code opens the live forecast"}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
            {isZh ? "自定义身份署名" : "Custom handle"}
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            maxLength={24}
            className="w-full rounded-lg bg-white/[0.05] border border-white/10 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <canvas
          ref={canvasRef}
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          className="w-full rounded-xl border border-white/15"
        />

        <div className="mt-5 flex items-center space-x-2.5">
          <button
            onClick={handleDownload}
            className="flex-1 inline-flex items-center justify-center space-x-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-glow-blue transition-all"
          >
            {downloaded ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>{isZh ? "已保存 PNG" : "PNG saved"}</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                <span>{isZh ? "保存卡片为 PNG" : "Download PNG"}</span>
              </>
            )}
          </button>
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center justify-center space-x-1.5 rounded-lg border border-white/10 bg-white/[0.05] hover:bg-white/10 px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white transition-all"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>{isZh ? "已复制" : "Copied"}</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>{isZh ? "复制文案" : "Copy text"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
