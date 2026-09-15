# ⚠️ [已归档历史文档] 8-Bit 复古像素风格 Codex 额度重置追踪站落地方案

> **状态**：**已归档 (Archived)**。  
> **说明**：本项目早期为 8-Bit 复古马里奥版本，现已全库重构为 **v2 Modern Frosted-Glass Telemetry Dashboard (现代暗黑磨砂玻璃遥测站)**。  
> **最新工程规范**：请查阅 [`AGENTS.md`](./AGENTS.md) 与 [`README.md`](./README.md)。  
> **最新设计体系**：深空暗黑背景 `#080B11` + 磨砂面板 `.glass-panel` + 翡翠绿脉冲 `#10B981` + `Inter` / `JetBrains Mono` 字体。

---

## 一、 产品定位与核心玩法复刻矩阵

将竞品全部功能进行复古 8-bit 像素世界的趣味转化，保留全部数据准确性与功能闭环：

| 竞品功能 (`codex-resets.com`) | WhenReset 像素版重塑 | 交互与视觉实现 |
| :--- | :--- | :--- |
| **Hero 实时看板** | **复古街机城堡状态看板** | 巨型像素时钟、相对时间（"X hours ago"）、UTC 时间，标注 Regular / Banked 属性 |
| **祈求/感谢按钮 (`reset-plea`)** | **问号金币砖块 (`?` 1-UP Block)** | 未重置时显示 `[ ❓ Hit for 1-UP ]`；重置 24h 内显示 `[ 🍄 Stage Clear! ]`；点击产生触觉震动、向上弹射跳动金币 `🪙 +1` / 蘑菇 `🍄`，数字翻滚并全网同步 |
| **三大核心统计 (`stat-row`)** | **关卡统计栏 (World Stats)** | 像素方块显示：`TOTAL RESETS`、`AVG MIRACLE INTERVAL (6.9d)`、`LONGEST WAIT (67.7d)` |
| **概率雷达与下注 (`watch-poll`)** | **首领城堡警报 (Boss Watch)** | 进入预警时闪烁像素警报：“🚨 Reset Watch: 75% Chance”。提供 **"Your Bet? [🍄 YES] [👾 NO]"** 下注与一键生成推特发帖 |
| **26周历史热力图 (`heatmap`)** | **8-Bit 像素关卡热力图** | 26 周方格做成 8-bit 砖块底纹：普通砖块（无重置）、红白蘑菇砖（Regular）、金币储蓄箱（Banked），悬停提示推文摘要 |
| **历史公告流 (`log-list`)** | **冒险编年史 (Quest Log)** | 像素对话框包裹 Tibo 的每一条官方推文，显示推特头像、时间与直达外链 |
| **通知订阅 Hub** | **像素通信站 (Pixel Mail)** | 像素信封按钮：支持邮件订阅、Telegram 频道、浏览器 Web Push |
| **商业赞助位 (`sponsor-rail`)** | **像素道具商店 (Item Shop)** | 屏幕两侧与移动端底部的 8-bit 道具卡片，支持赞助商自助认领 |

---

## 二、 法律合规与版权去风险标准 (Legal Compliance & IP De-risking)

为了确保产品在推特病毒传播、社区开源及后续商业化变现（Sponsor 广告）过程中拥有坚固的法律合规性，完全杜绝侵权风险（特别是防范任天堂等版权方的法务风险），确立以下三大去风险硬性标准：

### 1. 商标保护与命名红线 (Trademark Safety)
* **严禁出现的专有名词**：全站代码、页面标题、元数据（SEO/OG Tags）、URL 及官方推广文案中，**绝对不得出现** `Mario`, `Super Mario`, `Nintendo`, `Bowser`, `Luigi`, `Goomba` 等任天堂注册商标。
* **合规化通用术语替换**：
  * 产品名称：统一使用 **`WhenReset: 8-Bit Retro Edition`** 或 **`WhenReset.top`**。
  * 角色与场景代称：使用 **`Pixel Coder / Retro Player`**（玩家/开发者）、**`1-UP Block`**（问号金币砖）、**`Boss Alert`**（预警雷达）、**`World Stage`**（关卡热力图）。

