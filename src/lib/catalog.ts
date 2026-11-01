import fs from "node:fs";
import path from "node:path";
import { foldText } from "./text";

export type StorySummary = {
  slug: string;
  story_id: string;
  title: string;
  description: string;
  genre: string;
  tags?: string[];
  synopsis?: string;
  featured?: boolean;
  demo?: boolean;
  cover: string;
  chapter_count: number;
  total_duration_seconds: number;
  updated_at: string;
};

export type Chapter = {
  index: number;
  title: string;
  summary: string;
  duration_seconds: number;
  audio_key: string;
  audio_file: string;
  text: string;
};

export type Story = StorySummary & {
  voice?: string;
  chapters: Chapter[];
};

const SLUG_RE = /^[a-z0-9-]+$/;

function contentDir(): string {
  return path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.CATALOG_DIR || "content");
}

function readJson<T>(file: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8")) as T;
  } catch {
    return null;
  }
}

function normalize(s: StorySummary): StorySummary {
  return {
    ...s,
    genre: s.genre || "Khác",
    tags: Array.isArray(s.tags) ? s.tags : [],
    synopsis: s.synopsis ?? "",
    featured: s.featured === true,
    demo: s.demo === true,
    updated_at: s.updated_at ?? "",
  };
}

export function getStories(opts: { includeDemo?: boolean } = {}): StorySummary[] {
  const { includeDemo = true } = opts;
  const data = readJson<{ stories?: StorySummary[] }>(
    path.join(contentDir(), "stories.json"),
  );
  const stories = (data?.stories ?? [])
    .map(normalize)
    .filter((s) => includeDemo || !s.demo);
  return stories.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export function getStorySlugs(): string[] {
  return getStories().map((s) => s.slug);
}

export { foldText };

export function genreSlug(genre: string): string {
  return foldText(genre).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "khac";
}

export type GenreInfo = { name: string; slug: string; count: number };

export function getGenres(): GenreInfo[] {
  const map = new Map<string, GenreInfo>();
  for (const s of getStories()) {
    const slug = genreSlug(s.genre);
    const cur = map.get(slug);
    if (cur) cur.count += 1;
    else map.set(slug, { name: s.genre, slug, count: 1 });
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "vi"));
}

export function getStoriesByGenre(slug: string): StorySummary[] {
  return getStories().filter((s) => genreSlug(s.genre) === slug);
}

export function searchStories(query: string): StorySummary[] {
  const terms = foldText(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  return getStories().filter((s) => {
    const hay = foldText(
      [s.title, s.description, s.genre, ...(s.tags ?? [])].join(" "),
    );
    return terms.every((t) => hay.includes(t));
  });
}

export function getFeaturedStory(): StorySummary | null {
  const all = getStories();
  return all.find((s) => s.featured) ?? all[0] ?? null;
}

export function getLatestStories(n = 10): StorySummary[] {
  return getStories().slice(0, n);
}

export type SearchIndexItem = {
  slug: string;
  title: string;
  genre: string;
  tags: string[];
  description: string;
};

export function getSearchIndex(): SearchIndexItem[] {
  return getStories().map((s) => ({
    slug: s.slug,
    title: s.title,
    genre: s.genre,
    tags: s.tags ?? [],
    description: s.description,
  }));
}

export function getStory(slug: string): Story | null {
  if (!SLUG_RE.test(slug)) return null;
  const story = readJson<Story>(
    path.join(contentDir(), "stories", `${slug}.json`),
  );
  if (!story) return null;
  story.chapters = [...(story.chapters ?? [])].sort((a, b) => a.index - b.index);
  return story;
}

export function getChapter(slug: string, index: number): Chapter | null {
  const story = getStory(slug);
  return story?.chapters.find((c) => c.index === index) ?? null;
}

export function getAdjacentChapters(
  slug: string,
  index: number,
): { prev: Chapter | null; next: Chapter | null } {
  const story = getStory(slug);
  if (!story) return { prev: null, next: null };
  const pos = story.chapters.findIndex((c) => c.index === index);
  if (pos < 0) return { prev: null, next: null };
  return {
    prev: story.chapters[pos - 1] ?? null,
    next: story.chapters[pos + 1] ?? null,
  };
}
