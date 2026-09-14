import type { Metadata, Viewport } from "next";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { Analytics } from "@vercel/analytics/react";
import { SITE_CONFIG } from "@/lib/config";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#080B11",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.domain),
  title: {
    default: SITE_CONFIG.title,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    "OpenAI Codex",
    "Codex Quota Reset",
    "When will Codex reset",
    "Claude Code Reset",
    "Rate Limit Tracker",
    "OpenAI Reset Radar",
    "OpenAI API Limits",
    "Codex Rate Limits",
    "WhenReset",
    "AI Quota Meteorology",
    "Quota Countdown",
  ],
  authors: [{ name: SITE_CONFIG.author }],
  creator: SITE_CONFIG.twitterHandle,
  publisher: SITE_CONFIG.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: SITE_CONFIG.domain,
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
    url: SITE_CONFIG.domain,
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [
      {
        url: `${SITE_CONFIG.domain}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    site: SITE_CONFIG.twitterHandle,
    creator: SITE_CONFIG.twitterHandle,
    images: [`${SITE_CONFIG.domain}/opengraph-image`],
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
      "@id": `${SITE_CONFIG.domain}/#webapp`,
      name: SITE_CONFIG.name,
      alternateName: "WhenReset AI Quota Radar",
      url: SITE_CONFIG.domain,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "All",
      description: SITE_CONFIG.description,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "Real-time OpenAI Codex quota countdown clock",
        "Probabilistic reset threat radar",
        "Dynamic RFC 5545 iCalendar (.ics) subscription",
        "Instant Bark, Webhook & Email developer alerts",
        "Clean verifiable official announcement history",
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
      <body className="bg-[#080B11] text-slate-100 min-h-screen">
        <LanguageProvider>{children}</LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
