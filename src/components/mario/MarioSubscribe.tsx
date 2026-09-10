"use client";

import React, { useState, useEffect } from "react";
import {
  playMarioCoinSound,
  playMarioPowerupSound,
  triggerHaptic,
  cn,
} from "@/lib/utils";
import { Mail, Send, ExternalLink, CheckCircle2, AlertCircle, Bell } from "lucide-react";

interface MarioSubscribeProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = "whenreset_subscribed_email";

export function MarioSubscribe({ isOpen, onClose }: MarioSubscribeProps) {
  const [email, setEmail] = useState("");
  const [savedEmail, setSavedEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Read saved email from localStorage on mount & open
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedEmail(stored);
      }
    }
  }, [isOpen]);

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

  // If modal is not open, do not render
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      playMarioCoinSound();
      triggerHaptic(6);
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed || !emailRegex.test(trimmed)) {
      setStatus("error");
      setErrorMessage("INVALID FREQUENCY! PLEASE ENTER A VALID EMAIL.");
      triggerHaptic(30);
      return;
    }

    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, trimmed);
    }
    setSavedEmail(trimmed);
    setStatus("success");
    setEmail("");
    playMarioPowerupSound();
    triggerHaptic(20);
  };

  const handleUnsubscribe = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    setSavedEmail(null);
    setStatus("idle");
    playMarioCoinSound();
    triggerHaptic(10);
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-[2px] animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg border-[4px] border-black bg-[#181B26] p-5 sm:p-6 shadow-[8px_8px_0px_#000000] rounded-none text-white relative">
        {/* Retro Header Bar */}
        <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-mario-coin text-lg">📡</span>
            <div>
              <h3 className="font-pixel text-xs sm:text-sm text-mario-coin">
                TOAD COMM STATION
              </h3>
              <p className="font-mono text-[10px] text-gray-400">
                8-BIT QUOTA DROP NOTIFICATION RADAR
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

        {/* Saved Status Notice */}
        {savedEmail && status !== "error" && (
          <div className="mb-4 p-3 border-2 border-mario-green bg-[#0F111A] text-mario-green font-mono text-xs flex items-center justify-between shadow-pixel-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <div>
                <span className="font-pixel text-[9px] block text-white">
                  TUNED IN:
                </span>
                <span className="text-gray-300 break-all">{savedEmail}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleUnsubscribe}
              className="font-pixel text-[8px] text-gray-400 hover:text-mario-red ml-2 shrink-0 underline"
            >
              CHANGE
            </button>
          </div>
        )}

        {/* Success Alert */}
        {status === "success" && (
          <div className="mb-4 p-3 border-2 border-mario-coin bg-[#241F0A] text-mario-coin font-pixel text-[10px] shadow-pixel-sm leading-relaxed">
            🍄 1-UP! RADAR FREQUENCY TUNED! YOU WILL RECEIVE INSTANT DISPATCHES WHEN CODEX QUOTAS RESET.
          </div>
        )}

        {/* Error Alert */}
        {status === "error" && (
          <div className="mb-4 p-3 border-2 border-mario-red bg-[#2D0D0C] text-red-300 font-pixel text-[9px] shadow-pixel-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-mario-red" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form: Email Subscription */}
        <form onSubmit={handleSubmit} className="mb-6">
          <label className="block font-pixel text-[10px] text-gray-300 mb-2">
            DISPATCH FREQUENCY (EMAIL):
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="mario@mushroom-kingdom.io"
                className="w-full pl-9 pr-3 py-2.5 bg-[#0F111A] border-2 border-black text-white font-mono text-xs placeholder-gray-600 rounded-none focus:outline-none focus:border-mario-coin shadow-pixel-pressed"
              />
            </div>
            <button
              type="submit"
              className="pixel-btn px-4 py-2.5 bg-mario-coin text-black font-pixel text-[10px] border-2 border-black rounded-none hover:bg-[#FED626] flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>[ TUNE IN ]</span>
            </button>
          </div>
          <p className="font-mono text-[10px] text-gray-500 mt-1.5">
            Zero spam. Local memory verified. Triggered only upon confirmed OpenAI Codex quota drops.
          </p>
        </form>

        {/* Secondary Broadcast Channels */}
        <div className="border-t-2 border-black pt-4">
          <div className="font-pixel text-[10px] text-mario-coin mb-2 flex items-center gap-1.5">
            <span>⚡</span>
            <span>ALTERNATIVE BEACONS &amp; BROADCASTS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Telegram */}
            <a
              href="https://t.me/whenreset"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                playMarioCoinSound();
                triggerHaptic(8);
              }}
              className="p-2.5 border-2 border-black bg-[#0F111A] hover:bg-[#121622] flex items-center justify-between gap-2 shadow-pixel-sm transition-all group"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">✈️</span>
                <div>
                  <div className="font-pixel text-[9px] text-white group-hover:text-mario-coin">
                    TELEGRAM BEACON
                  </div>
                  <div className="font-mono text-[10px] text-gray-400">
                    t.me/whenreset
                  </div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-white shrink-0" />
            </a>

            {/* Twitter / X */}
            <a
              href="https://x.com/thsottiaux"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                playMarioCoinSound();
                triggerHaptic(8);
              }}
              className="p-2.5 border-2 border-black bg-[#0F111A] hover:bg-[#121622] flex items-center justify-between gap-2 shadow-pixel-sm transition-all group"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🐦</span>
                <div>
                  <div className="font-pixel text-[9px] text-white group-hover:text-mario-coin">
                    DISPATCH RADAR
                  </div>
                  <div className="font-mono text-[10px] text-gray-400">
                    @thsottiaux on X
                  </div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-white shrink-0" />
            </a>
          </div>
        </div>

        {/* NES Modal Footer Note */}
        <div className="mt-5 text-center font-pixel text-[9px] text-gray-500 border-t border-black/40 pt-3">
          CLICK OUTSIDE OR PRESS [ESC] TO RETURN TO STAGE
        </div>
      </div>
    </div>
  );
}
