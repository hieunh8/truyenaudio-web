import { create } from "zustand";

/** Fire an Umami analytics event; silently no-ops if Umami is not loaded. */
function trackUmami(event: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    (window as any).umami?.track(event, data);
  } catch {
    // Analytics must never break playback
  }
}

export type Track = {
  slug: string;
  index: number;
  title: string;
  storyTitle: string;
  src: string;
  duration: number;
};

/** Snapshot persisted to localStorage so playback can be resumed. */
export type ResumeCandidate = {
  track: Track;
  prev: Track | null;
  next: Track | null;
  position: number;
};

export type SleepTimer =
  | null
  | { kind: "minutes"; endsAt: number; minutes: number }
  | { kind: "chapter" };

export type SleepOption = { kind: "minutes"; minutes: number } | { kind: "chapter" } | null;

type PlayerState = {
  queue: Track[];
  current: Track | null;
  playing: boolean;
  currentTime: number;
  duration: number;
  rate: number;
  volume: number;
  error: string | null;
  resumeCandidate: ResumeCandidate | null;
  /** Position to seek to once the current track loads. */
  startAt: number;
  /** One-shot seek request consumed by the Player component. */
  seekRequest: { time: number; id: number } | null;
  sleep: SleepTimer;
  sheetOpen: boolean;
  /** Start a track (optionally replacing the queue); toggles if already loaded. */
  play: (track: Track, queue?: Track[]) => void;
  toggle: () => void;
  seek: (time: number) => void;
  /** Seek relative to the current position, clamped to the track. */
  skip: (delta: number) => void;
  next: () => void;
  prev: () => void;
  /** Play the queue entry at `i` (toggles when it is already current). */
  playQueueIndex: (i: number) => void;
  setSleep: (opt: SleepOption) => void;
  setSheetOpen: (open: boolean) => void;
  setRate: (rate: number) => void;
  setVolume: (volume: number) => void;
  setQueue: (queue: Track[]) => void;
  setProgress: (currentTime: number, duration?: number) => void;
  setPlaying: (playing: boolean) => void;
  setError: (error: string | null) => void;
  setResumeCandidate: (c: ResumeCandidate | null, rate?: number, volume?: number) => void;
  /** Load the saved track and seek to the saved position (call from a click). */
  resume: () => void;
  dismissResume: () => void;
};

const sameTrack = (a: Track | null, b: Track) =>
  !!a && a.slug === b.slug && a.index === b.index;

let seekId = 0;

/** Neighbor tracks of the current track within the queue. */
export function getNeighbors(s: Pick<PlayerState, "queue" | "current">) {
  const pos = s.queue.findIndex((t) => sameTrack(s.current, t));
  return {
    prev: pos > 0 ? s.queue[pos - 1] : null,
    next: pos >= 0 ? (s.queue[pos + 1] ?? null) : null,
  };
}

export const usePlayer = create<PlayerState>((set, get) => ({
  queue: [],
  current: null,
  playing: false,
  currentTime: 0,
  duration: 0,
  rate: 1,
  volume: 1,
  error: null,
  resumeCandidate: null,
  startAt: 0,
  seekRequest: null,
  sleep: null,
  sheetOpen: false,

  play: (track, queue) => {
    const s = get();
    if (sameTrack(s.current, track)) {
      if (queue) set({ queue });
      get().toggle();
      return;
    }
    set({
      current: track,
      playing: true,
      queue: queue ?? s.queue,
      currentTime: 0,
      duration: track.duration,
      startAt: 0,
      error: null,
      resumeCandidate: null,
    });
    trackUmami("play_chapter", { slug: track.slug, index: track.index });
  },
  toggle: () => {
    if (!get().current) return;
    set((s) => ({ playing: !s.playing, error: null }));
  },
  seek: (time) =>
    set({
      currentTime: time,
      seekRequest: { time, id: ++seekId },
    }),
  skip: (delta) => {
    const { currentTime, duration, current } = get();
    if (!current) return;
    const max = duration || current.duration || 0;
    const target = Math.max(0, max > 0 ? Math.min(max, currentTime + delta) : currentTime + delta);
    get().seek(target);
  },
  playQueueIndex: (i) => {
    const t = get().queue[i];
    if (t) get().play(t);
  },
  setSleep: (opt) =>
    set({
      sleep: !opt
        ? null
        : opt.kind === "chapter"
          ? { kind: "chapter" }
          : { kind: "minutes", minutes: opt.minutes, endsAt: Date.now() + opt.minutes * 60_000 },
    }),
  setSheetOpen: (sheetOpen) => set({ sheetOpen }),
  next: () => {
    const { next } = getNeighbors(get());
    if (next) {
      set({
        current: next,
        playing: true,
        currentTime: 0,
        duration: next.duration,
        startAt: 0,
        error: null,
      });
    } else {
      set({ playing: false });
    }
  },
  prev: () => {
    const s = get();
    // Restart the current chapter when already past a few seconds in
    if (s.currentTime > 5) {
      get().seek(0);
      return;
    }
    const { prev } = getNeighbors(s);
    if (prev) {
      set({
        current: prev,
        playing: true,
        currentTime: 0,
        duration: prev.duration,
        startAt: 0,
        error: null,
      });
    } else {
      get().seek(0);
    }
  },
  setRate: (rate) => set({ rate }),
  setVolume: (volume) => set({ volume }),
  setQueue: (queue) => set({ queue }),
  setProgress: (currentTime, duration) =>
    set((s) => ({ currentTime, duration: duration ?? s.duration })),
  setPlaying: (playing) => set({ playing }),
  setError: (error) => set({ error, playing: error ? false : get().playing }),
  setResumeCandidate: (resumeCandidate, rate, volume) =>
    set((s) => ({
      resumeCandidate,
      rate: rate ?? s.rate,
      volume: volume ?? s.volume,
    })),
  resume: () => {
    const c = get().resumeCandidate;
    if (!c) return;
    set({
      current: c.track,
      queue: [c.prev, c.track, c.next].filter((t): t is Track => t !== null),
      playing: true,
      currentTime: c.position,
      duration: c.track.duration,
      startAt: c.position,
      error: null,
      resumeCandidate: null,
    });
  },
  dismissResume: () => set({ resumeCandidate: null }),
}));
