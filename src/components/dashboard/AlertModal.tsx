"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Bell,
  Smartphone,
  Webhook,
  Mail,
  CheckCircle2,
  AlertCircle,
  Volume2,
  BellRing,
} from "lucide-react";
import {
  readAlertConfig,
  saveAlertConfig,
  pushNotification,
  subscribeEmail,
  DEFAULT_THRESHOLD,
} from "@/lib/notify";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "en" | "zh";
}

export const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose, lang }) => {
  const isZh = lang === "zh";
  const [tab, setTab] = useState<"bark" | "webhook" | "email">("bark");

  const [barkKey, setBarkKey] = useState<string>("");
  const [barkLevel, setBarkLevel] = useState<string>("timeSensitive");
  const [barkTestStatus, setBarkTestStatus] = useState<string | null>(null);

  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);

  const [email, setEmail] = useState<string>("");
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  const [threshold, setThreshold] = useState<number>(DEFAULT_THRESHOLD);

  useEffect(() => {
    const config = readAlertConfig();
    setBarkKey(config.barkKey);
    setBarkLevel(config.barkLevel);
    setWebhookUrl(config.webhookUrl);
    setEmail(config.email);
    setThreshold(config.threshold);
  }, []);

  if (!isOpen) return null;

  const handleTestBark = async () => {
    if (!barkKey.trim()) {
      setBarkTestStatus("empty");
      return;
    }
    setBarkTestStatus("sending");
    saveAlertConfig({ barkKey: barkKey.trim(), barkLevel, threshold });
    const result = await pushNotification({
      channel: "bark",
      target: barkKey.trim(),
      level: barkLevel,
      title: isZh ? "⚡ WhenReset 测试推送" : "⚡ WhenReset test push",
      body: isZh
        ? "如果你看到这条消息，说明 iOS 强提醒通道已打通。"
        : "If you see this, the iOS high-priority channel works.",
    });
    setBarkTestStatus(result.ok ? "success" : "error");
    setTimeout(() => setBarkTestStatus(null), 4000);
  };

  const handleSaveWebhook = async () => {
    if (!webhookUrl.trim()) {
      setWebhookStatus("empty");
      return;
    }
    setWebhookStatus("sending");
    saveAlertConfig({ webhookUrl: webhookUrl.trim(), threshold });
    const result = await pushNotification({
      channel: "webhook",
      target: webhookUrl.trim(),
      title: isZh ? "⚡ WhenReset 已连接" : "⚡ WhenReset connected",
      body: isZh
        ? "机器人通道已验证，重置信号将实时送达群聊。"
        : "Channel verified. Reset signals will be posted here.",
    });
    setWebhookStatus(result.ok ? "success" : "error");
    setTimeout(() => setWebhookStatus(null), 4000);
  };

  const handleSaveEmail = async () => {
    if (!email.trim()) {
      setEmailStatus("empty");
      return;
    }
    setEmailStatus("sending");
    const result = await subscribeEmail(email.trim());
    if (result.ok) {
      saveAlertConfig({ email: email.trim(), threshold });
      setEmailStatus("success");
    } else if (result.configured === false) {
      setEmailStatus("unconfigured");
    } else {
      setEmailStatus("error");
    }
    setTimeout(() => setEmailStatus(null), 5000);
  };

  const statusBlock = (
    status: string | null,
    zhMap: Record<string, string>,
    enMap: Record<string, string>
  ) => {
    if (!status) return null;
    if (status === "sending") {
      return (
        <div className="flex items-center space-x-2 text-xs text-slate-400 mt-2">
          <span>{isZh ? "正在发送..." : "Sending..."}</span>
        </div>
      );
    }
    const text = isZh ? zhMap[status] : enMap[status];
    const tone =
      status === "success"
        ? "text-emerald-400"
        : status === "unconfigured"
        ? "text-amber-400"
        : "text-rose-400";
    return (
      <div className={`flex items-center space-x-2 text-xs mt-2 ${tone}`}>
        {status === "success" ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
        <span>{text}</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl glass-panel p-6 sm:p-8 border border-white/15 shadow-glass animate-in fade-in zoom-in duration-200">
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
                ? "通道真实可用：保存后立即发一条验证消息"
                : "Real channels: a verification message goes out immediately"}
            </p>
          </div>
        </div>

        {/* Shared threshold control */}
        <div className="mb-6 rounded-xl bg-white/[0.03] border border-white/[0.08] p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <BellRing className="h-3.5 w-3.5 text-amber-400" />
              <span>{isZh ? "自动触发阈值" : "Auto-trigger threshold"}</span>
            </span>
            <span className="font-mono text-sm text-amber-400">{threshold}%</span>
          </div>
          <input
            type="range"
            min={50}
            max={95}
            step={5}
            value={threshold}
            onChange={(e) => {
              const next = Number(e.target.value);
              setThreshold(next);
              saveAlertConfig({ threshold: next });
            }}
            className="w-full accent-amber-400"
          />
          <p className="text-[11px] text-slate-400 mt-1.5">
            {isZh
              ? "预测概率达到该阈值、或出现新的官方重置公告时，自动推送到下方已配置的通道（每 6 小时最多一次）。"
              : "Pushes fire when the forecast hits this threshold or a new official drop lands (max once per 6h)."}
          </p>
        </div>

        {/* Channel tabs */}
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-white/[0.04] p-1 border border-white/[0.08] mb-6 text-xs">
          <button
            onClick={() => setTab("bark")}
            className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg font-medium transition-all ${
              tab === "bark" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
            <span>Bark (iOS)</span>
          </button>
          <button
            onClick={() => setTab("webhook")}
            className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg font-medium transition-all ${
              tab === "webhook" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            <Webhook className="h-3.5 w-3.5 text-blue-400" />
            <span>Webhook</span>
          </button>
          <button
            onClick={() => setTab("email")}
            className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg font-medium transition-all ${
              tab === "email" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"
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
                  ? "Bark 支持 iOS 设备穿透静音模式强提醒；推送由本站服务端代理发出，不受浏览器跨域限制。"
                  : "Bark bypasses iOS silent mode. Requests are proxied server-side so there are no CORS issues."}
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
                  {isZh ? "时效性通知 (突破免打扰)" : "timeSensitive (high priority)"}
                </option>
                <option value="active" className="bg-[#0F1420]">
                  {isZh ? "标准强提醒 (点亮屏幕)" : "active (standard)"}
                </option>
              </select>
            </div>

            <button
              onClick={handleTestBark}
              className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-glow-green transition-all"
            >
              {isZh ? "发送测试推送并保存" : "Send test push & save"}
            </button>

            {statusBlock(
              barkTestStatus,
              {
                success: "测试推送已发出！请查看手机 Bark。",
                empty: "请先填入有效的 Bark Key",
                error: "推送失败，请检查 Key 是否正确",
              },
              {
                success: "Test push sent. Check your device.",
                empty: "Please input a valid Bark key first",
                error: "Push failed — double-check the key",
              }
            )}
          </div>
        )}

        {/* Tab 2: Webhook */}
        {tab === "webhook" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              {isZh
                ? "支持企业微信、飞书与 Discord 机器人。保存时会发送一条验证消息，成功即代表通道可用。"
                : "Supports WeCom, Feishu and Discord bots. A verification message confirms the channel works."}
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Webhook URL</label>
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
              {isZh ? "保存并验证 Webhook" : "Save & verify webhook"}
            </button>

            {statusBlock(
              webhookStatus,
              {
                success: "验证消息已送达群聊！",
                empty: "请先填写 Webhook 地址",
                error: "发送失败：目标域名不在允许清单或地址无效",
              },
              {
                success: "Verification delivered to your channel!",
                empty: "Please fill in a webhook URL first",
                error: "Failed: destination host not allowed or URL invalid",
              }
            )}
          </div>
        )}

        {/* Tab 3: Email */}
        {tab === "email" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              {isZh
                ? "邮件订阅走服务端订阅读者列表，需部署方配置 RESEND_API_KEY；未配置时会如实提示。"
                : "Email registration needs RESEND_API_KEY on the deployment; if missing we tell you plainly."}
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

            {statusBlock(
              emailStatus,
              {
                success: "邮箱已成功登记！",
                empty: "请填写邮箱地址",
                unconfigured: "当前部署未配置邮件服务，请改用 Bark 或 Webhook 通道",
                error: "订阅失败，请稍后重试",
              },
              {
                success: "Email registered successfully!",
                empty: "Please enter an email address",
                unconfigured:
                  "Email is not configured on this deployment — use Bark or Webhook instead",
                error: "Subscription failed, please retry later",
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
};
