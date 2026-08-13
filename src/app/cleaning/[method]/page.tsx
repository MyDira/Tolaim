import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MethodIllustration } from "@/components/MethodIllustration";
import { CLEANING_METHODS, getMethod, methodsBuildingOn } from "@/content/cleaning-methods";

export async function generateStaticParams() {
  return CLEANING_METHODS.map((m) => ({ method: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ method: string }> }): Promise<Metadata> {
  const { method: slug } = await params;
  const method = getMethod(slug);
  if (!method) return { title: "Not found" };
  return { title: method.title, description: method.standfirst };
}

export default async function CleaningMethodPage({ params }: { params: Promise<{ method: string }> }) {
  const { method: slug } = await params;
  const method = getMethod(slug);
  if (!method) notFound();

  const prerequisites = method.prerequisites.map(getMethod).filter(Boolean);
  const nextUp = methodsBuildingOn(method.slug);

  return (
    <article className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <nav data-print="hide" aria-label="Breadcrumb" className="text-[0.8125rem] text-muted">
        <Link href="/cleaning" className="no-underline hover:text-accent">
          Cleaning methods
        </Link>
      </nav>

      <header className="mt-4">
        <h1 className="font-display text-[2rem] leading-tight sm:text-[2.5rem]">{method.title}</h1>
        <p className="mt-3 max-w-2xl text-[1.0625rem] leading-relaxed text-muted">{method.standfirst}</p>
      </header>

      {/* ---- what this assumes ---- */}
      {prerequisites.length > 0 && (
        <aside className="panel mt-6 border-l-4 p-4" style={{ borderLeftColor: "var(--color-accent)" }}>
          <h2 className="label">This method assumes</h2>
          <ul className="mt-2 space-y-1.5">
            {prerequisites.map((p) => (
              <li key={p!.slug} className="text-[0.9375rem]">
                <Link href={`/cleaning/${p!.slug}`} className="link">
                  {p!.title}
                </Link>
                <span className="text-muted"> — {p!.standfirst}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[0.8125rem] text-muted">
            You can read this page without them. If a step seems to skip something, it is probably explained there.
          </p>
        </aside>
      )}

      {/* ---- setup ---- */}
      <div className="mt-6 grid gap-5 sm:grid-cols-[1fr_1.1fr] sm:items-start">
        <div className="panel p-5">
          <h2 className="label">What you need</h2>
          <ul className="mt-2.5 space-y-1.5">
            {method.needs.map((need) => (
              <li key={need} className="flex gap-2.5 text-[0.9375rem] leading-snug">
                <span
                  className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rotate-45 border border-muted"
                  aria-hidden="true"
                />
                {need}
              </li>
            ))}
          </ul>
          <p className="citation mt-4 border-t border-edge pt-3">{method.minutes}</p>
        </div>

        {/* Skipped when a step already carries the same diagram, so the page
            does not open with the picture it is about to show again. */}
        {method.steps.some((step) => step.figure === method.figure) ? (
          <div className="panel bg-paper p-5">
            <h2 className="label">What this is for</h2>
            <p className="mt-2 text-[0.9375rem] leading-relaxed">{method.standfirst}</p>
          </div>
        ) : (
          <MethodIllustration figure={method.figure} />
        )}
      </div>

      {/* ---- steps ---- */}
      <section className="mt-10">
        <h2 className="font-display text-2xl">Step by step</h2>
        <ol className="mt-5 space-y-8">
          {method.steps.map((step, index) => (
            <li key={step.title} className="grid grid-cols-[2.25rem_1fr] gap-x-3 gap-y-3 sm:grid-cols-[2.75rem_1fr] sm:gap-x-4">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-edge bg-panel font-mono text-[0.8125rem] sm:h-9 sm:w-9"
              >
                {index + 1}
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-[1.1875rem] leading-snug">{step.title}</h3>
                <p className="mt-1.5 max-w-2xl text-[1rem] leading-relaxed">{step.body}</p>
              </div>
              {step.figure && (
                <div className="col-start-2">
                  <MethodIllustration figure={step.figure} caption={step.caption} className="max-w-md" />
                </div>
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* ---- watch for ---- */}
      <section className="mt-12">
        <div className="panel overflow-hidden">
          <h2
            className="px-5 py-2.5 text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-panel"
            style={{ backgroundColor: "var(--color-risk-2-mark)" }}
          >
            Where this usually goes wrong
          </h2>
          <ul className="space-y-3 p-5">
            {method.watchFor.map((item) => (
              <li key={item} className="flex gap-3 text-[0.9375rem] leading-relaxed">
                <span className="mt-[0.35em] shrink-0 font-mono text-[0.875rem]" style={{ color: "var(--color-risk-2-mark)" }} aria-hidden="true">
                  ×
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---- onward ---- */}
      {nextUp.length > 0 && (
        <section data-print="hide" className="mt-12">
          <h2 className="label">What this leads to</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {nextUp.map((m) => (
              <li key={m.slug}>
                <Link
                  href={`/cleaning/${m.slug}`}
                  className="panel flex h-full flex-col p-4 no-underline transition-colors hover:border-accent"
                >
                  <span className="font-display text-[1.0625rem] leading-snug">{m.title}</span>
                  <span className="mt-1.5 text-[0.875rem] leading-relaxed text-muted">{m.standfirst}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="print-only citation mt-10">tolaim — {method.title}</p>
    </article>
  );
}
