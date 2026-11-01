"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePlayer } from "@/store/player";
import { useStoryProgress } from "@/lib/progress";
import { formatDuration } from "@/lib/format";
import { useStoryChapters } from "./StoryChapters";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon, SortIcon } from "./icons";

const PAGE_SIZE = 50;

/** Paginated chapter list: only the current page (<= 50 rows) is ever in the DOM. */
export default function ChapterList() {
  const { slug, chapters, tracks } = useStoryChapters();
  const progress = useStoryProgress(slug);
  const play = usePlayer((s) => s.play);
  const currentIndex = usePlayer((s) => (s.current?.slug === slug ? s.current.index : null));
  const playing = usePlayer((s) => s.playing);

  const [desc, setDesc] = useState(false);
  const [page, setPage] = useState(0);
  const [jump, setJump] = useState("");
  const [jumpError, setJumpError] = useState("");
  const [focusIndex, setFocusIndex] = useState<number | null>(null);

  const ordered = useMemo(() => (desc ? [...chapters].reverse() : chapters), [chapters, desc]);
  const pages = Math.max(1, Math.ceil(ordered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const rows = ordered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  useEffect(() => {
    if (focusIndex === null) return;
    const el = document.getElementById(`ch-row-${slug}-${focusIndex}`);
    el?.scrollIntoView({ block: "center" });
    el?.focus({ preventScroll: true });
  }, [focusIndex, safePage, slug]);

  const pageLabel = (p: number) => {
    const a = ordered[p * PAGE_SIZE]?.index;
    const b = ordered[Math.min(ordered.length, (p + 1) * PAGE_SIZE) - 1]?.index;
    return `Chương ${a}–${b}`;
  };

  const onJump = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(jump);
    const pos = ordered.findIndex((c) => c.index === n);
    if (!Number.isInteger(n) || pos < 0) {
      setJumpError(`Không có chương ${jump || "này"}. Hãy nhập số từ ${chapters[0]?.index} đến ${chapters[chapters.length - 1]?.index}.`);
      return;
    }
    setJumpError("");
    setPage(Math.floor(pos / PAGE_SIZE));
    setFocusIndex(n);
  };

  if (chapters.length === 0) {
    return <p className="rounded-xl border border-dashed border-border p-6 text-center text-muted">Truyện chưa có chương nào.</p>;
  }

  const pageBtn =
    "inline-flex size-11 items-center justify-center rounded-full border border-border hover:bg-surface2 disabled:opacity-35";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-start gap-3">
        <form onSubmit={onJump} className="flex items-center gap-2">
          <label htmlFor={`jump-${slug}`} className="text-sm text-muted">
            Đến chương
          </label>
          <input
            id={`jump-${slug}`}
            inputMode="numeric"
            pattern="[0-9]*"
            value={jump}
            onChange={(e) => setJump(e.target.value.replace(/\D/g, ""))}
            aria-describedby={jumpError ? `jump-err-${slug}` : undefined}
            aria-invalid={jumpError ? true : undefined}
            className="min-h-11 w-24 rounded-lg border border-border bg-card px-3 tabular-nums"
            placeholder="777"
          />
          <button type="submit" className="min-h-11 rounded-lg bg-surface2 px-4 text-sm font-semibold hover:brightness-110">
            Đi
          </button>
        </form>
        <button
          type="button"
          aria-pressed={desc}
          onClick={() => {
            setDesc((v) => !v);
            setPage(0);
          }}
          className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium hover:bg-surface2"
        >
          <SortIcon width={18} height={18} />
          {desc ? "Mới nhất trước" : "Cũ nhất trước"}
        </button>
        {jumpError && (
          <p id={`jump-err-${slug}`} role="alert" className="w-full text-sm text-danger">
            {jumpError}
          </p>
        )}
      </div>

      <ol className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card" data-testid="chapter-rows">
        {rows.map((c) => {
          const p = progress[String(c.index)];
          const isCur = currentIndex === c.index;
          const pct = p && !p.done && p.dur > 0 ? Math.min(100, Math.round((p.pos / p.dur) * 100)) : 0;
          const track = tracks.find((t) => t.index === c.index);
          return (
            <li
              key={c.index}
              data-chapter-row
              className={`flex items-stretch ${isCur ? "bg-surface2" : ""}`}
            >
              <Link
                id={`ch-row-${slug}-${c.index}`}
                href={`/truyen/${slug}/chuong-${c.index}`}
                aria-current={isCur ? "true" : undefined}
                className="flex min-h-14 min-w-0 flex-1 items-center gap-3 px-4 py-2 transition-colors hover:bg-surface2"
              >
                <span className="w-12 shrink-0 text-sm font-semibold tabular-nums text-muted">{c.index}</span>
                <span className="min-w-0 flex-1">
                  <span className={`block truncate ${isCur ? "font-semibold text-accent" : ""}`}>{c.title}</span>
                  <span className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                    {formatDuration(c.duration_seconds).replace(/ \d+ giây$/, "") || "0 phút"}
                    {p?.done && (
                      <span className="inline-flex items-center gap-1 text-jade">
                        <CheckIcon width={14} height={14} /> Đã nghe
                      </span>
                    )}
                    {pct > 0 && <span className="text-accent">Đã nghe {pct}%</span>}
                  </span>
                  {pct > 0 && (
                    <span aria-hidden="true" className="mt-1 block h-0.5 overflow-hidden rounded-full bg-border">
                      <span className="block h-full bg-accent" style={{ width: `${pct}%` }} />
                    </span>
                  )}
                </span>
                {isCur && (
                  <span className="eq shrink-0 text-accent" data-paused={!playing} aria-label={playing ? "Đang phát" : "Đang tạm dừng"} role="img">
                    <span />
                    <span />
                    <span />
                  </span>
                )}
              </Link>
              {track && (
                <button
                  type="button"
                  aria-label={`${isCur && playing ? "Tạm dừng" : "Phát"} chương ${c.index}`}
                  onClick={() => play(track, tracks)}
                  className="inline-flex w-14 shrink-0 items-center justify-center text-accent transition-colors hover:bg-surface2"
                >
                  {isCur && playing ? <PauseIcon width={20} height={20} /> : <PlayIcon width={20} height={20} />}
                </button>
              )}
            </li>
          );
        })}
      </ol>

      {pages > 1 && (
        <nav aria-label="Phân trang chương" className="mt-5 flex items-center justify-between gap-3">
          <button type="button" className={pageBtn} aria-label="Trang trước" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
            <ChevronLeftIcon width={20} height={20} />
          </button>
          <label className="flex items-center gap-2 text-sm text-muted">
            <span className="sr-only sm:not-sr-only">Trang</span>
            <select
              value={safePage}
              onChange={(e) => setPage(Number(e.target.value))}
              className="min-h-11 rounded-lg border border-border bg-card px-3 text-foreground"
            >
              {Array.from({ length: pages }, (_, p) => (
                <option key={p} value={p}>
                  {p + 1}/{pages} · {pageLabel(p)}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className={pageBtn} aria-label="Trang sau" disabled={safePage >= pages - 1} onClick={() => setPage(safePage + 1)}>
            <ChevronRightIcon width={20} height={20} />
          </button>
        </nav>
      )}
    </div>
  );
}
