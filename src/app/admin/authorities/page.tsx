import Link from "next/link";
import { SavedNote, StatusPill } from "@/components/admin/ui";
import { listAuthorities, listProduce } from "@/lib/admin/queries";

export const metadata = { title: "Authorities" };

const KIND_LABEL: Record<string, string> = {
  organization: "Kashrus organisation",
  posek: "Posek",
  publication: "Published work",
};

export default async function AdminAuthoritiesList({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const [authorities, produce] = await Promise.all([listAuthorities(), listProduce()]);

  const countFor = (id: string) => produce.filter((p) => p.rulings.some((r) => r.authority_id === id)).length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Authorities</h1>
          <p className="mt-1 max-w-2xl text-[0.9375rem] text-muted">
            Whose positions this site cites. Add one before recording its rulings on produce items.
          </p>
        </div>
        <Link
          href="/admin/authorities/new"
          className="rounded-md px-3.5 py-2 text-[0.875rem] font-semibold text-panel no-underline"
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          New authority
        </Link>
      </div>

      {saved && <div className="mt-4"><SavedNote>Saved.</SavedNote></div>}

      {authorities.length === 0 ? (
        <div className="panel mt-6 px-6 py-12 text-center">
          <p className="font-display text-xl">No authorities yet</p>
          <p className="mx-auto mt-2 max-w-md text-[0.9375rem] text-muted">
            Every position on the site is attributed to one, so this is the first thing to set up.
          </p>
          <Link href="/admin/authorities/new" className="link mt-4 inline-block">
            Add the first one
          </Link>
        </div>
      ) : (
        <ul className="panel mt-6 divide-y divide-edge overflow-hidden">
          {authorities.map((authority) => (
            <li key={authority.id}>
              <Link href={`/admin/authorities/${authority.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 p-4 no-underline hover:bg-paper">
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{authority.name}</span>
                    <StatusPill status={authority.status} />
                  </span>
                  <span className="citation mt-0.5 block">
                    {KIND_LABEL[authority.kind] ?? authority.kind}
                    {authority.region ? ` · ${authority.region}` : ""} · {countFor(authority.id)} items on record
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
