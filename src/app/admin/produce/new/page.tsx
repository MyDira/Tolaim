import Link from "next/link";
import { ProduceForm } from "@/components/admin/ProduceForm";
import { listAuthorities, listCategories } from "@/lib/admin/queries";

export const metadata = { title: "New produce item" };

export default async function NewProducePage() {
  const [categories, authorities] = await Promise.all([listCategories(), listAuthorities()]);

  return (
    <div>
      <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-muted">
        <Link href="/admin/produce" className="no-underline hover:text-accent">
          Produce
        </Link>
      </nav>
      <h1 className="mt-3 font-display text-3xl">New produce item</h1>
      <p className="mt-1 max-w-2xl text-[0.9375rem] text-muted">
        It stays invisible to the public until it is approved, so there is no harm in saving a partial draft.
      </p>

      <div className="mt-6">
        <ProduceForm item={null} categories={categories} authorities={authorities} />
      </div>
    </div>
  );
}
