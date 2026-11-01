import type { Metadata } from "next";
import Link from "next/link";
import { getGenres, getStoriesByGenre } from "@/lib/catalog";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import CoverArt from "@/components/CoverArt";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Thể loại truyện",
  description: "Duyệt truyện audio theo thể loại: tu tiên, huyền huyễn, kiếm hiệp, đô thị, ngôn tình.",
  alternates: { canonical: "/the-loai" },
};

export default function GenresPage() {
  const genres = getGenres();
  return (
    <>
      <PageHeader title="Thể loại" eyebrow="Khám phá">
        Chọn thể loại bạn yêu thích và bắt đầu nghe.
      </PageHeader>
      {genres.length === 0 ? (
        <EmptyState title="Chưa có thể loại nào" text="Truyện mới sẽ sớm được cập nhật." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {genres.map((g, i) => {
            const sample = getStoriesByGenre(g.slug)[0];
            return (
              <li key={g.slug} className="rise" style={{ "--i": i } as React.CSSProperties}>
                <Link
                  href={`/the-loai/${g.slug}`}
                  className="group relative isolate flex min-h-36 flex-col justify-end overflow-hidden rounded-2xl border border-border p-5 transition-colors hover:border-accent"
                >
                  {sample && (
                    <div aria-hidden="true" className="absolute inset-0 -z-10 transition-transform duration-500 group-hover:scale-105">
                      <CoverArt slug={sample.slug} />
                    </div>
                  )}
                  <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
                  <h2 className="font-display text-2xl font-bold text-[#F5EFE0]">{g.name}</h2>
                  <p className="mt-1 text-sm text-[#E4DDCB]">{g.count} truyện</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
