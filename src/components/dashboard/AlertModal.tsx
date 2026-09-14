"use client";

import React, { useState, useEffect } from "react";
import { X, Bell, Smartphone, Webhook, Mail, CheckCircle2, AlertCircle, Volume2 } from "lucide-react";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "en" | "zh";
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const isZh = lang === "zh";
  const [tab, setTab] = useState<"bark" | "webhook" | "email">("bark");

  // Bark state
  const [barkKey, setBarkKey] = useState<string>("");
  const [barkLevel, setBarkLevel] = useState<string>("timeSensitive");
  const [barkTestStatus, setBarkTestStatus] = useState<string | null>(null);

  // Webhook state
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [webhookSaved, setWebhookSaved] = useState<boolean>(false);

  // Email state
  const [email, setEmail] = useState<string>("");
  const [emailSaved, setEmailSaved] = useState<boolean>(false);

  // Load saved settings
  useEffect(() => {
    try {
      const savedBark = localStorage.getItem("whenreset_bark_key");
      if (savedBark) setBarkKey(savedBark);
      const savedWebhook = localStorage.getItem("whenreset_webhook_url");
      if (savedWebhook) setWebhookUrl(savedWebhook);
      const savedEmail = localStorage.getItem("whenreset_email");
      if (savedEmail) setEmail(savedEmail);
    } catch {}
  }, []);

  if (!isOpen) return null;

  // Test Bark push
  const handleTestBark = async () => {
    if (!barkKey.trim()) {
      setBarkTestStatus("empty");
      return;
    }
    setBarkTestStatus("sending");

    try {
      localStorage.setItem("whenreset_bark_key", barkKey.trim());
      // Clean up key if user pasted full url or key
      const cleanKey = barkKey.trim().replace(/^https?:\/\/api\.day\.app\//, "");
      const testUrl = `https://api.day.app/${cleanKey}/WhenReset/⚡%20Codex%20Quota%20Reset%20Radar?level=${barkLevel}&sound=alarm`;
      
      const res = await fetch(testUrl, { mode: "no-cors" });
      setBarkTestStatus("success");
      setTimeout(() => setBarkTestStatus(null), 3500);
    } catch (err) {
      setBarkTestStatus("error");
      setTimeout(() => setBarkTestStatus(null), 3500);
    }
  };

  const handleSaveWebhook = () => {
    if (webhookUrl.trim()) {
      localStorage.setItem("whenreset_webhook_url", webhookUrl.trim());
      setWebhookSaved(true);
      setTimeout(() => setWebhookSaved(false), 2500);
    }
  };

  const handleSaveEmail = () => {
    if (email.trim()) {
      localStorage.setItem("whenreset_email", email.trim());
      setEmailSaved(true);
      setTimeout(() => setEmailSaved(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl glass-panel p-6 sm:p-8 border border-white/15 shadow-glass animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {isZh ? "开发者强提醒订阅中心" : "Developer Instant Alert Hub"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isZh
                ? "当重置概率 > 80% 或官方公告落地时，毫秒级推送提醒"
                : "Millisecond alerts when reset probability > 80% or drops confirm"}
            </p>
          </div>
        </div>

        {/* Channel Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-white/[0.04] p-1 border border-white/[0.08] mb-6 text-xs">
          <button
            onClick={() => setTab("bark")}
            className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg font-medium transition-all ${
              tab === "bark"
                ? "bg-white/10 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
            <span>Bark (iOS)</span>
          </button>
          <button
            onClick={() => setTab("webhook")}
            className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg font-medium transition-all ${
              tab === "webhook"
                ? "bg-white/10 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Webhook className="h-3.5 w-3.5 text-blue-400" />
            <span>Webhook</span>
          </button>
          <button
            onClick={() => setTab("email")}
            className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg font-medium transition-all ${
              tab === "email"
                ? "bg-white/10 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Mail className="h-3.5 w-3.5 text-amber-400" />
            <span>{isZh ? "邮件通知" : "Email"}</span>
          </button>
        </div>

        {/* Tab 1: Bark */}
        {tab === "bark" && (
          <div className="space-y-4">
            <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3.5 text-xs text-emerald-300 flex items-start space-x-2">
              <Volume2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                {isZh
                  ? "Bark 支持 iOS 设备穿透系统静音模式进行最大音量强提醒，最受国内 AI 开发者喜爱。"
                  : "Bark supports iOS high-priority alarms bypassing silent mode."}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isZh ? "Bark Key 或完整链接" : "Bark Key or URL"}
              </label>
              <input
                type="text"
                value={barkKey}
                onChange={(e) => setBarkKey(e.target.value)}
                placeholder="e.g. k5x9Yz... or https://api.day.app/YOUR_KEY"
                className="w-full rounded-lg bg-white/[0.05] border border-white/10 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isZh ? "提醒强弱等级" : "Notification Level"}
              </label>
              <select
                value={barkLevel}
                onChange={(e) => setBarkLevel(e.target.value)}
                className="w-full rounded-lg bg-white/[0.05] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="timeSensitive" className="bg-[#0F1420]">
                  {isZh ? "时效性通知 (timeSensitive - 突破免打扰)" : "timeSensitive (High Priority)"}
                </option>
                <option value="active" className="bg-[#0F1420]">
                  {isZh ? "标准强提醒 (active - 点亮屏幕)" : "active (Standard)"}
                </option>
              </select>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={handleTestBark}
                className="flex-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-glow-green transition-all"
              >
                {barkTestStatus === "sending"
                  ? isZh
                    ? "正在发送测试..."
                    : "Sending test..."
                  : isZh
                  ? "发送测试推送并保存"
                  : "Send Test Push & Save"}
              </button>
            </div>

            {barkTestStatus === "success" && (
              <div className="flex items-center space-x-2 text-xs text-emerald-400 mt-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>{isZh ? "测试推送已发出！请检查手机 Bark。" : "Test push sent! Check your device."}</span>
              </div>
            )}
            {barkTestStatus === "empty" && (
              <div className="flex items-center space-x-2 text-xs text-rose-400 mt-2">
                <AlertCircle className="h-4 w-4" />
                <span>{isZh ? "请先填入有效的 Bark Key" : "Please input a valid Bark key first."}</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Webhook */}
        {tab === "webhook" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              {isZh
                ? "支持企业微信群机器人、飞书机器人或 Discord Webhook。重置信号触发时自动向群内 @所有人。"
                : "Supports WeCom, Feishu or Discord bot webhooks for automated channel announcements."}
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Webhook URL
              </label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=..."
                className="w-full rounded-lg bg-white/[0.05] border border-white/10 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              onClick={handleSaveWebhook}
              className="w-full rounded-lg bg-blue-500 hover:bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-all shadow-glow-blue"
            >
              {isZh ? "保存 Webhook 配置" : "Save Webhook"}
            </button>

            {webhookSaved && (
              <div className="flex items-center space-x-2 text-xs text-blue-400 mt-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>{isZh ? "Webhook 配置已成功保存至本地！" : "Webhook saved successfully!"}</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Email */}
        {tab === "email" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              {isZh
                ? "我们将在重置概率触达 70% 时发送预告邮件，并在确认生效的一分钟内再次邮件送达。"
                : "We email once at 70% likelihood, and once more when the drop actually lands."}
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isZh ? "接收邮箱地址" : "Email Address"}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@company.com"
                className="w-full rounded-lg bg-white/[0.05] border border-white/10 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <button
              onClick={handleSaveEmail}
              className="w-full rounded-lg bg-amber-500 hover:bg-amber-600 px-4 py-2 text-xs font-semibold text-white transition-all shadow-glow-amber"
            >
              {isZh ? "确认订阅邮件提醒" : "Subscribe via Email"}
            </button>

            {emailSaved && (
              <div className="flex items-center space-x-2 text-xs text-amber-400 mt-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>{isZh ? "邮箱已成功登记！" : "Email registered successfully!"}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
