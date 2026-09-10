# 🌐 WhenReset MCP 开源生态收录申报与发布模版

> **目的**：将 WhenReset MCP 官方端点提交收录至全球主流 Model Context Protocol (MCP) 注册中心、Awesome 资源聚合库与开发者社区，打通 AI 智能体开箱即用生态。  
> **官方端点**：`https://whenreset.com/api/mcp`  
> **协议版本**：`2024-11-05` (Anthropic MCP Standard)  
> **鉴权需求**：公开免费 / 无需 API Key (Zero Authentication)

---

## 一、 项目规范元数据 (Canonical Metadata)

| 字段 | 标准取值 |
|---|---|
| **Server Name** | `whenreset-mcp` |
| **Display Name** | WhenReset: OpenAI Codex Quota Radar |
| **Short Description** | Real-time OpenAI Codex quota reset forecast, cadence intelligence, and historical telemetry radar for AI coding agents. |
| **Long Description** | WhenReset MCP equips AI coding agents (Cursor, Claude Desktop, Windsurf, Roo Code) with real-time rate limit intelligence. Agents can autonomously query quota reset probabilities, historical cadence cycles, and official announcements to optimize batch prompt scheduling and avoid mid-task rate limit starvation. |
| **Transport** | Streamable HTTP (JSON-RPC 2.0) & REST (`GET`/`POST`) |
| **Endpoint URL** | `https://whenreset.com/api/mcp` |
| **Homepage** | `https://whenreset.com` |
| **Repository** | `https://github.com/your-org/whenreset` |
| **License** | MIT |
| **Author** | WhenReset Open Source Community |
| **Categories** | `developer-tools`, `productivity`, `monitoring`, `ai-workflow` |
| **Tags** | `mcp`, `cursor`, `claude`, `openai`, `codex`, `rate-limits`, `retro-gaming` |

---

## 二、 `mcpservers.org` 提交模板 (YAML / Markdown Spec)

### 提交 PR / Issue 模版
```yaml
name: whenreset-mcp
title: WhenReset Codex Quota Radar
description: Real-time OpenAI Codex quota reset forecast and cadence intelligence for AI agents.
website: https://whenreset.com
repository: https://github.com/your-org/whenreset
license: MIT
transport:
  type: http
  url: https://whenreset.com/api/mcp
authentication:
  type: none
tools:
  - name: check_codex_reset_status
    description: Query current OpenAI Codex quota reset forecast probability, days elapsed since last reset, average cadence, and threat status level (NORMAL / ELEVATED / CRITICAL).
  - name: get_recent_resets
    description: Retrieve recent OpenAI Codex quota reset announcements, including UTC timestamps, reset type (regular/banked), text, and direct X/Twitter source link.
tags:
  - developer-tools
  - rate-limits
  - openai
  - coding-agents
```

---

## 三、 `awesome-mcp-servers` GitHub PR 模版

### PR Title: `feat: add WhenReset Codex quota radar MCP server`

### PR Description:
```markdown
### Summary
This PR adds **WhenReset MCP** to the Developer Tools / Monitoring section.

### Server Details
- **Name**: WhenReset (`whenreset-mcp`)
- **Homepage**: [https://whenreset.com](https://whenreset.com)
- **Repo**: [https://github.com/your-org/whenreset](https://github.com/your-org/whenreset)
- **Endpoint**: `https://whenreset.com/api/mcp`
- **Transport**: Streamable HTTP / REST (Zero-install, no local daemon required)
- **License**: MIT

### Tools Provided
- `check_codex_reset_status`: Forecasts quota reset likelihood (0-99%) and threat levels (`NORMAL`, `ELEVATED`, `CRITICAL`).
- `get_recent_resets`: Fetches confirmed reset history with timestamps and official Twitter/X source posts.

### Why It's Useful
Developers building heavy multi-agent pipelines with OpenAI Codex in Cursor or Claude Code frequently get disrupted by unexpected quota lockouts. WhenReset MCP allows agents to autonomously check if a quota refresh is imminent before embarking on large code migrations.

### Checklist
- [x] Server follows the MCP specification (`2024-11-05`).
- [x] No proprietary secrets or private credentials required.
- [x] Endpoints are publicly accessible with 99.9% uptime Edge caching.
```

### README Markdown 增量条目 (Diff / Insert Block)
```markdown
- [WhenReset](https://github.com/your-org/whenreset) - Real-time OpenAI Codex quota reset forecast probability, cadence intelligence, and telemetry radar for AI coding agents (`https://whenreset.com/api/mcp`).
```

---

## 四、 Cursor 官方论坛 (forum.cursor.com) 宣传展示帖

**Category**: Showcase / Discussions  
**Title**: [Showcase] Stop guessing Codex rate limits: WhenReset MCP brings real-time reset radar into Cursor

**Body**:
```markdown
Hi Cursor team & community,

If you build with Cursor Composer and heavy prompt chains, you know the pain of hitting a sudden OpenAI Codex rate limit in the middle of a refactor.

We built a public, zero-setup MCP server that brings **WhenReset** (the 8-bit retro Codex radar) directly into Cursor:

### ⚡ What It Does
When connected, your Cursor Agent can call two native tools:
1. `check_codex_reset_status`: Tells you the reset probability (0-99%), days elapsed, and status (`NORMAL`, `ELEVATED`, `CRITICAL`).
2. `get_recent_resets`: Shows the latest verified quota refuels from @thsottiaux.

### 🛠️ 1-Minute Setup
Add this to your `~/.cursor/mcp.json`:

\`\`\`json
{
  "mcpServers": {
    "whenreset": {
      "url": "https://whenreset.com/api/mcp"
    }
  }
}
\`\`\`

### 💡 How to Use
Ask Composer:
> *"What's the current Codex quota status? Is a reset imminent?"*

Composer will call the tool and reply:
> *"Current threat level is CRITICAL (88% likelihood). It's been 7.2 days since the last reset against a 6.9-day cadence. A quota refresh is expected shortly."*

Web UI (8-bit NES edition): https://whenreset.com  
Direct endpoint: `https://whenreset.com/api/mcp`

Looking forward to your thoughts and suggestions!
```

---

## 五、 Smithery.ai & Glama.ai 申报物料 (Registry Package Config)

### `smithery.yaml` 规格
```yaml
name: whenreset
version: 1.0.0
description: Real-time OpenAI Codex quota reset forecast and cadence intelligence.
author: WhenReset Community
license: MIT
repository: https://github.com/your-org/whenreset
homepage: https://whenreset.com
tools:
  - name: check_codex_reset_status
    description: Query current Codex quota reset probability and cadence status.
  - name: get_recent_resets
    description: Retrieve recent quota reset logs with UTC timestamps.
connections:
  http:
    url: https://whenreset.com/api/mcp
```

### Glama MCP Registry 标签配置
- **Tags**: `OpenAI`, `Codex`, `Quota`, `RateLimit`, `Cursor`, `Developer-Tools`
- **Icon**: `https://whenreset.com/opengraph-image` (1200x630 retro arcade HUD)
- **Quick Test Command**: `curl -s https://whenreset.com/api/mcp?tool=check_codex_reset_status`
