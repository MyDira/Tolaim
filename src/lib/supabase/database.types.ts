/**
 * Database types.
 *
 * Hand-written to match `supabase/migrations`. Once the project exists you can
 * regenerate this file instead of maintaining it:
 *
 *   npx supabase gen types typescript --project-id <ref> > src/lib/supabase/database.types.ts
 *
 * Note: these are `type` aliases rather than `interface`s on purpose. The
 * client constrains every table to `Record<string, unknown>`, and interfaces do
 * not get an implicit index signature — declaring them as interfaces makes the
 * whole schema fail the constraint and silently degrades every query result to
 * `never`.
 */

export type ContentStatusDb = "draft" | "approved";
export type AuthorityKindDb = "organization" | "posek" | "publication";
export type AlertSeverityDb = "info" | "advisory" | "urgent";
export type AdminRoleDb = "admin" | "reviewer";
export type ApprovalActionDb = "created" | "updated" | "submitted" | "approved" | "unapproved";

type Timestamps = {
  created_at: string;
  updated_at: string;
};

type Reviewable = {
  status: ContentStatusDb;
  approved_by: string | null;
  approved_at: string | null;
};

export type ProduceCategoryRow = {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
};

export type ProduceItemRow = Timestamps &
  Reviewable & {
    id: string;
    slug: string;
    name: string;
    also_known_as: string[];
    category_id: string | null;
    summary: string;
    cleaning_guidance: string;
    season_note: string;
    image_path: string | null;
    image_alt: string;
    site_risk_level: number | null;
  };

export type AuthorityRow = Timestamps &
  Reviewable & {
    id: string;
    slug: string;
    name: string;
    short_name: string;
    kind: AuthorityKindDb;
    region: string;
    description: string;
    website_url: string | null;
    logo_path: string | null;
    sort_order: number;
  };

export type RulingRow = Timestamps &
  Reviewable & {
    id: string;
    produce_id: string;
    authority_id: string;
    risk_level: number;
    guidance: string;
    citation: string;
    source_url: string | null;
    effective_date: string | null;
    notes: string;
  };

export type RabbiRow = Timestamps &
  Reviewable & {
    id: string;
    slug: string;
    name: string;
    community: string;
    region: string;
    description: string;
    default_authority_id: string | null;
  };

export type RabbiOverrideRow = {
  id: string;
  rabbi_id: string;
  produce_id: string;
  authority_id: string;
  note: string;
  created_at: string;
};

export type AlertRow = Timestamps &
  Reviewable & {
    id: string;
    slug: string;
    title: string;
    summary: string;
    body: string;
    severity: AlertSeverityDb;
    region: string;
    published_at: string;
    expires_at: string | null;
  };

export type AlertProduceRow = {
  alert_id: string;
  produce_id: string;
};

export type AdminUserRow = {
  id: string;
  email: string;
  display_name: string;
  role: AdminRoleDb;
  created_at: string;
};

export type ApprovalEventRow = {
  id: string;
  entity_type: "produce_item" | "ruling" | "authority" | "rabbi" | "alert";
  entity_id: string;
  entity_label: string;
  action: ApprovalActionDb;
  actor_id: string | null;
  actor_email: string;
  note: string;
  created_at: string;
};

/**
 * Inserts and updates are `Partial<Row>` throughout: server-side defaults cover
 * ids and timestamps, and the database constraints are the real validation.
 */
type Table<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      produce_categories: Table<ProduceCategoryRow>;
      produce_items: Table<ProduceItemRow>;
      authorities: Table<AuthorityRow>;
      rulings: Table<RulingRow>;
      rabbis: Table<RabbiRow>;
      rabbi_authority_overrides: Table<RabbiOverrideRow>;
      alerts: Table<AlertRow>;
      alert_produce: Table<AlertProduceRow>;
      admin_users: Table<AdminUserRow>;
      approval_events: Table<ApprovalEventRow>;
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      content_status: ContentStatusDb;
      authority_kind: AuthorityKindDb;
      alert_severity: AlertSeverityDb;
      admin_role: AdminRoleDb;
      approval_action: ApprovalActionDb;
    };
    CompositeTypes: { [_ in never]: never };
  };
};
