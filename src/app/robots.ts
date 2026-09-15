import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_CONFIG.domain.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Internal endpoints are not content, keep them out of the index.
        disallow: ["/api/push", "/api/subscribe", "/api/cron/", "/api/incidents"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
