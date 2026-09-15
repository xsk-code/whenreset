import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/config";
import { ERROR_PAGES } from "@/lib/error-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.domain.replace(/\/$/, "");
  const currentDate = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "always",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/wiki/rules`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/api/calendar.ics`,
      lastModified: currentDate,
      changeFrequency: "hourly",
      priority: 0.6,
    },
  ];

  const errorRoutes: MetadataRoute.Sitemap = ERROR_PAGES.map((page) => ({
    url: `${baseUrl}/errors/${page.slug}`,
    lastModified: currentDate,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [...staticRoutes, ...errorRoutes];
}
