import type { Metadata, Viewport } from "next";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { Analytics } from "@vercel/analytics/react";
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
    "Retro 8-bit arcade tracker for OpenAI Codex rate limit resets. Live radar, 26-week pixel heatmap, community prediction bets & 1-UP coin blocks.",
  keywords: [
    "OpenAI Codex",
    "Codex Quota Reset",
    "Rate Limit Tracker",
    "OpenAI Reset Radar",
    "8-Bit Retro Arcade",
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
      "Retro 8-bit arcade tracker for OpenAI Codex rate limit resets. Live radar, 26-week pixel heatmap, community prediction bets & 1-UP coin blocks.",
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
      "Retro 8-bit arcade tracker for OpenAI Codex rate limit resets. Live radar, 26-week pixel heatmap, community prediction bets & 1-UP coin blocks.",
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
  verification: {
    google: "slY1HVnTseRcBnZ7E3RnMods60NuQxmnNO2Jn70DywA",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://whenreset.top/#webapp",
      name: "WhenReset",
      alternateName: "WhenReset: 8-Bit Codex Reset Radar",
      url: "https://whenreset.top",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "All",
      description:
        "Retro 8-bit arcade tracker for OpenAI Codex rate limit resets and Model Context Protocol (MCP) server for Cursor and Claude Code.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "Real-time OpenAI Codex quota countdown clock",
        "26-week historic pixel quota heatmap",
        "Probabilistic reset threat radar",
        "Zero-config Model Context Protocol (MCP) endpoint",
      ],
    },
    {
      "@type": "FAQPage",
      "@id": "https://whenreset.top/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "When does OpenAI Codex quota reset?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "OpenAI Codex quotas reset on average every 6.9 days based on historical refill announcements tracked by WhenReset.",
          },
        },
        {
          "@type": "Question",
          name: "How can I monitor Codex rate limits in Cursor or Claude Code?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You can connect WhenReset's Model Context Protocol (MCP) server directly at https://whenreset.top/api/mcp to allow AI coding agents to autonomously inspect quota watermarks before running large refactors.",
          },
        },
        {
          "@type": "Question",
          name: "Is WhenReset free to use?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, WhenReset is 100% free with zero registration, zero API keys required, and zero commercial tracking cookies.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-mario-dark text-white min-h-screen selection:bg-mario-coin selection:text-black">
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
