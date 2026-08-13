"use client";

import Link from "next/link";
import { RISK, type RiskLevel } from "@/lib/risk";
import { resolveRulingForRabbi, useMyRabbi } from "@/lib/my-rabbi";
import type { ProduceItem } from "@/lib/types";
import { RiskGauge } from "./RiskGauge";

/**
 * The answer block.
 *
 * This is the ten-second test. Land on the page, read one line, know what to
 * do. Everything below it is for people who want more.
 *
 * When the visitor has set their rabbi, the position that applies to them is
 * what appears here, attributed. Otherwise it is the site's own summary level.
 * If their rabbi's authority has published nothing on this item, the block
 * says exactly that rather than quietly showing someone else's view.
 */

export function ProduceAnswer({ item }: { item: ProduceItem }) {
  const { rabbi, ready } = useMyRabbi();
  const resolved = resolveRulingForRabbi(rabbi, item.id, item.rulings);

  const level: RiskLevel | null = resolved.ruling?.riskLevel ?? item.siteRiskLevel;
  const usingRabbi = Boolean(rabbi && resolved.ruling);
  const rabbiGap = Boolean(rabbi && !resolved.ruling);

  if (level === null) {
    return (
      <section className="panel panel-lift mt-6 p-5">
        <h2 className="label">Level</h2>
        <p className="mt-2 text-[1.0625rem] text-muted">
          No level has been published for this item yet. The positions below are what is on record.
        </p>
      </section>
    );
  }

  const def = RISK[level];

  return (
    <section
      className="panel panel-lift mt-6 overflow-hidden"
      aria-labelledby="answer-heading"
      style={{ borderColor: `color-mix(in srgb, var(--color-risk-${level}-mark) 30%, var(--color-edge))` }}
    >
      {/* The band is the loudest colour on the page, and it is the only one. */}
      <div className="h-1.5 w-full" style={{ backgroundColor: `var(--color-risk-${level}-mark)` }} aria-hidden="true" />

      <div className="p-5 sm:p-6" style={{ backgroundColor: `var(--color-risk-${level}-bg)` }}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="label" id="answer-heading">
              {usingRabbi ? "Per your rabbi" : "This item"}
            </p>
            <h2
              className="mt-1 font-display text-[1.75rem] leading-tight sm:text-[2.125rem]"
              style={{ color: `var(--color-risk-${level}-fg)` }}
            >
              {def.label}
            </h2>
          </div>

          <Link
            href={`/risk-levels#level-${level}`}
            data-risk-badge
            className="flex shrink-0 flex-col items-center gap-1.5 rounded-md border px-3 py-2 no-underline"
            style={{
              borderColor: `color-mix(in srgb, var(--color-risk-${level}-mark) 32%, transparent)`,
              color: `var(--color-risk-${level}-fg)`,
            }}
          >
            <RiskGauge level={level} className="text-[1.25rem]" />
            <span className="font-mono text-[0.6875rem] whitespace-nowrap">
              {level === 1 ? "not on the scale" : `level ${level} of 5`}
            </span>
          </Link>
        </div>

        <p
          className="mt-3 max-w-2xl text-[1.0625rem] font-medium leading-snug sm:text-[1.1875rem]"
          style={{ color: `var(--color-risk-${level}-fg)` }}
        >
          {def.action}
        </p>

        {item.summary && (
          <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed" style={{ color: `var(--color-risk-${level}-fg)`, opacity: 0.85 }}>
            {item.summary}
          </p>
        )}
      </div>

      {/* ---- attribution strip ---- */}
      <div className="border-t border-edge bg-panel px-5 py-3 text-[0.875rem] sm:px-6">
        {!ready ? (
          <span className="text-muted">&nbsp;</span>
        ) : usingRabbi ? (
          <p className="text-muted">
            <Link href="/my-rabbi" className="link">
              {rabbi!.name}
            </Link>{" "}
            follows{" "}
            <Link href={`/authorities/${resolved.ruling!.authority?.slug ?? ""}`} className="link">
              {resolved.ruling!.authority?.name ?? "this authority"}
            </Link>
            {resolved.viaOverride ? " on this item specifically." : "."}{" "}
            {resolved.overrideNote && <span className="italic">{resolved.overrideNote}</span>}
          </p>
        ) : rabbiGap ? (
          <p className="text-muted">
            <Link href="/my-rabbi" className="link">
              {rabbi!.name}
            </Link>{" "}
            follows an authority that has not published a position on {item.name.toLowerCase()}. The level above is this
            site&rsquo;s own summary — ask your rabbi before relying on it.
          </p>
        ) : (
          <p className="text-muted">
            This is the site&rsquo;s summary of the positions below.{" "}
            <Link href="/my-rabbi" className="link">
              Set your rabbi
            </Link>{" "}
            to see the one that applies to you.
          </p>
        )}
      </div>
    </section>
  );
}
