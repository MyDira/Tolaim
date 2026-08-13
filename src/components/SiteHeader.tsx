import Link from "next/link";
import { MyRabbiChip } from "./MyRabbiChip";

/**
 * Site header.
 *
 * Four destinations, all visible at once on a phone — no menu button to learn
 * and nothing hidden behind a tap. There is deliberately no admin link here or
 * anywhere else in the public site.
 */

const NAV = [
  { href: "/produce", label: "Produce" },
  { href: "/alerts", label: "Alerts" },
  { href: "/cleaning", label: "Cleaning" },
  { href: "/risk-levels", label: "Levels" },
];

export function SiteHeader() {
  return (
    <header
      data-print="hide"
      className="sticky top-0 z-30 border-b border-edge bg-paper/85 backdrop-blur-md supports-[backdrop-filter]:bg-paper/75"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <Link href="/" className="group flex items-baseline gap-2 no-underline">
          <span className="font-display text-[1.375rem] leading-none tracking-tight">Tolaim</span>
          <span className="hidden text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted sm:inline">
            Produce inspection
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">
          <nav aria-label="Main">
            <ul className="flex items-center gap-3 text-[0.875rem] sm:gap-5">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="rounded-xs no-underline decoration-1 underline-offset-4 transition-colors hover:text-accent hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden sm:block">
            <MyRabbiChip />
          </div>
        </div>
      </div>

      {/* On a phone the rabbi chip gets its own line rather than being squeezed. */}
      <div className="border-t border-edge/60 px-4 py-1.5 sm:hidden">
        <MyRabbiChip />
      </div>
    </header>
  );
}
