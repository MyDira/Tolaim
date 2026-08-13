import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/admin/auth";
import { signOut } from "@/lib/admin/actions";

/**
 * Admin chrome.
 *
 * `/admin` is reachable only by typing it. Nothing in the public site links
 * here, and this subtree is noindex/nofollow on top of the middleware headers
 * and the robots.txt rule.
 */
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/produce", label: "Produce" },
  { href: "/admin/alerts", label: "Alerts" },
  { href: "/admin/authorities", label: "Authorities" },
  { href: "/admin/rabbis", label: "Rabbis" },
  { href: "/admin/review", label: "Review log" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  // Signed out: the login page renders on its own, with no navigation at all.
  if (!session) return <div className="min-h-screen bg-paper">{children}</div>;

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-edge bg-panel">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="font-display text-[1.125rem] leading-none no-underline">
              Tolaim
            </Link>
            <span
              className="rounded-sm px-1.5 py-0.5 font-mono text-[0.625rem] uppercase tracking-[0.1em] text-panel"
              style={{ backgroundColor: "var(--color-accent)" }}
            >
              Admin
            </span>
          </div>

          <div className="flex items-center gap-3 text-[0.8125rem]">
            <span className="hidden text-muted sm:inline">{session.displayName}</span>
            <Link href="/" target="_blank" className="link">
              View site
            </Link>
            <form action={signOut}>
              <button type="submit" className="text-muted underline underline-offset-4 hover:text-accent">
                Sign out
              </button>
            </form>
          </div>
        </div>

        <nav aria-label="Admin sections" className="border-t border-edge">
          <ul className="mx-auto flex max-w-6xl gap-4 overflow-x-auto px-4 py-2 text-[0.875rem] sm:px-6">
            {NAV.map((item) => (
              <li key={item.href} className="shrink-0">
                <Link href={item.href} className="no-underline transition-colors hover:text-accent">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
