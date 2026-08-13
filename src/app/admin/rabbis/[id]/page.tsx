import Link from "next/link";
import { notFound } from "next/navigation";
import { RabbiForm } from "@/components/admin/RabbiForm";
import { StatusPill } from "@/components/admin/ui";
import { deleteRabbi } from "@/lib/admin/actions";
import { getRabbiRow, listAuthorities, listProduce } from "@/lib/admin/queries";

export const metadata = { title: "Edit rabbi" };

export default async function EditRabbiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [rabbi, authorities, produce] = await Promise.all([getRabbiRow(id), listAuthorities(), listProduce()]);

  if (!rabbi) notFound();

  const removeRabbi = deleteRabbi.bind(null, rabbi.id);

  return (
    <div>
      <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-muted">
        <Link href="/admin/rabbis" className="no-underline hover:text-accent">
          Rabbis
        </Link>
      </nav>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl">{rabbi.name}</h1>
        <StatusPill status={rabbi.status} />
      </div>

      <div className="mt-6">
        <RabbiForm rabbi={rabbi} authorities={authorities} produce={produce} />
      </div>

      <section className="panel mt-8 p-5">
        <h2 className="font-display text-[1.25rem]">Delete this rabbi</h2>
        <p className="mt-1 max-w-2xl text-[0.8125rem] leading-relaxed text-muted">
          Anyone who has already chosen this rabbi in their browser falls back to the site&rsquo;s own summary levels.
          Nothing else is affected.
        </p>
        <form action={removeRabbi} className="mt-3">
          <button
            type="submit"
            className="rounded-md border px-3.5 py-2 text-[0.875rem] font-semibold"
            style={{
              color: "var(--color-risk-1-fg)",
              backgroundColor: "var(--color-risk-1-bg)",
              borderColor: "color-mix(in srgb, var(--color-risk-1-mark) 30%, transparent)",
            }}
          >
            Delete {rabbi.name}
          </button>
        </form>
      </section>
    </div>
  );
}
