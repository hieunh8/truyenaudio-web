"use client";

import { useStoryChapters } from "./StoryChapters";
import PlayChapterButton from "./PlayChapterButton";

/** Big play control for a chapter page; queue is the whole story so next/prev work. */
export default function ChapterPlayButton({ index, className = "" }: { index: number; className?: string }) {
  const { tracks } = useStoryChapters();
  const track = tracks.find((t) => t.index === index);
  if (!track) return null;
  return <PlayChapterButton track={track} queue={tracks} className={`min-h-14 px-8 text-base ${className}`} />;
}
