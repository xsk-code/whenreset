"use client";

import React from "react";
import { cn, playMarioCoinSound, triggerHaptic } from "@/lib/utils";

export interface MarioLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  interactive?: boolean;
  className?: string;
}

export function MarioLogo({
  size = "md",
  animated = true,
  interactive = true,
  className,
}: MarioLogoProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (!interactive) return;
    try {
      playMarioCoinSound();
      triggerHaptic(12);
    } catch {
      // Audio playback might be restricted before user gesture
    }
  };

  // Dimensions configuration
  const sizeMap = {
    sm: {
      container: "w-6 h-6 border-[2px]",
      bevel: "h-0.5 w-0.5",
      rivet: "w-1 h-1 top-0.5 left-0.5",
      rivetTR: "w-1 h-1 top-0.5 right-0.5",
      rivetBL: "w-1 h-1 bottom-0.5 left-0.5",
      rivetBR: "w-1 h-1 bottom-0.5 right-0.5",
      text: "text-xs",
      shadow: "shadow-pixel-sm",
    },
    md: {
      container: "w-8 h-8 sm:w-9 sm:h-9 border-[2px]",
      bevel: "h-1 w-1",
      rivet: "w-1 h-1 top-1 left-1",
      rivetTR: "w-1 h-1 top-1 right-1",
      rivetBL: "w-1 h-1 bottom-1 left-1",
      rivetBR: "w-1 h-1 bottom-1 right-1",
      text: "text-sm sm:text-base",
      shadow: "shadow-pixel-sm",
    },
    lg: {
      container: "w-12 h-12 border-[3px]",
      bevel: "h-1.5 w-1.5",
      rivet: "w-1.5 h-1.5 top-1.5 left-1.5",
      rivetTR: "w-1.5 h-1.5 top-1.5 right-1.5",
      rivetBL: "w-1.5 h-1.5 bottom-1.5 left-1.5",
      rivetBR: "w-1.5 h-1.5 bottom-1.5 right-1.5",
      text: "text-xl",
      shadow: "shadow-pixel",
    },
    xl: {
      container: "w-16 h-16 border-[4px]",
      bevel: "h-2 w-2",
      rivet: "w-2 h-2 top-2 left-2",
      rivetTR: "w-2 h-2 top-2 right-2",
      rivetBL: "w-2 h-2 bottom-2 left-2",
      rivetBR: "w-2 h-2 bottom-2 right-2",
      text: "text-2xl",
      shadow: "shadow-pixel",
    },
  };

  const currentSize = sizeMap[size];

  return (
    <div
      role="img"
      aria-label="WhenReset 8-Bit Question Block Logo"
      onClick={handleClick}
      className={cn(
        "relative shrink-0 rounded-none border-black bg-mario-coin flex items-center justify-center select-none",
        currentSize.container,
        currentSize.shadow,
        interactive && "cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
        animated && "hover:-translate-y-0.5 transition-transform",
        className
      )}
    >
      {/* NES Inset Bevels: Top & Left Highlight */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 bg-[#FFF587] pointer-events-none",
          currentSize.bevel.split(" ")[0]
        )}
      />
      <div
        className={cn(
          "absolute top-0 left-0 bottom-0 bg-[#FFF587] pointer-events-none",
          currentSize.bevel.split(" ")[1]
        )}
      />

      {/* NES Inset Bevels: Bottom & Right Shadow */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-[#B84418] pointer-events-none",
          currentSize.bevel.split(" ")[0]
        )}
      />
      <div
        className={cn(
          "absolute top-0 right-0 bottom-0 bg-[#B84418] pointer-events-none",
          currentSize.bevel.split(" ")[1]
        )}
      />

      {/* 4 Corner Rivets */}
      <div className={cn("absolute bg-black pointer-events-none", currentSize.rivet)} />
      <div className={cn("absolute bg-black pointer-events-none", currentSize.rivetTR)} />
      <div className={cn("absolute bg-black pointer-events-none", currentSize.rivetBL)} />
      <div className={cn("absolute bg-black pointer-events-none", currentSize.rivetBR)} />

      {/* Center 8-Bit Question Mark */}
      <span
        className={cn(
          "font-pixel text-black font-extrabold select-none leading-none drop-shadow-[1px_1px_0px_#B84418]",
          currentSize.text
        )}
      >
        ?
      </span>
    </div>
  );
}
