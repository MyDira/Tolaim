import Link from "next/link";
import { SavedNote, StatusPill } from "@/components/admin/ui";
import { listAuthorities, listRabbis } from "@/lib/admin/queries";

export const metadata = { title: "Rabbis" };

export default async function AdminRabbisList({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const [rabbis, authorities] = await Promise.all([listRabbis(), listAuthorities()]);

  const authorityName = (id: string | null) => authorities.find((a) => a.id === id)?.name ?? "Not recorded";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Rabbis</h1>
          <p className="mt-1 max-w-2xl text-[0.9375rem] text-muted">
            Which authority each rabbi follows. Visitors pick from this list once and see the position that applies to
            them first.
          </p>
        </div>
        <Link
          href="/admin/rabbis/new"
          className="rounded-md px-3.5 py-2 text-[0.875rem] font-semibold text-panel no-underline"
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          New rabbi
        </Link>
      </div>

      {saved && <div className="mt-4"><SavedNote>Saved.</SavedNote></div>}

      {rabbis.length === 0 ? (
        <div className="panel mt-6 px-6 py-12 text-center">
          <p className="font-display text-xl">No rabbis mapped yet</p>
          <p className="mx-auto mt-2 max-w-md text-[0.9375rem] text-muted">
            Until at least one is added and approved, the rabbi picker on the public site has nothing to offer.
          </p>
          <Link href="/admin/rabbis/new" className="link mt-4 inline-block">
            Add the first one
          </Link>
        </div>
      ) : (
        <ul className="panel mt-6 divide-y divide-edge overflow-hidden">
          {rabbis.map((rabbi) => (
            <li key={rabbi.id}>
              <Link href={`/admin/rabbis/${rabbi.id}`} className="block p-4 no-underline hover:bg-paper">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{rabbi.name}</span>
                  <StatusPill status={rabbi.status} />
                </span>
                <span className="citation mt-0.5 block">
                  {rabbi.community || "No community recorded"} · follows {authorityName(rabbi.default_authority_id)}
                  {rabbi.overrides.length > 0 &&
                    ` · ${rabbi.overrides.length} ${rabbi.overrides.length === 1 ? "exception" : "exceptions"}`}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
