import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/admin", "/fr/search", "/en/search", "/ar/search"] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
