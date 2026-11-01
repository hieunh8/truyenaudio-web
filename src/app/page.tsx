import Link from "next/link";
import {
  getFeaturedStory,
  getGenres,
  getLatestStories,
  getStories,
  getStory,
  getStoriesByGenre,
  type StorySummary,
} from "@/lib/catalog";
import { formatDuration } from "@/lib/format";
import { BRAND_TAGLINE } from "@/lib/brand";
import type { Track } from "@/store/player";
import CoverArt from "@/components/CoverArt";
import StoryCover from "@/components/StoryCover";
import StoryCard from "@/components/StoryCard";
import SectionHeader from "@/components/SectionHeader";
import ContinueListening from "@/components/ContinueListening";
import PlayChapterButton from "@/components/PlayChapterButton";

export const revalidate = 60;

function Scroller({ stories, label }: { stories: StorySummary[]; label: string }) {
  return (
    <ul
      aria-label={label}
      className="scrollbar-hide -mx-4 flex snap-x snap-mandatory scroll-px-4 sm:scroll-px-6 gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6"
    >
      {stories.map((s) => (
        <li key={s.slug} className="w-36 shrink-0 snap-start sm:w-44">
          <StoryCard story={s} />
        </li>
      ))}
    </ul>
  );
}

export default function HomePage() {
  const all = getStories();
  const hero = getFeaturedStory();

  if (!hero) {
    return (
      <section className="mx-auto max-w-lg py-16 text-center">
        <h1 className="font-display text-3xl font-bold">Sắp có truyện mới</h1>
        <p className="mt-3 text-muted">Chưa có truyện nào được đăng. Vui lòng quay lại sau.</p>
      </section>
    );
  }

  const heroStory = getStory(hero.slug);
  const first = heroStory?.chapters[0];
  const toTrack = (c: NonNullable<typeof first>): Track => ({
    slug: hero.slug,
    index: c.index,
    title: c.title,
    storyTitle: hero.title,
    src: `/api/audio/${hero.slug}/${c.index}`,
    duration: c.duration_seconds,
  });

  const rest = all.filter((s) => s.slug !== hero.slug);
  const latest = getLatestStories(12).filter((s) => s.slug !== hero.slug);
  const genres = getGenres()
    .map((g) => ({ ...g, stories: getStoriesByGenre(g.slug).filter((s) => s.slug !== hero.slug) }))
    .filter((g) => g.stories.length > 0);
  const featured = rest.filter((s) => s.featured);

  return (
    <>
      <section
        aria-labelledby="hero-title"
        className="rise relative isolate overflow-hidden rounded-3xl border border-border bg-card"
      >
        <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-40 blur-2xl [transform:scale(1.4)]">
          <CoverArt slug={hero.slug} />
        </div>
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-background/95 via-background/75 to-background/30" />
        <div className="grid items-center gap-6 p-5 sm:p-8 md:grid-cols-[minmax(0,1fr)_260px] md:gap-10 md:p-12 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="order-2 md:order-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {hero.featured ? "Truyện đề cử" : "Mới nhất"} · {hero.genre}
            </p>
            <h1 id="hero-title" className="mt-3 font-display text-3xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
              {hero.title}
            </h1>
            <p className="mt-2 text-sm text-muted">
              {hero.chapter_count} chương · {formatDuration(hero.total_duration_seconds).replace(/ \d+ giây$/, "")}
            </p>
            <p className="mt-4 line-clamp-4 max-w-xl text-base leading-relaxed text-foreground/90">
              {hero.synopsis || hero.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {first && (
                <PlayChapterButton
                  track={toTrack(first)}
                  queue={heroStory!.chapters.slice(0, 50).map(toTrack)}
                  label="Nghe ngay"
                />
              )}
              <Link
                href={`/truyen/${hero.slug}`}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-border bg-card/70 px-6 font-semibold transition-colors hover:border-accent hover:text-accent"
              >
                Xem chi tiết
              </Link>
            </div>
          </div>
          <div className="order-1 w-32 sm:w-44 md:order-2 md:w-full md:rotate-2">
            <StoryCover slug={hero.slug} title={hero.title} />
          </div>
        </div>
      </section>

      <ContinueListening />

      {latest.length > 0 && (
        <section aria-labelledby="latest-h" className="mt-12">
          <SectionHeader id="latest-h" title="Mới cập nhật" href="/moi-cap-nhat" />
          <Scroller stories={latest} label="Truyện mới cập nhật" />
        </section>
      )}

      {genres.map((g) => (
        <section key={g.slug} aria-label={g.name} className="mt-12">
          <SectionHeader title={g.name} href={`/the-loai/${g.slug}`} />
          <Scroller stories={g.stories.slice(0, 10)} label={`Truyện ${g.name}`} />
        </section>
      ))}

      {featured.length > 0 && (
        <section aria-labelledby="featured-h" className="mt-12">
          <SectionHeader id="featured-h" title="Truyện nổi bật" />
          <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {featured.map((s) => (
              <li key={s.slug}>
                <StoryCard story={s} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {rest.length === 0 && (
        <p className="mt-12 text-center text-sm text-muted">{BRAND_TAGLINE}. Truyện mới sẽ sớm được cập nhật.</p>
      )}
    </>
  );
}
