import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WhenReset: Super Mario Edition | 8-bit Codex Limit Tracker",
  description:
    "Track OpenAI Codex reset announcements in 8-bit Super Mario pixel style. 100% retro, live alerts, 26-week heatmap, and zero downtime.",
  icons: {
    icon: "/favicon.ico",
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
        {children}
      </body>
    </html>
  );
}
