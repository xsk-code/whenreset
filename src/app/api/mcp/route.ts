import { NextResponse } from "next/server";
import fallbackResets from "@/data/fallback-resets.json";
import { ResetItem, StatusResponse, ResetsResponse } from "@/lib/types";
import {
  calculateStats,
  calculateWatchProbability,
  formatUtcTime,
} from "@/lib/utils";

export const runtime = "nodejs";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-requested-with",
};

const PROTOCOL_VERSION = "2024-11-05";
const SERVER_INFO = {
  name: "whenreset-mcp",
  version: "1.0.0",
};

const TOOLS_DEFINITION = [
  {
    name: "check_codex_reset_status",
    description:
      "Query current OpenAI Codex quota reset forecast probability, days elapsed since last reset, average cadence, and threat status level (NORMAL / ELEVATED / CRITICAL).",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "get_recent_resets",
    description:
      "Retrieve recent OpenAI Codex quota reset announcements, including UTC timestamps, reset type (regular/banked), text, and direct X/Twitter source link.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description:
            "Number of reset announcements to retrieve (default: 5, max: 20)",
          default: 5,
        },
      },
      additionalProperties: false,
    },
  },
];

async function fetchResets(): Promise<ResetItem[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch("https://codex-resets.com/api/v1/resets", {
      signal: controller.signal,
      next: { revalidate: 60 },
      headers: {
        "User-Agent": "WhenReset-MCP/1.0",
        Accept: "application/json",
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data: ResetsResponse = await res.json();
      if (Array.isArray(data?.data) && data.data.length > 0) {
        return data.data;
      }
    }
  } catch (err) {
    console.warn("[MCP] Upstream resets fetch failed, using fallback resets", err);
  }

  return fallbackResets as ResetItem[];
}

async function fetchStatus(resets: ResetItem[]) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch("https://codex-resets.com/api/v1/status", {
      signal: controller.signal,
      next: { revalidate: 60 },
      headers: {
        "User-Agent": "WhenReset-MCP/1.0",
        Accept: "application/json",
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data: StatusResponse = await res.json();
      if (data?.data?.stats) {
        return data.data;
      }
    }
  } catch (err) {
    console.warn("[MCP] Upstream status fetch failed, using fallback calculation", err);
  }

  const stats = calculateStats(resets);
  return {
    latest_reset: resets[0],
    scheduled_reset: null,
    active_watch: null,
    stats,
  };
}

async function executeCheckStatus() {
  const resets = await fetchResets();
  const statusData = await fetchStatus(resets);
  const stats = statusData.stats;
  const probability = calculateWatchProbability(
    stats.days_since_last,
    stats.avg_interval_days
  );

  const status_level =
    probability >= 75
      ? "CRITICAL"
      : probability >= 45
      ? "ELEVATED"
      : "NORMAL";

  const threat_label =
    status_level === "CRITICAL"
      ? "THREAT LEVEL: CRITICAL SURGE"
      : status_level === "ELEVATED"
      ? "THREAT LEVEL: ELEVATED RUMBLE"
      : "THREAT LEVEL: LOW ACTIVITY";

  const assessment =
    status_level === "CRITICAL"
      ? "Imminent quota reset surge expected based on historical cadence (probability >= 75%)."
      : status_level === "ELEVATED"
      ? "Approaching average cycle interval; elevated reset likelihood (probability 45-74%)."
      : "Normal inter-cycle period; reset probability is low (probability < 45%).";

  return {
    probability_percentage: probability,
    days_since_last: stats.days_since_last,
    avg_interval_days: stats.avg_interval_days,
    longest_wait_days: stats.longest_wait_days,
    status_level,
    threat_label,
    assessment,
    last_reset_at: stats.last_reset_at,
    last_reset_at_utc: formatUtcTime(stats.last_reset_at),
    total_tracked_resets: stats.total,
    generated_at: new Date().toISOString(),
  };
}

async function executeGetRecentResets(limitArg?: unknown) {
  const parsedLimit = Number(limitArg);
  const limit = Math.max(1, Math.min(20, Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 5));
  const resets = await fetchResets();
  const sliced = resets.slice(0, limit);

  return {
    count: sliced.length,
    limit,
    resets: sliced.map((item) => ({
      id: item.id,
      reset_type: item.reset_type,
      announced_at: item.announced_at,
      announced_at_utc: formatUtcTime(item.announced_at),
      text: item.text,
      source_author: item.source?.author || "thsottiaux",
      source_type: item.source?.type || "x_post",
      twitter_url: item.source?.url || "https://x.com/thsottiaux",
    })),
    generated_at: new Date().toISOString(),
  };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tool = searchParams.get("tool");
  const action = searchParams.get("action");

  // REST tool execution via GET
  if (tool === "check_codex_reset_status") {
    const data = await executeCheckStatus();
    return NextResponse.json(
      { success: true, tool, data },
      {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  }

  if (tool === "get_recent_resets") {
    const limit = searchParams.get("limit");
    const data = await executeGetRecentResets(limit);
    return NextResponse.json(
      { success: true, tool, data },
      {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  }

  if (action === "tools/list" || action === "tools") {
    return NextResponse.json(
      {
        success: true,
        tools: TOOLS_DEFINITION,
      },
      {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  }

  // Default server discovery info & quick status preview
  const previewStatus = await executeCheckStatus();

  return NextResponse.json(
    {
      server: SERVER_INFO,
      protocolVersion: PROTOCOL_VERSION,
      description:
        "WhenReset Model Context Protocol (MCP) server for OpenAI Codex quota reset intelligence.",
      capabilities: {
        tools: {
          listChanged: false,
        },
      },
      tools: TOOLS_DEFINITION,
      current_status_preview: {
        probability_percentage: previewStatus.probability_percentage,
        days_since_last: previewStatus.days_since_last,
        avg_interval_days: previewStatus.avg_interval_days,
        status_level: previewStatus.status_level,
        threat_label: previewStatus.threat_label,
      },
      endpoints: {
        mcp_jsonrpc: "POST /api/mcp",
        rest_get: "GET /api/mcp?tool={check_codex_reset_status|get_recent_resets}",
        rest_post: "POST /api/mcp",
      },
      client_configurations: {
        cursor: {
          file: "~/.cursor/mcp.json",
          mcpServers: {
            whenreset: {
              url: "https://whenreset.top/api/mcp",
            },
          },
        },
        claude_desktop: {
          file: "claude_desktop_config.json",
          mcpServers: {
            whenreset: {
              command: "npx",
              args: [
                "-y",
                "@modelcontextprotocol/server-fetch",
                "https://whenreset.top/api/mcp",
              ],
            },
          },
        },
      },
    },
    {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: { code: -32700, message: "Parse error: Invalid JSON was received" },
      },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const isJsonRpc = body.jsonrpc === "2.0" || ("id" in body && "method" in body);

  if (isJsonRpc) {
    const id = body.id ?? null;
    const method = String(body.method || "");
    const params = (body.params as Record<string, unknown>) || {};

    switch (method) {
      case "initialize": {
        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id,
            result: {
              protocolVersion: PROTOCOL_VERSION,
              capabilities: {
                tools: {
                  listChanged: false,
                },
              },
              serverInfo: SERVER_INFO,
            },
          },
          { headers: CORS_HEADERS }
        );
      }

      case "notifications/initialized": {
        return NextResponse.json(
          { jsonrpc: "2.0", id, result: {} },
          { headers: CORS_HEADERS }
        );
      }

      case "ping": {
        return NextResponse.json(
          { jsonrpc: "2.0", id, result: {} },
          { headers: CORS_HEADERS }
        );
      }

      case "tools/list": {
        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id,
            result: {
              tools: TOOLS_DEFINITION,
            },
          },
          { headers: CORS_HEADERS }
        );
      }

      case "tools/call": {
        const toolName = String(params.name || "");
        const toolArgs = (params.arguments as Record<string, unknown>) || {};

        if (toolName === "check_codex_reset_status") {
          const result = await executeCheckStatus();
          return NextResponse.json(
            {
              jsonrpc: "2.0",
              id,
              result: {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify(result, null, 2),
                  },
                ],
                isError: false,
              },
            },
            { headers: CORS_HEADERS }
          );
        }

        if (toolName === "get_recent_resets") {
          const result = await executeGetRecentResets(toolArgs.limit);
          return NextResponse.json(
            {
              jsonrpc: "2.0",
              id,
              result: {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify(result, null, 2),
                  },
                ],
                isError: false,
              },
            },
            { headers: CORS_HEADERS }
          );
        }

        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "text",
                  text: `Error: Unknown tool "${toolName}". Available tools: check_codex_reset_status, get_recent_resets`,
                },
              ],
              isError: true,
            },
          },
          { headers: CORS_HEADERS }
        );
      }

      default: {
        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id,
            error: {
              code: -32601,
              message: `Method "${method}" not found`,
            },
          },
          { headers: CORS_HEADERS }
        );
      }
    }
  }

  // REST POST Handling
  const tool = (body.tool || body.name || body.action) as string | undefined;

  if (tool === "check_codex_reset_status") {
    const data = await executeCheckStatus();
    return NextResponse.json(
      { success: true, tool, data },
      { headers: CORS_HEADERS }
    );
  }

  if (tool === "get_recent_resets") {
    const args = (body.args || body.arguments || body) as Record<string, unknown>;
    const data = await executeGetRecentResets(args.limit);
    return NextResponse.json(
      { success: true, tool, data },
      { headers: CORS_HEADERS }
    );
  }

  if (tool === "tools/list" || tool === "list_tools") {
    return NextResponse.json(
      { success: true, tools: TOOLS_DEFINITION },
      { headers: CORS_HEADERS }
    );
  }

  // Default REST response with tools and usage
  return NextResponse.json(
    {
      server: SERVER_INFO,
      protocolVersion: PROTOCOL_VERSION,
      message: "WhenReset MCP HTTP/REST endpoint. Send JSON-RPC 2.0 or REST body.",
      tools: TOOLS_DEFINITION,
    },
    { headers: CORS_HEADERS }
  );
}
