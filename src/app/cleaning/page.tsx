import type { Metadata } from "next";
import Link from "next/link";
import { CLEANING_METHODS, TIERS, getMethod, methodsByTier } from "@/content/cleaning-methods";

export const metadata: Metadata = {
  title: "Cleaning methods",
  description:
    "How to wash, filter and inspect produce, step by step. Start with the two foundation pages; the working methods build on them in order.",
};

/**
 * The methods index.
 *
 * The hierarchy is the point of this page. Some methods assume you have
 * already learned others, so the order is shown explicitly — as a path at the
 * top and as prerequisites on every card. Nothing is locked: a reader arriving
 * mid-task from a produce page can go straight to what they need and will be
 * told what it builds on.
 */
export default function CleaningIndexPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl sm:text-4xl">Cleaning methods</h1>
        <p className="mt-3 text-[1.0625rem] leading-relaxed text-muted">
          Seven methods, in the order they build on each other. Read the two foundation pages once and everything else
          will make sense. If you have come from a produce page for one specific method, go straight to it — each page
          says what it assumes.
        </p>
      </header>

      <PathDiagram />

      <div className="mt-14 space-y-14">
        {TIERS.map((tier) => {
          const methods = methodsByTier(tier.key);
          if (methods.length === 0) return null;

          return (
            <section key={tier.key} aria-labelledby={`tier-${tier.key}`}>
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h2 id={`tier-${tier.key}`} className="font-display text-2xl">
                  {tier.label}
                </h2>
                <p className="text-[0.9375rem] text-muted">{tier.blurb}</p>
              </div>
              <div className="mesh-rule mt-3" aria-hidden="true" />

              <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                {methods.map((method) => (
                  <li key={method.slug}>
                    <Link
                      href={`/cleaning/${method.slug}`}
                      className="panel panel-lift flex h-full flex-col p-5 no-underline transition-shadow hover:shadow-[var(--shadow-lift)]"
                    >
                      <h3 className="font-display text-[1.25rem] leading-snug">{method.title}</h3>
                      <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-muted">{method.standfirst}</p>

                      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-edge pt-3">
                        <span className="citation">{method.minutes}</span>
                        {method.prerequisites.length > 0 && (
                          <span className="citation">
                            · after {method.prerequisites.map((p) => getMethod(p)?.title.toLowerCase()).join(" and ")}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

/**
 * The dependency path, drawn rather than described. Two roots on the left,
 * everything downstream flowing right.
 */
function PathDiagram() {
  const node = (slug: string) => {
    const m = getMethod(slug);
    return m ? { slug: m.slug, title: m.title } : null;
  };

  const columns = [
    { label: "Start here", items: [node("know-the-insects"), node("rinse-and-look")] },
    { label: "Build on those", items: [node("light-box-inspection"), node("wash-and-agitate")] },
    { label: "Then", items: [node("leaf-by-leaf"), node("filter-the-wash-water")] },
    { label: "Hardest", items: [node("dense-heads-and-florets")] },
  ];

  return (
    <div className="panel mt-8 overflow-x-auto p-5 sm:p-6">
      <h2 className="label">How the methods build on each other</h2>

      <div className="mt-4 flex min-w-[36rem] items-stretch gap-3">
        {columns.map((column, columnIndex) => (
          <div key={column.label} className="flex flex-1 items-center gap-3">
            <div className="flex-1">
              <p className="citation mb-2">{column.label}</p>
              <ul className="space-y-2">
                {column.items.filter(Boolean).map((item) => (
                  <li key={item!.slug}>
                    <Link
                      href={`/cleaning/${item!.slug}`}
                      className="block rounded-md border border-edge bg-paper px-3 py-2 text-[0.875rem] font-medium leading-snug no-underline transition-colors hover:border-accent hover:text-accent"
                    >
                      {item!.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            {columnIndex < columns.length - 1 && (
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" className="shrink-0 text-muted">
                <path
                  d="M2 8h11M9.5 4.5 13 8l-3.5 3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        ))}
      </div>

      <p className="mt-4 text-[0.8125rem] text-muted">
        Nothing here is locked. Go straight to the method you need — it will tell you what it assumes.
      </p>
      <p className="sr-only">
        {CLEANING_METHODS.map(
          (m) =>
            `${m.title}${m.prerequisites.length ? ` builds on ${m.prerequisites.map((p) => getMethod(p)?.title).join(" and ")}` : " has no prerequisites"}. `,
        )}
      </p>
    </div>
  );
}
