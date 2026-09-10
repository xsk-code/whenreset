import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://whenreset.top";
  const currentDate = new Date();

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "always",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/api/status`,
      lastModified: currentDate,
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/api/resets`,
      lastModified: currentDate,
      changeFrequency: "hourly",
      priority: 0.8,
    },
  ];
}