### 2. 美术资产与视觉合法性 (Art & Assets Compliance)
* **风格公有领域保护**：在知识产权法中，“8-Bit 像素艺术 (Pixel Art)”、“红白机街机风格”属于通用公有领域的通用艺术流派，任何人均可合法使用，不存在风格垄断。
* **严禁提取使用受版权保护的原版立绘 (No Copyrighted Sprites)**：绝对不从任天堂原版 ROM 中提取或直接复制任何官方绘制的角色切片（如原版马里奥大叔全身像、官方怪物切片）。
* **资产 100% 自绘与开源**：
  * **字体**：全面采用 Google Fonts 开源商用字体 **`Press Start 2P`**（遵循 SIL Open Font License，100% 永久免费商用）。
  * **图像与图形**：采用纯 CSS 与自绘 SVG 几何像素图形（通用八角街机金币 🪙、通用像素方块、砖石纹理）。

### 3. 音频与媒体合规 (Audio Compliance)
* **不使用任何官方音频采样**：不提取任天堂原版游戏的顶金币音效、跳跃音效或背景音乐（BGM）。
* **合规替代方案**：采用纯粹的**视觉关键帧动画（Coin Jump Animation）+ 移动端触觉震动反馈（`navigator.vibrate`）**，既满足爽快解压的点击手感，又杜绝任何音频侵权隐患。

---

## 三、 8-Bit 复古像素 UI/UX 规范

### 1. 字体与排版
* **像素点阵字体 (Headings & Buttons)**：引入 Google Fonts 经典开源像素字体 `Press Start 2P`，用于大标题、倒计时、金币数值、按钮文本。
* **高可读性阅读字体 (Tweets & Content)**：推文正文与详细说明采用 `Inter / JetBrains Mono`，确保技术文本清晰易读，避免纯像素字体造成阅读疲劳。

### 2. 经典 8-Bit 街机调色盘 (Arcade Palette)
* **主背景**：
  * **地下关卡暗黑模式 (Underground Dark)**：`#0F111A`（夜幕黑）搭配像素点网格。
  * **平原关卡明亮模式 (Overworld Light)**：`#5C94FC`（天空蓝）到 `#F5F7FF` 的渐变。
* **角色与道具专色**：
  * **问号砖块金 (Coin Gold)**：`#FBD000`（高亮）/ `#D89B00`（阴影）。
  * **街机经典红 (Arcade Red)**：`#E52521`（按钮与关键提示）。
  * **水管幽灵绿 (Pipe Green)**：`#00A800`（正向状态、确认标志）。
  * **砖块棕 (Brick Brown)**：`#B84418`（热力图未激活格、卡片边框）。
* **像素阴影与边框法则**：
  * 放弃现代平滑圆角，采用经典硬核像素边缘：`border: 3px solid #000; box-shadow: 4px 4px 0px #000;`。

### 3. 微交互特效 (Pixel Animations)
* **顶砖块跳金币**：点击 `?` 按钮时，CSS 关键帧动画驱动金币向上冲刺 40px 并淡出，伴随 `+1` 像素字样。
* **触觉反馈 (Haptic)**：移动端点击调用 `navigator.vibrate(14)`，还原掌机按键触感。
* **Canvas 像素彩带**：重置生效时，屏幕飘落像素方块彩色纸屑。

---

## 四、 系统架构与极速开发设计

采用 **“Next.js 15 App Router + Edge 缓存代理 + 本地静态兜底”** 的零服务器纯前端架构：

