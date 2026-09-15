export interface Bilingual {
  en: string;
  zh: string;
}

export interface RuleEntry {
  id: string;
  title: Bilingual;
  summary: Bilingual;
  details: Bilingual[];
  source: string;
  sourceLabel: Bilingual;
}

export const RULES: RuleEntry[] = [
  {
    id: "rolling-window",
    title: {
      en: "How the rolling window is counted",
      zh: "滚动窗口到底怎么算",
    },
    summary: {
      en: "Limits refill continuously from the moment each request is spent, not at a fixed midnight reset.",
      zh: "额度是随着每条请求的消耗「连续回血」，而不是在每天零点统一重置。",
    },
    details: [
      {
        en: "Claude Code and claude.ai run on a rolling window: capacity frees up progressively as the oldest usage ages out. Anthropic publishes a fixed window length (five hours on current plans) and shows you the exact refill timestamp in-product.",
        zh: "Claude Code 与网页版采用滚动窗口：最早的那部分用量会随时间逐步释放。Anthropic 公开了窗口长度（当前套餐为 5 小时），并在产品内直接给出具体的恢复时间。",
      },
      {
        en: "Codex usage is also consumed against a rolling allowance, layered with plan-level caps. Because OpenAI does not publish one universal number, the in-product meter beats any third-party estimate.",
        zh: "Codex 同样是滚动额度，并叠加套餐层级的封顶。由于 OpenAI 未公开一个统一数值，产品内显示的额度表比任何第三方推算都可靠。",
      },
      {
        en: "Practical consequence: a single large request is cheaper against the window than many small ones when the allowance counts messages.",
        zh: "实际影响：当额度按消息条数计时，一次大的请求比多次碎片请求更省。",
      },
    ],
    source: "https://support.anthropic.com/en/articles/8324991-about-claude-s-usage-limits",
    sourceLabel: { en: "Anthropic: about usage limits", zh: "Anthropic：使用限额说明" },
  },
  {
    id: "thinking-tokens",
    title: {
      en: "Do thinking tokens and prompt caching count?",
      zh: "思考 token 与 prompt 缓存扣不扣额度",
    },
    summary: {
      en: "Reasoning tokens count as output. Cache hits save latency and cost, but they are still requests.",
      zh: "推理 token 按输出计费；缓存命中省的是延迟和成本，请求本身仍然占额度。",
    },
    details: [
      {
        en: "Reasoning (thinking) tokens are billed as output tokens, so they consume the same allowance as a visible answer. Long reasoning traces are the most common reason a limit disappears faster than expected.",
        zh: "推理（thinking）token 按输出 token 计费，与可见回答占用同一份额度。长推理链是额度比预期更快见底的最常见原因。",
      },
      {
        en: "Prompt caching reduces latency and per-token cost on cache hits, but cached input is still input that passes through the endpoint and still counts against request and token rate limits.",
        zh: "Prompt 缓存能降低命中部分的延迟与单 token 成本，但缓存命中的输入依然是经过接口的输入，仍计入请求与 token 速率限制。",
      },
      {
        en: "If you need to stretch a window, lower the reasoning effort or shorten the context before you lower the model quality.",
        zh: "想拉长窗口，优先降低推理强度或缩短上下文，而不是先降模型质量。",
      },
    ],
    source: "https://help.openai.com/en/articles/11031357-codex-rate-limits-and-quotas",
    sourceLabel: { en: "OpenAI: Codex rate limits and quotas", zh: "OpenAI：Codex 限额与配额" },
  },
  {
    id: "banked-cards",
    title: {
      en: "How banked reset cards work",
      zh: "重置卡（banked reset）的生效机制",
    },
    summary: {
      en: "An on-demand refill credited to your account; you decide when to spend it. Expiry rules follow the official wording, not community lore.",
      zh: "发放到你账号的按需补给，何时使用由你决定；过期规则以官方说明为准，而非社区传闻。",
    },
    details: [
      {
        en: "A banked reset sits in your account until you trigger it, which makes it the fastest legal escape when you are blocked mid-task.",
        zh: "重置卡会留在账号里等你手动触发，因此是任务中途被限时最快的正规解法。",
      },
      {
        en: "This tracker records every announced drop with its source link, so you can verify which events were global resets and which were compensation cards.",
        zh: "本站对每一次公告掉落都保留了来源链接，你可以自行核验哪次是全员重置、哪次是补偿卡。",
      },
      {
        en: "Because expiry terms can change, treat any fixed number of days you read online as unverified until you see it in your own dashboard.",
        zh: "过期规则可能随政策调整，网上看到的固定天数在你自己的后台确认之前，都应视为未核实。",
      },
    ],
    source: "https://status.openai.com",
    sourceLabel: { en: "OpenAI status", zh: "OpenAI 服务状态" },
  },
  {
    id: "global-resets",
    title: {
      en: "Why surprise global resets happen",
      zh: "为什么会突然全员重置",
    },
    summary: {
      en: "Periodic drop events are a human decision on the provider side, historically clustered around incidents and launches.",
      zh: "周期性的全员掉落是服务方的人工决策，历史上集中在故障与发布期。",
    },
    details: [
      {
        en: "Global resets are triggered by the provider, not by a schedule you can compute. Any site claiming a guaranteed time is guessing.",
        zh: "全员重置由服务方触发，不存在可以推算的固定时刻表。任何宣称「保证几点重置」的站点都是在猜。",
      },
      {
        en: "In the public record archived here, drops cluster around service incidents and major model rollouts, which is why this tracker feeds live incident data into its forecast.",
        zh: "在本站归档的公开记录里，掉落集中在服务故障与重大模型发布期间，这也是本站把实时故障数据纳入预测的原因。",
      },
      {
        en: "The honest posture: treat the percentage as weather, not a timetable, and keep a fallback workflow ready.",
        zh: "诚实的态度是：把百分比当天气预报而非时刻表，并始终准备好降级工作流。",
      },
    ],
    source: "https://x.com/thsottiaux",
    sourceLabel: {
      en: "Tibo Sottiaux on X (reset announcements)",
      zh: "Tibo Sottiaux 的 X（重置公告）",
    },
  },
];
