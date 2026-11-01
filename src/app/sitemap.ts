import type { MetadataRoute } from "next";
import { genreSlug, getStories, getStory } from "@/lib/catalog";
import { SITE_URL } from "@/lib/config";

export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const stories = getStories({ includeDemo: false });
  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: stories[0]?.updated_at ?? new Date() },
  ];
  const now = stories[0]?.updated_at ?? new Date();
  entries.push(
    { url: `${SITE_URL}/the-loai`, lastModified: now },
    { url: `${SITE_URL}/moi-cap-nhat`, lastModified: now },
    { url: `${SITE_URL}/gioi-thieu` },
  );
  for (const g of [...new Set(stories.map((s) => genreSlug(s.genre)))]) {
    entries.push({ url: `${SITE_URL}/the-loai/${g}`, lastModified: now });
  }
  for (const s of stories) {
    const lastModified = s.updated_at;
    entries.push({ url: `${SITE_URL}/truyen/${s.slug}`, lastModified });
    for (const c of getStory(s.slug)?.chapters ?? []) {
      entries.push({ url: `${SITE_URL}/truyen/${s.slug}/chuong-${c.index}`, lastModified });
    }
  }
  return entries;
}
