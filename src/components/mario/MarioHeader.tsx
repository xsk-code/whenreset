"use client";

import React, { useState } from "react";
import { playMarioCoinSound, triggerHaptic } from "@/lib/utils";
import { Bell, ExternalLink, Zap } from "lucide-react";
import { MarioMcpModal } from "./MarioMcpModal";
import { MarioLogo } from "./MarioLogo";

interface MarioHeaderProps {
  totalResets: number;
  onOpenSubscribe: () => void;
  onOpenMcp?: () => void;
}

export function MarioHeader({ totalResets, onOpenSubscribe, onOpenMcp }: MarioHeaderProps) {
  const [isMcpOpen, setIsMcpOpen] = useState(false);

  const handleNotifyClick = () => {
    playMarioCoinSound();
    triggerHaptic(14);
    onOpenSubscribe();
  };

  const handleMcpClick = () => {
    playMarioCoinSound();
    triggerHaptic(14);
    if (onOpenMcp) {
      onOpenMcp();
    } else {
      setIsMcpOpen(true);
    }
  };

  const handleLinkClick = () => {
    playMarioCoinSound();
    triggerHaptic(8);
  };

  return (
    <>
      <header className="w-full max-w-5xl border-[3px] border-black bg-[#181B26] p-3 sm:p-4 mb-4 shadow-pixel rounded-none">
        {/* Top Arcade HUD Stats Line */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-pixel">
          <div className="flex items-center gap-2">
            <span className="text-mario-red text-base">🍄</span>
            <span className="text-white tracking-widest">MARIO</span>
            <span className="text-mario-coin ml-1">004200</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 text-gray-300">
            {/* Coins counter */}
            <div className="flex items-center gap-1.5 text-mario-coin">
              <span>🪙</span>
              <span>x{totalResets.toString().padStart(2, "0")}</span>
            </div>

            {/* World indicator */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400">WORLD</span>
              <span className="text-white">1-3</span>
            </div>

            {/* Live Radar Pulsing Beacon */}
            <div className="flex items-center gap-1.5 bg-[#0F111A] px-2 py-0.5 border border-black shadow-pixel-sm">
              <span className="inline-block w-2 h-2 bg-mario-green animate-pixel-blink" />
              <span className="text-mario-green text-[9px] sm:text-[10px]">LIVE RADAR</span>
            </div>
          </div>
        </div>

        {/* Arcade Title Marquee & Navigation / Action Bar */}
        <div className="mt-3 pt-3 border-t-2 border-black flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <MarioLogo size="md" />
            <div>
              <h1 className="font-pixel text-lg sm:text-2xl md:text-3xl text-mario-coin tracking-tight flex items-center gap-2">
                <span>WHENRESET</span>
                <span className="text-xs bg-mario-red text-white px-2 py-0.5 border border-black shadow-pixel-sm">
                  8-BIT
                </span>
              </h1>
              <p className="font-mono text-xs text-gray-400 mt-1">
                Retro 8-bit OpenAI Codex quota reset tracking terminal
              </p>
            </div>
          </div>

          {/* Action Controls & Endpoints */}
          <div className="flex flex-wrap items-center gap-2 font-pixel text-[10px]">
            {/* Notify Me Trigger Button */}
            <button
              onClick={handleNotifyClick}
              className="pixel-btn px-3 py-1.5 bg-mario-coin text-black border-2 border-black shadow-pixel-sm hover:bg-[#FED626] flex items-center gap-1.5 font-bold cursor-pointer rounded-none"
            >
              <Bell className="w-3 h-3" />
              <span>[ 🔔 NOTIFY ME ]</span>
            </button>

            {/* MCP for Cursor Button */}
            <button
              onClick={handleMcpClick}
              className="pixel-btn px-3 py-1.5 bg-mario-green text-black border-2 border-black shadow-pixel-sm hover:bg-[#00D000] flex items-center gap-1.5 font-bold cursor-pointer rounded-none"
            >
              <Zap className="w-3 h-3 text-black fill-black" />
              <span>[ ⚡ MCP FOR CURSOR ]</span>
            </button>

            {/* API Endpoints */}
            <a
              href="/api/status"
              target="_blank"
              onClick={handleLinkClick}
              className="px-2 py-1.5 border-2 border-black bg-[#0F111A] text-gray-300 hover:text-mario-coin shadow-pixel-sm transition-all rounded-none"
            >
              /api/status
            </a>
            <a
              href="/api/resets"
              target="_blank"
              onClick={handleLinkClick}
              className="px-2 py-1.5 border-2 border-black bg-[#0F111A] text-gray-300 hover:text-mario-coin shadow-pixel-sm transition-all rounded-none"
            >
              /api/resets
            </a>
            <a
              href="/api/mcp"
              target="_blank"
              onClick={handleLinkClick}
              className="px-2 py-1.5 border-2 border-black bg-[#0F111A] text-mario-coin hover:text-white shadow-pixel-sm transition-all rounded-none"
            >
              /api/mcp
            </a>

            {/* Official X link */}
            <a
              href="https://x.com/thsottiaux"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 border-2 border-black bg-[#0F111A] text-gray-400 hover:text-white shadow-pixel-sm transition-all rounded-none"
            >
              <span>@thsottiaux</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </header>

      {/* MCP Modal */}
      <MarioMcpModal
        isOpen={isMcpOpen}
        onClose={() => setIsMcpOpen(false)}
      />
    </>
  );
}
