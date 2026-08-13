import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthorityForm } from "@/components/admin/AuthorityForm";
import { StatusPill } from "@/components/admin/ui";
import { deleteAuthority } from "@/lib/admin/actions";
import { getAuthorityRow, listProduce } from "@/lib/admin/queries";

export const metadata = { title: "Edit authority" };

export default async function EditAuthorityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [authority, produce] = await Promise.all([getAuthorityRow(id), listProduce()]);

  if (!authority) notFound();

  const linked = produce.filter((p) => p.rulings.some((r) => r.authority_id === authority.id));
  const removeAuthority = deleteAuthority.bind(null, authority.id);

  return (
    <div>
      <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-muted">
        <Link href="/admin/authorities" className="no-underline hover:text-accent">
          Authorities
        </Link>
      </nav>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl">{authority.name}</h1>
        <StatusPill status={authority.status} />
      </div>

      <div className="mt-6">
        <AuthorityForm authority={authority} />
      </div>

      <section className="panel mt-8 p-5">
        <h2 className="font-display text-[1.25rem]">Delete this authority</h2>
        <p className="mt-1 max-w-2xl text-[0.8125rem] leading-relaxed text-muted">
          {linked.length > 0 ? (
            <>
              This would also delete its {linked.length} {linked.length === 1 ? "position" : "positions"} on{" "}
              {linked
                .slice(0, 4)
                .map((p) => p.name)
                .join(", ")}
              {linked.length > 4 ? ` and ${linked.length - 4} more` : ""}. To take it off the site without losing the
              rulings, untick &ldquo;approved&rdquo; above instead.
            </>
          ) : (
            <>Nothing currently cites this authority.</>
          )}
        </p>
        <form action={removeAuthority} className="mt-3">
          <button
            type="submit"
            className="rounded-md border px-3.5 py-2 text-[0.875rem] font-semibold"
            style={{
              color: "var(--color-risk-1-fg)",
              backgroundColor: "var(--color-risk-1-bg)",
              borderColor: "color-mix(in srgb, var(--color-risk-1-mark) 30%, transparent)",
            }}
          >
            Delete {authority.name}
          </button>
        </form>
      </section>
    </div>
  );
}
