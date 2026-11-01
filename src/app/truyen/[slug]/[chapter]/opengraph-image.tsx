import { getChapter, getStory } from "@/lib/catalog";
import { ogCard, OG_SIZE, OG_TYPE } from "@/lib/og";
import { BRAND_NAME } from "@/lib/brand";

export const alt = "Ảnh chương truyện";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string; chapter: string }> }) {
  const { slug, chapter: segment } = await params;
  const m = /^chuong-([1-9][0-9]*)$/.exec(segment);
  const story = getStory(slug);
  const chapter = m && story ? getChapter(slug, Number(m[1])) : null;
  if (!story || !chapter) return ogCard({ slug, title: BRAND_NAME });
  return ogCard({
    slug,
    title: chapter.title,
    kicker: `CHƯƠNG ${chapter.index}`,
    subtitle: story.title,
  });
}
