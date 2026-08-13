"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "./auth";
import { createAdminServerClient } from "@/lib/supabase/server";
import type { ApprovalActionDb, ContentStatusDb } from "@/lib/supabase/database.types";

/**
 * Admin writes.
 *
 * Every action re-checks the session. RLS would reject an unauthenticated
 * write anyway, but failing early gives a usable error instead of a policy
 * violation, and it means the approval-history row is never written by
 * someone we cannot name.
 */

export interface ActionResult {
  ok: boolean;
  error?: string;
}

type EntityType = "produce_item" | "ruling" | "authority" | "rabbi" | "alert";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const str = (form: FormData, key: string) => (form.get(key) as string | null)?.trim() ?? "";
const optional = (form: FormData, key: string) => str(form, key) || null;
const num = (form: FormData, key: string) => {
  const raw = str(form, key);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};

/** Approval columns, kept consistent across every table. */
function approvalFields(
  status: ContentStatusDb,
  userId: string,
): { status: ContentStatusDb; approved_by: string | null; approved_at: string | null } {
  return status === "approved"
    ? { status, approved_by: userId, approved_at: new Date().toISOString() }
    : { status, approved_by: null, approved_at: null };
}

async function logApproval(
  entityType: EntityType,
  entityId: string,
  entityLabel: string,
  action: ApprovalActionDb,
  note = "",
) {
  const session = await requireAdmin();
  const supabase = await createAdminServerClient();
  await supabase.from("approval_events").insert({
    entity_type: entityType,
    entity_id: entityId,
    entity_label: entityLabel,
    action,
    actor_id: session.userId,
    actor_email: session.email,
    note,
  });
}

