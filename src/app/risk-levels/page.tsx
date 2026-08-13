import type { Metadata } from "next";
import Link from "next/link";
import { RiskGauge } from "@/components/RiskGauge";
import { getProduceSummaries } from "@/lib/data";
import { RISK, RISK_ORDER, type RiskLevel } from "@/lib/risk";

export const metadata: Metadata = {
  title: "The five levels",
  description:
    "What each of the five levels means: not recommended, expert checking, home checking, rinse only, no checking — and where the line between them falls.",
};

export const revalidate = 300;

/**
 * The legend.
 *
 * Every risk badge on the site links here, because five levels cannot be
 * inferred from a colour. The page has to do two things: define the levels,
 * and make the two structural facts obvious — that level 1 is a different kind
 * of statement, and that the line between 3 and 4 is where inspection stops
 * being required.
 */
export default async function RiskLevelsPage() {
  const items = await getProduceSummaries();

  const countFor = (level: RiskLevel) => items.filter((i) => i.siteRiskLevel === level).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl sm:text-4xl">The five levels</h1>
        <p className="mt-3 text-[1.0625rem] leading-relaxed text-muted">
          Every item on this site carries one of five levels. Four of them describe how much work something takes. The
          fifth — level 1 — says that no amount of work helps, which is a different kind of statement, and it is drawn
          differently for that reason.
        </p>
      </header>

      {/* ---- how to read the gauge ---- */}
      <section className="panel mt-8 p-5 sm:p-6">
        <h2 className="label">How to read the gauge</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <span className="mt-1 text-[1.5rem] leading-none" style={{ color: "var(--color-risk-3-mark)" }}>
              <RiskGauge level={3} />
            </span>
            <p className="text-[0.9375rem] leading-relaxed">
              Filled slots are effort. More filled means more work. The notch between the second and third slot is the
              line: cross it and real inspection is required.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-1 text-[1.5rem] leading-none" style={{ color: "var(--color-risk-1-mark)" }}>
              <RiskGauge level={1} />
            </span>
            <p className="text-[0.9375rem] leading-relaxed">
              A struck block is level 1. It is not the far end of the ramp — it means the item cannot be brought to a
              usable state by cleaning at all.
            </p>
          </div>
        </div>
        <p className="mt-4 border-t border-edge pt-3 text-[0.8125rem] text-muted">
          The slot count and the strike survive a black-and-white photocopy, so a page printed for a kitchen wall still
          reads correctly.
        </p>
      </section>

      {/* ---- the levels ---- */}
      <div className="mt-10 space-y-4">
        {RISK_ORDER.map((level) => (
          <div key={level}>
            <LevelPanel level={level} count={countFor(level)} />
            {level === 3 && <TheLine />}
          </div>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Why levels differ between authorities</h2>
        <p className="mt-3 max-w-2xl text-[1rem] leading-relaxed">
          A produce item does not have one level. It has one level per authority, and authorities differ — sometimes
          because they are looking at different supply, sometimes because they weigh the same evidence differently. Each
          item page lists every position on record, with its citation, in strictest-first order.
        </p>
        <p className="mt-3 max-w-2xl text-[1rem] leading-relaxed">
          If you{" "}
          <Link href="/my-rabbi" className="link">
            tell the site which rabbi you follow
          </Link>
          , the position that applies to you is shown first everywhere. The others stay visible — surfacing one is not
          the same as hiding the rest.
        </p>
      </section>
    </div>
  );
}

function LevelPanel({ level, count }: { level: RiskLevel; count: number }) {
  const def = RISK[level];
  const isBlocked = level === 1;

  return (
    <section
      id={`level-${level}`}
      className="panel panel-lift scroll-mt-24 overflow-hidden"
      style={{ borderColor: `color-mix(in srgb, var(--color-risk-${level}-mark) 30%, var(--color-edge))` }}
    >
      <div className="h-1.5 w-full" style={{ backgroundColor: `var(--color-risk-${level}-mark)` }} aria-hidden="true" />

      <div className="p-5 sm:p-6" style={{ backgroundColor: `var(--color-risk-${level}-bg)` }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[0.75rem]" style={{ color: `var(--color-risk-${level}-fg)`, opacity: 0.8 }}>
              {isBlocked ? "off the scale" : `level ${level} of 5`}
            </p>
            <h2
              className="mt-0.5 font-display text-[1.625rem] leading-tight sm:text-[1.875rem]"
              style={{ color: `var(--color-risk-${level}-fg)` }}
            >
              {def.label}
            </h2>
            <p className="mt-1 text-[1rem]" style={{ color: `var(--color-risk-${level}-fg)`, opacity: 0.85 }}>
              {def.gloss}
            </p>
          </div>
          <span
            className="text-[1.75rem] leading-none"
            style={{ color: `var(--color-risk-${level}-fg)` }}
            data-risk-badge
          >
            <RiskGauge level={level} />
          </span>
        </div>
      </div>

      <div className="bg-panel p-5 sm:p-6">
        <p className="text-[1.0625rem] font-medium leading-snug">{def.action}</p>
        <p className="mt-2.5 max-w-2xl text-[0.9375rem] leading-relaxed text-muted">{def.detail}</p>

        {count > 0 && (
          <p data-print="hide" className="mt-4 border-t border-edge pt-3 text-[0.875rem]">
            <Link href={`/produce?filter=${def.requiresInspection ? "inspection" : "no-inspection"}`} className="link">
              {count} {count === 1 ? "item is" : "items are"} at this level
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}

/** The structural break between "inspection required" and "not required". */
function TheLine() {
  return (
    <div className="my-6 flex items-center gap-4" role="separator" aria-label="Below this line, no inspection is required">
      <div className="mesh-rule flex-1" aria-hidden="true" />
      <p className="shrink-0 text-center text-[0.8125rem] font-semibold leading-tight text-muted">
        Above this line, inspection is required
        <span className="block font-normal">Below it, it is not</span>
      </p>
      <div className="mesh-rule flex-1" aria-hidden="true" />
    </div>
  );
}
