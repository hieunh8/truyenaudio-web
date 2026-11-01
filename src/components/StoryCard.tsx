import Link from "next/link";
import StoryCover from "./StoryCover";
import { formatDuration } from "@/lib/format";
import type { StorySummary } from "@/lib/catalog";

export default function StoryCard({ story, className = "" }: { story: StorySummary; className?: string }) {
  return (
    <Link
      href={`/truyen/${story.slug}`}
      className={`group block rounded-xl ${className}`}
    >
      <div className="transition-transform duration-200 ease-out group-hover:-translate-y-1">
        <StoryCover slug={story.slug} title={story.title} />
      </div>
      <h3 className="mt-3 line-clamp-2 text-[15px] font-semibold leading-snug group-hover:text-accent">
        {story.title}
      </h3>
      <p className="mt-1 text-xs text-muted">
        {story.genre} · {story.chapter_count} chương
      </p>
      <p className="text-xs text-muted">{formatDuration(story.total_duration_seconds).replace(/ \d+ giây$/, "")}</p>
    </Link>
  );
}
