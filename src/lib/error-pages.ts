export type ErrorPlatform = "Codex" | "Claude";

export interface Bilingual {
  en: string;
  zh: string;
}

export interface ErrorPageEntry {
  slug: string;
  platform: ErrorPlatform;
  /** The wording users actually see; versions differ, so we describe rather than fake an exact string. */
  errorText: Bilingual;
  where: Bilingual;
  meaning: Bilingual;
  fixes: Bilingual[];
  fallbacks: Bilingual[];
  officialSource: string;
  officialLabel: Bilingual;
}

export const ERROR_PAGES: ErrorPageEntry[] = [
  {
    slug: "codex-message-limit-reached",
    platform: "Codex",
    errorText: {
      en: 'A "usage limit reached" / "you have hit your limit" notice from Codex CLI, the Codex web app, or the IDE extension.',
      zh: "Codex CLI、Codex 网页版或 IDE 插件提示「已达使用上限 / usage limit reached」。",
    },
    where: {
      en: "Shown at the start of a new request, before any token is spent.",
      zh: "通常在发起新请求时立即出现，不会消耗任何 token。",
    },
    meaning: {
      en: "Your rolling allowance is exhausted. It is consumed by message count and token weight (reasoning tokens included), not by wall-clock time.",
      zh: "滚动额度已耗尽。额度按「消息条数 × token 权重」消耗（含推理思考 token），与当前时间无关。",
    },
    fixes: [
      {
        en: "Wait for the rolling window to restore: allowance returns in slices, so retry after the cooldown instead of hammering the endpoint.",
        zh: "等待滚动窗口恢复：额度是按份逐步返还的，冷却后再重试，不要连续高频请求。",
      },
      {
        en: "Use banked reset cards if your plan grants them - they are on-demand and can be spent the moment you are blocked.",
        zh: "若套餐发放过重置卡（banked reset），直接手动使用，这是按需支取的即时额度。",
      },
      {
        en: "Batch your work: one large well-scoped request beats many small ones when the limit counts messages.",
        zh: "合并任务：额度按消息条数计时，一次大而清晰的请求优于多次碎片请求。",
      },
    ],
    fallbacks: [
      {
        en: "Switch to a cheaper model for mechanical work, keep the strong model for the hard part.",
        zh: "机械性工作切到更便宜的模型，把强模型留给真正困难的部分。",
      },
      {
        en: "Keep a local patch-based workflow so you can keep editing while blocked.",
        zh: "保持本地补丁式工作流，被限时仍可继续手工编辑。",
      },
    ],
    officialSource: "https://help.openai.com/en/articles/11031357-codex-rate-limits-and-quotas",
    officialLabel: { en: "OpenAI Help: Codex rate limits", zh: "OpenAI 帮助中心：Codex 限额说明" },
  },
  {
    slug: "codex-rate-limit-exceeded",
    platform: "Codex",
    errorText: {
      en: "HTTP 429 / \"rate limit exceeded\" returned by the Codex API or CLI.",
      zh: "Codex API 或 CLI 返回 HTTP 429 /「rate limit exceeded」。",
    },
    where: {
      en: "Mid-session, usually right after a burst of parallel or rapid-fire requests.",
      zh: "多出现在会话中途，尤其是并发或高频连续请求之后。",
    },
    meaning: {
      en: "You tripped a short-window request throttle. This is separate from the weekly/rolling message allowance and clears much faster.",
      zh: "触发的是短时间窗口的请求频率限制，与滚动/每周消息额度是两套机制，恢复也快得多。",
    },
    fixes: [
      {
        en: "Retry with exponential backoff; respect the retry-after hint instead of retrying instantly.",
        zh: "用指数退避重试，遵循响应中的 retry-after 提示，不要立即重发。",
      },
      {
        en: "Cut concurrency: run one agent stream at a time instead of several in parallel.",
        zh: "降低并发：一次只跑一条 Agent 流，不要同时开多条。",
      },
      {
        en: "Trim context. Huge prompts and long histories push you toward the throttle faster.",
        zh: "压缩上下文：超长 prompt 与历史记录会更快把你推向频率上限。",
      },
    ],
    fallbacks: [
      {
        en: "Queue non-urgent work locally and resume once the throttle window passes.",
        zh: "把非紧急任务本地排队，等限频窗口过去再继续。",
      },
    ],
    officialSource: "https://help.openai.com/en/articles/5955598-api-rate-limits",
    officialLabel: { en: "OpenAI Help: API rate limits", zh: "OpenAI 帮助中心：API 限频说明" },
  },
  {
    slug: "claude-out-of-messages",
    platform: "Claude",
    errorText: {
      en: 'The "Claude AI usage limit reached" notice that includes a specific reset timestamp.',
      zh: "Claude 提示「usage limit reached」，并附带一个具体的重置时间。",
    },
    where: {
      en: "At the beginning of a turn in Claude Code, Claude Desktop or claude.ai.",
      zh: "出现在 Claude Code、Claude 桌面版或网页端发起新对话时。",
    },
    meaning: {
      en: "The 5-hour rolling window is fully consumed. The stated timestamp is authoritative for your account - it is not the same as OpenAI's global drops.",
      zh: "5 小时滚动窗口已用满。界面给出的时间戳对你账号是权威的，它与 OpenAI 的全局掉落是两套独立机制。",
    },
    fixes: [
      {
        en: "Wait for the stated reset time; plan work around the five-hour boundary instead of guessing.",
        zh: "按界面给出的时间等待，围绕 5 小时边界排期，不要靠猜。",
      },
      {
        en: "Stretch each window: write precise specs first, then let the model execute in one pass.",
        zh: "拉长每个窗口的产出：先把需求写清楚，再让模型一次性执行。",
      },
    ],
    fallbacks: [
      {
        en: "Work from your own diffs and tests while the window refills.",
        zh: "窗口回血期间，先用手工 diff 与测试推进。",
      },
    ],
    officialSource: "https://support.anthropic.com/en/articles/8324991-about-claude-s-usage-limits",
    officialLabel: {
      en: "Anthropic Support: usage limits",
      zh: "Anthropic 支持中心：使用限额说明",
    },
  },
  {
    slug: "claude-hit-rate-limit",
    platform: "Claude",
    errorText: {
      en: 'A 429 / "you have hit your rate limit" response while Claude is actively working.',
      zh: "使用过程中返回 429 /「you have hit your rate limit」。",
    },
    where: {
      en: "Mid-task, typically with long contexts or heavy tool-calling loops.",
      zh: "多出现在任务中途，常见于超长上下文或密集工具调用循环中。",
    },
    meaning: {
      en: "Short-window throttling rather than quota exhaustion. Token weight and request frequency both count.",
      zh: "属于短时间限频，不是额度耗尽。token 权重与请求频率都会计入。",
    },
    fixes: [
      {
        en: "Reduce context: compact the conversation, drop unused files from the working set.",
        zh: "降低上下文：压缩对话、把无关文件移出工作集。",
      },
      {
        en: "Slow the loop - fewer automated retries per minute keeps you under the throttle.",
        zh: "放慢循环：每分钟自动重试次数降下来，就不容易触碰限频。",
      },
    ],
    fallbacks: [
      {
        en: "Split the task across windows and write the plan down between runs.",
        zh: "把任务拆到多个窗口执行，两次之间把计划写下来。",
      },
    ],
    officialSource: "https://docs.anthropic.com/en/api/rate-limits",
    officialLabel: { en: "Anthropic Docs: rate limits", zh: "Anthropic 文档：速率限制" },
  },
];

export function getErrorPage(slug: string): ErrorPageEntry | undefined {
  return ERROR_PAGES.find((page) => page.slug === slug);
}
