"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { INSPECTION_LINE, RISK, type RiskLevel } from "@/lib/risk";
import { prepare, search } from "@/lib/search";
import { useMyRabbi } from "@/lib/my-rabbi";
import type { Category, ProduceSummary } from "@/lib/types";
import { ProduceCard } from "./ProduceCard";

/**
 * The listing.
 *
 * Everything is in memory: search, filters and sorting all run against a
 * prepared index built once. The primary filter is the line between levels 3
 * and 4 — above it real inspection is required, below it none is — because
 * that is the question people are actually asking in the aisle.
 */

type InspectionFilter = "all" | "inspection" | "no-inspection";

const FILTERS: { value: InspectionFilter; label: string; hint: string }[] = [
  { value: "all", label: "Everything", hint: "All produce items" },
  { value: "inspection", label: "Needs inspection", hint: "Levels 1 to 3 — real checking required" },
  { value: "no-inspection", label: "Rinse or less", hint: "Levels 4 and 5 — no inspection required" },
];

interface ProduceExplorerProps {
  items: ProduceSummary[];
  categories: Category[];
  initialFilter?: InspectionFilter;
}

export function ProduceExplorer({ items, categories, initialFilter = "all" }: ProduceExplorerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { rabbi, ready } = useMyRabbi();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<InspectionFilter>(initialFilter);
  const [category, setCategory] = useState<string>("all");
  const inputRef = useRef<HTMLInputElement>(null);

  // Deferred so typing never blocks on rendering a few hundred cards.
  const deferredQuery = useDeferredValue(query);

  const index = useMemo(() => prepare(items), [items]);

  // "/" focuses search, as in every reference tool people already use.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey) return;
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      event.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Deep links from the home page and the breadcrumbs land here.
  useEffect(() => {
    const fromUrl = searchParams.get("filter");
    if (fromUrl === "inspection" || fromUrl === "no-inspection" || fromUrl === "all") setFilter(fromUrl);

    const categoryFromUrl = searchParams.get("category");
    if (categoryFromUrl && categories.some((c) => c.slug === categoryFromUrl)) setCategory(categoryFromUrl);
  }, [searchParams, categories]);

  /** The level that applies to this visitor, for one item. */
  const levelFor = useMemo(() => {
    return (item: ProduceSummary): { level: RiskLevel | null; attribution?: string } => {
      if (!rabbi) return { level: item.siteRiskLevel };

      const override = rabbi.overrides.find((o) => o.produceId === item.id);
      const authorityId = override?.authorityId ?? rabbi.defaultAuthorityId;
      const level = authorityId ? item.levelsByAuthority[authorityId] : undefined;

      if (level === undefined) {
        return item.siteRiskLevel === null
          ? { level: null }
          : { level: item.siteRiskLevel, attribution: "No position from your rabbi's authority" };
      }
      return { level, attribution: `Per ${rabbi.name}` };
    };
  }, [rabbi]);

  const results = useMemo(() => {
    let list = search(index, deferredQuery);

    if (category !== "all") list = list.filter((item) => item.categorySlug === category);

    if (filter !== "all") {
      list = list.filter((item) => {
        const { level } = levelFor(item);
        if (level === null) return false;
        return filter === "inspection" ? level <= INSPECTION_LINE : level > INSPECTION_LINE;
      });
    }

    return list;
  }, [index, deferredQuery, category, filter, levelFor]);

  /** Keeps filter state in the URL so a filtered view can be linked or shared. */
  const updateUrl = (key: "filter" | "category", value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete(key);
    else params.set(key, value);
    router.replace(params.toString() ? `/produce?${params}` : "/produce", { scroll: false });
  };

  const setFilterAndUrl = (next: InspectionFilter) => {
    setFilter(next);
    updateUrl("filter", next);
  };

  const setCategoryAndUrl = (next: string) => {
    setCategory(next);
    updateUrl("category", next);
  };

  return (
    <div>
      {/* ---- controls ---- */}
      <div data-print="hide" className="sticky top-[3.25rem] z-20 -mx-4 bg-paper/90 px-4 pb-3 pt-3 backdrop-blur-md sm:top-[3.5rem] sm:mx-0 sm:px-0">
        <div className="relative">
          <SearchIcon />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search produce — try “lettuce”"
            aria-label="Search produce"
            enterKeyHint="search"
            autoComplete="off"
            className="w-full rounded-lg border border-edge bg-panel py-3 pl-11 pr-4 text-[1.0625rem] shadow-[var(--shadow-panel)] outline-none transition-colors placeholder:text-muted/70 focus:border-accent"
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Filter by whether inspection is required" className="flex flex-wrap gap-1.5">
            {FILTERS.map((option) => {
              const active = filter === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilterAndUrl(option.value)}
                  aria-pressed={active}
                  title={option.hint}
                  className={`rounded-md border px-2.5 py-1.5 text-[0.8125rem] font-medium transition-colors ${
                    active
                      ? "border-transparent bg-ink text-paper"
                      : "border-edge bg-panel text-muted hover:border-accent hover:text-accent"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <label className="ml-auto flex items-center gap-2 text-[0.8125rem] text-muted">
            <span className="sr-only sm:not-sr-only">Category</span>
            <select
              value={category}
              onChange={(event) => setCategoryAndUrl(event.target.value)}
              className="rounded-md border border-edge bg-panel px-2 py-1.5 text-[0.8125rem] outline-none focus:border-accent"
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* ---- result count and personalisation note ---- */}
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-[0.8125rem] text-muted" role="status" aria-live="polite">
          {results.length === items.length
            ? `${items.length} items`
            : `${results.length} of ${items.length} items`}
        </p>
        {ready && rabbi && (
          <p className="text-[0.8125rem] text-muted">
            Showing levels per{" "}
            <Link href="/my-rabbi" className="link">
              {rabbi.name}
            </Link>
          </p>
        )}
      </div>

      {/* ---- results ---- */}
      {results.length > 0 ? (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {results.map((item, i) => {
            const { level, attribution } = levelFor(item);
            return (
              <li key={item.id} className="contents">
                <ProduceCard item={item} level={level} attribution={attribution} priority={i < 4} />
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          query={deferredQuery}
          filter={filter}
          onClear={() => {
            setQuery("");
            setFilter("all");
            setCategory("all");
            router.replace("/produce", { scroll: false });
          }}
        />
      )}

      <LegendStrip />
    </div>
  );
}

function EmptyState({
  query,
  filter,
  onClear,
}: {
  query: string;
  filter: InspectionFilter;
  onClear: () => void;
}) {
  const filterLabel = FILTERS.find((f) => f.value === filter)?.label.toLowerCase();

  return (
    <div className="panel mt-6 px-6 py-12 text-center">
      <p className="font-display text-xl">
        {query ? <>Nothing here matches “{query}”</> : <>No items match these filters</>}
      </p>
      <p className="mx-auto mt-2 max-w-md text-[0.9375rem] text-muted">
        {query && filter !== "all" ? (
          <>
            Try the same search without the “{filterLabel}” filter, or check the spelling. If the item genuinely is not
            listed yet, it has not been reviewed for publication.
          </>
        ) : query ? (
          <>
            Check the spelling, or try a more common name for it. If it genuinely is not listed, it has not been
            reviewed for publication yet.
          </>
        ) : (
          <>Widen the filters to see the rest of the list.</>
        )}
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-5 rounded-md border border-edge bg-panel px-4 py-2 text-[0.9375rem] font-medium transition-colors hover:border-accent hover:text-accent"
      >
        Clear search and filters
      </button>
    </div>
  );
}

/** The legend is reachable from anywhere a badge appears — including here. */
function LegendStrip() {
  return (
    <div data-print="hide" className="mt-10">
      <div className="mesh-rule" aria-hidden="true" />
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="label">The five levels</span>
        {([1, 2, 3, 4, 5] as RiskLevel[]).map((level) => (
          <Link
            key={level}
            href={`/risk-levels#level-${level}`}
            className="text-[0.8125rem] no-underline transition-colors hover:text-accent"
            style={{ color: `var(--color-risk-${level}-fg)` }}
          >
            <span className="font-mono">{level}</span> {RISK[level].label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      width="18"
      height="18"
      aria-hidden="true"
      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
    >
      <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12.8 12.8 17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
