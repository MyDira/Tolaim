import Link from "next/link";
import { RiskChip } from "@/components/RiskBadge";
import { StatusPill } from "@/components/admin/ui";
import { listProduce } from "@/lib/admin/queries";
import { isRiskLevel } from "@/lib/risk";

export const metadata = { title: "Produce" };

export default async function AdminProduceList() {
  const items = await listProduce();
  const drafts = items.filter((i) => i.status === "draft");

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Produce</h1>
          <p className="mt-1 text-[0.9375rem] text-muted">
            {items.length} {items.length === 1 ? "item" : "items"}
            {drafts.length > 0 && ` · ${drafts.length} in draft`}
          </p>
        </div>
        <Link
          href="/admin/produce/new"
          className="rounded-md px-3.5 py-2 text-[0.875rem] font-semibold text-panel no-underline"
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          New item
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="panel mt-6 px-6 py-12 text-center">
          <p className="font-display text-xl">No produce yet</p>
          <p className="mx-auto mt-2 max-w-md text-[0.9375rem] text-muted">
            Add the first item and it will appear on the public site once it is approved.
          </p>
          <Link href="/admin/produce/new" className="link mt-4 inline-block">
            Add an item
          </Link>
        </div>
      ) : (
        <div className="panel mt-6 overflow-hidden">
          <ul className="divide-y divide-edge">
            {items.map((item) => {
              const draftRulings = item.rulings.filter((r) => r.status === "draft").length;
              return (
                <li key={item.id}>
                  <Link href={`/admin/produce/${item.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4 no-underline hover:bg-paper">
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{item.name}</span>
                        <StatusPill status={item.status} />
                        {isRiskLevel(item.site_risk_level) && <RiskChip level={item.site_risk_level} />}
                      </span>
                      <span className="citation mt-0.5 block">
                        {item.category?.name ?? "No category"} · {item.rulings.length}{" "}
                        {item.rulings.length === 1 ? "position" : "positions"}
                        {draftRulings > 0 && ` · ${draftRulings} unapproved`}
                      </span>
                    </span>
                    <span className="citation shrink-0">{new Date(item.updated_at).toLocaleDateString("en-GB")}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
