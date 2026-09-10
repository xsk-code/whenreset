import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        mario: {
          red: "#EF4444",
          blue: "#3B82F6",
          sky: "#60A5FA",
          green: "#22C55E",
          coin: "#F59E0B",
          coinShadow: "#D97706",
          brick: "#A14324",
          dark: "#12141D",
          darkCard: "#191C28",
          lightCard: "#FFFFFF",
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', "monospace"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        pixel: "3px 3px 0px rgba(0, 0, 0, 0.75)",
        "pixel-sm": "2px 2px 0px rgba(0, 0, 0, 0.65)",
        "pixel-lg": "4px 4px 0px rgba(0, 0, 0, 0.8)",
        "pixel-pressed": "inset 2px 2px 0px rgba(0, 0, 0, 0.5)",
        "pixel-white": "3px 3px 0px rgba(255, 255, 255, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
