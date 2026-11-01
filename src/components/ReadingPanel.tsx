"use client";

import { useId, useState, useSyncExternalStore } from "react";

const KEY = "truyenaudio:reader:v1";
const EVENT = "truyenaudio:reader";
const SIZES = ["1rem", "1.125rem", "1.3rem", "1.5rem"];
const DEFAULT = 1;

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}
const getSnapshot = () => {
  try {
    return localStorage.getItem(KEY) ?? String(DEFAULT);
  } catch {
    return String(DEFAULT);
  }
};

export default function ReadingPanel({ paragraphs }: { paragraphs: string[] }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => String(DEFAULT));
  const parsed = Number(raw);
  const size = Number.isInteger(parsed) && parsed >= 0 && parsed < SIZES.length ? parsed : DEFAULT;

  const setSize = (n: number) => {
    try {
      localStorage.setItem(KEY, String(n));
    } catch {
      // Best effort
    }
    window.dispatchEvent(new Event(EVENT));
  };
  const step = "inline-flex size-11 items-center justify-center rounded-full border border-border font-semibold hover:bg-surface2 disabled:opacity-35";

  return (
    <section aria-label="Văn bản chương" className="rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 font-semibold hover:bg-surface2"
        >
          <span aria-hidden="true" className={`inline-block transition-transform ${open ? "rotate-90" : ""}`}>
            ▸
          </span>
          Đọc văn bản
        </button>
        {open && (
          <div role="group" aria-label="Cỡ chữ" className="flex items-center gap-2">
            <button type="button" className={step} aria-label="Giảm cỡ chữ" disabled={size === 0} onClick={() => setSize(size - 1)}>
              <span className="text-sm">A-</span>
            </button>
            <button type="button" className={step} aria-label="Tăng cỡ chữ" disabled={size === SIZES.length - 1} onClick={() => setSize(size + 1)}>
              <span className="text-lg">A+</span>
            </button>
          </div>
        )}
      </div>
      <div id={id} hidden={!open} className="border-t border-border px-5 py-6 sm:px-8">
        <div className="mx-auto max-w-prose space-y-5" style={{ fontSize: SIZES[size], lineHeight: 1.85 }}>
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
