import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProduceAlertNotice } from "@/components/AlertPieces";
import { Markdown } from "@/components/Markdown";
import { ProduceAnswer } from "@/components/ProduceAnswer";
import { ProduceImage } from "@/components/ProduceImage";
import { RulingsList } from "@/components/RulingsList";
import { getAlertsForProduce, getAllProduce, getProduceItem } from "@/lib/data";
import { RISK } from "@/lib/risk";
import { suggestedMethodFor } from "@/content/cleaning-methods";

export const revalidate = 300;

export async function generateStaticParams() {
  const items = await getAllProduce();
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = await getProduceItem(slug);
  if (!item) return { title: "Not found" };

  const level = item.siteRiskLevel ? RISK[item.siteRiskLevel].label : null;

  return {
    title: item.name,
    description: item.summary || `Insect checking guidance for ${item.name.toLowerCase()}.`,
    openGraph: {
      title: level ? `${item.name} — ${level}` : item.name,
      description: item.summary,
    },
  };
}

export default async function ProduceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getProduceItem(slug);
  if (!item) notFound();

  const alerts = await getAlertsForProduce(item.id);
  const method = suggestedMethodFor(item.siteRiskLevel, item.category?.slug ?? null);

  return (
    <article className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <nav data-print="hide" aria-label="Breadcrumb" className="text-[0.8125rem] text-muted">
        <Link href="/produce" className="no-underline hover:text-accent">
          Produce
        </Link>
        {item.category && (
          <>
            <span className="mx-1.5" aria-hidden="true">
              /
            </span>
            <Link href={`/produce?category=${item.category.slug}`} className="no-underline hover:text-accent">
              {item.category.name}
            </Link>
          </>
        )}
      </nav>

      {/* ---- identity ---- */}
      <header className="mt-4 flex items-start gap-4 sm:gap-5">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-edge sm:h-28 sm:w-28">
          <ProduceImage
            imagePath={item.imagePath}
            alt={item.imageAlt}
            categorySlug={item.category?.slug ?? null}
            sizes="112px"
            priority
          />
        </div>
        <div className="min-w-0 pt-0.5">
          <h1 className="font-display text-[2rem] leading-tight sm:text-[2.5rem]">{item.name}</h1>
          {item.alsoKnownAs.length > 0 && (
            <p className="mt-1 text-[0.9375rem] text-muted">Also called {item.alsoKnownAs.join(", ")}</p>
          )}
        </div>
      </header>

      {/* ---- the answer ---- */}
      <ProduceAnswer item={item} />

      {/* ---- alerts affecting this item ---- */}
      {alerts.length > 0 && (
        <section className="mt-5 space-y-3" aria-label="Current alerts for this item">
          {alerts.map((alert) => (
            <ProduceAlertNotice key={alert.id} alert={alert} />
          ))}
        </section>
      )}

      {/* ---- what to do ---- */}
      {item.cleaningGuidance && (
        <section className="mt-10">
          <h2 className="font-display text-2xl">What to do</h2>
          <Markdown source={item.cleaningGuidance} className="mt-3" />

          {method && (
            <Link
              data-print="hide"
              href={`/cleaning/${method.slug}`}
              className="panel mt-5 flex items-center justify-between gap-4 p-4 no-underline transition-colors hover:border-accent"
            >
              <span className="min-w-0">
                <span className="label">Step-by-step method</span>
                <span className="mt-0.5 block font-display text-[1.0625rem] leading-snug">{method.title}</span>
              </span>
              <ArrowIcon />
            </Link>
          )}
        </section>
      )}

      {/* ---- season ---- */}
      {item.seasonNote && (
        <section className="mt-8">
          <div className="panel border-l-4 p-4" style={{ borderLeftColor: "var(--color-accent)" }}>
            <h2 className="label">Season and region</h2>
            <p className="mt-1.5 text-[0.9375rem] leading-relaxed">{item.seasonNote}</p>
          </div>
        </section>
      )}

      {/* ---- who says what ---- */}
      <RulingsList item={item} />

      {/* ---- provenance ---- */}
      <footer className="mt-12 border-t border-edge pt-5">
        <p className="citation">
          {item.approvedAt ? <>Reviewed and approved {formatDate(item.approvedAt)}.</> : null} Last updated{" "}
          {formatDate(item.updatedAt)}.
        </p>
        <p className="mt-2 max-w-2xl text-[0.8125rem] leading-relaxed text-muted">
          This page reports the positions of the authorities named on it. For a ruling that applies to you, ask your own
          rabbi.
        </p>
      </footer>
    </article>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" className="shrink-0 text-accent">
      <path d="M4 10h11M11 5.5 15.5 10 11 14.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
