"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePlayer, type SleepTimer, type Track } from "@/store/player";
import { formatClock } from "@/lib/format";
import StoryCover from "./StoryCover";
import {
  Back15Icon,
  ChevronDownIcon,
  Forward30Icon,
  PauseIcon,
  PlayIcon,
  SkipNextIcon,
  SkipPrevIcon,
  TimerIcon,
  VolumeIcon,
} from "./icons";

const SLEEP_OPTIONS = [15, 30, 60];
const QUEUE_WINDOW = 25;
const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

type Props = {
  current: Track;
  prevTrack: Track | null;
  nextTrack: Track | null;
  playing: boolean;
  currentTime: number;
  total: number;
  rate: number;
  volume: number;
  error: string | null;
  queue: Track[];
  sleep: SleepTimer;
  rates: number[];
  onClose: () => void;
};

function SleepStatus({ sleep }: { sleep: SleepTimer }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!sleep || sleep.kind !== "minutes") return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [sleep]);
  if (!sleep) return null;
  const text =
    sleep.kind === "chapter"
      ? "Sẽ dừng khi hết chương này"
      : `Sẽ dừng sau ${formatClock(Math.max(0, (sleep.endsAt - now) / 1000))}`;
  return (
    <p role="status" className="text-sm font-medium text-accent">
      {text}
    </p>
  );
}

