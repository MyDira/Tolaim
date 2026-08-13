import Link from "next/link";

/**
 * Site footer.
 *
 * No admin link, no sign-in, no hint that an admin panel exists. That is a
 * requirement, not an oversight — the route is reachable only by typing it.
 */

const COLUMNS = [
  {
    heading: "Look up",
    links: [
      { href: "/produce", label: "All produce" },
      { href: "/produce?filter=inspection", label: "Needs inspection" },
      { href: "/risk-levels", label: "The five levels" },
    ],
  },
  {
    heading: "Learn",
    links: [
      { href: "/cleaning", label: "Cleaning methods" },
      { href: "/authorities", label: "Authorities cited" },
      { href: "/my-rabbi", label: "Set your rabbi" },
    ],
  },
  {
    heading: "Notices",
    links: [
      { href: "/alerts", label: "Current alerts" },
      { href: "/alerts/archive", label: "Alert archive" },
      { href: "/about", label: "About this site" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer data-print="hide" className="mt-20 border-t border-edge bg-panel">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-xl leading-none">Tolaim</p>
            <p className="mt-3 max-w-xs text-[0.875rem] leading-relaxed text-muted">
              A reference for insect inspection in fruit, vegetables and herbs. Prepared under rabbinic oversight and
              reviewed before publication.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="label">{column.heading}</h2>
              <ul className="mt-3 space-y-2 text-[0.9375rem]">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="no-underline transition-colors hover:text-accent">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mesh-rule mt-12" aria-hidden="true" />

        <p className="mt-6 max-w-3xl text-[0.8125rem] leading-relaxed text-muted">
          This site reports the positions of the authorities it cites. It does not decide questions of halacha. Where
          authorities differ, the difference is shown rather than resolved. For a ruling that applies to you, ask your
          own rabbi.
        </p>
      </div>
    </footer>
  );
}
