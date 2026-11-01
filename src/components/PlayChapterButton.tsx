"use client";

import { usePlayer, type Track } from "@/store/player";
import { PauseIcon, PlayIcon } from "./icons";

export default function PlayChapterButton({
  track,
  queue,
  label = "Nghe chương này",
  className = "",
}: {
  track: Track;
  queue?: Track[];
  label?: string;
  className?: string;
}) {
  const play = usePlayer((s) => s.play);
  const active = usePlayer(
    (s) => !!s.current && s.current.slug === track.slug && s.current.index === track.index && s.playing,
  );
  return (
    <button
      type="button"
      onClick={() => play(track, queue)}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 font-semibold text-accent-fg shadow-[0_6px_20px_-6px_var(--accent)] transition-[transform,filter] hover:brightness-110 active:scale-[0.98] ${className}`}
    >
      {active ? <PauseIcon width={18} height={18} /> : <PlayIcon width={18} height={18} />}
      {active ? "Tạm dừng" : label}
    </button>
  );
}
