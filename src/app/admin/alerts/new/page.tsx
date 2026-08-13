import Link from "next/link";
import { AlertComposer } from "@/components/admin/AlertComposer";
import { listProduce } from "@/lib/admin/queries";

export const metadata = { title: "New alert" };

export default async function NewAlertPage() {
  const produce = await listProduce();

  return (
    <div>
      <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-muted">
        <Link href="/admin/alerts" className="no-underline hover:text-accent">
          Alerts
        </Link>
      </nav>
      <h1 className="mt-3 font-display text-3xl">New alert</h1>
      <p className="mt-1 max-w-2xl text-[0.9375rem] text-muted">
        Publishing now and expiring in thirty days are the defaults. Change them only if this one is different.
      </p>

      <div className="mt-6">
        <AlertComposer alert={null} produce={produce} />
      </div>
    </div>
  );
}
