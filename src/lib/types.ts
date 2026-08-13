import type { RiskLevel } from "./risk";

export type ContentStatus = "draft" | "approved";
export type AuthorityKind = "organization" | "posek" | "publication";
export type AlertSeverity = "info" | "advisory" | "urgent";
export type AdminRole = "admin" | "reviewer";
export type ApprovalAction = "created" | "updated" | "submitted" | "approved" | "unapproved";

export interface Category {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
}

export interface Authority {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  kind: AuthorityKind;
  region: string;
  description: string;
  websiteUrl: string | null;
  logoPath: string | null;
  sortOrder: number;
  status: ContentStatus;
}

/** One authority's position on one produce item. */
export interface Ruling {
  id: string;
  produceId: string;
  authorityId: string;
  authority: Authority | null;
  riskLevel: RiskLevel;
  guidance: string;
  citation: string;
  sourceUrl: string | null;
  effectiveDate: string | null;
  notes: string;
  status: ContentStatus;
}

export interface ProduceItem {
  id: string;
  slug: string;
  name: string;
  alsoKnownAs: string[];
  categoryId: string | null;
  category: Category | null;
  summary: string;
  cleaningGuidance: string;
  seasonNote: string;
  imagePath: string | null;
  imageAlt: string;
  /** Authored editorial summary. Never derived from the rulings. */
  siteRiskLevel: RiskLevel | null;
  status: ContentStatus;
  approvedAt: string | null;
  updatedAt: string;
  rulings: Ruling[];
}

/** The lighter shape used by the listing grid and the client search index. */
export interface ProduceSummary {
  id: string;
  slug: string;
  name: string;
  alsoKnownAs: string[];
  categorySlug: string | null;
  categoryName: string | null;
  summary: string;
  siteRiskLevel: RiskLevel | null;
  imagePath: string | null;
  imageAlt: string;
  /** Spread of positions across approved authorities, for the "authorities differ" hint. */
  minRuling: RiskLevel | null;
  maxRuling: RiskLevel | null;
  rulingCount: number;
  hasActiveAlert: boolean;
  /**
   * Level per authority, so the listing can surface the visitor's own rabbi's
   * position without a second request. Small enough to ship with the index.
   */
  levelsByAuthority: Record<string, RiskLevel>;
}

export interface RabbiOverride {
  produceId: string;
  produceSlug: string;
  produceName: string;
  authorityId: string;
  note: string;
}

export interface Rabbi {
  id: string;
  slug: string;
  name: string;
  community: string;
  region: string;
  description: string;
  defaultAuthorityId: string | null;
  defaultAuthority: Authority | null;
  overrides: RabbiOverride[];
  status: ContentStatus;
}

export interface Alert {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  severity: AlertSeverity;
  region: string;
  publishedAt: string;
  expiresAt: string | null;
  status: ContentStatus;
  produce: { id: string; slug: string; name: string }[];
}

export interface ApprovalEvent {
  id: string;
  entityType: "produce_item" | "ruling" | "authority" | "rabbi" | "alert";
  entityId: string;
  entityLabel: string;
  action: ApprovalAction;
  actorEmail: string;
  note: string;
  createdAt: string;
}

/** True when the alert is published and has not expired. */
export function isAlertActive(alert: Pick<Alert, "publishedAt" | "expiresAt">, now = new Date()): boolean {
  if (new Date(alert.publishedAt) > now) return false;
  if (alert.expiresAt && new Date(alert.expiresAt) <= now) return false;
  return true;
}
