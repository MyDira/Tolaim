"use client";

import Link from "next/link";
import { useMyRabbi } from "@/lib/my-rabbi";

/**
 * The header's "my rabbi" control. Shows the current choice, or invites one.
 * Renders nothing until localStorage has been read, so the header does not
 * flicker between states on first paint.
 */
export function MyRabbiChip() {
  const { ready, rabbi } = useMyRabbi();

  if (!ready) return <span className="h-7 w-28" aria-hidden="true" />;

  if (!rabbi) {
    return (
      <Link
        href="/my-rabbi"
        className="inline-flex items-center gap-1.5 rounded-md border border-edge px-2.5 py-1 text-[0.8125rem] text-muted no-underline transition-colors hover:border-accent hover:text-accent"
      >
        <MarkerIcon />
        Set your rabbi
      </Link>
    );
  }

  return (
    <Link
      href="/my-rabbi"
      className="inline-flex max-w-[46vw] items-center gap-1.5 rounded-md border px-2.5 py-1 text-[0.8125rem] no-underline transition-colors sm:max-w-none"
      style={{ borderColor: "color-mix(in srgb, var(--color-accent) 30%, transparent)", color: "var(--color-accent)" }}
    >
      <MarkerIcon />
      <span className="truncate">{rabbi.name}</span>
    </Link>
  );
}

function MarkerIcon() {
  return (
    <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true" className="shrink-0">
      <circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="6" cy="6" r="1.6" fill="currentColor" />
    </svg>
  );
}
