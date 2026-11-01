"use client";

import { useEffect, useRef } from "react";
import { Howl } from "howler";
import { getNeighbors, usePlayer, type ResumeCandidate, type Track } from "@/store/player";
import { SITE_NAME } from "@/lib/config";
import { markDone, markProgress } from "@/lib/progress";
import StoryCover from "./StoryCover";
import NowPlayingSheet from "./NowPlayingSheet";
import { PauseIcon, PlayIcon, SkipNextIcon } from "./icons";

const STORAGE_KEY = "truyenaudio:player:v1";
const RATES = [0.75, 1, 1.25, 1.5, 2];
const SAVE_INTERVAL_MS = 5000;
const SKIP_BACK = 15;
const SKIP_FORWARD = 30;

type Saved = {
  slug: string;
  index: number;
  title: string;
  storyTitle: string;
  duration: number;
  position: number;
  rate: number;
  volume: number;
  prev: Track | null;
  next: Track | null;
};

/** Format seconds as mm:ss (minutes may exceed 59). */
function fmt(sec: number): string {
  const s = Math.max(0, Math.floor(Number.isFinite(sec) ? sec : 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

const trackOf = (slug: string, index: number, title: string, storyTitle: string, duration: number): Track => ({
  slug,
  index,
  title,
  storyTitle,
  duration,
  src: `/api/audio/${slug}/${index}`,
});

function isTrack(t: unknown): t is Track {
  if (!t || typeof t !== "object") return false;
  const o = t as Record<string, unknown>;
  return (
    typeof o.slug === "string" &&
    /^[a-z0-9-]+$/.test(o.slug) &&
    typeof o.index === "number" &&
    Number.isInteger(o.index) &&
    typeof o.title === "string" &&
    typeof o.storyTitle === "string" &&
    typeof o.duration === "number"
  );
}

/** Read the saved snapshot; returns null on any parse/shape problem. */
function readSaved(): { candidate: ResumeCandidate; rate: number; volume: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as Partial<Saved>;
    if (!d || typeof d !== "object") return null;
    const track = { ...d, src: `/api/audio/${d.slug}/${d.index}` };
    if (!isTrack(track) || typeof d.position !== "number" || d.position < 1) return null;
    return {
      candidate: {
        track: trackOf(track.slug, track.index, track.title, track.storyTitle, track.duration),
        prev: isTrack(d.prev) ? d.prev : null,
        next: isTrack(d.next) ? d.next : null,
        position: d.position,
      },
      rate: typeof d.rate === "number" && RATES.includes(d.rate) ? d.rate : 1,
      volume: typeof d.volume === "number" && d.volume >= 0 && d.volume <= 1 ? d.volume : 1,
    };
  } catch {
    return null;
  }
}

function save(position: number) {
  const s = usePlayer.getState();
  if (!s.current) return;
  const { prev, next } = getNeighbors(s);
  const data: Saved = {
    slug: s.current.slug,
    index: s.current.index,
    title: s.current.title,
    storyTitle: s.current.storyTitle,
    duration: s.duration || s.current.duration,
    position,
    rate: s.rate,
    volume: s.volume,
    prev,
    next,
  };
  if (position > 0) markProgress(s.current.slug, s.current.index, position, data.duration);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage may be full or blocked; persistence is best effort
  }
}

export default function Player() {
  const current = usePlayer((s) => s.current);
  const playing = usePlayer((s) => s.playing);
  const currentTime = usePlayer((s) => s.currentTime);
  const duration = usePlayer((s) => s.duration);
  const rate = usePlayer((s) => s.rate);
  const volume = usePlayer((s) => s.volume);
  const error = usePlayer((s) => s.error);
  const resumeCandidate = usePlayer((s) => s.resumeCandidate);
  const seekRequest = usePlayer((s) => s.seekRequest);
  const queue = usePlayer((s) => s.queue);

  const sleep = usePlayer((s) => s.sleep);
  const sheetOpen = usePlayer((s) => s.sheetOpen);
  const howlRef = useRef<Howl | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const visible = !!current || !!resumeCandidate;
  const trackKey = current ? `${current.slug}/${current.index}` : null;

  // Load the saved snapshot after mount to avoid hydration mismatch
  useEffect(() => {
    const saved = readSaved();
    if (saved && !usePlayer.getState().current) {
      usePlayer.getState().setResumeCandidate(saved.candidate, saved.rate, saved.volume);
    }
  }, []);

  // Single Howl instance per track; unloaded on track change/unmount
  useEffect(() => {
    if (!trackKey) return;
    const { current: track, rate: r, volume: v, startAt, playing: shouldPlay } = usePlayer.getState();
    if (!track) return;
    const howl = new Howl({
      src: [track.src],
      format: ["mp3"],
      html5: true,
      preload: true,
      rate: r,
      volume: v,
      onload: () => {
        const d = howl.duration();
        if (d > 0) usePlayer.getState().setProgress(usePlayer.getState().currentTime, d);
      },
      onplay: () => usePlayer.getState().setPlaying(true),
      onpause: () => {
        save(Number(howl.seek()) || 0);
      },
      onend: () => {
        const st = usePlayer.getState();
        markDone(track.slug, track.index, howl.duration() || track.duration);
        // "Hết chương" sleep timer: stop here instead of advancing
        if (st.sleep?.kind === "chapter") {
          st.setSleep(null);
          st.setPlaying(false);
          return;
        }
        if (typeof window !== "undefined") {
          try {
            (window as any).umami?.track("chapter_completed", { slug: track.slug, index: track.index });
          } catch {
            // Analytics must never break playback
          }
        }
        st.next();
      },
      onloaderror: () =>
        usePlayer
          .getState()
          .setError("Chương này chưa có file audio hoặc không tải được. Hãy thử chương khác hoặc tải lại trang."),
      onplayerror: () =>
        usePlayer.getState().setError("Không phát được audio. Hãy nhấn phát để thử lại."),
    });
    howlRef.current = howl;
    if (startAt > 0) howl.seek(startAt);
    if (shouldPlay) howl.play();

    let lastSave = Date.now();
    const timer = window.setInterval(() => {
      if (!howl.playing()) return;
      const t = Number(howl.seek()) || 0;
      usePlayer.getState().setProgress(t, howl.duration() || undefined);
      if (Date.now() - lastSave >= SAVE_INTERVAL_MS) {
        lastSave = Date.now();
        save(t);
      }
    }, 500);
    const onHide = () => save(Number(howl.seek()) || 0);
    window.addEventListener("pagehide", onHide);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("pagehide", onHide);
      howl.unload();
      if (howlRef.current === howl) howlRef.current = null;
    };
  }, [trackKey]);

  // Sync play/pause state to the Howl
  useEffect(() => {
    const howl = howlRef.current;
    if (!howl) return;
    if (playing && !howl.playing()) howl.play();
    else if (!playing && howl.playing()) howl.pause();
  }, [playing, trackKey]);

  useEffect(() => {
    howlRef.current?.rate(rate);
  }, [rate, trackKey]);

  useEffect(() => {
    howlRef.current?.volume(volume);
  }, [volume, trackKey]);

  useEffect(() => {
    if (seekRequest && howlRef.current) howlRef.current.seek(seekRequest.time);
  }, [seekRequest]);

  // Media Session metadata and handlers (feature-detected)
  useEffect(() => {
    if (!current || typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const ms = navigator.mediaSession;
    if (typeof MediaMetadata !== "undefined") {
      ms.metadata = new MediaMetadata({
        title: `Chương ${current.index}: ${current.title}`,
        artist: current.storyTitle,
        album: SITE_NAME,
      });
    }
    const st = () => usePlayer.getState();
    const set = (action: MediaSessionAction, fn: MediaSessionActionHandler | null) => {
      try {
        ms.setActionHandler(action, fn);
      } catch {
        // Action not supported in this browser
      }
    };
    set("play", () => st().playing || st().toggle());
    set("pause", () => st().playing && st().toggle());
    set("previoustrack", () => st().prev());
    set("nexttrack", () => st().next());
    set("seekbackward", () => st().seek(Math.max(0, st().currentTime - SKIP_BACK)));
    set("seekforward", () => st().seek(Math.min(st().duration, st().currentTime + SKIP_FORWARD)));
    set("seekto", (d) => {
      if (typeof d.seekTime === "number") st().seek(d.seekTime);
    });
    return () => {
      (["play", "pause", "previoustrack", "nexttrack", "seekbackward", "seekforward", "seekto"] as const).forEach(
        (a) => set(a, null),
      );
    };
  }, [current]);

  useEffect(() => {
    if (!current || typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = playing ? "playing" : "paused";
  }, [current, playing]);

  useEffect(() => {
    if (!current || typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    if (!duration || !Number.isFinite(duration)) return;
    try {
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate: rate,
        position: Math.min(Math.max(0, currentTime), duration),
      });
    } catch {
      // Invalid state; ignore
    }
  }, [current, duration, rate, currentTime]);

  // Sleep timer: pause when the countdown elapses
  useEffect(() => {
    if (!sleep || sleep.kind !== "minutes") return;
    const id = window.setTimeout(() => {
      const st = usePlayer.getState();
      st.setPlaying(false);
      st.setSleep(null);
    }, Math.max(0, sleep.endsAt - Date.now()));
    return () => window.clearTimeout(id);
  }, [sleep]);

  // Expose the bar height so pages can pad their bottom edge
  useEffect(() => {
    const root = document.documentElement;
    const el = rootRef.current;
    if (!visible || !el) {
      root.style.setProperty("--player-h", "0px");
      return;
    }
    const update = () => root.style.setProperty("--player-h", `${el.offsetHeight}px`);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.setProperty("--player-h", "0px");
    };
  }, [visible]);

  if (!current && !resumeCandidate) return null;

  const btn =
    "inline-flex size-11 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface2";
  const total = duration || current?.duration || 0;
  const pct = total > 0 ? Math.min(100, (currentTime / total) * 100) : 0;
  const { prev, next } = getNeighbors({ queue, current });

  return (
    <>
      <div
        ref={rootRef}
        role="region"
        aria-label="Trình phát audio"
        className="fixed inset-x-0 bottom-[var(--nav-h)] z-50 border-t border-border bg-card/95 text-foreground shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.5)] backdrop-blur"
      >
        {current && (
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-0.5 bg-surface2"
          >
            <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
          </div>
        )}
        <div className="mx-auto max-w-6xl px-3 py-2 sm:px-6">
          {resumeCandidate && !current && (
            <div className="flex flex-wrap items-center gap-3 py-1">
              <p className="min-w-0 flex-1 text-sm">
                <span className="text-muted">Tiếp tục nghe: </span>
                {resumeCandidate.track.title}
                <span className="text-muted"> tại {fmt(resumeCandidate.position)}</span>
              </p>
              <button
                type="button"
                onClick={() => usePlayer.getState().resume()}
                className="min-h-11 rounded-full bg-accent px-5 font-semibold text-accent-fg hover:brightness-110"
              >
                Tiếp tục
              </button>
              <button
                type="button"
                onClick={() => usePlayer.getState().dismissResume()}
                className="min-h-11 rounded-full border border-border px-4 hover:bg-surface2"
              >
                Bỏ qua
              </button>
            </div>
          )}
          {current && (
            <>
              <div className="flex items-center gap-2">
                <button
                  ref={openerRef}
                  type="button"
                  aria-haspopup="dialog"
                  onClick={() => usePlayer.getState().setSheetOpen(true)}
                  className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-lg text-left"
                >
                  <span className="sr-only">Mở trình phát: </span>
                  <span className="w-10 shrink-0">
                    <StoryCover slug={current.slug} title={current.storyTitle} showTitle={false} className="rounded-md" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">
                      Chương {current.index}: {current.title}
                    </span>
                    <span className="block truncate text-xs text-muted">{current.storyTitle}</span>
                  </span>
                </button>
                <button
                  type="button"
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-fg transition-[filter,transform] hover:brightness-110 active:scale-95"
                  aria-label={playing ? "Tạm dừng" : "Phát"}
                  onClick={() => usePlayer.getState().toggle()}
                >
                  {playing ? <PauseIcon width={20} height={20} /> : <PlayIcon width={20} height={20} />}
                </button>
                <button
                  type="button"
                  className={`${btn} disabled:opacity-40`}
                  aria-label="Chương sau"
                  disabled={!next}
                  onClick={() => usePlayer.getState().next()}
                >
                  <SkipNextIcon width={22} height={22} />
                </button>
              </div>
              {error && (
                <p role="alert" className="pb-1 pt-0.5 text-sm text-danger">
                  {error}
                </p>
              )}
            </>
          )}
        </div>
      </div>
      {current && sheetOpen && (
        <NowPlayingSheet
          current={current}
          prevTrack={prev}
          nextTrack={next}
          playing={playing}
          currentTime={currentTime}
          total={total}
          rate={rate}
          volume={volume}
          error={error}
          queue={queue}
          sleep={sleep}
          rates={RATES}
          onClose={() => {
            usePlayer.getState().setSheetOpen(false);
            openerRef.current?.focus();
          }}
        />
      )}
    </>
  );
}
