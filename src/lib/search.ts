import type { ProduceSummary } from "./types";

/**
 * Client-side search.
 *
 * A few hundred produce items is a small enough index to ship whole, so search
 * runs entirely in the browser: no round trip, instant results, and it keeps
 * working when the connection does not. That is the point — the dominant use
 * case is someone standing in a supermarket aisle on a bad signal.
 *
 * Scoring is deliberately blunt. People type the name of the thing in front of
 * them, so exact and prefix matches on the name and its aliases dominate, and
 * the fuzzy pass exists only to absorb typos.
 */

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Are the characters of `needle` present in `haystack`, in order? */
function isSubsequence(needle: string, haystack: string): boolean {
  let i = 0;
  for (let j = 0; j < haystack.length && i < needle.length; j += 1) {
    if (haystack[j] === needle[i]) i += 1;
  }
  return i === needle.length;
}

export interface SearchableProduce extends ProduceSummary {
  /** Precomputed once, reused on every keystroke. */
  _haystack?: string;
  _name?: string;
  _aliases?: string[];
}

export function prepare(items: ProduceSummary[]): SearchableProduce[] {
  return items.map((item) => ({
    ...item,
    _name: normalize(item.name),
    _aliases: item.alsoKnownAs.map(normalize),
    _haystack: normalize([item.name, ...item.alsoKnownAs, item.categoryName ?? "", item.summary].join(" ")),
  }));
}

function scoreOne(item: SearchableProduce, term: string): number {
  const name = item._name ?? "";
  const aliases = item._aliases ?? [];
  const haystack = item._haystack ?? "";

  if (name === term) return 1000;
  if (name.startsWith(term)) return 700;
  if (aliases.some((a) => a === term)) return 650;
  if (aliases.some((a) => a.startsWith(term))) return 500;

  // Word-boundary hit inside the name, e.g. "lettuce" in "romaine lettuce".
  if (name.split(" ").some((word) => word.startsWith(term))) return 420;
  if (name.includes(term)) return 300;
  if (aliases.some((a) => a.includes(term))) return 260;
  if (haystack.includes(term)) return 120;

  // Typo tolerance, and only for terms long enough for it to mean something.
  if (term.length >= 4 && isSubsequence(term, name)) return 60;
  if (term.length >= 4 && isSubsequence(term, haystack)) return 25;

  return 0;
}

export function search(items: SearchableProduce[], query: string): SearchableProduce[] {
  const normalized = normalize(query);
  if (!normalized) return items;

  const terms = normalized.split(" ");

  return items
    .map((item) => {
      let total = 0;
      for (const term of terms) {
        const score = scoreOne(item, term);
        // Every term has to hit something, or it is not a match at all.
        if (score === 0) return { item, score: 0 };
        total += score;
      }
      return { item, score: total };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))
    .map((entry) => entry.item);
}
