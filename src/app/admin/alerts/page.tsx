import Link from "next/link";
import { SeverityTag } from "@/components/AlertPieces";
import { SavedNote, StatusPill } from "@/components/admin/ui";
import { expireAlertNow } from "@/lib/admin/actions";
import { listAlerts } from "@/lib/admin/queries";

export const metadata = { title: "Alerts" };

export default async function AdminAlertsList({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const alerts = await listAlerts();
  const now = Date.now();

  const isActive = (a: (typeof alerts)[number]) =>
    a.status === "approved" &&
    new Date(a.published_at).getTime() <= now &&
    (!a.expires_at || new Date(a.expires_at).getTime() > now);

  const active = alerts.filter(isActive);
  const drafts = alerts.filter((a) => a.status === "draft");
  const scheduled = alerts.filter((a) => a.status === "approved" && new Date(a.published_at).getTime() > now);
  const expired = alerts.filter(
    (a) => a.status === "approved" && a.expires_at !== null && new Date(a.expires_at).getTime() <= now,
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Alerts</h1>
          <p className="mt-1 text-[0.9375rem] text-muted">
            {active.length} active · {drafts.length} draft · {expired.length} archived
          </p>
        </div>
        <Link
          href="/admin/alerts/new"
          className="rounded-md px-3.5 py-2 text-[0.875rem] font-semibold text-panel no-underline"
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          New alert
        </Link>
      </div>

      {saved && <div className="mt-4"><SavedNote>Saved.</SavedNote></div>}

      <div className="mt-6 space-y-8">
        <Group title="Active" alerts={active} showExpire />
        <Group title="Scheduled" alerts={scheduled} />
        <Group title="Drafts" alerts={drafts} />
        <Group title="Archived" alerts={expired} />
      </div>

      {alerts.length === 0 && (
        <div className="panel mt-6 px-6 py-12 text-center">
          <p className="font-display text-xl">No alerts yet</p>
          <p className="mx-auto mt-2 max-w-md text-[0.9375rem] text-muted">
            Post one when infestation levels change enough to affect what people do at the sink.
          </p>
          <Link href="/admin/alerts/new" className="link mt-4 inline-block">
            Write the first one
          </Link>
        </div>
      )}
    </div>
  );
}

function Group({
  title,
  alerts,
  showExpire = false,
}: {
  title: string;
  alerts: Awaited<ReturnType<typeof listAlerts>>;
  showExpire?: boolean;
}) {
  if (alerts.length === 0) return null;

  return (
    <section>
      <h2 className="label">
        {title} ({alerts.length})
      </h2>
      <ul className="panel mt-2 divide-y divide-edge overflow-hidden">
        {alerts.map((alert) => {
          const expire = expireAlertNow.bind(null, alert.id, alert.title);
          return (
            <li key={alert.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityTag severity={alert.severity} />
                  <StatusPill status={alert.status} />
                </div>
                <Link href={`/admin/alerts/${alert.id}`} className="mt-1 block font-medium no-underline hover:text-accent">
                  {alert.title}
                </Link>
                <p className="citation mt-0.5">
                  {new Date(alert.published_at).toLocaleDateString("en-GB")}
                  {alert.expires_at && ` → ${new Date(alert.expires_at).toLocaleDateString("en-GB")}`}
                  {alert.alert_produce.length > 0 && ` · ${alert.alert_produce.length} items linked`}
                </p>
              </div>

              {showExpire && (
                <form action={expire}>
                  <button
                    type="submit"
                    className="rounded-md border border-edge px-2.5 py-1.5 text-[0.8125rem] transition-colors hover:border-accent hover:text-accent"
                    title="Move this alert to the public archive now. It is not deleted."
                  >
                    Expire now
                  </button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