export default function NowPlayingSheet({
  current,
  prevTrack,
  nextTrack,
  playing,
  currentTime,
  total,
  rate,
  volume,
  error,
  queue,
  sleep,
  rates,
  onClose,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const currentRowRef = useRef<HTMLLIElement>(null);
  const [sleepOpen, setSleepOpen] = useState(false);
  const [more, setMore] = useState({ before: 0, after: 0 });
  const st = usePlayer.getState;

  // Focus management, scroll lock, Escape and Tab trapping
  useEffect(() => {
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const items = [...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null,
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !dialogRef.current.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !dialogRef.current.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const key = `${current.slug}/${current.index}`;
  useEffect(() => {
    // Center the current row inside the queue's own scroll box only, so opening
    // the sheet never scrolls the cover and controls out of view.
    const row = currentRowRef.current;
    const list = row?.parentElement;
    if (row && list) {
      list.scrollTop = row.offsetTop - list.clientHeight / 2 + row.clientHeight / 2;
    }
  }, [key]);

  const pos = queue.findIndex((t) => t.slug === current.slug && t.index === current.index);
  const center = pos < 0 ? 0 : pos;
  const start = Math.max(0, center - QUEUE_WINDOW - more.before);
  const end = Math.min(queue.length, center + QUEUE_WINDOW + 1 + more.after);
  const max = Math.max(1, Math.floor(total));

  const ctl =
    "inline-flex size-12 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface2 disabled:opacity-35";

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Đang phát"
      className="sheet-in fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-background"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-40 [mask-image:linear-gradient(#000,transparent)]">
        <div className="size-full scale-125 blur-3xl">
          <StoryCover slug={current.slug} title="" showTitle={false} className="!aspect-auto h-full rounded-none" />
        </div>
      </div>
      <header className="relative mx-auto flex w-full max-w-5xl items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Thu nhỏ trình phát" className={ctl}>
          <ChevronDownIcon width={26} height={26} />
        </button>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Đang phát</p>
        <Link
          href={`/truyen/${current.slug}/chuong-${current.index}`}
          onClick={onClose}
          className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium text-accent hover:bg-surface2"
        >
          Đọc chương
        </Link>
      </header>

      <div className="relative mx-auto grid w-full max-w-5xl flex-1 gap-8 px-4 pb-10 pt-4 sm:px-6 md:grid-cols-2 md:gap-12">
        <section aria-label="Điều khiển phát" className="flex flex-col items-center">
          <div className="w-[min(68vw,300px)] md:w-[min(100%,340px)]">
            <StoryCover slug={current.slug} title={current.storyTitle} />
          </div>
          <div className="mt-6 w-full text-center">
            <h2 className="font-display text-xl font-bold leading-snug sm:text-2xl">
              Chương {current.index}: {current.title}
            </h2>
            <p className="mt-1 text-sm text-muted">{current.storyTitle}</p>
          </div>
          {error && (
            <p role="alert" className="mt-3 w-full rounded-lg border border-danger/50 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <div className="mt-6 w-full">
            <input
              type="range"
              aria-label="Tua"
              aria-valuetext={`${formatClock(currentTime)} trên ${formatClock(total)}`}
              min={0}
              max={max}
              step={1}
              value={Math.min(Math.floor(currentTime), max)}
              onChange={(e) => st().seek(Number(e.target.value))}
              className="block h-11 w-full accent-[var(--accent)]"
            />
            <div className="flex justify-between text-xs tabular-nums text-muted" aria-hidden="true">
              <span>{formatClock(currentTime)}</span>
              <span>{formatClock(total)}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-center gap-1 sm:gap-3">
            <button
              type="button"
              className={ctl}
              aria-label="Chương trước"
              disabled={!prevTrack && currentTime <= 5}
              onClick={() => st().prev()}
            >
              <SkipPrevIcon width={24} height={24} />
            </button>
            <button type="button" className={ctl} aria-label="Lùi 15 giây" onClick={() => st().skip(-15)}>
              <Back15Icon width={30} height={30} />
            </button>
            <button
              type="button"
              aria-label={playing ? "Tạm dừng" : "Phát"}
              onClick={() => st().toggle()}
              className="inline-flex size-16 items-center justify-center rounded-full bg-accent text-accent-fg shadow-[0_10px_30px_-8px_var(--accent)] transition-[filter,transform] hover:brightness-110 active:scale-95"
            >
              {playing ? <PauseIcon width={28} height={28} /> : <PlayIcon width={28} height={28} />}
            </button>
            <button type="button" className={ctl} aria-label="Tua tới 30 giây" onClick={() => st().skip(30)}>
              <Forward30Icon width={30} height={30} />
            </button>
            <button
              type="button"
              className={ctl}
              aria-label="Chương sau"
              disabled={!nextTrack}
              onClick={() => st().next()}
            >
              <SkipNextIcon width={24} height={24} />
            </button>
          </div>

          <div className="mt-5 flex w-full flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-muted">
              Tốc độ
              <select
                value={rate}
                onChange={(e) => st().setRate(Number(e.target.value))}
                className="min-h-11 rounded-lg border border-border bg-card px-3 text-foreground"
              >
                {rates.map((r) => (
                  <option key={r} value={r}>
                    {r}x
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              aria-expanded={sleepOpen}
              aria-controls="sleep-panel"
              onClick={() => setSleepOpen((v) => !v)}
              className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-surface2 ${
                sleep ? "border-accent text-accent" : "border-border"
              }`}
            >
              <TimerIcon width={20} height={20} />
              Hẹn giờ ngủ
            </button>
            <label className="flex min-w-36 flex-1 items-center gap-2 text-muted">
              <VolumeIcon width={20} height={20} />
              <input
                type="range"
                aria-label="Âm lượng"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => st().setVolume(Number(e.target.value))}
                className="h-11 w-full accent-[var(--accent)]"
              />
            </label>
          </div>

          <div id="sleep-panel" hidden={!sleepOpen} className="mt-3 w-full rounded-xl border border-border bg-card p-3">
            <p className="mb-2 text-sm font-semibold">Dừng phát sau</p>
            <div className="flex flex-wrap gap-2">
              {SLEEP_OPTIONS.map((m) => {
                const on = sleep?.kind === "minutes" && sleep.minutes === m;
                return (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={on}
                    onClick={() => st().setSleep({ kind: "minutes", minutes: m })}
                    className={`min-h-11 rounded-full border px-4 text-sm font-medium ${
                      on ? "border-accent bg-accent text-accent-fg" : "border-border hover:bg-surface2"
                    }`}
                  >
                    {m} phút
                  </button>
                );
              })}
              <button
                type="button"
                aria-pressed={sleep?.kind === "chapter"}
                onClick={() => st().setSleep({ kind: "chapter" })}
                className={`min-h-11 rounded-full border px-4 text-sm font-medium ${
                  sleep?.kind === "chapter" ? "border-accent bg-accent text-accent-fg" : "border-border hover:bg-surface2"
                }`}
              >
                Hết chương
              </button>
              <button
                type="button"
                disabled={!sleep}
                onClick={() => st().setSleep(null)}
                className="min-h-11 rounded-full border border-border px-4 text-sm font-medium hover:bg-surface2 disabled:opacity-40"
              >
                Tắt hẹn giờ
              </button>
            </div>
          </div>
          <div className="mt-2 min-h-5 w-full">
            <SleepStatus sleep={sleep} />
          </div>
        </section>

        <section aria-labelledby="queue-h" className="min-w-0">
          <h3 id="queue-h" className="font-display text-lg font-bold">
            Danh sách chương
          </h3>
          {queue.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Chưa có chương nào trong hàng đợi.</p>
          ) : (
            <>
              {start > 0 && (
                <button
                  type="button"
                  onClick={() => setMore((m) => ({ ...m, before: m.before + 50 }))}
                  className="mt-3 min-h-11 w-full rounded-lg border border-border text-sm hover:bg-surface2"
                >
                  Hiện thêm chương trước ({start})
                </button>
              )}
              <ol className="relative mt-3 max-h-[60vh] divide-y divide-border overflow-y-auto overscroll-contain rounded-xl border border-border bg-card md:max-h-[calc(100dvh-14rem)]">
                {queue.slice(start, end).map((t, i) => {
                  const isCur = start + i === pos;
                  return (
                    <li key={`${t.slug}/${t.index}`} ref={isCur ? currentRowRef : undefined}>
                      <button
                        type="button"
                        aria-current={isCur ? "true" : undefined}
                        onClick={() => st().playQueueIndex(start + i)}
                        className={`flex min-h-12 w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-surface2 ${
                          isCur ? "bg-surface2 font-semibold text-accent" : ""
                        }`}
                      >
                        <span className="w-10 shrink-0 tabular-nums text-muted">{t.index}</span>
                        <span className="min-w-0 flex-1 truncate">{t.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
              {end < queue.length && (
                <button
                  type="button"
                  onClick={() => setMore((m) => ({ ...m, after: m.after + 50 }))}
                  className="mt-3 min-h-11 w-full rounded-lg border border-border text-sm hover:bg-surface2"
                >
                  Hiện thêm chương sau ({queue.length - end})
                </button>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
