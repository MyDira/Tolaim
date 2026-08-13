import Image from "next/image";
import { storageUrl } from "@/lib/supabase/config";

/**
 * Produce imagery.
 *
 * Produce is recognised by photograph faster than by name, so the listing is
 * image-forward. Until real photographs are uploaded through /admin, each item
 * gets a drawn specimen glyph chosen by category — quiet, consistent, and
 * still scannable, rather than a grey rectangle. The glyph tones are muted on
 * purpose: nothing in the image may compete with the risk badge sitting on it.
 */

type Glyph = "leaf" | "sprig" | "floret" | "berries" | "fruit" | "stalk" | "root" | "grain";

const GLYPH_BY_CATEGORY: Record<string, Glyph> = {
  "leafy-greens": "leaf",
  herbs: "sprig",
  cruciferous: "floret",
  berries: "berries",
  fruit: "fruit",
  vegetables: "stalk",
  "root-and-bulb": "root",
  "dried-and-grains": "grain",
};

const PATHS: Record<Glyph, React.ReactNode> = {
  leaf: (
    <>
      <path d="M60 12C29 26 16 52 20 84c2 17 12 30 26 34 20 5 38-9 44-31C97 60 86 32 60 12Z" />
      <path d="M52 118C50 90 54 56 68 30" className="vein" />
      <path d="M50 92c8-6 18-9 27-9M48 72c7-7 16-12 25-14M50 52c6-8 13-14 21-18" className="vein" />
    </>
  ),
  sprig: (
    <>
      <path d="M60 122V26" className="vein" />
      <path d="M60 40c-14-6-24-2-30 8 12 7 23 6 30-8ZM60 40c14-6 24-2 30 8-12 7-23 6-30-8ZM60 66c-14-6-24-2-30 8 12 7 23 6 30-8ZM60 66c14-6 24-2 30 8-12 7-23 6-30-8ZM60 92c-13-6-22-2-27 7 11 6 21 5 27-7ZM60 92c13-6 22-2 27 7-11 6-21 5-27-7ZM60 14c-7 5-10 12-9 20 8-3 12-11 9-20Z" />
    </>
  ),
  floret: (
    <>
      <path d="M60 124V78" className="vein" />
      <path d="M60 82c-24 0-40-14-40-31 0-9 5-16 12-19 1-13 12-22 28-22s27 9 28 22c7 3 12 10 12 19 0 17-16 31-40 31Z" />
      <circle cx="42" cy="40" r="7" className="vein" />
      <circle cx="60" cy="30" r="7" className="vein" />
      <circle cx="78" cy="40" r="7" className="vein" />
      <circle cx="50" cy="58" r="7" className="vein" />
      <circle cx="70" cy="58" r="7" className="vein" />
    </>
  ),
  berries: (
    <>
      <path d="M60 44V22M60 30c-8-6-16-8-24-6M60 30c8-6 16-8 24-6" className="vein" />
      <circle cx="44" cy="66" r="21" />
      <circle cx="78" cy="72" r="18" />
      <circle cx="58" cy="98" r="16" />
    </>
  ),
  fruit: (
    <>
      <path d="M60 26c18 0 34 18 34 42s-16 42-34 42-34-18-34-42 16-42 34-42Z" />
      <path d="M60 26V10" className="vein" />
      <path d="M62 14c8-6 17-7 24-3-4 8-14 12-24 3Z" />
    </>
  ),
  stalk: (
    <>
      <path d="M38 20c10 20 12 60 6 96M60 16c4 22 4 62 0 100M82 20c-10 20-12 60-6 96" />
      <path d="M30 116h60" className="vein" />
      <path d="M46 44c8 4 20 4 28 0M44 74c10 4 22 4 32 0" className="vein" />
    </>
  ),
  root: (
    <>
      <path d="M60 118c-9-24-14-48-14-66 0-14 6-22 14-22s14 8 14 22c0 18-5 42-14 66Z" />
      <path d="M46 44c-9-6-14-14-14-24 11 1 18 8 20 18M74 44c9-6 14-14 14-24-11 1-18 8-20 18M60 26V10" className="vein" />
      <path d="M52 62h16M50 82h20M54 100h12" className="vein" />
    </>
  ),
  grain: (
    <>
      <ellipse cx="38" cy="46" rx="9" ry="15" transform="rotate(-18 38 46)" />
      <ellipse cx="66" cy="38" rx="9" ry="15" transform="rotate(12 66 38)" />
      <ellipse cx="84" cy="62" rx="9" ry="15" transform="rotate(28 84 62)" />
      <ellipse cx="48" cy="76" rx="9" ry="15" transform="rotate(-6 48 76)" />
      <ellipse cx="74" cy="92" rx="9" ry="15" transform="rotate(-32 74 92)" />
      <ellipse cx="36" cy="104" rx="9" ry="15" transform="rotate(20 36 104)" />
    </>
  ),
};

function glyphFor(categorySlug: string | null): Glyph {
  if (!categorySlug) return "leaf";
  return GLYPH_BY_CATEGORY[categorySlug] ?? "leaf";
}

interface ProduceImageProps {
  imagePath: string | null;
  alt: string;
  categorySlug: string | null;
  /** Feeds `sizes`; the grid and the detail hero need different hints. */
  sizes?: string;
  priority?: boolean;
  className?: string;
}

export function ProduceImage({
  imagePath,
  alt,
  categorySlug,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px",
  priority = false,
  className = "",
}: ProduceImageProps) {
  const src = storageUrl(imagePath);

  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover ${className}`}
      />
    );
  }

  return <SpecimenGlyph glyph={glyphFor(categorySlug)} className={className} />;
}

function SpecimenGlyph({ glyph, className = "" }: { glyph: Glyph; className?: string }) {
  return (
    <svg
      viewBox="0 0 120 132"
      role="presentation"
      aria-hidden="true"
      className={`h-full w-full ${className}`}
      // `meet` keeps the whole glyph visible in any aspect ratio — `slice`
      // decapitated the taller ones in the listing grid. The backdrop rects are
      // deliberately oversized so the letterboxed area is still painted; the
      // SVG element clips them to its own bounds.
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <pattern id={`hatch-${glyph}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="var(--color-edge)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="-400" y="-400" width="920" height="932" fill="var(--color-panel)" />
      <rect x="-400" y="-400" width="920" height="932" fill={`url(#hatch-${glyph})`} opacity="0.3" />
      <g
        transform="translate(60, 66) scale(0.76) translate(-60, -66)"
        fill="color-mix(in srgb, var(--color-muted) 22%, var(--color-panel))"
        stroke="color-mix(in srgb, var(--color-muted) 55%, transparent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <style>{`.vein { fill: none; stroke: color-mix(in srgb, var(--color-muted) 45%, transparent); }`}</style>
        {PATHS[glyph]}
      </g>
    </svg>
  );
}
