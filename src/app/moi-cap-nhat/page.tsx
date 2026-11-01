import type { Metadata } from "next";
import Link from "next/link";
import { getLatestStories } from "@/lib/catalog";
import { formatDuration } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import StoryCover from "@/components/StoryCover";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Mới cập nhật",
  description: "Những truyện audio vừa được cập nhật chương mới.",
  alternates: { canonical: "/moi-cap-nhat" },
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("vi-VN", { timeZone: "UTC" });
}

export default function LatestPage() {
  const stories = getLatestStories(60);
  return (
    <>
      <PageHeader title="Mới cập nhật" eyebrow="Vừa lên sóng">
        Truyện được cập nhật gần đây nhất nằm ở đầu danh sách.
      </PageHeader>
      {stories.length === 0 ? (
        <EmptyState title="Chưa có truyện nào" text="Truyện mới sẽ sớm được cập nhật." />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {stories.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/truyen/${s.slug}`}
                className="flex gap-4 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-accent sm:p-4"
              >
                <div className="w-20 shrink-0 sm:w-24">
                  <StoryCover slug={s.slug} title={s.title} showTitle={false} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="line-clamp-2 font-display text-lg font-bold leading-snug">{s.title}</h2>
                  <p className="mt-1 text-xs text-muted">
                    {s.genre} · {s.chapter_count} chương · {formatDuration(s.total_duration_seconds).replace(/ \d+ giây$/, "")}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-foreground/85">{s.description}</p>
                  {fmtDate(s.updated_at) && (
                    <p className="mt-2 text-xs text-muted">Cập nhật {fmtDate(s.updated_at)}</p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
