import Link from "next/link";
import { AuthorityForm } from "@/components/admin/AuthorityForm";

export const metadata = { title: "New authority" };

export default function NewAuthorityPage() {
  return (
    <div>
      <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-muted">
        <Link href="/admin/authorities" className="no-underline hover:text-accent">
          Authorities
        </Link>
      </nav>
      <h1 className="mt-3 font-display text-3xl">New authority</h1>

      <div className="mt-6">
        <AuthorityForm authority={null} />
      </div>
    </div>
  );
}
