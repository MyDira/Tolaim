import "server-only";

import { isSupabaseConfigured } from "../supabase/config";
import { createPublicClient } from "../supabase/public";
import type { RiskLevel } from "../risk";
import { isRiskLevel } from "../risk";
import { isAlertActive } from "../types";
import type { Alert, Authority, Category, ProduceItem, ProduceSummary, Rabbi, Ruling } from "../types";
import { buildFixtureAlerts, fixtureAuthorities, fixtureCategories, fixtureProduce, fixtureRabbis } from "./fixtures";
import type {
  AlertRow,
  AuthorityRow,
  ProduceCategoryRow,
  ProduceItemRow,
  RabbiRow,
  RulingRow,
} from "../supabase/database.types";

/**
 * The public read layer.
 *
 * Every function here returns approved content only. When Supabase is
 * configured that is enforced by Row Level Security — the anon role simply
 * cannot see anything else. When it is not configured, the bundled sample
 * dataset stands in so the site runs on a fresh clone.
 */

let warned = false;
function usingFixtures(): boolean {
  if (isSupabaseConfigured) return false;
  if (!warned && process.env.NODE_ENV !== "production") {
    warned = true;
    console.warn(
      "\n[tolaim] Supabase is not configured — serving the bundled sample dataset.\n" +
        "         Copy .env.example to .env.local to connect a real project.\n",
    );
  }
  return true;
}

// ---------------------------------------------------------------------------
// Row -> domain mappers
// ---------------------------------------------------------------------------

const toRisk = (value: number | null): RiskLevel | null => (isRiskLevel(value) ? value : null);

function mapCategory(row: ProduceCategoryRow): Category {
  return { id: row.id, slug: row.slug, name: row.name, sortOrder: row.sort_order };
}

function mapAuthority(row: AuthorityRow): Authority {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortName: row.short_name || row.name,
    kind: row.kind,
    region: row.region,
    description: row.description,
    websiteUrl: row.website_url,
    logoPath: row.logo_path,
    sortOrder: row.sort_order,
    status: row.status,
  };
}

type RulingWithAuthority = RulingRow & { authority: AuthorityRow | null };

function mapRuling(row: RulingWithAuthority): Ruling | null {
  const level = toRisk(row.risk_level);
  if (level === null) return null;
  return {
    id: row.id,
    produceId: row.produce_id,
    authorityId: row.authority_id,
    authority: row.authority ? mapAuthority(row.authority) : null,
    riskLevel: level,
    guidance: row.guidance,
    citation: row.citation,
    sourceUrl: row.source_url,
    effectiveDate: row.effective_date,
    notes: row.notes,
    status: row.status,
  };
}

type ProduceWithRelations = ProduceItemRow & {
  category: ProduceCategoryRow | null;
  rulings: RulingWithAuthority[] | null;
};

function mapProduce(row: ProduceWithRelations): ProduceItem {
  const rulings = (row.rulings ?? [])
    .map(mapRuling)
    .filter((r): r is Ruling => r !== null)
    // Strictest position first, so the table opens with the sharpest view.
    .sort((a, b) => a.riskLevel - b.riskLevel || (a.authority?.sortOrder ?? 0) - (b.authority?.sortOrder ?? 0));

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    alsoKnownAs: row.also_known_as ?? [],
    categoryId: row.category_id,
    category: row.category ? mapCategory(row.category) : null,
    summary: row.summary,
    cleaningGuidance: row.cleaning_guidance,
    seasonNote: row.season_note,
    imagePath: row.image_path,
    imageAlt: row.image_alt || row.name,
    siteRiskLevel: toRisk(row.site_risk_level),
    status: row.status,
    approvedAt: row.approved_at,
    updatedAt: row.updated_at,
    rulings,
  };
}

type AlertWithProduce = AlertRow & {
  alert_produce: { produce_items: Pick<ProduceItemRow, "id" | "slug" | "name"> | null }[] | null;
};

function mapAlert(row: AlertWithProduce): Alert {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    body: row.body,
    severity: row.severity,
    region: row.region,
    publishedAt: row.published_at,
    expiresAt: row.expires_at,
    status: row.status,
    produce: (row.alert_produce ?? []).flatMap((link) =>
      link.produce_items ? [{ id: link.produce_items.id, slug: link.produce_items.slug, name: link.produce_items.name }] : [],
    ),
  };
}

// ---------------------------------------------------------------------------
// Select fragments
// ---------------------------------------------------------------------------

