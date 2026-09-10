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
          red: "#E52521",
          blue: "#0058F8",
          sky: "#5C94FC",
          green: "#00A800",
          coin: "#FBD000",
          coinShadow: "#D89B00",
          brick: "#B84418",
          dark: "#0F111A",
          darkCard: "#181B26",
          lightCard: "#FFFFFF",
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', "monospace"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        pixel: "4px 4px 0px #000000",
        "pixel-sm": "2px 2px 0px #000000",
        "pixel-lg": "6px 6px 0px #000000",
        "pixel-pressed": "inset 3px 3px 0px rgba(0, 0, 0, 0.4)",
        "pixel-white": "4px 4px 0px #FFFFFF",
      },
    },
  },
  plugins: [],
};

export default config;
