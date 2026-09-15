# WhenReset 出海独立站运维与增长实战手册 (Operations Playbook)

> **版本**：v2.0  
> **指导思想**：结合「生财有术」精选库出海操盘手实战沉淀（子木《AI 工具站 SEO 从 0 到 1 小册子》、大林子《日活 1200+ 出海做站复盘》、秀才《AI 出海工具站踩坑实录》），专为 **WhenReset (AI Quota Reset Radar)** 量身定制的极简落地指南。

---

## 目录
- [一、 域名与邮箱闭环配置 (5 分钟)](#一-域名与邮箱闭环配置-5-分钟)
- [二、 Google Search Console (GSC) 索引与验证指南](#二-google-search-console-gsc-索引与验证指南)
- [三、 生财出海工具站 Top 20 目录站 / 外链提交通道](#三-生财出海工具站-top-20-目录站--外链提交通道)
- [四、 网站流量与行为事件监控指南](#四-网站流量与行为事件监控指南)
- [五、 每日 5 分钟无人值守轻量运维 SOP](#五-每日-5-分钟无人值守轻量运维-sop)

---

## 一、 域名与邮箱闭环配置 (5 分钟)

为确保赞助商、广告主能够联系到您，且无需购买昂贵的 Google Workspace / 域名企业邮，推荐使用 **Cloudflare Email Routing（完全免费）**：

1. **登录 Cloudflare** -> 进入 `whenreset.top` 域名管理控制台。
2. 侧边栏点击 **Email (电子邮件)** -> **Email Routing (电子邮件路由)** -> 点击启用。
3. **添加自定义地址 (Custom address)**：
   - 自定义邮箱：`sponsor@whenreset.top`
   - 转发目的地 (Destination address)：输入您的真实个人邮箱（如 `2475986535@qq.com` 或个人 Gmail）。
4. 在个人邮箱中点击确认邮件激活验证。
5. **测试验证**：用另一个邮箱向 `sponsor@whenreset.top` 发送一封测试邮件，确认个人收件箱能正常接收。

---

## 二、 Google Search Console (GSC) 索引与验证指南

1. 登录 [Google Search Console](https://search.google.com/search-console)。
2. 选择 **网址前缀 (URL Prefix)**，输入 `https://whenreset.top`。
3. 验证方式选择 **HTML 标记 (HTML Tag)**。
4. 本项目已在 `src/app/layout.tsx` 中预先注入 Verification Code：
   ```html
   <meta name="google-site-verification" content="slY1HVnTseRcBnZ7E3RnMods60NuQxmnNO2Jn70DywA" />
   ```
5. 点击验证即可通过。随后提交 Sitemap：`https://whenreset.top/sitemap.xml`。

---

## 三、 生财出海工具站 Top 20 目录站 / 外链提交通道

### 1. 核心高权重工具目录站名单
| 目录站名称 | 官网地址 | 权重与特点 | 推荐分类 |
|---|---|---|---|
| **Product Hunt** | `producthunt.com` | 全球最大的新科技发布平台 | Developer Tools / AI |
| **Theres An AI For That** | `theresanaiforthat.com` | 全球最大 AI 工具聚合目录 | Developer Tools |
| **Toolify.ai** | `toolify.ai` | 出海头部 AI 导航，流量巨大 | Coding / AI Assistant |
| **Futurepedia** | `futurepedia.io` | 老牌权威 AI 工具库 | Coding / Productivity |
| **AI Top Tools** | `aitoptools.com` | 审核较快，Dofollow 外链 | Development |
| **Dang.ai** | `dang.ai` | 界面极客，收录快 | Developer Tools |

### 2. 提交物料预设卡（直接复制使用）

```text
[Name / Title]:
WhenReset — Live AI Quota Reset Radar for OpenAI Codex & Claude

[Tagline]:
Real-time AI quota reset tracking radar & forecast countdown for developers.

[Short Description]:
WhenReset is a real-time developer telemetry radar predicting OpenAI Codex and Claude quota resets. Features statistical probability forecasting, 26-week historical heatmap, dynamic RFC 5545 iCalendar sync, and multi-channel developer alert pipelines.

[Website URL]:
https://whenreset.top

[MCP Server URL]:
https://whenreset.top/api/mcp

[Tags / Keywords]:
OpenAI Codex, Rate Limits, Reset Radar, Model Context Protocol, MCP, Cursor AI, Claude Code, Developer Telemetry, Developer Tools
```

---

## 四、 网站流量与行为事件监控指南

本项目已无缝集成 **Vercel Analytics** 与标准化核心事件打点，在无需 Cookie 授权弹窗的前提下完整保护访客隐私。

### 核心监测指标与事件清单：

| 事件名 (`eventName`) | 触发场景 | 业务意义 (生财指标) |
| :--- | :--- | :--- |
| `subscribe_modal_opened` | 用户点击顶部 `[ 🔔 订阅提醒 ]` | 衡量访客对“额度提醒”的意向强度 |
| `subscribe_email_submitted` | 用户在通信站提交邮箱 | 订阅转化率 (Lead Conversion) |
| `telegram_beacon_clicked` | 用户点击 Telegram 通道 | 评估是否有必要尽快开设官方 TG 群 |
| `mario_block_hit` | 用户顶撞问号方块抽金币 | 页面趣味性与粘性互动频次 |
| `sponsor_clicked` | 用户点击道具展台中的赞助位 | 商业赞助展台的吸引力 |
| `footer_sponsor_mail_clicked` | 用户点击页脚商务邮箱发信 | 商业直连询盘意向 |
| `footer_sponsor_email_copied` | 用户在页脚点击复制邮箱 | 商务潜在合作线索 |

---

## 五、 每日 5 分钟无人值守轻量运维 SOP

对于独立开发者 / 小微出海工具，**切忌陷入每天几个小时人工刷数据的内耗**。建立每日 5 分钟极简工作流即可：

1. **第 1 分钟：看 GitHub Actions 运行状态**
   - 确认 `.github/workflows/sync-upstream.yml` 是否每 4 小时正常运行。
   - 若出现绿勾，说明数据自动同步正常，无需人工介入。
2. **第 2 分钟：看 GSC (每周一次即可)**
   - 查看近 7 天“总点击次数”与“总展示次数”曲线是否平稳向上。
   - 关注“页面”栏目，确认主页是否被正常编入索引。
3. **第 3 分钟：看 Vercel Analytics / 流量**
   - 查看每日访问量（UV）、Top 来源国家（如 US / JP / DE 等海外比例）。
   - 查看 `subscribe_email_submitted` 留资数量。
4. **第 4~5 分钟：查收个人邮箱 (sponsor 转发)**
   - 查看是否有来自广告商、API 平台或开发者的合作意向信件。