const PRODUCE_SELECT = "*, category:produce_categories(*), rulings(*, authority:authorities(*))";
const ALERT_SELECT = "*, alert_produce(produce_items(id, slug, name))";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function getCategories(): Promise<Category[]> {
  if (usingFixtures()) return [...fixtureCategories].sort((a, b) => a.sortOrder - b.sortOrder);

  const { data, error } = await createPublicClient()
    .from("produce_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapCategory);
}

export async function getAllProduce(): Promise<ProduceItem[]> {
  if (usingFixtures()) return fixtureProduce;

  const { data, error } = await createPublicClient()
    .from("produce_items")
    .select(PRODUCE_SELECT)
    .order("name", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as unknown as ProduceWithRelations[]).map(mapProduce);
}

export async function getProduceItem(slug: string): Promise<ProduceItem | null> {
  if (usingFixtures()) return fixtureProduce.find((p) => p.slug === slug) ?? null;

  const { data, error } = await createPublicClient()
    .from("produce_items")
    .select(PRODUCE_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data ? mapProduce(data as unknown as ProduceWithRelations) : null;
}

/**
 * The listing payload. Also serialised into the page as the client-side search
 * index — a few hundred rows of this shape is a small enough payload to ship
 * whole, and it makes search instant and immune to a bad connection.
 */
export async function getProduceSummaries(): Promise<ProduceSummary[]> {
  const [items, alerts] = await Promise.all([getAllProduce(), getActiveAlerts()]);
  const alerted = new Set(alerts.flatMap((a) => a.produce.map((p) => p.id)));

  return items
    .map((item) => {
      const levels = item.rulings.map((r) => r.riskLevel);
      return {
        id: item.id,
        slug: item.slug,
        name: item.name,
        alsoKnownAs: item.alsoKnownAs,
        categorySlug: item.category?.slug ?? null,
        categoryName: item.category?.name ?? null,
        summary: item.summary,
        siteRiskLevel: item.siteRiskLevel,
        imagePath: item.imagePath,
        imageAlt: item.imageAlt,
        minRuling: levels.length ? (Math.min(...levels) as RiskLevel) : null,
        maxRuling: levels.length ? (Math.max(...levels) as RiskLevel) : null,
        rulingCount: item.rulings.length,
        hasActiveAlert: alerted.has(item.id),
        levelsByAuthority: Object.fromEntries(item.rulings.map((r) => [r.authorityId, r.riskLevel])),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getAuthorities(): Promise<Authority[]> {
  if (usingFixtures()) return [...fixtureAuthorities].sort((a, b) => a.sortOrder - b.sortOrder);

  const { data, error } = await createPublicClient()
    .from("authorities")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapAuthority);
}

export async function getAuthority(slug: string): Promise<Authority | null> {
  const all = await getAuthorities();
  return all.find((a) => a.slug === slug) ?? null;
}

export async function getRabbis(): Promise<Rabbi[]> {
  if (usingFixtures()) return fixtureRabbis;

  const client = createPublicClient();
  const [{ data: rabbiRows, error: rabbiError }, authorities, produce] = await Promise.all([
    client.from("rabbis").select("*, overrides:rabbi_authority_overrides(*)").order("name", { ascending: true }),
    getAuthorities(),
    getAllProduce(),
  ]);

  if (rabbiError) throw rabbiError;

  const authorityById = new Map(authorities.map((a) => [a.id, a]));
  const produceById = new Map(produce.map((p) => [p.id, p]));

  type RabbiWithOverrides = RabbiRow & {
    overrides: { produce_id: string; authority_id: string; note: string }[] | null;
  };

  return ((rabbiRows ?? []) as unknown as RabbiWithOverrides[]).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    community: row.community,
    region: row.region,
    description: row.description,
    defaultAuthorityId: row.default_authority_id,
    defaultAuthority: row.default_authority_id ? (authorityById.get(row.default_authority_id) ?? null) : null,
    overrides: (row.overrides ?? []).flatMap((o) => {
      const item = produceById.get(o.produce_id);
      if (!item) return [];
      return [
        {
          produceId: o.produce_id,
          produceSlug: item.slug,
          produceName: item.name,
          authorityId: o.authority_id,
          note: o.note,
        },
      ];
    }),
    status: row.status,
  }));
}

export async function getRabbi(slug: string): Promise<Rabbi | null> {
  const all = await getRabbis();
  return all.find((r) => r.slug === slug) ?? null;
}

/** Everything published, newest first. Active and expired together. */
export async function getAllAlerts(): Promise<Alert[]> {
  if (usingFixtures()) return buildFixtureAlerts();

  const { data, error } = await createPublicClient()
    .from("alerts")
    .select(ALERT_SELECT)
    .order("published_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as unknown as AlertWithProduce[]).map(mapAlert);
}

export async function getActiveAlerts(): Promise<Alert[]> {
  const all = await getAllAlerts();
  return all.filter((a) => isAlertActive(a));
}

/** Expired alerts. Kept, never deleted — the archive is public. */
export async function getArchivedAlerts(): Promise<Alert[]> {
  const all = await getAllAlerts();
  return all.filter((a) => !isAlertActive(a));
}

export async function getAlert(slug: string): Promise<Alert | null> {
  const all = await getAllAlerts();
  return all.find((a) => a.slug === slug) ?? null;
}

export async function getAlertsForProduce(produceId: string): Promise<Alert[]> {
  const active = await getActiveAlerts();
  return active.filter((a) => a.produce.some((p) => p.id === produceId));
}
