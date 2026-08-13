import type { MetadataRoute } from "next";
import { CLEANING_METHODS } from "@/content/cleaning-methods";
import { getAllAlerts, getAllProduce, getAuthorities } from "@/lib/data";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [produce, alerts, authorities] = await Promise.all([getAllProduce(), getAllAlerts(), getAuthorities()]);

  const staticRoutes = [
    { path: "", priority: 1 },
    { path: "/produce", priority: 0.9 },
    { path: "/cleaning", priority: 0.8 },
    { path: "/risk-levels", priority: 0.8 },
    { path: "/alerts", priority: 0.7 },
    { path: "/alerts/archive", priority: 0.3 },
    { path: "/authorities", priority: 0.5 },
    { path: "/my-rabbi", priority: 0.5 },
    { path: "/about", priority: 0.4 },
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${base}${route.path}`,
      lastModified: new Date(),
      priority: route.priority,
    })),
    ...produce.map((item) => ({
      url: `${base}/produce/${item.slug}`,
      lastModified: new Date(item.updatedAt),
      priority: 0.8,
    })),
    ...CLEANING_METHODS.map((method) => ({
      url: `${base}/cleaning/${method.slug}`,
      lastModified: new Date(),
      priority: 0.7,
    })),
    ...alerts.map((alert) => ({
      url: `${base}/alerts/${alert.slug}`,
      lastModified: new Date(alert.publishedAt),
      priority: 0.5,
    })),
    ...authorities.map((authority) => ({
      url: `${base}/authorities/${authority.slug}`,
      lastModified: new Date(),
      priority: 0.4,
    })),
  ];
}
