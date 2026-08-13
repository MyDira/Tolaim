import Link from "next/link";
import { RabbiForm } from "@/components/admin/RabbiForm";
import { listAuthorities, listProduce } from "@/lib/admin/queries";

export const metadata = { title: "New rabbi" };

export default async function NewRabbiPage() {
  const [authorities, produce] = await Promise.all([listAuthorities(), listProduce()]);

  return (
    <div>
      <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-muted">
        <Link href="/admin/rabbis" className="no-underline hover:text-accent">
          Rabbis
        </Link>
      </nav>
      <h1 className="mt-3 font-display text-3xl">New rabbi</h1>

      <div className="mt-6">
        <RabbiForm rabbi={null} authorities={authorities} produce={produce} />
      </div>
    </div>
  );
}
