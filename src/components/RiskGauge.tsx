import type { RiskLevel } from "@/lib/risk";

/**
 * The five-slot gauge — the site's signature mark.
 *
 * Five slots for five levels. The number of filled slots is how much work the
 * item takes: level 5 fills one, level 2 fills four. An almost-empty gauge
 * means "almost nothing to do", which is the reading we want at a glance.
 *
 * A notch is drawn between the second and third slot. That is the line between
 * "no inspection required" and "inspection required" — the distinction that
 * matters most in a kitchen.
 *
 * Level 1 does not fill slots. It renders as a struck, hatched block, because
 * "cannot be cleaned" is not the far end of an effort ramp; it is a different
 * kind of statement, and a full gauge would imply the wrong thing.
 *
 * Colour is never the only signal: slot count, the notch, and the hatch all
 * survive a black-and-white photocopy.
 */

interface RiskGaugeProps {
  level: RiskLevel;
  /** Scales with the surrounding font size; `em`-based throughout. */
  className?: string;
}

export function RiskGauge({ level, className = "" }: RiskGaugeProps) {
  if (level === 1) {
    return (
      <span className={`gauge ${className}`} style={{ width: "2.4em" }} aria-hidden="true">
        <span className="gauge-blocked" />
      </span>
    );
  }

  const filled = 6 - level;

  return (
    <span className={`gauge ${className}`} aria-hidden="true">
      {[1, 2, 3, 4, 5].map((slot) => (
        <span
          key={slot}
          className="gauge-slot"
          data-filled={slot <= filled ? "true" : "false"}
          data-line={slot === 3 ? "true" : undefined}
        />
      ))}
    </span>
  );
}
