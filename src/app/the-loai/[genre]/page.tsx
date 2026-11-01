import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGenres, getStoriesByGenre } from "@/lib/catalog";
import PageHeader from "@/components/PageHeader";
import StoryCard from "@/components/StoryCard";

export const revalidate = 300;
export const dynamicParams = true;

type Props = { params: Promise<{ genre: string }> };

export function generateStaticParams() {
  return getGenres().map((g) => ({ genre: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { genre } = await params;
  const info = getGenres().find((g) => g.slug === genre);
  if (!info) return { title: "Không tìm thấy thể loại" };
  return {
    title: `Truyện ${info.name}`,
    description: `Nghe truyện audio thể loại ${info.name}: ${info.count} truyện.`,
    alternates: { canonical: `/the-loai/${genre}` },
  };
}

export default async function GenrePage({ params }: Props) {
  const { genre } = await params;
  const stories = getStoriesByGenre(genre);
  if (stories.length === 0) notFound();
  const name = stories[0].genre;
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
        <Link href="/the-loai" className="inline-flex min-h-11 items-center hover:text-accent">Thể loại</Link>
        <span aria-hidden="true"> › </span>
        <span aria-current="page">{name}</span>
      </nav>
      <PageHeader title={name} eyebrow="Thể loại">
        {stories.length} truyện audio thuộc thể loại {name}.
      </PageHeader>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {stories.map((s) => (
          <li key={s.slug}>
            <StoryCard story={s} />
          </li>
        ))}
      </ul>
    </>
  );
}
