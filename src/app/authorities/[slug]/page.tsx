import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RiskChip } from "@/components/RiskBadge";
import { getAllProduce, getAuthorities, getAuthority, getRabbis } from "@/lib/data";
import { RISK, RISK_ORDER, type RiskLevel } from "@/lib/risk";

export const revalidate = 300;

const KIND_LABEL: Record<string, string> = {
  organization: "Kashrus organisation",
  posek: "Posek",
  publication: "Published work",
};

export async function generateStaticParams() {
  const authorities = await getAuthorities();
  return authorities.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const authority = await getAuthority(slug);
  if (!authority) return { title: "Not found" };
  return { title: authority.name, description: authority.description };
}

export default async function AuthorityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const authority = await getAuthority(slug);
  if (!authority) notFound();

  const [produce, rabbis] = await Promise.all([getAllProduce(), getRabbis()]);

  const rulings = produce
    .flatMap((item) => {
      const ruling = item.rulings.find((r) => r.authorityId === authority.id);
      return ruling ? [{ item, ruling }] : [];
    })
    .sort((a, b) => a.ruling.riskLevel - b.ruling.riskLevel || a.item.name.localeCompare(b.item.name));

  const followers = rabbis.filter(
    (r) => r.defaultAuthorityId === authority.id || r.overrides.some((o) => o.authorityId === authority.id),
  );

  const byLevel = RISK_ORDER.map((level) => ({
    level,
    entries: rulings.filter((r) => r.ruling.riskLevel === level),
  })).filter((group) => group.entries.length > 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <nav data-print="hide" aria-label="Breadcrumb" className="text-[0.8125rem] text-muted">
        <Link href="/authorities" className="no-underline hover:text-accent">
          Authorities
        </Link>
      </nav>

      <header className="mt-4">
        <p className="citation">
          {KIND_LABEL[authority.kind] ?? authority.kind}
          {authority.region ? ` · ${authority.region}` : ""}
        </p>
        <h1 className="mt-1 font-display text-[2rem] leading-tight sm:text-[2.5rem]">{authority.name}</h1>
        {authority.description && (
          <p className="mt-3 max-w-2xl text-[1.0625rem] leading-relaxed text-muted">{authority.description}</p>
        )}
        {authority.websiteUrl && (
          <p className="mt-3">
            <a
              href={authority.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="link text-[0.9375rem]"
              data-print-url={authority.websiteUrl}
            >
              Official site
            </a>
          </p>
        )}
      </header>

      {followers.length > 0 && (
        <section className="panel mt-6 p-5">
          <h2 className="label">Rabbis who follow this authority</h2>
          <ul className="mt-2.5 space-y-1.5">
            {followers.map((rabbi) => (
              <li key={rabbi.id} className="text-[0.9375rem]">
                <Link href={`/my-rabbi#${rabbi.slug}`} className="link">
                  {rabbi.name}
                </Link>
                {rabbi.community && <span className="text-muted"> — {rabbi.community}</span>}
                {rabbi.defaultAuthorityId !== authority.id && (
                  <span className="text-muted"> (on specific items only)</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-display text-2xl">Positions on record</h2>
        {rulings.length === 0 ? (
          <p className="mt-3 text-[0.9375rem] text-muted">
            No positions from this authority have been published on the site yet.
          </p>
        ) : (
          <>
            <p className="mt-2 text-[0.9375rem] text-muted">
              {rulings.length} {rulings.length === 1 ? "item" : "items"}, grouped by level.
            </p>

            <div className="mt-6 space-y-8">
              {byLevel.map(({ level, entries }) => (
                <div key={level}>
                  <div className="flex items-baseline gap-2.5">
                    <RiskChip level={level as RiskLevel} />
                    <h3 className="font-display text-[1.125rem]">{RISK[level as RiskLevel].label}</h3>
                    <span className="citation">
                      {entries.length} {entries.length === 1 ? "item" : "items"}
                    </span>
                  </div>

                  <ul className="mt-3 divide-y divide-edge overflow-hidden rounded-lg border border-edge bg-panel">
                    {entries.map(({ item, ruling }) => (
                      <li key={item.id}>
                        <Link href={`/produce/${item.slug}`} className="block p-3.5 no-underline hover:bg-paper">
                          <span className="font-medium">{item.name}</span>
                          {ruling.guidance && (
                            <span className="mt-0.5 block text-[0.875rem] leading-snug text-muted">
                              {ruling.guidance}
                            </span>
                          )}
                          {ruling.citation && <span className="citation mt-1 block">{ruling.citation}</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
