import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SeverityTag, formatAlertDate } from "@/components/AlertPieces";
import { Markdown } from "@/components/Markdown";
import { getAlert, getAllAlerts } from "@/lib/data";
import { isAlertActive } from "@/lib/types";

export const revalidate = 60;

export async function generateStaticParams() {
  const alerts = await getAllAlerts();
  return alerts.map((alert) => ({ slug: alert.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const alert = await getAlert(slug);
  if (!alert) return { title: "Not found" };
  return { title: alert.title, description: alert.summary };
}

export default async function AlertPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const alert = await getAlert(slug);
  if (!alert) notFound();

  const active = isAlertActive(alert);

  return (
    <article className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <nav data-print="hide" aria-label="Breadcrumb" className="text-[0.8125rem] text-muted">
        <Link href="/alerts" className="no-underline hover:text-accent">
          Alerts
        </Link>
        {!active && (
          <>
            <span className="mx-1.5" aria-hidden="true">
              /
            </span>
            <Link href="/alerts/archive" className="no-underline hover:text-accent">
              Archive
            </Link>
          </>
        )}
      </nav>

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <SeverityTag severity={alert.severity} expired={!active} />
          <span className="citation">{formatAlertDate(alert.publishedAt)}</span>
          {alert.region && <span className="citation">· {alert.region}</span>}
        </div>

        <h1 className="mt-3 font-display text-[2rem] leading-tight sm:text-[2.5rem]">{alert.title}</h1>
        {alert.summary && <p className="mt-3 max-w-2xl text-[1.125rem] leading-relaxed text-muted">{alert.summary}</p>}
      </header>

      {!active && (
        <div className="panel mt-6 border-l-4 border-l-edge bg-paper p-4">
          <h2 className="label">This alert has expired</h2>
          <p className="mt-1.5 text-[0.9375rem] leading-relaxed">
            It expired on {alert.expiresAt ? formatAlertDate(alert.expiresAt) : "an earlier date"} and no longer
            applies. It is kept for the record. What stands now is the guidance on the produce page.
          </p>
        </div>
      )}

      <div className="mt-8">
        <Markdown source={alert.body} />
      </div>

      {alert.produce.length > 0 && (
        <section className="mt-10 border-t border-edge pt-6">
          <h2 className="label">Produce affected</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {alert.produce.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/produce/${p.slug}`}
                  className="inline-block rounded-md border border-edge bg-panel px-3 py-1.5 text-[0.9375rem] no-underline transition-colors hover:border-accent hover:text-accent"
                >
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {active && alert.expiresAt && (
        <p className="citation mt-8">Due for review by {formatAlertDate(alert.expiresAt)}.</p>
      )}
    </article>
  );
}
