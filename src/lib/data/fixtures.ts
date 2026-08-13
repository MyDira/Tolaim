/**
 * Shapes the sample dataset into domain objects.
 *
 * Used when NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not
 * set, so `npm run dev` produces a fully working site with no configuration.
 * Once Supabase is configured this module is never reached — see
 * `src/lib/data/index.ts` for the switch.
 *
 * Everything here is treated as approved. Draft-visibility behaviour cannot be
 * exercised without a real database, which is the point: the enforcement lives
 * in Row Level Security, not in application code.
 */

import type { RiskLevel } from "../risk";
import type { Alert, Authority, Category, ProduceItem, Rabbi, Ruling } from "../types";
import { SEED_ALERTS, SEED_AUTHORITIES, SEED_CATEGORIES, SEED_PRODUCE, SEED_RABBIS } from "./seed-data";

/** Stable, readable ids. Nothing outside this module depends on their shape. */
const id = (kind: string, slug: string) => `${kind}_${slug}`;

const APPROVED_AT = "2026-01-05T09:00:00.000Z";

export const fixtureCategories: Category[] = SEED_CATEGORIES.map((c) => ({
  id: id("cat", c.slug),
  slug: c.slug,
  name: c.name,
  sortOrder: c.sortOrder,
}));

export const fixtureAuthorities: Authority[] = SEED_AUTHORITIES.map((a) => ({
  id: id("auth", a.slug),
  slug: a.slug,
  name: a.name,
  shortName: a.shortName,
  kind: a.kind,
  region: a.region,
  description: a.description,
  websiteUrl: a.websiteUrl,
  logoPath: null,
  sortOrder: a.sortOrder,
  status: "approved",
}));

const authorityBySlug = new Map(fixtureAuthorities.map((a) => [a.slug, a]));
const categoryBySlug = new Map(fixtureCategories.map((c) => [c.slug, c]));

export const fixtureProduce: ProduceItem[] = SEED_PRODUCE.map((p) => {
  const produceId = id("prod", p.slug);
  const category = categoryBySlug.get(p.category) ?? null;

  const rulings: Ruling[] = p.rulings.map((r) => {
    const authority = authorityBySlug.get(r.authority) ?? null;
    return {
      id: id("rul", `${p.slug}__${r.authority}`),
      produceId,
      authorityId: authority?.id ?? "",
      authority,
      riskLevel: r.level,
      guidance: r.guidance,
      citation: r.citation,
      sourceUrl: null,
      effectiveDate: r.effectiveDate ?? null,
      notes: r.notes ?? "",
      status: "approved",
    };
  });

  // Presentation order: the sharpest position first, so a visitor scanning the
  // table meets the strictest view before the most lenient one.
  rulings.sort((a, b) => a.riskLevel - b.riskLevel || a.authority!.sortOrder - b.authority!.sortOrder);

  return {
    id: produceId,
    slug: p.slug,
    name: p.name,
    alsoKnownAs: p.alsoKnownAs,
    categoryId: category?.id ?? null,
    category,
    summary: p.summary,
    cleaningGuidance: p.cleaningGuidance,
    seasonNote: p.seasonNote ?? "",
    imagePath: p.imagePath ?? null,
    imageAlt: `${p.name}`,
    siteRiskLevel: p.siteRiskLevel as RiskLevel | null,
    status: "approved",
    approvedAt: APPROVED_AT,
    updatedAt: APPROVED_AT,
    rulings,
  };
});

const produceBySlug = new Map(fixtureProduce.map((p) => [p.slug, p]));

export const fixtureRabbis: Rabbi[] = SEED_RABBIS.map((r) => {
  const defaultAuthority = r.defaultAuthority ? (authorityBySlug.get(r.defaultAuthority) ?? null) : null;
  return {
    id: id("rabbi", r.slug),
    slug: r.slug,
    name: r.name,
    community: r.community,
    region: r.region,
    description: r.description,
    defaultAuthorityId: defaultAuthority?.id ?? null,
    defaultAuthority,
    overrides: r.overrides.flatMap((o) => {
      const produce = produceBySlug.get(o.produce);
      const authority = authorityBySlug.get(o.authority);
      if (!produce || !authority) return [];
      return [
        {
          produceId: produce.id,
          produceSlug: produce.slug,
          produceName: produce.name,
          authorityId: authority.id,
          note: o.note,
        },
      ];
    }),
    status: "approved",
  };
});

/**
 * Alert dates are stored as offsets from "now" so the sample data never goes
 * stale — the demo always has live alerts and a populated archive.
 */
export function buildFixtureAlerts(now = new Date()): Alert[] {
  const shift = (days: number) => new Date(now.getTime() + days * 86_400_000).toISOString();

  return SEED_ALERTS.map((a) => ({
    id: id("alert", a.slug),
    slug: a.slug,
    title: a.title,
    summary: a.summary,
    body: a.body,
    severity: a.severity,
    region: a.region,
    publishedAt: shift(a.publishedOffsetDays),
    expiresAt: a.expiresOffsetDays === null ? null : shift(a.expiresOffsetDays),
    status: "approved" as const,
    produce: a.produce.flatMap((slug) => {
      const p = produceBySlug.get(slug);
      return p ? [{ id: p.id, slug: p.slug, name: p.name }] : [];
    }),
  })).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
