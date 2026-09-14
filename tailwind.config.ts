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
        background: "#080B11",
        surface: {
          DEFAULT: "#0F1420",
          card: "rgba(18, 24, 38, 0.7)",
          elevated: "rgba(26, 34, 52, 0.8)",
          border: "rgba(255, 255, 255, 0.08)",
          borderSubtle: "rgba(255, 255, 255, 0.04)",
        },
        brand: {
          green: "#10B981",
          emerald: "#059669",
          amber: "#F59E0B",
          blue: "#3B82F6",
          purple: "#8B5CF6",
          rose: "#F43F5E",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.4)",
        "glass-sm": "0 4px 16px 0 rgba(0, 0, 0, 0.3)",
        "glow-green": "0 0 25px -4px rgba(16, 185, 129, 0.25)",
        "glow-amber": "0 0 25px -4px rgba(245, 158, 11, 0.25)",
        "glow-blue": "0 0 25px -4px rgba(59, 130, 246, 0.25)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
