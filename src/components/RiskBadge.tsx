import Link from "next/link";
import { RISK, type RiskLevel } from "@/lib/risk";
import { RiskGauge } from "./RiskGauge";

/**
 * The risk badge.
 *
 * Because five levels cannot be inferred, every badge is a link to the legend.
 * That is the rule the brief sets and it is enforced here rather than left to
 * each caller: there is no non-linking variant.
 */

type BadgeSize = "sm" | "md" | "lg";

const SIZE: Record<BadgeSize, string> = {
  sm: "text-[0.75rem] gap-1.5 px-2 py-1",
  md: "text-[0.875rem] gap-2 px-2.5 py-1.5",
  lg: "text-[1rem] gap-2.5 px-3 py-2",
};

interface RiskBadgeProps {
  level: RiskLevel;
  size?: BadgeSize;
  /** Adds the one-line gloss under the label. Detail pages only. */
  showGloss?: boolean;
  className?: string;
}

export function RiskBadge({ level, size = "md", showGloss = false, className = "" }: RiskBadgeProps) {
  const def = RISK[level];

  return (
    <Link
      href={`/risk-levels#level-${level}`}
      data-risk-badge
      className={`inline-flex items-center rounded-md border font-semibold no-underline transition-shadow hover:shadow-sm ${SIZE[size]} ${className}`}
      style={{
        backgroundColor: `var(--color-risk-${level}-bg)`,
        color: `var(--color-risk-${level}-fg)`,
        borderColor: `color-mix(in srgb, var(--color-risk-${level}-mark) 28%, transparent)`,
      }}
      title={`Level ${level} of 5 — ${def.label}. ${def.gloss}.`}
    >
      <RiskGauge level={level} />
      <span className="flex flex-col leading-tight">
        <span>
          {def.label}
          <span className="sr-only"> — level {level} of 5, {def.gloss}</span>
        </span>
        {showGloss && (
          <span className="font-normal opacity-80 text-[0.8em]" aria-hidden="true">
            {def.gloss}
          </span>
        )}
      </span>
    </Link>
  );
}

/**
 * Compact variant for dense rows (the rulings table, the listing grid corner).
 * Gauge plus the level number, no label — always beside a labelled badge or
 * inside a table whose header names the scale.
 */
export function RiskChip({ level, className = "" }: { level: RiskLevel; className?: string }) {
  const def = RISK[level];
  return (
    <Link
      href={`/risk-levels#level-${level}`}
      data-risk-badge
      className={`inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 text-[0.7rem] font-semibold no-underline ${className}`}
      style={{
        backgroundColor: `var(--color-risk-${level}-bg)`,
        color: `var(--color-risk-${level}-fg)`,
        borderColor: `color-mix(in srgb, var(--color-risk-${level}-mark) 28%, transparent)`,
      }}
    >
      <RiskGauge level={level} />
      <span className="font-mono">{level}</span>
      <span className="sr-only">of 5 — {def.label}</span>
    </Link>
  );
}
