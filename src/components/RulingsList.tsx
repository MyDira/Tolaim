"use client";

import Link from "next/link";
import { RISK, riskRange } from "@/lib/risk";
import { resolveRulingForRabbi, useMyRabbi } from "@/lib/my-rabbi";
import type { ProduceItem } from "@/lib/types";
import { RiskGauge } from "./RiskGauge";

/**
 * Who says what.
 *
 * A produce item does not have one ruling; it has many. This is the drill-down
 * from the answer block. The visitor's own rabbi's position is marked but not
 * moved — the order stays strictest-first so the shape of the disagreement is
 * visible, which is the honest way to present it.
 */

export function RulingsList({ item }: { item: ProduceItem }) {
  const { rabbi } = useMyRabbi();
  const resolved = resolveRulingForRabbi(rabbi, item.id, item.rulings);
  const range = riskRange(item.rulings.map((r) => r.riskLevel));

  if (item.rulings.length === 0) {
    return (
      <section className="mt-10">
        <SectionHeading>Positions on record</SectionHeading>
        <p className="mt-3 max-w-2xl text-[0.9375rem] text-muted">
          No authority&rsquo;s position has been published for this item yet.
        </p>
      </section>
    );
  }

  const disagrees = range !== null && range.min !== range.max;

  return (
    <section className="mt-10" id="positions">
      <SectionHeading>Positions on record</SectionHeading>

      <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-muted">
        {disagrees ? (
          <>
            The {item.rulings.length} authorities on record differ on this item, from{" "}
            <strong className="font-semibold" style={{ color: `var(--color-risk-${range.min}-fg)` }}>
              {RISK[range.min].label.toLowerCase()}
            </strong>{" "}
            to{" "}
            <strong className="font-semibold" style={{ color: `var(--color-risk-${range.max}-fg)` }}>
              {RISK[range.max].label.toLowerCase()}
            </strong>
            . This site reports the difference; it does not resolve it.
          </>
        ) : (
          <>All {item.rulings.length} authorities on record agree on this item.</>
        )}
      </p>

      <ul className="mt-5 space-y-3">
        {item.rulings.map((ruling) => {
          const mine = resolved.ruling?.id === ruling.id;
          const def = RISK[ruling.riskLevel];

          return (
            <li
              key={ruling.id}
              className="panel overflow-hidden"
              style={mine ? { borderColor: "color-mix(in srgb, var(--color-accent) 40%, transparent)" } : undefined}
            >
              {mine && (
                <p
                  className="px-4 py-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-panel"
                  style={{ backgroundColor: "var(--color-accent)" }}
                >
                  This is the one your rabbi follows
                </p>
              )}

              <div className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-display text-[1.125rem] leading-snug">
                      {ruling.authority ? (
                        <Link href={`/authorities/${ruling.authority.slug}`} className="no-underline hover:text-accent">
                          {ruling.authority.name}
                        </Link>
                      ) : (
                        "Authority"
                      )}
                    </h3>
                    {ruling.authority && (
                      <p className="citation mt-0.5">
                        {KIND_LABEL[ruling.authority.kind]}
                        {ruling.authority.region ? ` · ${ruling.authority.region}` : ""}
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/risk-levels#level-${ruling.riskLevel}`}
                    data-risk-badge
                    className="inline-flex shrink-0 items-center gap-2 rounded-md border px-2.5 py-1.5 text-[0.8125rem] font-semibold no-underline"
                    style={{
                      backgroundColor: `var(--color-risk-${ruling.riskLevel}-bg)`,
                      color: `var(--color-risk-${ruling.riskLevel}-fg)`,
                      borderColor: `color-mix(in srgb, var(--color-risk-${ruling.riskLevel}-mark) 28%, transparent)`,
                    }}
                  >
                    <RiskGauge level={ruling.riskLevel} />
                    {def.label}
                    <span className="sr-only">— level {ruling.riskLevel} of 5</span>
                  </Link>
                </div>

                {ruling.guidance && <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed">{ruling.guidance}</p>}

                {ruling.notes && (
                  <p className="mt-2 max-w-2xl border-l-2 border-edge pl-3 text-[0.875rem] italic leading-relaxed text-muted">
                    {ruling.notes}
                  </p>
                )}

                {(ruling.citation || ruling.effectiveDate || ruling.sourceUrl) && (
                  <p className="citation mt-3">
                    {ruling.citation}
                    {ruling.effectiveDate && (
                      <>
                        {ruling.citation ? " · " : ""}
                        {formatDate(ruling.effectiveDate)}
                      </>
                    )}
                    {ruling.sourceUrl && (
                      <>
                        {" · "}
                        <a
                          href={ruling.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link"
                          data-print-url={ruling.sourceUrl}
                        >
                          Source
                        </a>
                      </>
                    )}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {!rabbi && (
        <p data-print="hide" className="mt-4 text-[0.875rem] text-muted">
          <Link href="/my-rabbi" className="link">
            Tell the site which rabbi you follow
          </Link>{" "}
          and the position that applies to you will be marked here and shown first everywhere else.
        </p>
      )}
    </section>
  );
}

const KIND_LABEL: Record<string, string> = {
  organization: "Kashrus organisation",
  posek: "Posek",
  publication: "Published work",
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-2xl">{children}</h2>;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { year: "numeric", month: "long" });
}
