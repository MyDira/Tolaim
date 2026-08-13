import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertComposer } from "@/components/admin/AlertComposer";
import { StatusPill } from "@/components/admin/ui";
import { deleteAlert } from "@/lib/admin/actions";
import { approvalHistory, getAlertRow, listProduce } from "@/lib/admin/queries";

export const metadata = { title: "Edit alert" };

export default async function EditAlertPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [alert, produce, history] = await Promise.all([getAlertRow(id), listProduce(), approvalHistory("alert", id)]);

  if (!alert) notFound();

  const removeAlert = deleteAlert.bind(null, alert.id);

  return (
    <div>
      <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-muted">
        <Link href="/admin/alerts" className="no-underline hover:text-accent">
          Alerts
        </Link>
      </nav>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl">Edit alert</h1>
        <StatusPill status={alert.status} />
      </div>

      <div className="mt-6">
        <AlertComposer alert={alert} produce={produce} />
      </div>

      <section className="panel mt-8 p-5">
        <h2 className="font-display text-[1.25rem]">Review history</h2>
        {history.length === 0 ? (
          <p className="mt-2 text-[0.875rem] text-muted">Nothing recorded for this alert yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-edge text-[0.875rem]">
            {history.map((event) => (
              <li key={event.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2">
                <span>
                  <span className="font-medium">{event.actor_email}</span> {event.action}
                  {event.note && <span className="text-muted"> — {event.note}</span>}
                </span>
                <span className="citation">{new Date(event.created_at).toLocaleString("en-GB")}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel mt-6 p-5">
        <h2 className="font-display text-[1.25rem]">Delete this alert</h2>
        <p className="mt-1 max-w-2xl text-[0.8125rem] leading-relaxed text-muted">
          Expired alerts belong in the archive, not the bin. Use &ldquo;expire now&rdquo; on the alerts list unless this
          one was posted in error.
        </p>
        <form action={removeAlert} className="mt-3">
          <button
            type="submit"
            className="rounded-md border px-3.5 py-2 text-[0.875rem] font-semibold"
            style={{
              color: "var(--color-risk-1-fg)",
              backgroundColor: "var(--color-risk-1-bg)",
              borderColor: "color-mix(in srgb, var(--color-risk-1-mark) 30%, transparent)",
            }}
          >
            Delete permanently
          </button>
        </form>
      </section>
    </div>
  );
}
