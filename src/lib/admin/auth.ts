import "server-only";

import { createAdminServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export interface AdminSession {
  userId: string;
  email: string;
  displayName: string;
  role: "admin" | "reviewer";
}

/**
 * Who is signed in, if anyone.
 *
 * Membership of `admin_users` is what grants access — being authenticated is
 * not enough. There is no public signup, so in practice the two coincide, but
 * the check is written the strict way on purpose.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = await createAdminServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("admin_users")
    .select("id, email, display_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;

  return {
    userId: profile.id,
    email: profile.email || user.email || "",
    displayName: profile.display_name || profile.email || user.email || "",
    role: profile.role,
  };
}

/** For server actions. Throws rather than redirecting — actions are not pages. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) throw new Error("Not signed in.");
  return session;
}
