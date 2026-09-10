import type { Metadata, Viewport } from "next";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0F111A",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://whenreset.top"),
  title: {
    default: "WhenReset: 8-Bit Retro Edition | OpenAI Codex Quota Reset Radar",
    template: "%s | WhenReset 8-Bit",
  },
  description:
    "Super Mario 8-bit retro arcade tracker for OpenAI Codex rate limit resets. Live radar, 26-week pixel heatmap, community prediction bets & 1-UP coin blocks.",
  keywords: [
    "OpenAI Codex",
    "Codex Quota Reset",
    "Rate Limit Tracker",
    "OpenAI Reset Radar",
    "Super Mario 8-Bit",
    "Retro Arcade Tracker",
    "OpenAI API Limits",
    "Codex Rate Limits",
    "WhenReset",
    "Pixel Heatmap",
    "8-bit Quota Monitor",
  ],
  authors: [{ name: "WhenReset Community" }],
  creator: "@WhenReset",
  publisher: "WhenReset",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://whenreset.top",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://whenreset.top",
    siteName: "WhenReset",
    title: "WhenReset: 8-Bit Retro Edition | OpenAI Codex Quota Reset Radar",
    description:
      "Super Mario 8-bit retro arcade tracker for OpenAI Codex rate limit resets. Live radar, 26-week pixel heatmap, community prediction bets & 1-UP coin blocks.",
    images: [
      {
        url: "https://whenreset.top/opengraph-image",
        width: 1200,
        height: 630,
        alt: "WhenReset: 8-Bit Retro Edition | OpenAI Codex Quota Reset Radar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WhenReset: 8-Bit Retro Edition | OpenAI Codex Quota Reset Radar",
    description:
      "Super Mario 8-bit retro arcade tracker for OpenAI Codex rate limit resets. Live radar, 26-week pixel heatmap, community prediction bets & 1-UP coin blocks.",
    site: "@WhenReset",
    creator: "@WhenReset",
    images: ["https://whenreset.top/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-mario-dark text-white min-h-screen selection:bg-mario-coin selection:text-black">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
