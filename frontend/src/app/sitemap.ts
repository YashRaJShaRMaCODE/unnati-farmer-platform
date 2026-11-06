import type { MetadataRoute } from "next";

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://unnati-farmer-platform.vercel.app");

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/onboarding", "/project-overview"].map((path) => ({
    url: new URL(path, siteUrl).href,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
