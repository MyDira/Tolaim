"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { RISK, type RiskLevel } from "@/lib/risk";
import { prepare, search } from "@/lib/search";
import { useMyRabbi } from "@/lib/my-rabbi";
import type { ProduceSummary } from "@/lib/types";
import { ProduceImage } from "./ProduceImage";
import { RiskGauge } from "./RiskGauge";

/**
 * The front door.
 *
 * One field, answers underneath as you type. The whole index is already in the
 * page, so this works on the first keystroke and keeps working when the
 * connection drops — which is the actual condition in a supermarket aisle.
 */
export function HomeSearch({ items }: { items: ProduceSummary[] }) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const { rabbi } = useMyRabbi();

  const index = useMemo(() => prepare(items), [items]);
  const results = useMemo(() => (deferred.trim() ? search(index, deferred).slice(0, 6) : []), [index, deferred]);

  const levelFor = (item: ProduceSummary): RiskLevel | null => {
    if (!rabbi) return item.siteRiskLevel;
    const override = rabbi.overrides.find((o) => o.produceId === item.id);
    const authorityId = override?.authorityId ?? rabbi.defaultAuthorityId;
    const level = authorityId ? item.levelsByAuthority[authorityId] : undefined;
    return level ?? item.siteRiskLevel;
  };

  return (
    <div>
      <div className="relative">
        <SearchIcon />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="What are you holding?"
          aria-label="Search produce"
          enterKeyHint="search"
          autoComplete="off"
          className="w-full rounded-xl border border-edge bg-panel py-4 pl-12 pr-4 text-[1.125rem] shadow-[var(--shadow-panel)] outline-none transition-colors placeholder:text-muted/70 focus:border-accent sm:text-[1.25rem]"
        />
      </div>

      {query.trim() && (
        <div className="mt-3" role="region" aria-live="polite">
          {results.length > 0 ? (
            <ul className="divide-y divide-edge overflow-hidden rounded-xl border border-edge bg-panel shadow-[var(--shadow-panel)]">
              {results.map((item) => {
                const level = levelFor(item);
                const def = level ? RISK[level] : null;
                return (
                  <li key={item.id}>
                    <Link href={`/produce/${item.slug}`} className="flex items-center gap-3 p-3 no-underline hover:bg-paper">
                      <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md border border-edge">
                        <ProduceImage
                          imagePath={item.imagePath}
                          alt=""
                          categorySlug={item.categorySlug}
                          sizes="44px"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{item.name}</span>
                        {item.categoryName && <span className="citation block">{item.categoryName}</span>}
                      </span>
                      {def && level && (
                        <span
                          data-risk-badge
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-[0.75rem] font-semibold"
                          style={{
                            backgroundColor: `var(--color-risk-${level}-bg)`,
                            color: `var(--color-risk-${level}-fg)`,
                            borderColor: `color-mix(in srgb, var(--color-risk-${level}-mark) 28%, transparent)`,
                          }}
                        >
                          <RiskGauge level={level} />
                          <span className="hidden sm:inline">{def.label}</span>
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="rounded-xl border border-edge bg-panel p-5 text-center">
              <p className="text-[0.9375rem]">
                Nothing matches &ldquo;{query}&rdquo;. Check the spelling, or try a more common name for it.
              </p>
              <Link href="/produce" className="link mt-2 inline-block text-[0.875rem]">
                Browse the full list instead
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      width="20"
      height="20"
      aria-hidden="true"
      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
    >
      <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12.8 12.8 17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
