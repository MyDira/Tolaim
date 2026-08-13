import Link from "next/link";
import { RISK, type RiskLevel } from "@/lib/risk";
import type { ProduceSummary } from "@/lib/types";
import { ProduceImage } from "./ProduceImage";
import { RiskGauge } from "./RiskGauge";

/**
 * A specimen card.
 *
 * Image first, because produce is recognised by photograph faster than by
 * name. The level sits directly under the name in a full-width band so it can
 * be read at arm's length without looking for it.
 *
 * When the visitor has chosen a rabbi, `level` is that rabbi's authority's
 * position and the card says so. Otherwise it is the site's own summary.
 */

interface ProduceCardProps {
  item: ProduceSummary;
  level: RiskLevel | null;
  /** Set when `level` came from the visitor's rabbi rather than the site. */
  attribution?: string;
  priority?: boolean;
}

export function ProduceCard({ item, level, attribution, priority = false }: ProduceCardProps) {
  const def = level ? RISK[level] : null;
  const differs = item.minRuling !== null && item.maxRuling !== null && item.minRuling !== item.maxRuling;

  return (
    <Link
      href={`/produce/${item.slug}`}
      className="group panel panel-lift flex flex-col overflow-hidden no-underline transition-shadow duration-200 hover:shadow-[var(--shadow-lift)]"
    >
      <div className="relative aspect-[5/4] w-full overflow-hidden border-b border-edge bg-panel">
        <ProduceImage
          imagePath={item.imagePath}
          alt={item.imageAlt}
          categorySlug={item.categorySlug}
          priority={priority}
        />

        {item.hasActiveAlert && (
          <span
            className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-panel"
            style={{ backgroundColor: "var(--color-sev-urgent)" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
            Alert
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-3.5">
        <h3 className="font-display text-[1.0625rem] leading-snug">{item.name}</h3>
        {item.categoryName && <p className="citation mt-0.5">{item.categoryName}</p>}

        <div className="mt-auto pt-3">
          {def && level ? (
            <div
              className="flex items-start gap-2 rounded-md border px-2 py-1.5 text-[0.8125rem] font-semibold leading-tight"
              data-risk-badge
              style={{
                backgroundColor: `var(--color-risk-${level}-bg)`,
                color: `var(--color-risk-${level}-fg)`,
                borderColor: `color-mix(in srgb, var(--color-risk-${level}-mark) 28%, transparent)`,
              }}
            >
              <RiskGauge level={level} className="mt-[0.15em]" />
              {/* Wraps rather than truncates: the label is the answer, not a detail. */}
              <span>{def.label}</span>
              <span className="sr-only">— level {level} of 5</span>
            </div>
          ) : (
            <div className="rounded-md border border-edge px-2 py-1.5 text-[0.8125rem] text-muted">No level set</div>
          )}

          <p className="mt-1.5 text-[0.75rem] leading-snug text-muted">
            {attribution ? attribution : differs ? "Authorities differ — see the item" : `${item.rulingCount} sources`}
          </p>
        </div>
      </div>
    </Link>
  );
}
