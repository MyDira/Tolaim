import Link from "next/link";
import { SeverityTag, formatAlertDate } from "@/components/AlertPieces";
import { HomeSearch } from "@/components/HomeSearch";
import { RiskGauge } from "@/components/RiskGauge";
import { getActiveAlerts, getCategories, getProduceSummaries } from "@/lib/data";
import { RISK, RISK_ORDER } from "@/lib/risk";

export const revalidate = 300;

export default async function HomePage() {
  const [items, alerts, categories] = await Promise.all([
    getProduceSummaries(),
    getActiveAlerts(),
    getCategories(),
  ]);

  const urgent = alerts.filter((a) => a.severity === "urgent");
  const headline = urgent[0] ?? alerts[0] ?? null;

  const populatedCategories = categories.filter((c) => items.some((i) => i.categorySlug === c.slug));

  return (
    <div>
      {/* ---- hero ---- */}
      <section className="relative overflow-hidden border-b border-edge">
        <div className="mesh pointer-events-none absolute inset-0 opacity-[0.35]" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-16">
          <h1 className="font-display text-[2.25rem] leading-[1.08] sm:text-[3.25rem]">
            Does it need checking?
          </h1>
          <p className="mt-3 max-w-xl text-[1.0625rem] leading-relaxed text-muted sm:text-[1.125rem]">
            Search any fruit, vegetable or herb and find out whether it has an insect concern, how serious it is, and
            what to do before you eat it.
          </p>

          <div className="mt-6">
            <HomeSearch items={items} />
          </div>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[0.875rem]">
            <Link href="/produce" className="link">
              Browse all {items.length} items
            </Link>
            <Link href="/produce?filter=inspection" className="link">
              Only what needs inspection
            </Link>
            <Link href="/cleaning" className="link">
              How to check
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        {/* ---- current alert ---- */}
        {headline && (
          <section aria-labelledby="alert-heading">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="alert-heading" className="label">
                Right now
              </h2>
              {alerts.length > 1 && (
                <Link href="/alerts" className="link text-[0.8125rem]">
                  All {alerts.length} alerts
                </Link>
              )}
            </div>

            <Link
              href={`/alerts/${headline.slug}`}
              className="panel panel-lift mt-3 block overflow-hidden no-underline transition-shadow hover:shadow-[var(--shadow-lift)]"
            >
              <div
                className="h-1 w-full"
                style={{ backgroundColor: `var(--color-sev-${headline.severity})` }}
                aria-hidden="true"
              />
              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <SeverityTag severity={headline.severity} />
                  <span className="citation">{formatAlertDate(headline.publishedAt)}</span>
                  {headline.region && <span className="citation">· {headline.region}</span>}
                </div>
                <p className="mt-2 font-display text-[1.375rem] leading-snug sm:text-[1.5rem]">{headline.title}</p>
                {headline.summary && (
                  <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-muted">{headline.summary}</p>
                )}
              </div>
            </Link>
          </section>
        )}

        {/* ---- the scale ---- */}
        <section className="mt-14" aria-labelledby="scale-heading">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="scale-heading" className="label">
              The five levels
            </h2>
            <Link href="/risk-levels" className="link text-[0.8125rem]">
              Full legend
            </Link>
          </div>

          <ul className="mt-3 grid gap-2 sm:grid-cols-5">
            {RISK_ORDER.map((level) => (
              <li key={level}>
                <Link
                  href={`/risk-levels#level-${level}`}
                  data-risk-badge
                  className="panel flex h-full flex-col gap-2 p-3.5 no-underline transition-shadow hover:shadow-[var(--shadow-panel)]"
                  style={{
                    backgroundColor: `var(--color-risk-${level}-bg)`,
                    borderColor: `color-mix(in srgb, var(--color-risk-${level}-mark) 25%, transparent)`,
                    color: `var(--color-risk-${level}-fg)`,
                  }}
                >
                  <span className="text-[1.25rem] leading-none">
                    <RiskGauge level={level} />
                  </span>
                  <span className="font-semibold leading-tight">{RISK[level].label}</span>
                  <span className="text-[0.8125rem] leading-snug opacity-85">{RISK[level].gloss}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[0.8125rem] text-muted">
            The line falls between <strong className="font-semibold">home checking</strong> and{" "}
            <strong className="font-semibold">rinse only</strong>: above it, real inspection is required.
          </p>
        </section>

        {/* ---- categories ---- */}
        {populatedCategories.length > 0 && (
          <section className="mt-14" aria-labelledby="browse-heading">
            <h2 id="browse-heading" className="label">
              Browse by kind
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {populatedCategories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/produce?category=${category.slug}`}
                    className="inline-block rounded-md border border-edge bg-panel px-3.5 py-2 text-[0.9375rem] no-underline transition-colors hover:border-accent hover:text-accent"
                  >
                    {category.name}
                    <span className="citation ml-2">
                      {items.filter((i) => i.categorySlug === category.slug).length}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ---- two doors ---- */}
        <section className="mt-14 grid gap-4 sm:grid-cols-2">
          <Link href="/cleaning" className="panel panel-lift p-5 no-underline transition-shadow hover:shadow-[var(--shadow-lift)] sm:p-6">
            <h2 className="font-display text-[1.375rem] leading-snug">Learn to check properly</h2>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
              Seven step-by-step methods, in the order they build on each other. Start with what the insects actually
              look like — that is most of the skill.
            </p>
            <span className="link mt-3 inline-block text-[0.875rem]">Cleaning methods</span>
          </Link>

          <Link href="/my-rabbi" className="panel panel-lift p-5 no-underline transition-shadow hover:shadow-[var(--shadow-lift)] sm:p-6">
            <h2 className="font-display text-[1.375rem] leading-snug">See the ruling that applies to you</h2>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
              Authorities differ. Tell the site which rabbi you follow and their position is shown first everywhere —
              stored in your browser, no account.
            </p>
            <span className="link mt-3 inline-block text-[0.875rem]">Set your rabbi</span>
          </Link>
        </section>
      </div>
    </div>
  );
}
