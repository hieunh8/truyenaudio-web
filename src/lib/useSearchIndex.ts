"use client";

import { useEffect, useState } from "react";

export type SearchItem = {
  slug: string;
  title: string;
  genre: string;
  tags: string[];
  description: string;
};

let cache: SearchItem[] | null = null;
let pending: Promise<SearchItem[]> | null = null;

export function loadSearchIndex(): Promise<SearchItem[]> {
  if (cache) return Promise.resolve(cache);
  pending ??= fetch("/api/search")
    .then((r) => (r.ok ? (r.json() as Promise<SearchItem[]>) : []))
    .then((d) => (cache = Array.isArray(d) ? d : []))
    .catch(() => {
      pending = null;
      return [];
    });
  return pending;
}

/** Lazily loads the lightweight search index once per page session. */
export function useSearchIndex(enabled: boolean): SearchItem[] | null {
  const [items, setItems] = useState<SearchItem[] | null>(cache);
  useEffect(() => {
    if (!enabled || items) return;
    let alive = true;
    loadSearchIndex().then((d) => alive && setItems(d));
    return () => {
      alive = false;
    };
  }, [enabled, items]);
  return items;
}
