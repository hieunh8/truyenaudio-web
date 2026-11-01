import fs from "node:fs";
import path from "node:path";
import { getStories, getStory } from "@/lib/catalog";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, WORKSPACE_ROOT } from "@/lib/config";

export const revalidate = 3600;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function fileSize(storyId: string, audioFile: string): number | null {
  if (!/^[0-9A-Za-z_]+$/.test(storyId) || !/^[\w.-]+\.mp3$/.test(audioFile)) return null;
  try {
    return fs.statSync(path.join(WORKSPACE_ROOT, "output", storyId, "audio", audioFile)).size;
  } catch {
    return null;
  }
}

function itunesDuration(sec: number): string {
  const s = Math.round(sec);
  const h = Math.floor(s / 3600);
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${ss}`;
}

export function GET() {
  const items: { date: string; xml: string }[] = [];
  for (const s of getStories({ includeDemo: false })) {
    const story = getStory(s.slug);
    if (!story) continue;
    for (const c of story.chapters) {
      const link = `${SITE_URL}/truyen/${s.slug}/chuong-${c.index}`;
      const size = fileSize(story.story_id, c.audio_file);
      items.push({
        date: story.updated_at,
        xml: `<item>
<title>${esc(`${story.title} - Chương ${c.index}: ${c.title}`)}</title>
<link>${esc(link)}</link>
<guid isPermaLink="true">${esc(link)}</guid>
<description>${esc(c.summary)}</description>
<pubDate>${new Date(story.updated_at).toUTCString()}</pubDate>
<enclosure url="${esc(`${SITE_URL}/api/audio/${s.slug}/${c.index}`)}" length="${size ?? 0}" type="audio/mpeg"/>
<itunes:duration>${itunesDuration(c.duration_seconds)}</itunes:duration>
</item>`,
      });
    }
  }
  items.sort((a, b) => b.date.localeCompare(a.date));
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${esc(SITE_NAME)}</title>
<link>${esc(SITE_URL)}</link>
<description>${esc(SITE_DESCRIPTION)}</description>
<language>vi</language>
<atom:link href="${esc(`${SITE_URL}/feed.xml`)}" rel="self" type="application/rss+xml"/>
<itunes:explicit>false</itunes:explicit>
${items.slice(0, 50).map((i) => i.xml).join("\n")}
</channel>
</rss>`;
  return new Response(body, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
