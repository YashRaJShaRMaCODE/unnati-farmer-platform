import type { MetadataRoute } from "next";

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://unnati-farmer-platform.vercel.app");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/profile",
        "/lands",
        "/crops",
        "/marketplace",
        "/schemes",
        "/complaints",
        "/trust-score",
        "/trust-simulator",
        "/health-card",
        "/loan-eligibility",
        "/village-analytics",
        "/notifications",
        "/ai-assistant",
        "/login",
        "/register",
      ],
    },
    sitemap: new URL("/sitemap.xml", siteUrl).href,
  };
}
