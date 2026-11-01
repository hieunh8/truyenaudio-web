"use client";

import { createContext, useContext, useMemo } from "react";
import type { Track } from "@/store/player";

export type ChapterMeta = { index: number; title: string; duration_seconds: number };

type Value = {
  slug: string;
  storyTitle: string;
  chapters: ChapterMeta[];
  /** Full playback queue for the story, built once on the client. */
  tracks: Track[];
};

const Ctx = createContext<Value | null>(null);

/** Shares compact chapter metadata (never chapter text) with client children, serialised once. */
export function StoryChaptersProvider({
  slug,
  storyTitle,
  chapters,
  children,
}: {
  slug: string;
  storyTitle: string;
  chapters: ChapterMeta[];
  children: React.ReactNode;
}) {
  const value = useMemo<Value>(
    () => ({
      slug,
      storyTitle,
      chapters,
      tracks: chapters.map((c) => ({
        slug,
        index: c.index,
        title: c.title,
        storyTitle,
        src: `/api/audio/${slug}/${c.index}`,
        duration: c.duration_seconds,
      })),
    }),
    [slug, storyTitle, chapters],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStoryChapters(): Value {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStoryChapters must be used inside StoryChaptersProvider");
  return v;
}
