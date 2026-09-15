# ⚡ WhenReset — Live AI Quota Reset Radar

> **OpenAI Codex & Claude 配额重置实时追踪雷达 // 高可用极客遥测看板**
> 
> 针对全球高强度使用 AI 编程工具（OpenAI Codex, Claude Code, Grok）的开发者，提供毫秒级配额重置倒计时、统计学概率预测雷达、26 周重置全景热力图、RFC 5545 日历同步与多渠道（Bark / Webhook / 邮件）开发者强提醒服务。

[![Next.js 15](https://img.shields.io/badge/Next.js-15.2.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0.0-blue?style=flat-square&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## 🧭 项目愿景与核心价值

在开发者高强度使用 OpenAI Codex 或 Claude 进行复杂工程构建时，速率限制（Rate Limits）与额度何时刷新是最高频关切的痛点。

**WhenReset** 旨在构建一个极客、精确且永不下线的全网配额遥测雷达：
- **统计学概率预测**：基于历史平均 ~3.3 天重置周期与泊松/指数分布衰减模型，结合 OpenAI 官方事故与状态信号，毫秒级测算当前窗口重置概率；
- **全渠道告警闭环**：支持添加到系统日历（RFC 5545 .ICS 定期静默刷新）、浏览器桌面通知、Bark 手机推送与企业微信/飞书/Discord/Slack Webhook；
- **现代暗黑磨砂质感 (Frosted-Glass)**：高科技暗黑配色、半透明玻璃拟态与发光脉冲指标，专为极客开发者工作流打造；
- **零服务器成本、零单点故障**：纯 Edge 缓存代理与静态 JSON 本地双重容灾，确保极端网络环境下 100% 永不白屏。

---

## 🌟 核心功能矩阵

| 功能模块 | 对应组件 / API | 说明 |
|---|---|---|
| **概率预测与实时倒计时** | `<ForecastHero />` | 毫秒级倒计时、概率综合得分（0%~97%）与影响因子（历史周期 + 事故信号）拆解 |
| **26 周配额全景热力图** | `<TopicMatrix />` | 完整呈现过去 26 周（182 天）每日 Codex 额度重置频率，支持 Regular / Banked 分类与推文溯源 |
| **实时官方与社区信号流** | `<SignalDesk />` | 自动抓取并聚合 Tibo (@thsottiaux) 与官方关键通知，提供情报等级与决策建议 |
| **RFC 5545 动态日历订阅** | `/api/calendar.ics` | 标准 iCalendar 格式订阅源，自动将预测重置窗口同步至 Mac / iOS / Google Calendar |
| **开发者强提醒中枢** | `<AlertModal />` + `/api/push` | 支持阈值通知、官方定档突发推送，集成 Bark / 飞书 / 企微 / Discord / 邮件 |
| **高保真状态卡片分享** | `<ShareModal />` | 纯客户端生成带动态二维码、概率徽标的精美 PNG 状态海报，一键直推 X |

---

## 🎨 现代极客设计规范 (Frosted-Glass Telemetry)

本项目遵循严格的现代暗黑遥测看板视觉系统：

1. **暗黑深空与磨砂拟态**：
   - 页面背景采用深空 Slate 黑 `#080B11`，配合微弱点阵背景；
   - 核心看板采用半透明磨砂面板（`.glass-panel`，`backdrop-filter: blur(16px)`）；
   - 微圆角细腻层次（`rounded-lg` / `rounded-xl` / `rounded-2xl`），摒弃生硬直角与杂乱边框。
2. **状态色彩与脉冲指示灯**：
   - **翡翠绿 (`#10B981`)**：实时在线、高活跃度、健康状态脉冲；
   - **琥珀黄 (`#F59E0B`)**：重置临界窗口、高概率警戒；
   - **科技蓝 (`#3B82F6`)**：官方信号、分析报告与外链。
3. **字体配比**：
   - 页面标题、说明文本：现代无衬线字体 `Inter`；
   - 倒计时、概率数值、时间戳与代码：开发者等宽字体 `JetBrains Mono`。

---

## 🏗️ 系统与技术架构

```
                     ┌─────────────────────────────┐
                     │   Browser / Client Visit    │
                     │    (https://whenreset.top)  │
                     └──────────────┬──────────────┘
                                    │
                         ┌──────────▼──────────┐
                         │   Vercel Edge CDN   │
                         │ (Next.js 15 App R.) │
                         └──────────┬──────────┘
                                    │
            ┌───────────────────────┴───────────────────────┐
            │                                               │
 ┌──────────▼──────────┐                         ┌──────────▼──────────┐
 │   /api/status       │                         │   /api/resets       │
 │   - Edge Cache (60s)│                         │   - Edge Cache (60s)│
 └──────────┬──────────┘                         └──────────┬──────────┘
            │                                               │
            ├───────────────[ Upstream Unreachable? ]──────┤
            │                                               │
            ▼                                               ▼
 ┌─────────────────────────────────────────────────────────────────────┐
 │       Local Static Fallback (src/data/fallback-resets.json)         │
 │                    100% Never Blank Screen                          │
 └─────────────────────────────────────────────────────────────────────┘
```

### 技术栈选型
- **核心框架**：[Next.js 15.2.0](https://nextjs.org/) (App Router, React 19)
- **样式方案**：[Tailwind CSS](https://tailwindcss.com/) + 原生 CSS 扫描线动画 (`bg-scanline`)
- **图标系统**：[Lucide Icons](https://lucide.dev/)（结合像素直角规范封装）
- **粒子特效**：[Canvas Confetti](https://github.com/catdad/canvas-confetti)（金币喷发特效）
- **动态社媒生成**：Next.js `ImageResponse` (`@vercel/og`) 动态矢量像素合成

---

## 🛡️ 隐私优先、中立定位与安全性设计

1. **独立第三方中立定位**：
   - 本项目声明为独立第三方额度追踪器（*Independent tracker for OpenAI Codex rate limits*）；
   - 不代表 OpenAI 或 Anthropic 官方；
   - 全站不设用户登录，不收集、不存储任何用户私有凭据或 API Key。
2. **纯客户端隐私告警**：
   - 个人告警规则保存在用户浏览器本地存储（LocalStorage）；
   - 告警触发通过浏览器端守护进程计算，服务端代理推送通道仅用于规避 CORS，绝不沉淀任何用户隐私。

---

## 🌐 SEO、Sitemap 与社媒卡片

- **动态站点地图 (`src/app/sitemap.ts`)**：
  - 自动输出遵循 Google / 必应标准的 `/sitemap.xml`，收录首页及公开 API 接口。
- **爬虫协议 (`src/app/robots.ts`)**：
  - 输出规范 `/robots.txt`，放行各大搜索引擎爬虫并显式声明 sitemap 地址。
- **OpenGraph & Twitter Card**：
  - 集成 `summary_large_image` 与 1200x630 动态 OG 图片 (`/opengraph-image`)；
  - 呈现现代暗黑磨砂玻璃雷达卡片、实时概率指标与多模型技术规格。

---

## 🚀 本地开发与快速上手

### 1. 环境准备
- Node.js 18.18+ 或 Node.js 20+
- npm、pnpm 或 yarn

### 2. 安装依赖
```bash
git clone https://github.com/xsk-code/whenreset.git
cd whenreset
npm install
```

### 3. 启动本地开发服务
```bash
npm run dev
```
打开浏览器访问 [http://localhost:3000](http://localhost:3000)。

### 4. 生产构建验证
```bash
npm run build
```
确保全量静态预渲染与类型检查 100% 通过。

---

## ☁️ Vercel 零配置一键部署指引

本项目专为 Vercel 边缘运行环境设计，无需数据库或中间件，零成本零月租运行。

### 步骤一：导入仓库
1. 登录 [Vercel 控制台](https://vercel.com/)；
2. 点击 **"Add New..." -> "Project"**；
3. 选择关联的 GitHub 仓库 `whenreset`。

### 步骤二：构建设置（开箱即用）
- **Framework Preset**: `Next.js`
- **Root Directory**: `./`
- **Build Command**: `next build`（默认）
- **Output Directory**: `.next`（默认）
- **Environment Variables**: 无需强制配置，默认使用公开数据源与内置本地双重容灾。

### 步骤三：绑定自定义域名（`whenreset.top`）
1. 在 Vercel 项目详情页中进入 **Settings -> Domains**；
2. 输入 `whenreset.top` 及 `www.whenreset.top`；
3. 前往您的域名 DNS 服务商（如 Cloudflare, 阿里云, DNSPod 等），添加如下解析记录：
   - **A 记录**：`@` 指向 `76.76.21.21`（Vercel 官方 Anycast IP）
   - **CNAME 记录**：`www` 指向 `cname.vercel-dns.com`
4. 等待 SSL 证书自动签发，即可通过 HTTPS 访问站点。

---

## 📜 开源许可与致谢

- 本项目代码遵循 [MIT 许可证](LICENSE) 开源；
- 致敬全球开源 AI 与开发者工具社区，特别鸣谢 OpenAI 团队及 Tibo (@thsottiaux) 的前线动态分享。

---

## 🔧 环境变量与告警通道配置

本项目默认无需任何环境变量即可直接运行与本地预览；以下变量仅在启用「服务端推送」与自定义生产域名时按需配置：

| 环境变量 | 作用 | 未配置时的行为 |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | 站点域名，统一驱动 canonical / sitemap / ICS / 二维码 | 回退到 `https://whenreset.top` |
| `CRON_SECRET` | 保护 `/api/cron/dispatch` 的 Bearer token | 不配置则该端点不校验身份（不推荐） |
| `ADMIN_BARK_KEY` | 每日摘要推送的 Bark 目标 | 跳过 Bark 投递 |
| `ADMIN_WEBHOOK_URL` | 每日摘要推送的群机器人 Webhook | 跳过 Webhook 投递 |
| `RESEND_API_KEY` | 邮件订阅通道密钥 | `/api/subscribe` 返回 `configured:false`，UI 如实提示 |
| `RESEND_AUDIENCE_ID` | 可选，Resend 读者列表 ID | 不带 audience 直接建联系人 |

### 推送链路说明

- 面向个人的告警在**浏览器端守护进程**里触发（`src/lib/useAlertGuardian.ts`）：命中概率阈值或出现新的官方公告时，
  调用 `/api/push` 由服务端代理发出，避免 Webhook 的 CORS 限制。
- `/api/push` 带目标主机白名单（Bark / 企业微信 / 飞书 / Discord / Slack），非白名单目标直接 403，防止沦为开放 SSRF 中继。
- 每日摘要由 Vercel Cron 触发（见 `vercel.json`，每天 09:00 UTC）。

### 预测模型

统一入口为 `src/lib/forecast.ts`，全站（首页、SEO 页、ICS、Cron）共用同一个结果：

```
likelihood = 92 * (1 - e^(-1.6 * daysSinceLast / medianInterval)) + incidentBoost
incidentBoost ≤ 15   // 来自 status.openai.com 的实时事故信号
```

- `medianInterval` 取历史间隔中位数（而非平均值），避免极端干旱期拉偏整体；
- 非官方定档时上限 97%，永不谎称 100%；
- 首页「概率构成明细」卡片会把每一项的实际贡献显示出来。
