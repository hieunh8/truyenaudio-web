import { useMemo, useSyncExternalStore } from "react";

const KEY = "truyenaudio:progress:v1";
const EVENT = "truyenaudio:progress";
const DONE_RATIO = 0.95;

export type ProgressEntry = { pos: number; dur: number; done: boolean; t: number };
type All = Record<string, Record<string, ProgressEntry>>;

function parse(raw: string): All {
  if (!raw) return {};
  try {
    const d = JSON.parse(raw) as unknown;
    return d && typeof d === "object" ? (d as All) : {};
  } catch {
    return {};
  }
}

function readRaw(): string {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

function notify() {
  window.dispatchEvent(new Event(EVENT));
}

export function getStoryProgress(slug: string): Record<string, ProgressEntry> {
  return parse(readRaw())[slug] ?? {};
}

/** Record a playback position for a chapter (best effort; ignores storage errors). */
export function markProgress(slug: string, index: number, pos: number, dur: number) {
  if (!Number.isFinite(pos) || pos < 0) return;
  const all = parse(readRaw());
  const story = (all[slug] ??= {});
  const old = story[String(index)];
  const done = old?.done === true || (dur > 0 && pos >= dur * DONE_RATIO);
  story[String(index)] = { pos: Math.floor(pos), dur: Math.floor(dur), done, t: Date.now() };
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
    notify();
  } catch {
    // Storage may be full or blocked
  }
}

export function markDone(slug: string, index: number, dur: number) {
  markProgress(slug, index, dur, dur);
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

/** Reactive per-chapter progress for one story. Empty on the server. */
export function useStoryProgress(slug: string): Record<string, ProgressEntry> {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "");
  return useMemo(() => parse(raw)[slug] ?? {}, [raw, slug]);
}
