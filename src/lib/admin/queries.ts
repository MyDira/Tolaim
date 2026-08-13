import "server-only";

import { createAdminServerClient } from "@/lib/supabase/server";
import type {
  AlertRow,
  ApprovalEventRow,
  AuthorityRow,
  ProduceCategoryRow,
  ProduceItemRow,
  RabbiOverrideRow,
  RabbiRow,
  RulingRow,
} from "@/lib/supabase/database.types";

/**
 * Admin reads.
 *
 * Separate from the public read layer because these deliberately see drafts.
 * They run as the signed-in admin, so the same RLS policies apply — an admin
 * sees everything because a policy says so, not because this code asks nicely.
 */

export interface AdminProduceRow extends ProduceItemRow {
  category: ProduceCategoryRow | null;
  rulings: (RulingRow & { authority: Pick<AuthorityRow, "id" | "name" | "short_name" | "slug"> | null })[];
}

export async function listProduce(): Promise<AdminProduceRow[]> {
  const supabase = await createAdminServerClient();
  const { data, error } = await supabase
    .from("produce_items")
    .select("*, category:produce_categories(*), rulings(*, authority:authorities(id, name, short_name, slug))")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as AdminProduceRow[];
}

export async function getProduce(id: string): Promise<AdminProduceRow | null> {
  const supabase = await createAdminServerClient();
  const { data, error } = await supabase
    .from("produce_items")
    .select("*, category:produce_categories(*), rulings(*, authority:authorities(id, name, short_name, slug))")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data as unknown as AdminProduceRow) ?? null;
}

export async function listCategories(): Promise<ProduceCategoryRow[]> {
  const supabase = await createAdminServerClient();
  const { data, error } = await supabase.from("produce_categories").select("*").order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function listAuthorities(): Promise<AuthorityRow[]> {
  const supabase = await createAdminServerClient();
  const { data, error } = await supabase.from("authorities").select("*").order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function getAuthorityRow(id: string): Promise<AuthorityRow | null> {
  const supabase = await createAdminServerClient();
  const { data, error } = await supabase.from("authorities").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export interface AdminRabbiRow extends RabbiRow {
  overrides: RabbiOverrideRow[];
}

export async function listRabbis(): Promise<AdminRabbiRow[]> {
  const supabase = await createAdminServerClient();
  const { data, error } = await supabase
    .from("rabbis")
    .select("*, overrides:rabbi_authority_overrides(*)")
    .order("name");
  if (error) throw error;
  return (data ?? []) as unknown as AdminRabbiRow[];
}

export async function getRabbiRow(id: string): Promise<AdminRabbiRow | null> {
  const supabase = await createAdminServerClient();
  const { data, error } = await supabase
    .from("rabbis")
    .select("*, overrides:rabbi_authority_overrides(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as AdminRabbiRow) ?? null;
}

export interface AdminAlertRow extends AlertRow {
  alert_produce: { produce_id: string }[];
}

export async function listAlerts(): Promise<AdminAlertRow[]> {
  const supabase = await createAdminServerClient();
  const { data, error } = await supabase
    .from("alerts")
    .select("*, alert_produce(produce_id)")
    .order("published_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as AdminAlertRow[];
}

export async function getAlertRow(id: string): Promise<AdminAlertRow | null> {
  const supabase = await createAdminServerClient();
  const { data, error } = await supabase
    .from("alerts")
    .select("*, alert_produce(produce_id)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as AdminAlertRow) ?? null;
}

export async function recentApprovals(limit = 25): Promise<ApprovalEventRow[]> {
  const supabase = await createAdminServerClient();
  const { data, error } = await supabase
    .from("approval_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function approvalHistory(
  entityType: ApprovalEventRow["entity_type"],
  entityId: string,
): Promise<ApprovalEventRow[]> {
  const supabase = await createAdminServerClient();
  const { data, error } = await supabase
    .from("approval_events")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
