import type { Metadata } from "next";
import Link from "next/link";
import { getAllProduce, getAuthorities } from "@/lib/data";

export const metadata: Metadata = {
  title: "Authorities",
  description:
    "The organisations, poskim and published works whose positions are cited on this site, and how many items each one has ruled on.",
};

export const revalidate = 300;

const KIND_LABEL: Record<string, string> = {
  organization: "Kashrus organisation",
  posek: "Posek",
  publication: "Published work",
};

export default async function AuthoritiesPage() {
  const [authorities, produce] = await Promise.all([getAuthorities(), getAllProduce()]);

  const rulingCount = (authorityId: string) =>
    produce.reduce((total, item) => total + (item.rulings.some((r) => r.authorityId === authorityId) ? 1 : 0), 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl sm:text-4xl">Authorities</h1>
        <p className="mt-3 text-[1.0625rem] leading-relaxed text-muted">
          Every position on this site is attributed. These are the organisations, poskim and published works whose
          rulings are cited, with the number of items each has a position on.
        </p>
      </header>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {authorities.map((authority) => {
          const count = rulingCount(authority.id);
          return (
            <li key={authority.id}>
              <Link
                href={`/authorities/${authority.slug}`}
                className="panel panel-lift flex h-full flex-col p-5 no-underline transition-shadow hover:shadow-[var(--shadow-lift)]"
              >
                <p className="citation">
                  {KIND_LABEL[authority.kind] ?? authority.kind}
                  {authority.region ? ` · ${authority.region}` : ""}
                </p>
                <h2 className="mt-1 font-display text-[1.25rem] leading-snug">{authority.name}</h2>
                <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-muted">{authority.description}</p>
                <p className="citation mt-4 border-t border-edge pt-3">
                  {count} {count === 1 ? "item" : "items"} on record
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
