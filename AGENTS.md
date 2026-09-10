# WhenReset 工程契约与规范 (AGENTS.md)

> 本文件是 `whenreset` 项目的跨 Agent 规矩。所有进场 Agent 必须遵守。

---

## 一、 项目愿景与技术栈

- **定位**：1:1 像素级复刻 OpenAI Codex 额度重置追踪站，全面重塑为**超级马里奥（8-bit Retro Pixel）**趣味极客风格。
- **技术栈**：
  - Next.js 15 (App Router) + React 19 + TypeScript
  - Tailwind CSS + Lucide Icons + `Press Start 2P` 像素字体
  - 零服务器部署：Vercel Edge 缓存 + 本地静态 JSON 双重容灾

---

## 二、 像素设计规范 (Pixel Aesthetics)

1. **绝对拒绝现代平滑圆角**：
   - 必须使用坚硬像素直角：`rounded-none`。
   - 核心边框：`border-[3px] border-black` 或 `border-2 border-black`。
   - 核心阴影：`shadow-[4px_4px_0px_#000]` 或 `shadow-[2px_2px_0px_#000]`。
2. **调色盘标准**：
   - 地下关卡（Dark）：背景 `#0F111A`
   - 平原关卡（Light）：背景 `#5C94FC` 到 `#F5F7FF`
   - 问号金币黄：`#FBD000`
   - 马里奥红：`#E52521`
   - 水管幽灵绿：`#00A800`
   - 砖块棕：`#B84418`
3. **字体配比**：
   - 标题、倒计时、数值、按钮：`font-pixel` (`Press Start 2P`)
   - 长篇推文、说明文本：系统等宽或无衬线字体（确保阅读舒适度，避免纯像素密集排版导致眩晕）

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
