import type { FigureKey } from "@/content/cleaning-methods";

/**
 * Method diagrams.
 *
 * Line drawings rather than photographs: they show the thing that matters (the
 * direction of the light, where the water goes, what the interior of a floret
 * head looks like) without the noise of a real kitchen, they weigh nothing on
 * a bad connection, and they photocopy cleanly — which these pages will be.
 */

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const FIGURES: Record<FigureKey, React.ReactNode> = {
  // Insects at scale against a leaf vein.
  insects: (
    <>
      <path d="M20 108c40-40 100-64 170-66" {...STROKE} strokeWidth={2.2} />
      <path d="M52 96c10 8 18 12 28 14M84 82c10 8 19 12 30 13M118 71c10 7 19 11 30 12" {...STROKE} strokeWidth={1} opacity={0.6} />
      {/* thrips */}
      <g transform="translate(96 74) rotate(-16)">
        <ellipse cx="0" cy="0" rx="11" ry="3.4" {...STROKE} strokeWidth={1.3} />
        <path d="M-11 0h-4M-9-3l-4-3M-9 3l-4 3M-2-3.4v-3M2-3.4v-3" {...STROKE} strokeWidth={1} />
      </g>
      <path d="M96 56v10M78 48h36" {...STROKE} strokeWidth={1} opacity={0.7} />
      <text x="96" y="44" textAnchor="middle" className="fill-current text-[9px] font-mono" opacity={0.75}>
        1–2 mm
      </text>
      {/* aphid cluster */}
      <g transform="translate(160 60)">
        <circle cx="0" cy="0" r="5" {...STROKE} strokeWidth={1.3} />
        <circle cx="10" cy="4" r="4.4" {...STROKE} strokeWidth={1.3} />
        <circle cx="4" cy="9" r="4" {...STROKE} strokeWidth={1.3} />
        <path d="M-4 4l-4 3M-4-4l-4-3M14 8l4 3" {...STROKE} strokeWidth={1} />
      </g>
      {/* miner trail */}
      <path d="M212 88c14-4 8-16 20-18s16 10 26 5 8-16 20-15" {...STROKE} strokeWidth={1.4} strokeDasharray="1 3" />
      <text x="252" y="112" textAnchor="middle" className="fill-current text-[9px] font-mono" opacity={0.75}>
        miner trail
      </text>
      <text x="160" y="40" textAnchor="middle" className="fill-current text-[9px] font-mono" opacity={0.75}>
        aphids
      </text>
    </>
  ),

  // Running water into a colander, over a pale surface.
  basin: (
    <>
      <path d="M96 18v22" {...STROKE} strokeWidth={2.4} />
      <path d="M96 18h34a10 10 0 0 1 10 10v6" {...STROKE} strokeWidth={2.4} />
      <path d="M140 40v6" {...STROKE} strokeWidth={3} />
      {/* stream */}
      <path d="M140 50v34M134 54v26M146 54v26" {...STROKE} strokeWidth={1.2} opacity={0.75} />
      {/* colander */}
      <path d="M100 88h80l-10 34a10 10 0 0 1-10 8h-40a10 10 0 0 1-10-8Z" {...STROKE} />
      <path d="M92 88h96" {...STROKE} strokeWidth={2.2} />
      <circle cx="126" cy="106" r="1.6" className="fill-current" opacity={0.6} />
      <circle cx="140" cy="112" r="1.6" className="fill-current" opacity={0.6} />
      <circle cx="154" cy="106" r="1.6" className="fill-current" opacity={0.6} />
      <circle cx="140" cy="98" r="1.6" className="fill-current" opacity={0.6} />
      {/* draining */}
      <path d="M130 136v10M144 138v9M156 136v8" {...STROKE} strokeWidth={1} opacity={0.55} />
      <path d="M60 156h200" {...STROKE} strokeWidth={2} />
      <text x="212" y="80" className="fill-current text-[9px] font-mono" opacity={0.75}>
        running,
      </text>
      <text x="212" y="92" className="fill-current text-[9px] font-mono" opacity={0.75}>
        not standing
      </text>
    </>
  ),

  // Light through a leaf, eye above.
  lightbox: (
    <>
      {/* panel */}
      <rect x="70" y="112" width="180" height="16" rx="3" {...STROKE} />
      <path d="M78 128v10M250 128v-10" {...STROKE} strokeWidth={1} opacity={0.5} />
      {/* rays upward */}
      <path d="M100 108V88M124 108V80M148 108V74M172 108V80M196 108V88M220 108V96" {...STROKE} strokeWidth={1} opacity={0.6} />
      {/* leaf */}
      <path d="M104 70c22-22 62-30 96-22 6 20-12 42-44 46-24 3-44-8-52-24Z" {...STROKE} />
      <path d="M104 70c30-8 62-14 96-22" {...STROKE} strokeWidth={1} opacity={0.6} />
      <path d="M126 78c8-6 16-11 24-14M148 84c8-7 17-12 26-15" {...STROKE} strokeWidth={0.9} opacity={0.5} />
      <circle cx="150" cy="72" r="2.6" className="fill-current" />
      <circle cx="176" cy="62" r="2.2" className="fill-current" />
      {/* eye */}
      <path d="M132 30c10-10 26-10 36 0-10 10-26 10-36 0Z" {...STROKE} />
      <circle cx="150" cy="30" r="4" {...STROKE} strokeWidth={1.3} />
      <path d="M150 40v10" {...STROKE} strokeWidth={1} strokeDasharray="2 3" opacity={0.6} />
      <text x="262" y="122" className="fill-current text-[9px] font-mono" opacity={0.75}>
        light
      </text>
    </>
  ),

  // Pouring wash water through a lined strainer.
  mesh: (
    <>
      {/* bowl being poured */}
      <path d="M40 34c0 16 12 28 28 28s28-12 28-28Z" {...STROKE} />
      <path d="M36 34h64" {...STROKE} strokeWidth={2} />
      {/* pour */}
      <path d="M96 44c14 4 26 14 32 26" {...STROKE} strokeWidth={1.4} opacity={0.8} />
      <path d="M100 52c10 4 18 12 22 20" {...STROKE} strokeWidth={1} opacity={0.6} />
      {/* strainer */}
      <path d="M104 76h96l-14 30h-68Z" {...STROKE} />
      <path d="M98 76h108" {...STROKE} strokeWidth={2.2} />
      {/* cloth */}
      <path d="M112 80h80l-11 22h-58Z" {...STROKE} strokeWidth={1} strokeDasharray="3 3" opacity={0.8} />
      <circle cx="140" cy="92" r="1.8" className="fill-current" />
      <circle cx="158" cy="88" r="1.5" className="fill-current" />
      <circle cx="168" cy="96" r="1.6" className="fill-current" />
      {/* second bowl */}
      <path d="M96 118c0 18 14 32 32 32h48c18 0 32-14 32-32Z" {...STROKE} />
      <path d="M90 118h124" {...STROKE} strokeWidth={2} />
      <text x="222" y="86" className="fill-current text-[9px] font-mono" opacity={0.75}>
        white cloth
      </text>
      <text x="222" y="140" className="fill-current text-[9px] font-mono" opacity={0.75}>
        second bowl
      </text>
    </>
  ),

  // Three-station workflow.
  leaf: (
    <>
      <rect x="16" y="60" width="76" height="56" rx="4" {...STROKE} />
      <rect x="122" y="60" width="76" height="56" rx="4" {...STROKE} strokeWidth={2.2} />
      <rect x="228" y="60" width="76" height="56" rx="4" {...STROKE} />

      <path d="M34 96c10-16 26-22 42-20 1 14-10 24-26 24-6 0-12-2-16-4Z" {...STROKE} strokeWidth={1.2} />
      <path d="M140 96c10-16 26-22 42-20 1 14-10 24-26 24-6 0-12-2-16-4Z" {...STROKE} strokeWidth={1.2} />
      <path d="M130 118v6M190 118v6" {...STROKE} strokeWidth={1} opacity={0.5} />
      <path d="M246 96c10-16 26-22 42-20 1 14-10 24-26 24-6 0-12-2-16-4Z" {...STROKE} strokeWidth={1.2} />

      <path d="M96 88h20M120 88l-6-4M120 88l-6 4" {...STROKE} strokeWidth={1.4} />
      <path d="M202 88h20M226 88l-6-4M226 88l-6 4" {...STROKE} strokeWidth={1.4} />

      <text x="54" y="46" textAnchor="middle" className="fill-current text-[9px] font-mono" opacity={0.8}>
        unchecked
      </text>
      <text x="160" y="46" textAnchor="middle" className="fill-current text-[9px] font-mono" opacity={0.8}>
        light box
      </text>
      <text x="266" y="46" textAnchor="middle" className="fill-current text-[9px] font-mono" opacity={0.8}>
        checked
      </text>
      <path d="M228 140H92" {...STROKE} strokeWidth={1} strokeDasharray="3 4" opacity={0.45} />
      <path d="M96 136l-6 4 6 4" {...STROKE} strokeWidth={1} opacity={0.45} />
      <text x="160" y="154" textAnchor="middle" className="fill-current text-[9px] font-mono" opacity={0.55}>
        never back this way
      </text>
    </>
  ),

  // Section through a floret head.
  floret: (
    <>
      <path d="M60 120V96c0-30 22-52 60-56 12-18 48-18 60 0 38 4 60 26 60 56v24Z" {...STROKE} />
      <path d="M60 120h180" {...STROKE} strokeWidth={2.2} />
      <path d="M150 120V74" {...STROKE} strokeWidth={1.2} opacity={0.6} />
      <path d="M150 92c-16-2-28-6-36-12M150 92c16-2 28-6 36-12M120 120V96M180 120V96" {...STROKE} strokeWidth={1} opacity={0.55} />
      <circle cx="118" cy="86" r="2.4" className="fill-current" />
      <circle cx="176" cy="90" r="2.2" className="fill-current" />
      <circle cx="146" cy="102" r="2.2" className="fill-current" />
      {/* blocked light */}
      <path d="M96 40v22M126 32v24M162 32v24M196 40v22" {...STROKE} strokeWidth={1} opacity={0.5} />
      <path d="M110 60l10 10M120 60l-10 10" {...STROKE} strokeWidth={1.2} opacity={0.75} />
      <path d="M178 60l10 10M188 60l-10 10" {...STROKE} strokeWidth={1.2} opacity={0.75} />
      <text x="150" y="24" textAnchor="middle" className="fill-current text-[9px] font-mono" opacity={0.75}>
        light does not reach the interior
      </text>
      <text x="150" y="144" textAnchor="middle" className="fill-current text-[9px] font-mono" opacity={0.75}>
        so the wash water is the check
      </text>
    </>
  ),
};

export function MethodIllustration({
  figure,
  caption,
  className = "",
}: {
  figure: FigureKey;
  caption?: string;
  className?: string;
}) {
  return (
    <figure className={className}>
      <div className="panel overflow-hidden bg-panel px-2 py-3">
        <svg viewBox="0 0 320 176" role="img" aria-label={caption ?? "Diagram"} className="h-auto w-full text-ink">
          {FIGURES[figure]}
        </svg>
      </div>
      {caption && <figcaption className="citation mt-2">{caption}</figcaption>}
    </figure>
  );
}
