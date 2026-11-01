"use client";

import { useMemo } from "react";
import { usePlayer } from "@/store/player";
import { useStoryProgress } from "@/lib/progress";
import { useStoryChapters } from "./StoryChapters";
import { PauseIcon, PlayIcon } from "./icons";

/** Primary story CTA: "Nghe từ đầu" or "Tiếp tục chương N" based on saved progress. */
export default function StoryActions() {
  const { slug, tracks } = useStoryChapters();
  const progress = useStoryProgress(slug);
  const play = usePlayer((s) => s.play);
  const playingThis = usePlayer((s) => s.playing && s.current?.slug === slug);

  const target = useMemo(() => {
    let last: { index: number; pos: number; done: boolean; t: number } | null = null;
    for (const [k, v] of Object.entries(progress)) {
      if (!last || v.t > last.t) last = { index: Number(k), pos: v.pos, done: v.done, t: v.t };
    }
    if (!last) return null;
    if (!last.done) {
      const track = tracks.find((t) => t.index === last.index);
      return track ? { track, pos: last.pos } : null;
    }
    const pos = tracks.findIndex((t) => t.index === last.index);
    const nextTrack = pos >= 0 ? tracks[pos + 1] : undefined;
    return nextTrack ? { track: nextTrack, pos: 0 } : null;
  }, [progress, tracks]);

  const first = tracks[0];
  if (!first) return null;
  const chosen = target ?? { track: first, pos: 0 };
  const label = playingThis
    ? "Tạm dừng"
    : target
      ? `Tiếp tục chương ${target.track.index}`
      : "Nghe từ đầu";

  const onClick = () => {
    const cur = usePlayer.getState().current;
    const same = cur?.slug === chosen.track.slug && cur.index === chosen.track.index;
    if (playingThis && same) {
      usePlayer.getState().toggle();
      return;
    }
    play(chosen.track, tracks);
    if (!same && chosen.pos > 1) usePlayer.setState({ startAt: chosen.pos, currentTime: chosen.pos });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-accent px-8 text-base font-semibold text-accent-fg shadow-[0_10px_30px_-8px_var(--accent)] transition-[transform,filter] hover:brightness-110 active:scale-[0.98]"
    >
      {playingThis ? <PauseIcon width={20} height={20} /> : <PlayIcon width={20} height={20} />}
      {label}
    </button>
  );
}
