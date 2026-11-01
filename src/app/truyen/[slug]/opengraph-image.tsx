import { getStory } from "@/lib/catalog";
import { ogCard, OG_SIZE, OG_TYPE } from "@/lib/og";
import { BRAND_NAME } from "@/lib/brand";
import { formatDuration } from "@/lib/format";

export const alt = "Ảnh bìa truyện";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) return ogCard({ slug, title: BRAND_NAME });
  const hours = formatDuration(story.total_duration_seconds).replace(/ \d+ giây$/, "");
  return ogCard({
    slug,
    title: story.title,
    kicker: story.genre.toUpperCase(),
    subtitle: `${story.chapters.length} chương · ${hours}`,
  });
}
