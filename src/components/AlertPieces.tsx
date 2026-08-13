import Link from "next/link";
import type { Alert, AlertSeverity } from "@/lib/types";

/**
 * Alert presentation, shared by the feed, the archive and the produce pages.
 *
 * Severity borrows three colours from the risk scale rather than introducing a
 * second palette. An alert is loud because of where it sits, not because of a
 * colour nobody has seen before.
 */

export const SEVERITY: Record<AlertSeverity, { label: string; token: string }> = {
  urgent: { label: "Urgent", token: "var(--color-sev-urgent)" },
  advisory: { label: "Advisory", token: "var(--color-sev-advisory)" },
  info: { label: "Notice", token: "var(--color-sev-info)" },
};

export function SeverityTag({ severity, expired = false }: { severity: AlertSeverity; expired?: boolean }) {
  const meta = SEVERITY[severity];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em]"
      style={{
        color: expired ? "var(--color-muted)" : meta.token,
        borderColor: expired ? "var(--color-edge)" : `color-mix(in srgb, ${meta.token} 35%, transparent)`,
      }}
    >
      {!expired && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.token }} aria-hidden="true" />}
      {expired ? "Expired" : meta.label}
    </span>
  );
}

export function formatAlertDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/** Feed and archive row. */
export function AlertCard({ alert, expired = false }: { alert: Alert; expired?: boolean }) {
  return (
    <article className="panel panel-lift overflow-hidden">
      {!expired && (
        <div className="h-1 w-full" style={{ backgroundColor: SEVERITY[alert.severity].token }} aria-hidden="true" />
      )}
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <SeverityTag severity={alert.severity} expired={expired} />
          <span className="citation">{formatAlertDate(alert.publishedAt)}</span>
          {alert.region && <span className="citation">· {alert.region}</span>}
        </div>

        <h2 className="mt-2.5 font-display text-[1.375rem] leading-snug sm:text-[1.5rem]">
          <Link href={`/alerts/${alert.slug}`} className="no-underline transition-colors hover:text-accent">
            {alert.title}
          </Link>
        </h2>

        {alert.summary && <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-muted">{alert.summary}</p>}

        {alert.produce.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <span className="label mr-1">Affects</span>
            {alert.produce.map((p) => (
              <Link
                key={p.id}
                href={`/produce/${p.slug}`}
                className="rounded-sm border border-edge px-1.5 py-0.5 text-[0.8125rem] no-underline transition-colors hover:border-accent hover:text-accent"
              >
                {p.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

/**
 * The inline notice on a produce page. An active alert has to surface where
 * the visitor is looking, not only in the feed.
 */
export function ProduceAlertNotice({ alert }: { alert: Alert }) {
  const meta = SEVERITY[alert.severity];
  return (
    <Link
      href={`/alerts/${alert.slug}`}
      className="panel flex gap-3 border-l-4 p-4 no-underline transition-shadow hover:shadow-[var(--shadow-panel)]"
      style={{ borderLeftColor: meta.token }}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <SeverityTag severity={alert.severity} />
          <span className="citation">{formatAlertDate(alert.publishedAt)}</span>
        </div>
        <p className="mt-1.5 font-display text-[1.0625rem] leading-snug">{alert.title}</p>
        {alert.summary && <p className="mt-1 text-[0.875rem] leading-relaxed text-muted">{alert.summary}</p>}
      </div>
    </Link>
  );
}
