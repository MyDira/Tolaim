import type { Metadata } from "next";
import Link from "next/link";
import { AlertCard } from "@/components/AlertPieces";
import { getArchivedAlerts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Alert archive",
  description: "Past alerts, kept on record after they expire.",
};

export const revalidate = 300;

export default async function AlertArchivePage() {
  const archived = await getArchivedAlerts();

  // Grouped by year so a long archive stays navigable.
  const byYear = new Map<number, typeof archived>();
  for (const alert of archived) {
    const year = new Date(alert.publishedAt).getFullYear();
    byYear.set(year, [...(byYear.get(year) ?? []), alert]);
  }
  const years = [...byYear.keys()].sort((a, b) => b - a);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <nav data-print="hide" aria-label="Breadcrumb" className="text-[0.8125rem] text-muted">
        <Link href="/alerts" className="no-underline hover:text-accent">
          Alerts
        </Link>
      </nav>

      <header className="mt-4 max-w-2xl">
        <h1 className="font-display text-3xl sm:text-4xl">Alert archive</h1>
        <p className="mt-3 text-[1.0625rem] leading-relaxed text-muted">
          Alerts that have expired. They are kept rather than deleted, so what was said and when stays on record. An
          expired alert no longer applies — the guidance on the produce page is what stands.
        </p>
      </header>

      {archived.length === 0 ? (
        <div className="panel mt-8 px-6 py-12 text-center">
          <p className="font-display text-xl">The archive is empty</p>
          <p className="mx-auto mt-2 max-w-md text-[0.9375rem] text-muted">
            No alert has expired yet. Current notices are on the{" "}
            <Link href="/alerts" className="link">
              alerts page
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {years.map((year) => (
            <section key={year} aria-labelledby={`year-${year}`}>
              <h2 id={`year-${year}`} className="label">
                {year}
              </h2>
              <div className="mt-3 space-y-4">
                {byYear.get(year)!.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} expired />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
