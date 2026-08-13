import Link from "next/link";
import { notFound } from "next/navigation";
import { ProduceForm } from "@/components/admin/ProduceForm";
import { SavedNote, StatusPill } from "@/components/admin/ui";
import { deleteProduce } from "@/lib/admin/actions";
import { approvalHistory, getProduce, listAuthorities, listCategories } from "@/lib/admin/queries";

export const metadata = { title: "Edit produce item" };

export default async function EditProducePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;

  const [item, categories, authorities, history] = await Promise.all([
    getProduce(id),
    listCategories(),
    listAuthorities(),
    approvalHistory("produce_item", id),
  ]);

  if (!item) notFound();

  const removeItem = deleteProduce.bind(null, item.id);

  return (
    <div>
      <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-muted">
        <Link href="/admin/produce" className="no-underline hover:text-accent">
          Produce
        </Link>
      </nav>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl">{item.name}</h1>
        <StatusPill status={item.status} />
      </div>

      {saved && <div className="mt-4"><SavedNote>Saved.</SavedNote></div>}

      <div className="mt-6">
        <ProduceForm item={item} categories={categories} authorities={authorities} />
      </div>

      {/* ---- history ---- */}
      <section className="panel mt-8 p-5">
        <h2 className="font-display text-[1.25rem]">Review history</h2>
        {history.length === 0 ? (
          <p className="mt-2 text-[0.875rem] text-muted">Nothing recorded for this item yet.</p>
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

      {/* ---- delete ---- */}
      <section className="panel mt-6 p-5">
        <h2 className="font-display text-[1.25rem]">Delete this item</h2>
        <p className="mt-1 max-w-2xl text-[0.8125rem] leading-relaxed text-muted">
          Deleting removes the item and every position on it. To take something off the public site without losing it,
          untick &ldquo;approved&rdquo; above and save instead.
        </p>
        <form action={removeItem} className="mt-3">
          <button
            type="submit"
            className="rounded-md border px-3.5 py-2 text-[0.875rem] font-semibold"
            style={{
              color: "var(--color-risk-1-fg)",
              backgroundColor: "var(--color-risk-1-bg)",
              borderColor: "color-mix(in srgb, var(--color-risk-1-mark) 30%, transparent)",
            }}
          >
            Delete {item.name}
          </button>
        </form>
      </section>
    </div>
  );
}