/** Public pages that depend on almost everything. */
function revalidatePublic() {
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function signIn(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const email = str(form, "email");
  const password = str(form, "password");

  if (!email || !password) return { ok: false, error: "Enter your email address and password." };

  const supabase = await createAdminServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { ok: false, error: "That email address and password do not match an account." };

  const { data: profile } = await supabase.from("admin_users").select("id").eq("id", data.user.id).maybeSingle();

  if (!profile) {
    await supabase.auth.signOut();
    return { ok: false, error: "That account does not have access to this panel." };
  }

  redirect("/admin");
}

export async function signOut(): Promise<void> {
  const supabase = await createAdminServerClient();
  await supabase.auth.signOut();
  redirect("/admin");
}

// ---------------------------------------------------------------------------
// Produce
// ---------------------------------------------------------------------------

interface RulingInput {
  id?: string;
  authority_id: string;
  risk_level: number;
  guidance: string;
  citation: string;
  source_url: string | null;
  effective_date: string | null;
  notes: string;
  status: ContentStatusDb;
  /** Set by the editor when a row is removed. */
  deleted?: boolean;
}

export async function saveProduce(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const supabase = await createAdminServerClient();

  const id = optional(form, "id");
  const name = str(form, "name");
  if (!name) return { ok: false, error: "Give the item a name." };

  const status = (str(form, "status") || "draft") as ContentStatusDb;
  const slug = slugify(str(form, "slug") || name);

  const payload = {
    slug,
    name,
    also_known_as: str(form, "also_known_as")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    category_id: optional(form, "category_id"),
    summary: str(form, "summary"),
    cleaning_guidance: str(form, "cleaning_guidance"),
    season_note: str(form, "season_note"),
    image_path: optional(form, "image_path"),
    image_alt: str(form, "image_alt"),
    site_risk_level: num(form, "site_risk_level"),
    ...approvalFields(status, session.userId),
  };

  let produceId = id;

  if (id) {
    const { error } = await supabase.from("produce_items").update(payload).eq("id", id);
    if (error) return { ok: false, error: friendly(error.message) };
  } else {
    const { data, error } = await supabase.from("produce_items").insert(payload).select("id").single();
    if (error) return { ok: false, error: friendly(error.message) };
    produceId = data.id;
  }

  if (!produceId) return { ok: false, error: "Could not save the item." };

  // --- rulings -------------------------------------------------------------
  let rulings: RulingInput[] = [];
  try {
    rulings = JSON.parse(str(form, "rulings") || "[]");
  } catch {
    return { ok: false, error: "The positions on this item could not be read. Nothing was saved to them." };
  }

  for (const ruling of rulings) {
    if (ruling.deleted) {
      if (ruling.id) await supabase.from("rulings").delete().eq("id", ruling.id);
      continue;
    }
    if (!ruling.authority_id || !ruling.risk_level) continue;

    const rulingPayload = {
      produce_id: produceId,
      authority_id: ruling.authority_id,
      risk_level: ruling.risk_level,
      guidance: ruling.guidance ?? "",
      citation: ruling.citation ?? "",
      source_url: ruling.source_url || null,
      effective_date: ruling.effective_date || null,
      notes: ruling.notes ?? "",
      ...approvalFields((ruling.status ?? "draft") as ContentStatusDb, session.userId),
    };

    const { error } = ruling.id
      ? await supabase.from("rulings").update(rulingPayload).eq("id", ruling.id)
      : await supabase.from("rulings").insert(rulingPayload);

    if (error) return { ok: false, error: friendly(error.message) };
  }

  await logApproval("produce_item", produceId, name, id ? (status === "approved" ? "approved" : "updated") : "created");

  revalidatePublic();
  redirect(`/admin/produce/${produceId}?saved=1`);
}

export async function setProduceStatus(id: string, status: ContentStatusDb, label: string): Promise<void> {
  const session = await requireAdmin();
  const supabase = await createAdminServerClient();

  await supabase.from("produce_items").update(approvalFields(status, session.userId)).eq("id", id);
  await logApproval("produce_item", id, label, status === "approved" ? "approved" : "unapproved");

  revalidatePublic();
  revalidatePath("/admin/produce");
}

export async function deleteProduce(id: string): Promise<void> {
  await requireAdmin();
  const supabase = await createAdminServerClient();
  await supabase.from("produce_items").delete().eq("id", id);
  revalidatePublic();
  redirect("/admin/produce");
}

// ---------------------------------------------------------------------------
// Authorities
// ---------------------------------------------------------------------------

export async function saveAuthority(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const supabase = await createAdminServerClient();

  const id = optional(form, "id");
  const name = str(form, "name");
  if (!name) return { ok: false, error: "Give the authority a name." };

  const status = (str(form, "status") || "draft") as ContentStatusDb;

  const payload = {
    slug: slugify(str(form, "slug") || name),
    name,
    short_name: str(form, "short_name"),
    kind: (str(form, "kind") || "organization") as "organization" | "posek" | "publication",
    region: str(form, "region"),
    description: str(form, "description"),
    website_url: optional(form, "website_url"),
    sort_order: num(form, "sort_order") ?? 100,
    ...approvalFields(status, session.userId),
  };

  const { data, error } = id
    ? await supabase.from("authorities").update(payload).eq("id", id).select("id").single()
    : await supabase.from("authorities").insert(payload).select("id").single();

  if (error) return { ok: false, error: friendly(error.message) };

  await logApproval("authority", data.id, name, id ? "updated" : "created");

  revalidatePublic();
  redirect("/admin/authorities?saved=1");
}

export async function deleteAuthority(id: string): Promise<void> {
  await requireAdmin();
  const supabase = await createAdminServerClient();
  await supabase.from("authorities").delete().eq("id", id);
  revalidatePublic();
  redirect("/admin/authorities");
}

// ---------------------------------------------------------------------------
// Rabbis
// ---------------------------------------------------------------------------

interface OverrideInput {
  produce_id: string;
  authority_id: string;
  note: string;
}

export async function saveRabbi(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const supabase = await createAdminServerClient();

  const id = optional(form, "id");
  const name = str(form, "name");
  if (!name) return { ok: false, error: "Give the rabbi a name." };

  const status = (str(form, "status") || "draft") as ContentStatusDb;

  const payload = {
    slug: slugify(str(form, "slug") || name),
    name,
    community: str(form, "community"),
    region: str(form, "region"),
    description: str(form, "description"),
    default_authority_id: optional(form, "default_authority_id"),
    ...approvalFields(status, session.userId),
  };

  const { data, error } = id
    ? await supabase.from("rabbis").update(payload).eq("id", id).select("id").single()
    : await supabase.from("rabbis").insert(payload).select("id").single();

  if (error) return { ok: false, error: friendly(error.message) };

  // Overrides are small and always sent whole, so replacing them is simpler
  // and less error-prone than diffing.
  let overrides: OverrideInput[] = [];
  try {
    overrides = JSON.parse(str(form, "overrides") || "[]");
  } catch {
    return { ok: false, error: "The per-item exceptions could not be read. Nothing was saved to them." };
  }

  await supabase.from("rabbi_authority_overrides").delete().eq("rabbi_id", data.id);

  const valid = overrides.filter((o) => o.produce_id && o.authority_id);
  if (valid.length > 0) {
    const { error: overrideError } = await supabase.from("rabbi_authority_overrides").insert(
      valid.map((o) => ({
        rabbi_id: data.id,
        produce_id: o.produce_id,
        authority_id: o.authority_id,
        note: o.note ?? "",
      })),
    );
    if (overrideError) return { ok: false, error: friendly(overrideError.message) };
  }

  await logApproval("rabbi", data.id, name, id ? "updated" : "created");

  revalidatePublic();
  redirect("/admin/rabbis?saved=1");
}

export async function deleteRabbi(id: string): Promise<void> {
  await requireAdmin();
  const supabase = await createAdminServerClient();
  await supabase.from("rabbis").delete().eq("id", id);
  revalidatePublic();
  redirect("/admin/rabbis");
}

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------

export async function saveAlert(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const supabase = await createAdminServerClient();

  const id = optional(form, "id");
  const title = str(form, "title");
  if (!title) return { ok: false, error: "Give the alert a title." };

  const status = (str(form, "status") || "draft") as ContentStatusDb;
  const publishedAt = str(form, "published_at");
  const expiresAt = str(form, "expires_at");

  if (publishedAt && expiresAt && new Date(expiresAt) <= new Date(publishedAt)) {
    return { ok: false, error: "The expiry date has to be after the publish date." };
  }

  const payload = {
    slug: slugify(str(form, "slug") || title),
    title,
    summary: str(form, "summary"),
    body: str(form, "body"),
    severity: (str(form, "severity") || "advisory") as "info" | "advisory" | "urgent",
    region: str(form, "region"),
    published_at: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
    expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    ...approvalFields(status, session.userId),
  };

  const { data, error } = id
    ? await supabase.from("alerts").update(payload).eq("id", id).select("id").single()
    : await supabase.from("alerts").insert(payload).select("id").single();

  if (error) return { ok: false, error: friendly(error.message) };

  const produceIds = form.getAll("produce_ids").map(String).filter(Boolean);
  await supabase.from("alert_produce").delete().eq("alert_id", data.id);
  if (produceIds.length > 0) {
    await supabase.from("alert_produce").insert(produceIds.map((produce_id) => ({ alert_id: data.id, produce_id })));
  }

  await logApproval("alert", data.id, title, id ? (status === "approved" ? "approved" : "updated") : "created");

  revalidatePublic();
  redirect("/admin/alerts?saved=1");
}

export async function setAlertStatus(id: string, status: ContentStatusDb, label: string): Promise<void> {
  const session = await requireAdmin();
  const supabase = await createAdminServerClient();

  await supabase.from("alerts").update(approvalFields(status, session.userId)).eq("id", id);
  await logApproval("alert", id, label, status === "approved" ? "approved" : "unapproved");

  revalidatePublic();
  revalidatePath("/admin/alerts");
}

export async function expireAlertNow(id: string, label: string): Promise<void> {
  await requireAdmin();
  const supabase = await createAdminServerClient();

  // Moves the alert to the archive without deleting it, which is the rule.
  await supabase.from("alerts").update({ expires_at: new Date().toISOString() }).eq("id", id);
  await logApproval("alert", id, label, "updated", "Expired early from the admin panel.");

  revalidatePublic();
  revalidatePath("/admin/alerts");
}

export async function deleteAlert(id: string): Promise<void> {
  await requireAdmin();
  const supabase = await createAdminServerClient();
  await supabase.from("alerts").delete().eq("id", id);
  revalidatePublic();
  redirect("/admin/alerts");
}

// ---------------------------------------------------------------------------

/** Turns Postgres errors into something an editor can act on. */
function friendly(message: string): string {
  if (message.includes("duplicate key") && message.includes("slug")) {
    return "Something else already uses that web address. Change the slug and try again.";
  }
  if (message.includes("rulings_produce_id_authority_id_key")) {
    return "That authority already has a position on this item. Edit the existing one instead of adding a second.";
  }
  if (message.includes("violates row-level security")) {
    return "Your account does not have permission to make that change.";
  }
  return message;
}
