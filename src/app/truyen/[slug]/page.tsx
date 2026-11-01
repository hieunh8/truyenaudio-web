import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { genreSlug, getStory, getStorySlugs } from "@/lib/catalog";
import { formatDuration, jsonLd } from "@/lib/format";
import { SITE_URL } from "@/lib/config";
import CoverArt from "@/components/CoverArt";
import StoryCover from "@/components/StoryCover";
import { StoryChaptersProvider } from "@/components/StoryChapters";
import StoryActions from "@/components/StoryActions";
import ChapterList from "@/components/ChapterList";
import Synopsis from "@/components/Synopsis";
import Tabs from "@/components/Tabs";

/** Cap JSON-LD hasPart so a 1000+ chapter story does not add megabytes to the HTML. */
const LD_MAX_PARTS = 100;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("vi-VN", { timeZone: "UTC" });
}

export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  return getStorySlugs().map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) return { title: "Không tìm thấy truyện" };
  const url = `/truyen/${story.slug}`;
  return {
    title: story.title,
    description: story.description,
    alternates: { canonical: url },
    openGraph: { type: "book", url, title: story.title, description: story.description, locale: "vi_VN" },
  };
}

export default async function StoryPage({ params }: Props) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) notFound();

  const ld = {
    "@context": "https://schema.org",
    "@type": ["Book", "CreativeWorkSeries"],
    name: story.title,
    description: story.description,
    genre: story.genre,
    inLanguage: "vi",
    url: `${SITE_URL}/truyen/${story.slug}`,
    dateModified: story.updated_at,
    numberOfItems: story.chapters.length,
    hasPart: story.chapters.slice(0, LD_MAX_PARTS).map((c) => ({
      "@type": "Chapter",
      name: c.title,
      position: c.index,
      url: `${SITE_URL}/truyen/${story.slug}/chuong-${c.index}`,
    })),
  };

  // Only compact metadata crosses to the client; chapter text never does.
  const chapters = story.chapters.map((c) => ({
    index: c.index,
    title: c.title,
    duration_seconds: c.duration_seconds,
  }));
  const synopsis = story.synopsis || story.description;
  const updated = formatDate(story.updated_at);
  const totalDuration = formatDuration(story.total_duration_seconds).replace(/ \d+ giây$/, "");
  const stats = [
    { label: "Chương", value: String(story.chapters.length) },
    { label: "Thời lượng", value: totalDuration },
    ...(updated ? [{ label: "Cập nhật", value: updated }] : []),
  ];

  return (
    <StoryChaptersProvider slug={story.slug} storyTitle={story.title} chapters={chapters}>
      <article>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />

        <header className="relative -mx-4 -mt-6 overflow-hidden px-4 pb-8 pt-8 sm:-mx-6 sm:-mt-10 sm:px-6 sm:pb-12 sm:pt-12">
          <div aria-hidden="true" className="absolute inset-0 -z-10">
            <div className="size-full scale-150 opacity-45 blur-3xl">
              <CoverArt slug={story.slug} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
          </div>
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
            <ol className="flex flex-wrap items-center gap-x-2">
              <li><Link href="/" className="hover:text-foreground">Trang chủ</Link></li>
              <li aria-hidden="true">›</li>
              <li><Link href={`/the-loai/${genreSlug(story.genre)}`} className="hover:text-foreground">{story.genre}</Link></li>
            </ol>
          </nav>
          <div className="rise flex flex-col items-center gap-6 text-center sm:flex-row sm:items-end sm:gap-10 sm:text-left">
            <div className="w-44 shrink-0 sm:w-56">
              <StoryCover slug={story.slug} title={story.title} className="shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                <Link
                  href={`/the-loai/${genreSlug(story.genre)}`}
                  className="inline-flex min-h-8 items-center rounded-full bg-accent px-3 text-xs font-semibold text-accent-fg"
                >
                  {story.genre}
                </Link>
                {(story.tags ?? []).map((t) => (
                  <Link
                    key={t}
                    href={`/tim-kiem?q=${encodeURIComponent(t)}`}
                    className="inline-flex min-h-8 items-center rounded-full border border-border px-3 text-xs text-muted hover:text-foreground"
                  >
                    {t}
                  </Link>
                ))}
              </div>
              <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">{story.title}</h1>
              <dl className="mt-5 flex flex-wrap justify-center gap-x-8 gap-y-3 sm:justify-start">
                {stats.map((s) => (
                  <div key={s.label}>
                    <dt className="text-xs uppercase tracking-wider text-muted">{s.label}</dt>
                    <dd className="font-semibold">{s.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 flex justify-center sm:justify-start">
                <StoryActions />
              </div>
            </div>
          </div>
        </header>

        <div className="mt-4">
          <h2 className="sr-only">Giới thiệu nhanh</h2>
          <Synopsis text={synopsis} />
        </div>

        <div className="mt-8">
          <Tabs
            label="Nội dung truyện"
            tabs={[
              {
                id: "chuong",
                label: `Chương (${story.chapters.length})`,
                content: <ChapterList />,
              },
              {
                id: "gioi-thieu",
                label: "Giới thiệu",
                content: (
                  <div className="max-w-2xl space-y-6">
                    <p className="whitespace-pre-line leading-relaxed">{synopsis}</p>
                    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                      <dt className="text-muted">Thể loại</dt>
                      <dd>{story.genre}</dd>
                      <dt className="text-muted">Số chương</dt>
                      <dd>{story.chapters.length}</dd>
                      <dt className="text-muted">Tổng thời lượng</dt>
                      <dd>{totalDuration}</dd>
                      {story.voice && (<><dt className="text-muted">Giọng đọc</dt><dd>{story.voice}</dd></>)}
                      {updated && (<><dt className="text-muted">Cập nhật</dt><dd>{updated}</dd></>)}
                    </dl>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </article>
    </StoryChaptersProvider>
  );
}
