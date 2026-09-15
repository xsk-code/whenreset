import type { Metadata } from "next";
import { RulesDoc } from "@/components/seo/RulesDoc";
import { SITE_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: "AI coding quota rules: rolling windows, thinking tokens, reset cards",
  description:
    "How Codex and Claude quota rules actually work: rolling windows, reasoning tokens, prompt caching, banked reset cards and why surprise global resets happen. Every rule cites a verifiable source.",
  alternates: {
    canonical: `${SITE_CONFIG.domain.replace(/\/$/, "")}/wiki/rules`,
  },
  openGraph: {
    title: "AI coding quota rules: rolling windows, thinking tokens, reset cards",
    description:
      "How Codex and Claude quota rules actually work, with verifiable sources for every claim.",
    type: "article",
    siteName: SITE_CONFIG.name,
  },
};

export default function RulesPage() {
  return <RulesDoc />;
}
