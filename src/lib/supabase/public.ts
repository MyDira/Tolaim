import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { requireSupabaseConfig } from "./config";

/**
 * Anonymous read client, used during static generation and revalidation.
 *
 * No session, no cookies — it is the `anon` role and therefore sees exactly
 * what an anonymous visitor sees. If a draft ever appears on a public page,
 * the bug is in a policy, not here.
 */
export function createPublicClient() {
  const { url, anonKey } = requireSupabaseConfig();
  return createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
