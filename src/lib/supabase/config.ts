/**
 * Supabase configuration.
 *
 * The site is designed to run in two modes:
 *
 *   configured   — env vars present, all content comes from Supabase
 *   unconfigured — env vars absent, the bundled sample dataset is used
 *
 * The second mode exists so `npm run dev` works on a fresh clone with no
 * setup. The admin panel is only available in the first.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Throws with a message that says what to do, rather than what went wrong. */
export function requireSupabaseConfig(): { url: string; anonKey: string } {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Copy .env.example to .env.local and fill in " +
        "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from your project's API settings.",
    );
  }
  return { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY };
}

export const STORAGE_BUCKET = "produce-images";

/** Public CDN URL for an object in the images bucket. */
export function storageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (!SUPABASE_URL) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${path.replace(/^\/+/, "")}`;
}
