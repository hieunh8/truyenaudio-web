import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdjacentChapters, getChapter, getStories, getStory } from "@/lib/catalog";
import { formatDuration, jsonLd, toIsoDuration } from "@/lib/format";
import { SITE_URL } from "@/lib/config";
import StoryCover from "@/components/StoryCover";
import { StoryChaptersProvider } from "@/components/StoryChapters";
import ChapterPlayButton from "@/components/ChapterPlayButton";
import ReadingPanel from "@/components/ReadingPanel";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

export const revalidate = 3600;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string; chapter: string }> };

/** Parse the "chuong-N" route segment into a positive integer. */
function parseIndex(segment: string): number | null {
  const m = /^chuong-([1-9][0-9]*)$/.exec(segment);
  return m ? Number(m[1]) : null;
}

export function generateStaticParams() {
  // Pre-render only the first chapter of each story
  return getStories().flatMap((s) => {
    const first = getStory(s.slug)?.chapters[0];
    return first ? [{ slug: s.slug, chapter: `chuong-${first.index}` }] : [];
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, chapter: segment } = await params;
  const n = parseIndex(segment);
  const story = getStory(slug);
  const chapter = n && story ? getChapter(slug, n) : null;
  if (!story || !chapter) return { title: "Không tìm thấy chương" };
  const url = `/truyen/${slug}/chuong-${chapter.index}`;
  const title = `Chương ${chapter.index}: ${chapter.title} - ${story.title}`;
  return {
    title,
    description: chapter.summary,
    alternates: { canonical: url },
    openGraph: { type: "article", url, title, description: chapter.summary, locale: "vi_VN" },
  };
}

export default async function ChapterPage({ params }: Props) {
  const { slug, chapter: segment } = await params;
  const n = parseIndex(segment);
  if (n === null) notFound();
  const story = getStory(slug);
  const chapter = story ? getChapter(slug, n) : null;
  if (!story || !chapter) notFound();

  const { prev, next } = getAdjacentChapters(slug, n);
  const pageUrl = `${SITE_URL}/truyen/${slug}/chuong-${chapter.index}`;
  const chapters = story.chapters.map((c) => ({
    index: c.index,
    title: c.title,
    duration_seconds: c.duration_seconds,
  }));

  const ld = {
    "@context": "https://schema.org",
    "@type": "AudioObject",
    name: `Chương ${chapter.index}: ${chapter.title} - ${story.title}`,
    description: chapter.summary,
    contentUrl: `${SITE_URL}/api/audio/${slug}/${chapter.index}`,
    duration: toIsoDuration(chapter.duration_seconds),
    encodingFormat: "audio/mpeg",
    inLanguage: "vi",
    url: pageUrl,
    isPartOf: { "@type": "Book", name: story.title, url: `${SITE_URL}/truyen/${slug}` },
  };

  const paragraphs = chapter.text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const navBtn =
    "inline-flex min-h-12 flex-1 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium transition-colors";

  return (
    <StoryChaptersProvider slug={slug} storyTitle={story.title} chapters={chapters}>
      <article className="mx-auto max-w-3xl">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />

        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-x-2">
            <li><Link href="/" className="hover:text-foreground">Trang chủ</Link></li>
            <li aria-hidden="true">›</li>
            <li><Link href={`/truyen/${slug}`} className="hover:text-foreground">{story.title}</Link></li>
            <li aria-hidden="true">›</li>
            <li aria-current="page" className="text-foreground">Chương {chapter.index}</li>
          </ol>
        </nav>

        <header className="rise flex items-start gap-5">
          <div className="hidden w-24 shrink-0 sm:block">
            <StoryCover slug={slug} title={story.title} showTitle={false} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Chương {chapter.index}</p>
            <h1 className="mt-2 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{chapter.title}</h1>
            <p className="mt-2 text-sm text-muted">
              {story.title} · {formatDuration(chapter.duration_seconds)}
            </p>
          </div>
        </header>

        {chapter.summary && <p className="mt-6 leading-relaxed text-foreground/90">{chapter.summary}</p>}

        <div className="mt-6">
          <ChapterPlayButton index={chapter.index} />
        </div>

        <nav aria-label="Chuyển chương" className="mt-6 flex gap-3">
          {prev ? (
            <Link href={`/truyen/${slug}/chuong-${prev.index}`} className={`${navBtn} hover:bg-surface2`}>
              <ChevronLeftIcon width={18} height={18} />
              <span>Chương {prev.index}</span>
            </Link>
          ) : (
            <span aria-disabled="true" className={`${navBtn} opacity-40`}>
              <ChevronLeftIcon width={18} height={18} />
              <span>Chương trước</span>
            </span>
          )}
          {next ? (
            <Link href={`/truyen/${slug}/chuong-${next.index}`} className={`${navBtn} justify-end hover:bg-surface2`}>
              <span>Chương {next.index}</span>
              <ChevronRightIcon width={18} height={18} />
            </Link>
          ) : (
            <span aria-disabled="true" className={`${navBtn} justify-end opacity-40`}>
              <span>Chương sau</span>
              <ChevronRightIcon width={18} height={18} />
            </span>
          )}
        </nav>

        <div className="mt-8">
          <ReadingPanel paragraphs={paragraphs} />
        </div>
      </article>
    </StoryChaptersProvider>
  );
}
