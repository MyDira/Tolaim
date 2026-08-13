/**
 * The risk scale.
 *
 * Five levels, used identically everywhere the scale appears. These labels are
 * fixed — do not paraphrase them in components, import from here.
 *
 * Level 1 is a categorically different kind of statement from levels 2-5.
 * Levels 2-5 form an effort ramp: the higher the number, the less work is
 * required. Level 1 is not "the most work" — it is "there is no amount of work
 * that helps". Components render it as a broken slot rather than the bottom of
 * the ramp for exactly this reason.
 *
 * The line between 3 and 4 is the one that matters most in practice: at 3 and
 * above (numerically lower) real inspection is required, at 4 and below it is
 * not. It is the primary filter on the listing page.
 */

export const RISK_LEVELS = [1, 2, 3, 4, 5] as const;

export type RiskLevel = (typeof RISK_LEVELS)[number];

export interface RiskDefinition {
  level: RiskLevel;
  /** The fixed label. Never reworded. */
  label: string;
  /** One-line expansion, safe to show next to the label. */
  gloss: string;
  /** What the visitor actually does. Imperative, plain. */
  action: string;
  /** Longer explanation for the legend page. */
  detail: string;
  /** True for levels 1-3: real inspection is required. */
  requiresInspection: boolean;
}

export const RISK: Record<RiskLevel, RiskDefinition> = {
  1: {
    level: 1,
    label: "Not recommended",
    gloss: "Cannot be cleaned",
    action: "Do not use this in its fresh form.",
    detail:
      "There is no cleaning method that reliably removes the infestation. This is not the hardest rung of the ladder — it is a different statement altogether. Look for a reliably supervised processed or frozen equivalent instead.",
    requiresInspection: true,
  },
  2: {
    level: 2,
    label: "Expert checking",
    gloss: "Requires expertise or skill",
    action: "Have this checked by someone trained, or buy it pre-checked.",
    detail:
      "It can be cleaned, but doing it correctly takes training and practice — knowing what the insects look like, where they hide, and when a batch has to be rejected. If you have not been taught, buy a reliably supervised pre-checked product.",
    requiresInspection: true,
  },
  3: {
    level: 3,
    label: "Home checking",
    gloss: "Can be cleaned at home",
    action: "Inspect it yourself before use, following the method below.",
    detail:
      "An ordinary person can do this at their own sink with no special equipment beyond good light. It still takes real attention — this is inspection, not rinsing.",
    requiresInspection: true,
  },
  4: {
    level: 4,
    label: "Rinse only",
    gloss: "A basic rinse is enough",
    action: "Rinse under running water before use.",
    detail:
      "No inspection is required. Rinse it the way you would rinse anything else, for ordinary cleanliness.",
    requiresInspection: false,
  },
  5: {
    level: 5,
    label: "No checking",
    gloss: "Nothing needed",
    action: "Use it as is.",
    detail:
      "No infestation concern is known for this item. Nothing is required beyond whatever you would normally do in the kitchen.",
    requiresInspection: false,
  },
};

export const RISK_ORDER: RiskLevel[] = [1, 2, 3, 4, 5];

/** The line between "inspection required" and "no inspection required". */
export const INSPECTION_LINE = 3;

export function isRiskLevel(value: unknown): value is RiskLevel {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5;
}

export function riskDefinition(level: RiskLevel): RiskDefinition {
  return RISK[level];
}

/** CSS custom-property namespace for a level, e.g. `--risk-3-bg`. */
export function riskVar(level: RiskLevel, part: "bg" | "fg" | "mark" | "edge"): string {
  return `var(--risk-${level}-${part})`;
}

/**
 * Describes the spread of positions across authorities without asserting one.
 * The site reports positions; it does not resolve them.
 */
export function riskRange(levels: RiskLevel[]): { min: RiskLevel; max: RiskLevel } | null {
  if (levels.length === 0) return null;
  const sorted = [...levels].sort((a, b) => a - b);
  return { min: sorted[0], max: sorted[sorted.length - 1] };
}