```
whenreset/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # 根布局：引入 Press Start 2P 字体与像素主题变量
│   │   ├── page.tsx                # 核心单页：组装所有复古街机模块
│   │   ├── globals.css             # 像素阴影、按压动画、8-bit 边框样式
│   │   ├── sitemap.ts              # SEO 站点地图
│   │   ├── robots.ts               # 搜索引擎抓取规则
│   │   └── api/
│   │       ├── status/route.ts     # 代理竞品 /api/v1/status (带 60s Edge 缓存)
│   │       ├── resets/route.ts     # 代理竞品 /api/v1/resets (带 60s Edge 缓存)
│   │       └── plea/route.ts       # 祈求点击计数 (支持 LocalStorage / Upstash Redis)
│   ├── components/
│   │   ├── pixel/
│   │   │   ├── PixelHeader.tsx     # 像素顶部导航 (Logo, X 链接, 主题切换)
│   │   │   ├── PixelHero.tsx       # 状态看板、倒计时、问号金币砖块 (Plea Button)
│   │   │   ├── PixelStats.tsx      # 关卡统计条 (总次数, 平均天数 6.9d, 最长等待)
│   │   │   ├── PixelWatch.tsx      # 警报卡片与下注投票 (Betting Poll)
│   │   │   ├── PixelHeatmap.tsx    # 26 周超级关卡热力图
│   │   │   ├── PixelLog.tsx        # 冒险推文流时间线 (带展开/收起)
│   │   │   ├── PixelSubscribe.tsx  # 像素通信站 (邮件/Telegram 弹窗)
│   │   │   └── PixelSponsors.tsx   # 像素道具商店广告位
│   ├── data/
│   │   └── fallback-resets.json    # 53条历史全量兜底数据 (100% 容灾断网不白屏)
│   └── lib/
│       ├── types.ts                # TypeScript 接口定义
│       └── utils.ts                # 相对时间计算、像素震动函数
├── public/
│   ├── coin.svg                    # 自绘像素金币
│   ├── brick.svg                   # 自绘像素砖块
│   ├── mushroom.svg                # 自绘像素蘑菇
│   └── og-arcade.png               # 病毒推特分享封面图
├── package.json
└── tailwind.config.ts
```

### 数据层韧性设计
1. **API 路由带自动缓存**：Next.js 服务端抓取上游数据，配置 `next: { revalidate: 60 }`，防止高并发时被上游限频。
2. **零依赖静态兜底**：若上游服务异常，自动降级读取本地 `fallback-resets.json`，确保页面 100% 永不崩溃白屏。

---

## 五、 零成本、零维护部署方案

### 1. 部署步骤（3 步完成上线）
1. **代码推送**：本地开发调试完成，提交至 GitHub 仓库。
2. **连接 Vercel**：
   - 登录 Vercel，点击 `New Project` 导入 GitHub 仓库。
   - Framework Preset 自动识别为 `Next.js`，无须任何环境变量，直接点击 **Deploy**。
3. **绑定域名 `whenreset.top`**：
   - 在 Vercel 项目设置 `Domains` 中添加 `whenreset.top`。
   - 在域名 DNS 解析服务商处添加两条记录：
     - **CNAME 记录**：主机记录 `@`（或 `www`），记录值 `cname.vercel-dns.com`。
   - Vercel 自动申请并下发免费 SSL 证书，全站强制启用 HTTPS。

### 2. 运维与成本
* **服务器成本**：$0 / 月（Vercel 免费额度已足够支撑数十万 PV）。
* **数据库成本**：$0 / 月（静态构建 + Edge 缓存，无需常驻服务器）。
* **运维动作**：完全零运维，代码推送到 GitHub 自动触发部署。

---

## 六、 全套网站运营与推特破圈手册 (Operation Playbook)

### 阶段 1：点对点借势 OpenAI 负责人（最核心破圈点）
* **核心目标**：吸引 Tibo Sottiaux (`@thsottiaux`，OpenAI 负责按下重置按钮的人) 点赞、回复或转推。
* **破圈物料准备**：
  * 录制一段 10 秒的高清操作视频/GIF：鼠标疯狂敲击 8-bit 问号金币砖块，金币不断喷出，数字飙升。
* **推特发布文案示例**：
  > *"Hey @thsottiaux, the Codex community was burning through tokens, so we turned your reset button into a Retro 8-bit 1-UP Block! 🍄🪙*  
  > *Hit the block for 1-UP resets, check the 26-week pixel heatmap, and place your bets: https://whenreset.top*  
  > *(P.S. Boss is waiting, no pressure! 👾)* #OpenAI #Codex"*

