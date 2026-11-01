"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import StoryCover from "./StoryCover";
import SectionHeader from "./SectionHeader";

const KEY = "truyenaudio:player:v1";

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}
const getSnapshot = () => {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
};
// `undefined` on the server and during hydration -> skeleton; "" means nothing saved.
const getServerSnapshot = () => undefined;

type Saved = { slug: string; index: number; title: string; storyTitle: string; duration: number; position: number };

function parse(raw: string | undefined): Saved | null {
  if (!raw) return null;
  try {
    const d = JSON.parse(raw) as Partial<Saved>;
    if (
      typeof d.slug === "string" && /^[a-z0-9-]+$/.test(d.slug) &&
      typeof d.index === "number" && Number.isInteger(d.index) &&
      typeof d.title === "string" && typeof d.storyTitle === "string" &&
      typeof d.duration === "number" && typeof d.position === "number" && d.position >= 1
    ) {
      return d as Saved;
    }
  } catch {
    /* ignore corrupt data */
  }
  return null;
}

export default function ContinueListening() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const saved = useMemo(() => parse(raw), [raw]);

  if (raw === undefined) {
    return (
      <section aria-hidden="true" className="mt-10">
        <div className="skeleton h-24 w-full max-w-xl" />
      </section>
    );
  }
  if (!saved) return null;

  const pct = saved.duration > 0 ? Math.min(100, Math.round((saved.position / saved.duration) * 100)) : 0;
  return (
    <section aria-labelledby="continue-h" className="mt-12">
      <SectionHeader id="continue-h" title="Tiếp tục nghe" />
      <Link
        href={`/truyen/${saved.slug}/chuong-${saved.index}`}
        className="flex max-w-xl items-center gap-4 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-accent"
      >
        <div className="w-16 shrink-0">
          <StoryCover slug={saved.slug} title={saved.storyTitle} showTitle={false} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted">{saved.storyTitle}</p>
          <p className="truncate font-semibold">
            Chương {saved.index}: {saved.title}
          </p>
          <div
            role="progressbar"
            aria-label="Tiến độ nghe"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface2"
          >
            <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </Link>
    </section>
  );
}
