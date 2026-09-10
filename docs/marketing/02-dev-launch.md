# ⚡ AI 开发者社区推广物料与 MCP 极速接入指南

> **目标受众**：Cursor, Claude Code, Windsurf, Roo Code, Cline 及 AI 编码智能体重度开发者。  
> **核心痛点**：重构到一半突遭 OpenAI Codex 限流掐断；频繁切出 IDE 刷 Twitter 确认重置极其低效；需要智能体在执行批处理任务前自主探测额度水位。  
> **解决方案**：基于标准 Model Context Protocol (MCP)，将 WhenReset 额度雷达直接接入 IDE 与智能体工作流。

---

## 一、 社交媒体推广推文套件 (Social Media Launch Kit)

### 1. X / Twitter 破圈主推文 (Hook & Thread)

#### 主推文 (Lead Tweet - 269 chars)
```text
Stop alt-tabbing to Twitter to check if OpenAI Codex limits have reset. 🛑

We built a public Model Context Protocol (MCP) server for @cursor_ai & Claude Code:

⚡ "Check Codex reset probability"
📊 "Show recent refill history"

Zero API keys. 1-click config:
👉 https://whenreset.com
```

#### Thread 展开第 2 推：痛点与实机演示 (Thread #2 - 275 chars)
```text
How it works in your editor:

Before running a 40-file refactor or full test suite generation, just ask Cursor:
"What's the current Codex quota status?"

Cursor calls `check_codex_reset_status`:
- Threat Level: CRITICAL (88% prob)
- Elapsed: 7.2d (Avg: 6.9d)
- Advice: Heavy surge imminent! 🍄
```

#### Thread 展开第 3 推：开源与即用配置 (Thread #3 - 262 chars)
```text
Setup takes 15 seconds. Just paste this into `~/.cursor/mcp.json`:

{
  "mcpServers": {
    "whenreset": {
      "url": "https://whenreset.com/api/mcp"
    }
  }
}

Also works with Claude Desktop, Windsurf, and REST curl.
Full documentation: https://whenreset.com
#CursorAI #ClaudeCode #MCP
```

---

### 2. Reddit 社区发帖模板 (r/cursor, r/ClaudeAI, r/LocalLLaMA)

**Title**: [Showcase] I built a free MCP server so Cursor & Claude can tell you when OpenAI Codex quotas will reset

**Body**:
```markdown
Hey everyone,

Like many of you, I've had my flow completely broken during late-night coding sessions when OpenAI Codex suddenly hits rate limits. We usually end up manually monitoring @thsottiaux's X feed to guess when the next quota refresh drops.

To solve this for AI developers, we launched **WhenReset MCP**:
A public, zero-authentication Model Context Protocol server that exposes real-time quota forecast probability, average historical cadence, and official reset logs directly to your AI agents.

### 🎮 What tools are exposed?
1. `check_codex_reset_status`: Returns current reset likelihood percentage, elapsed days, cadence, and alert level (`NORMAL` / `ELEVATED` / `CRITICAL`).
2. `get_recent_resets`: Returns the last N confirmed quota announcements with exact UTC timestamps and direct source links.

### 🚀 10-Second Setup in Cursor:
Add this to your `~/.cursor/mcp.json` (or Cursor Settings > MCP):

\`\`\`json
{
  "mcpServers": {
    "whenreset": {
      "url": "https://whenreset.com/api/mcp"
    }
  }
}
\`\`\`

### 💡 Example Prompts to Try:
- *"Check the Codex quota reset status before running this test suite."*
- *"When was the last banked quota reset announced, and how long was the interval?"*

Web UI (8-bit Mario arcade edition): https://whenreset.com  
Direct MCP Endpoint: `https://whenreset.com/api/mcp`  
Feedback and feature requests welcome!
```

---

## 二、 MCP 极速接入配置手册 (Zero-Config Integration)

WhenReset MCP 服务器完全符合 Anthropic MCP 规范 (`2024-11-05`)，支持 HTTP SSE / Streamable JSON-RPC 2.0 与通用 REST GET/POST。

### 1. Cursor IDE 配置
- **配置文件路径**：`~/.cursor/mcp.json`（全局）或项目根目录 `.cursor/mcp.json`
- **配置内容**：
```json
{
  "mcpServers": {
    "whenreset": {
      "url": "https://whenreset.com/api/mcp"
    }
  }
}
```
*提示：亦可在 Cursor 界面中点击「Settings」->「Features」->「MCP」，点击「+ Add New MCP Server」，类型选择 `sse` / `http`，URL 填入 `https://whenreset.com/api/mcp` 即可。*

---

### 2. Claude Desktop 配置
- **配置文件路径**：
  - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
  - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- **配置内容**：
```json
{
  "mcpServers": {
    "whenreset": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-fetch",
        "https://whenreset.com/api/mcp"
      ]
    }
  }
}
```

---

### 3. Windsurf / Roo Code / Cline 配置
在对应插件的 `mcp_settings.json` 中配置：
```json
{
  "mcpServers": {
    "whenreset": {
      "url": "https://whenreset.com/api/mcp",
      "transport": "streamable-http"
    }
  }
}
```

---

### 4. 终端 cURL 与 REST 直接调用验证

```bash
# 1. 快速查询实时额度概率与威胁等级
curl -s "https://whenreset.com/api/mcp?tool=check_codex_reset_status"

# 2. 检索最近 5 次官方重置记录与推文链接
curl -s "https://whenreset.com/api/mcp?tool=get_recent_resets&limit=5"

# 3. 标准 MCP JSON-RPC 2.0 握手与工具执行
curl -s -X POST https://whenreset.com/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "check_codex_reset_status",
      "arguments": {}
    }
  }'
```

---

## 三、 智能体提示词模版 (Agent Prompting Templates)

### 场景 1：任务开工前额度水位预检 (Pre-Flight Quota Check)
> **用户输入**：  
> *"在开始对我整个项目执行单元测试重构之前，先调用 WhenReset MCP 查询当前的 Codex 额度重置雷达。如果处于 CRITICAL 预警，提醒我谨慎启动大规模消耗。"*

**智能体返回示例**：
```text
🛠️ [WhenReset Radar Telemetry]
- 距离上次重置：7.2 天（历史平均周期：6.9 天）
- 当前重置概率：88%
- 预警等级：CRITICAL SURGE（极度临界）
- 建议：Codex 额度预计在数小时内重置，建议稍等片刻或分批执行，避免任务中途遭遇限频掐断。
```

### 场景 2：历史周期分析与排期 (Cadence Intelligence)
> **用户输入**：  
> *"帮我查询最近 3 次 Codex 的重置类型，计算一下它们分别是 Regular 还是 Banked 额度。"*

---

## 四、 隐私与安全性保障 (Privacy & Security)

1. **零密钥、零鉴权**：无需申请注册或绑定 OpenAI API Key，任何人与智能体均可即开即用。
2. **零数据留存**：WhenReset 接口纯无状态（Stateless），不记录任何客户端代码、提示词或敏感业务上下文。
3. **高韧性保障**：边缘节点 60 秒自动更新缓存，上游异常时秒级自动回退到本地数据，保证智能体工具调用 100% 成功率。
