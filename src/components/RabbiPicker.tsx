"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMyRabbi } from "@/lib/my-rabbi";

/**
 * Choosing a rabbi.
 *
 * One decision, made once, stored in this browser. No account, nothing sent to
 * a server, and clearing it is one button. The list is short enough that a
 * filter is a convenience rather than a necessity, but it earns its place once
 * a community has more than a dozen entries.
 */
export function RabbiPicker() {
  const { rabbi, rabbis, setRabbiSlug, ready } = useMyRabbi();
  const [filter, setFilter] = useState("");

  const shown = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    if (!needle) return rabbis;
    return rabbis.filter((r) =>
      [r.name, r.community, r.region].some((field) => field.toLowerCase().includes(needle)),
    );
  }, [filter, rabbis]);

  return (
    <div>
      {ready && rabbi && (
        <div
          className="panel mt-6 border-l-4 p-4 sm:p-5"
          style={{ borderLeftColor: "var(--color-accent)" }}
          role="status"
        >
          <h2 className="label">Currently set to</h2>
          <p className="mt-1 font-display text-[1.375rem] leading-snug">{rabbi.name}</p>
          <p className="mt-1 text-[0.9375rem] text-muted">
            {rabbi.defaultAuthority ? (
              <>
                Follows{" "}
                <Link href={`/authorities/${rabbi.defaultAuthority.slug}`} className="link">
                  {rabbi.defaultAuthority.name}
                </Link>
                {rabbi.overrides.length > 0 && (
                  <>
                    , except on{" "}
                    {rabbi.overrides.map((o, i) => (
                      <span key={o.produceId}>
                        {i > 0 && ", "}
                        <Link href={`/produce/${o.produceSlug}`} className="link">
                          {o.produceName.toLowerCase()}
                        </Link>
                      </span>
                    ))}
                  </>
                )}
                .
              </>
            ) : (
              "No authority recorded for this rabbi yet."
            )}
          </p>
          <button
            type="button"
            onClick={() => setRabbiSlug(null)}
            className="mt-4 rounded-md border border-edge bg-panel px-3.5 py-2 text-[0.875rem] font-medium transition-colors hover:border-accent hover:text-accent"
          >
            Clear my choice
          </button>
        </div>
      )}

      {rabbis.length > 6 && (
        <label className="mt-8 block">
          <span className="label">Find a rabbi</span>
          <input
            type="search"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Name, community or region"
            className="mt-1.5 w-full rounded-lg border border-edge bg-panel px-4 py-2.5 outline-none transition-colors placeholder:text-muted/70 focus:border-accent"
          />
        </label>
      )}

      <ul className="mt-6 space-y-3">
        {shown.map((entry) => {
          const selected = rabbi?.id === entry.id;
          return (
            <li key={entry.id} id={entry.slug} className="scroll-mt-24">
              <button
                type="button"
                onClick={() => setRabbiSlug(selected ? null : entry.slug)}
                aria-pressed={selected}
                className="panel w-full p-4 text-left transition-colors hover:border-accent sm:p-5"
                style={
                  selected
                    ? {
                        borderColor: "color-mix(in srgb, var(--color-accent) 45%, transparent)",
                        backgroundColor: "var(--color-accent-soft)",
                      }
                    : undefined
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-[1.1875rem] leading-snug">{entry.name}</p>
                    {(entry.community || entry.region) && (
                      <p className="citation mt-0.5">
                        {[entry.community, entry.region].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                  <span
                    aria-hidden="true"
                    className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border"
                    style={{
                      borderColor: selected ? "var(--color-accent)" : "var(--color-edge)",
                      backgroundColor: selected ? "var(--color-accent)" : "transparent",
                    }}
                  >
                    {selected && (
                      <svg viewBox="0 0 12 12" width="10" height="10" className="text-panel">
                        <path
                          d="M2.5 6.2 4.8 8.5 9.5 3.8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                </div>

                {entry.description && (
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{entry.description}</p>
                )}

                {entry.overrides.length > 0 && (
                  <p className="citation mt-2">
                    Differs on {entry.overrides.map((o) => o.produceName.toLowerCase()).join(", ")}
                  </p>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {shown.length === 0 && (
        <div className="panel mt-6 px-6 py-10 text-center">
          <p className="font-display text-lg">No rabbi here matches “{filter}”</p>
          <p className="mx-auto mt-2 max-w-md text-[0.9375rem] text-muted">
            Only rabbis whose practice has been recorded and reviewed appear on this list. If yours is not here, use the
            site without setting one — every position is shown on each produce page regardless.
          </p>
        </div>
      )}
    </div>
  );
}
