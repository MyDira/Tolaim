import type { Metadata } from "next";
import Link from "next/link";
import { AlertCard } from "@/components/AlertPieces";
import { getActiveAlerts, getArchivedAlerts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Alerts",
  description:
    "Current notices about infestation levels, which change by season, region and growing conditions. Expired notices move to the archive.",
};

// The feed is the one part of the site that has to stay genuinely fresh.
export const revalidate = 60;

export default async function AlertsPage() {
  const [active, archived] = await Promise.all([getActiveAlerts(), getArchivedAlerts()]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl sm:text-4xl">Alerts</h1>
        <p className="mt-3 text-[1.0625rem] leading-relaxed text-muted">
          Infestation levels change with the season, the region and the weather a crop grew in. When something changes
          enough to affect what you do at the sink, it is posted here.
        </p>
      </header>

      {active.length > 0 ? (
        <section className="mt-8 space-y-4" aria-label="Current alerts">
          {active.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </section>
      ) : (
        <div className="panel mt-8 px-6 py-12 text-center">
          <p className="font-display text-xl">Nothing current</p>
          <p className="mx-auto mt-2 max-w-md text-[0.9375rem] text-muted">
            There are no active alerts. The guidance on each produce page is what applies.
          </p>
          {archived.length > 0 && (
            <Link href="/alerts/archive" className="link mt-4 inline-block text-[0.9375rem]">
              Read past alerts
            </Link>
          )}
        </div>
      )}

      {active.length > 0 && archived.length > 0 && (
        <>
          <div className="mesh-rule mt-12" aria-hidden="true" />
          <p className="mt-5 text-[0.9375rem] text-muted">
            {archived.length} past {archived.length === 1 ? "alert has" : "alerts have"} expired.{" "}
            <Link href="/alerts/archive" className="link">
              Read the archive
            </Link>
            . Expired alerts are kept rather than deleted, so the record of what was said and when stays available.
          </p>
        </>
      )}
    </div>
  );
}
