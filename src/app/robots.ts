import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The admin is also noindex'd in its own layout and gated by middleware.
      // Listing it here keeps it out of search results without being the only
      // thing that does so.
      disallow: "/admin",
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
