import { foldText } from "./text";
import type { SearchItem } from "./useSearchIndex";

/** Diacritic-insensitive AND match over title, genre, tags and description. Title hits rank first. */
export function filterIndex(items: SearchItem[], query: string): SearchItem[] {
  const terms = foldText(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  const scored: { item: SearchItem; score: number }[] = [];
  for (const item of items) {
    const title = foldText(item.title);
    const rest = foldText([item.genre, ...item.tags, item.description].join(" "));
    if (!terms.every((t) => title.includes(t) || rest.includes(t))) continue;
    const score = terms.every((t) => title.includes(t)) ? 0 : 1;
    scored.push({ item, score });
  }
  return scored.sort((a, b) => a.score - b.score).map((s) => s.item);
}