### 阶段 2：社交矩阵自动化建设
1. **官方 X 账号**：创建 `@WhenReset`，定位为 *“Tracking OpenAI Codex limit resets in 8-bit Retro Arcade style.”*
2. **Telegram 频道**：创建 `t.me/whenreset`，提供给国内及海外重度开发者。
3. **推特转发机器**：设置推特关键词监听，只要监测到官方重置推文，自动带图发推。

### 阶段 3：社群病毒下注（Crowdsource Viral Loop）
* 充分利用网站的 **“Your Bet? [Yes] [No]”** 功能。
* 用户投票后，弹出带格式的预设推特：“*I just bet that Codex limits will reset within 3 hours on WhenReset.top! 82% of players agree with me. Will we get a 1-UP?*”
* 激发程序员的好胜心与抱团心理，形成自来水传播。

### 阶段 4：开发者生态扩展 (MCP 协议)
* 在网站页脚上线免费的 Remote MCP 端点，并向 `mcpservers.org`、Cursor 官方生态、GitHub Awesome-MCP 提交收录。
* 开发者可以直接在 Cursor / Claude Code 里询问：“*Ask WhenReset if Codex was reset today*”。

### 阶段 5：道具商店自助广告变现 (Sponsorship)
* 当流量达到日活过千时，开放两侧“道具商店”广告位。
* 针对 AI 编程工具、API 代理商、GPU 云厂商，定价 $199~$499/月，接入 Stripe 自助结账，实现独立开发者的被动收入。

---

## 七、 开发计划与任务拆解

| 序号 | 模块与文件 | 主要产出 | 预估工时 |
| :---: | :--- | :--- | :---: |
| **Step 1** | 项目工程初始化 | `package.json`, Tailwind v3.4 像素配置, `Press Start 2P` 字体集成 | 10 min |
| **Step 2** | 全局像素基础与主题 | `globals.css` (像素边框/阴影/金币跳跃动画), 经典天空蓝/暗黑地宫切换 | 15 min |
| **Step 3** | 数据层与接口代理 | `src/data/fallback-resets.json`, `/api/status`, `/api/resets` (带容灾) | 20 min |
| **Step 4** | 问号金币砖块与状态主屏 | `PixelHero.tsx` (倒计时、金币跳动动画、震动、实时计数) | 30 min |
| **Step 5** | 关卡统计条与警报雷达 | `PixelStats.tsx`, `PixelWatch.tsx` (预测下注、推特一键分享) | 25 min |
| **Step 6** | 26周超级关卡热力图 | `PixelHeatmap.tsx` (像素方格矩阵、悬停推文卡片) | 30 min |
| **Step 7** | 冒险推文编年史流 | `PixelLog.tsx` (倒序对话框气泡、展开收起、推特外链) | 20 min |
| **Step 8** | 导航、订阅弹窗与道具商店 | `PixelHeader.tsx`, `PixelSubscribe.tsx`, `PixelSponsors.tsx` | 20 min |
| **Step 9** | 生产构建与 Vercel 部署验证 | `npm run build` 静态类型检查与上线验证 | 10 min |

---

## 八、 验证计划 (Verification Plan)

### 自动化与构建验证
- 运行 `npm run build` 确保 TypeScript 零错误、SSR 静态渲染无水合异常（Hydration mismatch）。
- 验证 `/api/status` 与 `/api/resets` 接口在离线状态与在线状态下的平滑降级。

### 交互与视觉走查
- **问号砖块测试**：点击问号砖块，测试金币喷出动画、触觉震动反馈、数字平滑滚动。
- **热力图走查**：检查 26 周 180+ 天日期计算无偏移，悬停气泡正确显示当天对应推文。
- **响应式适配**：在桌面端（左右道具展位正常悬浮）与手机端（自适应堆叠，问号砖块居中大尺寸）分别验证。
