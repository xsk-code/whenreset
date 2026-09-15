# WhenReset 工程契约与规范 (AGENTS.md)

> 本文件是 `whenreset` 项目的跨 Agent 规矩。所有进场 Agent 必须遵守。

---

## 一、 项目愿景与技术栈

- **定位**：OpenAI Codex、Claude 等主流 AI 编码工具速率与配额重置实时预测追踪雷达（Live AI Quota Reset Radar），面向全球开发者的高可用极客遥测看板。
- **技术栈**：
  - Next.js 15 (App Router) + React 19 + TypeScript
  - Tailwind CSS + Lucide Icons + `Inter` 无衬线与 `JetBrains Mono` 等宽字体
  - 零服务器单点故障：Vercel Edge 缓存 + 本地静态 JSON 双重容灾

---

## 二、 现代化设计规范 (Frosted-Glass & Telemetry Aesthetics)

1. **暗黑深空与磨砂玻璃质感 (Glassmorphism)**：
   - 全站基底：深空暗黑背景 `#080B11`，配合微弱点阵背景（`.bg-grid-pattern`）。
   - 核心面板：采用 `.glass-panel`（`backdrop-filter: blur(16px)`，`border: 1px solid rgba(255, 255, 255, 0.08)`）。
   - 微圆角体系：根据组件层级规范采用 `rounded-lg` (8px)、`rounded-xl` (12px) 或 `rounded-2xl` (16px)，提供细腻触感。
2. **状态色彩与脉冲指示灯 (Telemetry Color Palette)**：
   - 核心活跃 / 实时监控：翡翠绿 `#10B981`（`animate-pulse` 发光脉冲）
   - 告警与临界态：琥珀黄 `#F59E0B`
   - 动态信号与链接：科技蓝 `#3B82F6`
   - 次级文本与边框：`#94A3B8` (slate-400) / `rgba(255, 255, 255, 0.08)`
3. **字体排版平衡**：
   - 界面常规标签、说明文本、正文：系统现代无衬线 `Inter`
   - 倒计时、概率数值、时间戳、终端代码：高可读性等宽字体 `JetBrains Mono` / `monospace`，保证数据列对齐与技术硬核质感。

---

## 三、 数据韧性与 API 纪律

1. **永远不依赖单点**：
   - `/api/status` 与 `/api/resets` 默认代理并缓存上游数据（`revalidate: 60`）。
   - 一旦上游不可达或被限频，自动降级为读取 `src/data/fallback-resets.json`。
   - 页面 100% 永不白屏。
2. **无私有用户数据**：
   - 本项目所有数据来自公开推特与公开接口，绝不存储任何敏感凭据。

---

## 四、 Agent 执行与交付纪律

1. **严格按任务卡工作**：
   - 进场先核查任务卡的「修改边界」与「非目标」。
   - 严禁越过卡片边界“顺手优化”其他组件。
2. **小步验证与门禁**：
   - 每次改动必须能够通过 `npm run build`。
   - 未经验收，不得擅自执行 `git commit`。
3. **交付格式规范**：
   - 执行层必须按四段式（做了什么、没做什么、建议主脑决策、门禁结果）交付。

---

## 五、 分支与并行纪律（防伪并行与大包越权）

1. **强制独立特性分支**：
   - **严禁直接在 main 分支上写代码与提交**。
   - 任务卡开工的第一条命令必须是：`git checkout -b feat/<task-id>`。
2. **并行必须物理隔离**：
   - 并行任务必须通过 `git worktree add -b feat/<id> ../whenreset-<id> main` 开设在不同物理目录下。
   - **严禁在同一个工作区内假装多 Agent 并行**。
3. **单卡提交颗粒度**：
   - 严禁单次提交超过 1500 行；每次提交必须精确绑定单一 Task-Id。
   - 仓库已安装 `.git/hooks/pre-commit` 机械门禁，任何对 main 分支的直接提交或超大提交将被物理拦截报错。
