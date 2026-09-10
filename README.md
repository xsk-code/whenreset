# 🍄 WhenReset: 8-Bit Retro Edition

> **OpenAI Codex 额度重置雷达 // 超级马里奥 8-bit 红白机复古像素追踪站**
> 
> 1:1 像素级复刻 OpenAI Codex 速率与额度重置预测追踪站，全面重塑为 NES 经典街机游戏风格。具备 100% 高韧性容灾、毫秒级倒计时、26 周像素热力图、社区预测互动与 1-UP 顶砖音效！

[![Next.js 15](https://img.shields.io/badge/Next.js-15.2.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0.0-blue?style=flat-square&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## 🕹️ 项目愿景与设计哲学

在广大开发者高强度使用 OpenAI Codex 编程工具时，速率限制（Rate Limits）何时重置是最高频关切的问题。

**WhenReset** 旨在提供一个极其直观、趣味横生且高可用的追踪雷达：
- 将枯燥的倒计时与图表转化为经典 **超级马里奥（Super Mario NES 8-bit）** 游戏世界；
- **全站纯像素直角**、经典黑黄红绿配色、问号金币砖块跳跃与通关旗杆动效；
- **零服务器成本、零运维负担**，通过 Edge 缓存与静态 JSON 双重容灾，确保全网 100% 永不白屏。

---

## 🌟 核心功能矩阵

| 功能模块 | 8-bit 街机映射 | 说明 |
|---|---|---|
| **实时重置倒计时** | `TIME 365` 计时器 | 毫秒级计算并倒计时下一次预估重置时间点，附带进度条 |
| **状态雷达看板** | 城堡警报与水管信标 | 实时显示当前 Codex 额度可用状态（NORMAL / RESTRICTED / RESETTING） |
| **26 周历史热力图** | 地下关卡像素方块点阵 | 完整呈现过去 26 周每日额度重置频率与密集度，支持悬浮查看 |
| **社区预测竞猜池** | 城堡问号对赌街机 | 社区用户可选择提前重置或延后重置，模拟实时投币质押 |
| **1-UP 金币与顶砖互动** | `[?]` 问号金币箱 | 点击砖块触发经典跳起金币动画与彩带粒子效果 |
| **官方动态与情报流** | 通关滚屏与推特羊皮纸 | 自动汇总官方通知、社区推文与历史重置记录 |
| **赞助者与致敬名单** | 名人堂像素排行榜 | 纯 CSS 像素徽章展示支持者与开源社区贡献者 |

---

## 🎨 8-bit 像素美学规范 (Pixel Aesthetics)

本项目严格遵循《WhenReset 工程规范 (AGENTS.md)》的复古红白机视觉约束：

1. **坚硬像素直角（拒绝现代圆角）**：
   - 页面全量元素采用 `rounded-none`；
   - 核心边框采用 `border-[3px] border-black` 或 `border-2 border-black`；
   - 核心阴影采用硬边缘投影 `shadow-[4px_4px_0px_#000]` 或 `shadow-[2px_2px_0px_#000]`；
   - 按钮具备物理下沉反馈（`:active` 时 `translate(3px, 3px)` 且阴影缩减）。
2. **红白机经典调色盘**：
   - 地下关卡背景（Dark）：`#0F111A`
   - 马里奥战袍红：`#E52521`
   - 问号金币金黄：`#FBD000`
   - 水管幽灵亮绿：`#00A800`
   - 地面与砖块棕：`#B84418`
   - 云朵与天空蓝：`#5C94FC`
3. **双轨字体平衡排版**：
   - **游戏标题、倒计时、数值、按钮**：采用经典像素字体 `font-pixel` (`Press Start 2P`)；
   - **长文推文、详细说明、代码片段**：采用高可读性等宽字体 `JetBrains Mono`，杜绝大段像素文字眩晕。

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

## 🛡️ 无版权风险合规与去中心化设计

1. **纯自绘像素几何**：
   - 所有马里奥元素（问号砖块、金币、管道指示、像素心形）均为纯 CSS / SVG 矢量绘制，**严禁引入任天堂商业 Sprite 贴图与音频**，完全规避版权侵权风险。
2. **独立第三方中立定位**：
   - 本项目声明为独立第三方额度追踪器（*Independent tracker for OpenAI Codex rate limits*）；
   - 不代表 OpenAI 官方，亦非任天堂关联产品；
   - 全站不设用户登录，不收集、不存储任何用户私有凭据或 API Key。

---

## 🌐 SEO、Sitemap 与社媒卡片

- **动态站点地图 (`src/app/sitemap.ts`)**：
  - 自动输出遵循 Google / 必应标准的 `/sitemap.xml`，收录首页及公开 API 接口。
- **爬虫协议 (`src/app/robots.ts`)**：
  - 输出规范 `/robots.txt`，放行各大搜索引擎爬虫并显式声明 sitemap 地址。
- **OpenGraph & Twitter Card**：
  - 集成 `summary_large_image` 与 1200x630 动态 OG 图片 (`/opengraph-image`)；
  - 呈现红白机 HUD 仪表板、金色问号箱与状态标语。

---

## 🚀 本地开发与快速上手

### 1. 环境准备
- Node.js 18.18+ 或 Node.js 20+
- npm、pnpm 或 yarn

### 2. 安装依赖
```bash
git clone https://github.com/your-org/whenreset.git
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
- 致敬 80 年代经典红白机街机游戏与全球开源 AI 开发者社区。
