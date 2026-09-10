"use client";

import React, { useState, useEffect } from "react";
import {
  playMarioCoinSound,
  playMarioPowerupSound,
  triggerHaptic,
  cn,
} from "@/lib/utils";
import {
  Cpu,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  Layers,
  Sparkles,
  HelpCircle,
} from "lucide-react";

interface MarioMcpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "cursor" | "claude" | "curl";

const CURSOR_CONFIG = `{
  "mcpServers": {
    "whenreset": {
      "url": "https://whenreset.com/api/mcp"
    }
  }
}`;

const CLAUDE_CONFIG = `{
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
}`;

const CURL_EXAMPLE = `# 1. Query quota reset probability & threat status
curl -s https://whenreset.com/api/mcp?tool=check_codex_reset_status

# 2. Get latest 5 reset announcements with Twitter links
curl -s "https://whenreset.com/api/mcp?tool=get_recent_resets&limit=5"

# 3. Standard MCP JSON-RPC 2.0 tool execution
curl -s -X POST https://whenreset.com/api/mcp \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"check_codex_reset_status","arguments":{}}}'`;

export function MarioMcpModal({ isOpen, onClose }: MarioMcpModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("cursor");
  const [copied, setCopied] = useState<boolean>(false);

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        playMarioCoinSound();
        triggerHaptic(6);
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Reset copied state on open or tab change
  useEffect(() => {
    setCopied(false);
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      playMarioCoinSound();
      triggerHaptic(6);
      onClose();
    }
  };

  const getActiveCode = () => {
    switch (activeTab) {
      case "cursor":
        return CURSOR_CONFIG;
      case "claude":
        return CLAUDE_CONFIG;
      case "curl":
        return CURL_EXAMPLE;
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getActiveCode());
      setCopied(true);
      playMarioPowerupSound();
      triggerHaptic(20);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      triggerHaptic(30);
    }
  };

  const handleTabSwitch = (tab: TabType) => {
    playMarioCoinSound();
    triggerHaptic(8);
    setActiveTab(tab);
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-[2px] animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mcp-modal-title"
    >
      <div className="w-full max-w-2xl border-[4px] border-black bg-[#181B26] p-4 sm:p-6 shadow-[8px_8px_0px_#000000] rounded-none text-white relative max-h-[92vh] overflow-y-auto">
        {/* Retro Header Bar */}
        <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-mario-coin text-xl">⚡</span>
            <div>
              <h3
                id="mcp-modal-title"
                className="font-pixel text-xs sm:text-sm text-mario-coin flex items-center gap-2"
              >
                <span>MCP PROTOCOL RADAR</span>
                <span className="text-[9px] bg-mario-green text-black px-1.5 py-0.5 border border-black">
                  DEV ECO
                </span>
              </h3>
              <p className="font-mono text-[10px] text-gray-400">
                Model Context Protocol (JSON-RPC 2.0 &amp; REST) for AI Coding Agents
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playMarioCoinSound();
              triggerHaptic(6);
              onClose();
            }}
            className="pixel-btn px-2.5 py-1 bg-mario-red text-white font-pixel text-[10px] border-2 border-black rounded-none hover:bg-red-600 cursor-pointer"
            aria-label="Close modal"
          >
            [ ✕ ESC ]
          </button>
        </div>

        {/* Introduction Banner */}
        <div className="mb-4 p-3 border-2 border-black bg-[#0F111A] text-xs font-mono shadow-pixel-sm">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-mario-coin shrink-0 mt-0.5" />
            <p className="text-gray-300 leading-relaxed text-[11px] sm:text-xs">
              Equip your AI Agents (Cursor, Claude Desktop, Windsurf, Roo Code) with native WhenReset quota intelligence. Agents can autonomously query real-time surge levels and historical reset intervals.
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-2 mb-3 font-pixel text-[10px]">
          <button
            onClick={() => handleTabSwitch("cursor")}
            className={cn(
              "px-3 py-1.5 border-2 border-black rounded-none transition-all cursor-pointer flex items-center gap-1.5",
              activeTab === "cursor"
                ? "bg-mario-coin text-black shadow-pixel-sm font-bold"
                : "bg-[#0F111A] text-gray-400 hover:text-white"
            )}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>CURSOR (~/.cursor/mcp.json)</span>
          </button>

          <button
            onClick={() => handleTabSwitch("claude")}
            className={cn(
              "px-3 py-1.5 border-2 border-black rounded-none transition-all cursor-pointer flex items-center gap-1.5",
              activeTab === "claude"
                ? "bg-mario-coin text-black shadow-pixel-sm font-bold"
                : "bg-[#0F111A] text-gray-400 hover:text-white"
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>CLAUDE DESKTOP</span>
          </button>

          <button
            onClick={() => handleTabSwitch("curl")}
            className={cn(
              "px-3 py-1.5 border-2 border-black rounded-none transition-all cursor-pointer flex items-center gap-1.5",
              activeTab === "curl"
                ? "bg-mario-coin text-black shadow-pixel-sm font-bold"
                : "bg-[#0F111A] text-gray-400 hover:text-white"
            )}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>CURL / REST</span>
          </button>
        </div>

        {/* Tab Content & Config Snippet Box */}
        <div className="border-2 border-black bg-[#0A0C12] p-3 sm:p-4 mb-4 relative shadow-pixel-pressed">
          {/* Target File Hint */}
          <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-2 border-b border-gray-800 pb-1.5">
            <span className="flex items-center gap-1 text-mario-green">
              <span>●</span>
              {activeTab === "cursor" && "Add to ~/.cursor/mcp.json or Cursor Settings > MCP"}
              {activeTab === "claude" && "Add to claude_desktop_config.json"}
              {activeTab === "curl" && "Direct Terminal / HTTP REST Execution"}
            </span>
            <span className="text-gray-500 font-pixel text-[9px]">
              {activeTab === "curl" ? "BASH" : "JSON"}
            </span>
          </div>

          {/* Code Block */}
          <pre className="font-mono text-xs sm:text-[13px] text-gray-200 overflow-x-auto p-2 bg-[#06080C] border border-gray-900 leading-relaxed select-all">
            <code>{getActiveCode()}</code>
          </pre>

          {/* Action Row: Copy Button */}
          <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <div className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-mario-coin" />
              <span>Public endpoint &bull; Zero API keys required</span>
            </div>

            <button
              onClick={handleCopy}
              className={cn(
                "pixel-btn px-4 py-2 border-2 border-black font-pixel text-[10px] rounded-none cursor-pointer flex items-center justify-center gap-1.5 transition-all",
                copied
                  ? "bg-mario-green text-black font-bold shadow-pixel-sm"
                  : "bg-mario-coin text-black hover:bg-[#FED626] shadow-pixel-sm font-bold"
              )}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-black" />
                  <span>[ 🍄 COPIED CONFIG! ]</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>[ 📋 COPY CONFIG ]</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Available MCP Tools Showcase */}
        <div className="border-t-2 border-black pt-4">
          <div className="font-pixel text-[10px] text-mario-coin mb-2.5 flex items-center gap-1.5">
            <span>🛠️</span>
            <span>AVAILABLE MCP TOOLS DEFINED</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs">
            {/* Tool 1 */}
            <div className="p-2.5 border-2 border-black bg-[#0F111A] shadow-pixel-sm">
              <div className="flex items-center gap-1.5 font-pixel text-[9px] text-mario-coin mb-1">
                <span>⚡</span>
                <span className="text-white">check_codex_reset_status</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-normal">
                Returns reset forecast probability (%), days since last reset, average cadence, and threat level (<code>NORMAL</code>, <code>ELEVATED</code>, <code>CRITICAL</code>).
              </p>
            </div>

            {/* Tool 2 */}
            <div className="p-2.5 border-2 border-black bg-[#0F111A] shadow-pixel-sm">
              <div className="flex items-center gap-1.5 font-pixel text-[9px] text-mario-coin mb-1">
                <span>📜</span>
                <span className="text-white">get_recent_resets</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-normal">
                Retrieves the latest <i>N</i> official quota reset records, UTC timestamps, reset type (Regular/Banked), and direct official X/Twitter links.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Tip */}
        <div className="mt-4 pt-3 border-t border-black/40 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-2 text-gray-500 font-pixel text-[9px]">
          <div>PRESS [ESC] OR CLICK OUTSIDE TO RETURN</div>
          <a
            href="/api/mcp"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              playMarioCoinSound();
              triggerHaptic(8);
            }}
            className="text-mario-coin hover:underline inline-flex items-center gap-1 font-mono text-[10px]"
          >
            <span>Inspect Raw /api/mcp</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
