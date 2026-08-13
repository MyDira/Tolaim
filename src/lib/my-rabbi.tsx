"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Rabbi, Ruling } from "./types";

/**
 * "My rabbi".
 *
 * Most people follow a particular rabbi, and that rabbi in turn follows a
 * particular expert — usually across the board, sometimes differently for a
 * specific item. A visitor identifies their rabbi once and from then on the
 * ruling that applies to them is surfaced first.
 *
 * The choice lives in localStorage and nowhere else. There are no public user
 * accounts on this site, nothing is sent to the server, and clearing it is one
 * click. The full picture stays visible either way — surfacing one position
 * first is not the same as hiding the others.
 */

const STORAGE_KEY = "tolaim.my-rabbi.v1";

interface MyRabbiValue {
  /** False until localStorage has been read, so nothing flashes on first paint. */
  ready: boolean;
  rabbi: Rabbi | null;
  rabbis: Rabbi[];
  setRabbiSlug: (slug: string | null) => void;
}

const MyRabbiContext = createContext<MyRabbiValue>({
  ready: false,
  rabbi: null,
  rabbis: [],
  setRabbiSlug: () => {},
});

export function MyRabbiProvider({ rabbis, children }: { rabbis: Rabbi[]; children: React.ReactNode }) {
  const [slug, setSlug] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setSlug(window.localStorage.getItem(STORAGE_KEY));
    } catch {
      // Private browsing or storage disabled. The site works without it.
    }
    setReady(true);
  }, []);

  // Keep two open tabs in step.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setSlug(event.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setRabbiSlug = useCallback((next: string | null) => {
    setSlug(next);
    try {
      if (next) window.localStorage.setItem(STORAGE_KEY, next);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignored, as above.
    }
  }, []);

  const value = useMemo<MyRabbiValue>(
    () => ({
      ready,
      rabbi: slug ? (rabbis.find((r) => r.slug === slug) ?? null) : null,
      rabbis,
      setRabbiSlug,
    }),
    [ready, slug, rabbis, setRabbiSlug],
  );

  return <MyRabbiContext.Provider value={value}>{children}</MyRabbiContext.Provider>;
}

export function useMyRabbi() {
  return useContext(MyRabbiContext);
}

export interface ResolvedRuling {
  /** The position that applies to this visitor, when there is one. */
  ruling: Ruling | null;
  /** Which authority the rabbi follows for this item. */
  authorityId: string | null;
  /** True when this item has a specific exception to the rabbi's usual practice. */
  viaOverride: boolean;
  overrideNote: string;
}

/**
 * Works out which position applies to a visitor for one produce item.
 *
 * If the rabbi's authority has published nothing on this item, the result
 * carries a null ruling and the caller says so plainly. A silent fallback to
 * some other authority's position would be worse than an honest gap — the
 * visitor would think they were reading their own rabbi's view.
 */
export function resolveRulingForRabbi(rabbi: Rabbi | null, produceId: string, rulings: Ruling[]): ResolvedRuling {
  if (!rabbi) return { ruling: null, authorityId: null, viaOverride: false, overrideNote: "" };

  const override = rabbi.overrides.find((o) => o.produceId === produceId);
  const authorityId = override?.authorityId ?? rabbi.defaultAuthorityId;

  if (!authorityId) return { ruling: null, authorityId: null, viaOverride: false, overrideNote: "" };

  return {
    ruling: rulings.find((r) => r.authorityId === authorityId) ?? null,
    authorityId,
    viaOverride: Boolean(override),
    overrideNote: override?.note ?? "",
  };
}
