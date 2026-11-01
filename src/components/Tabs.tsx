"use client";

import { useId, useRef, useState } from "react";

export type TabItem = { id: string; label: string; content: React.ReactNode };

/** Accessible tabs (roving tabindex, arrows/Home/End). All panels stay in the DOM for SEO. */
export default function Tabs({ tabs, label }: { tabs: TabItem[]; label: string }) {
  const uid = useId();
  const [active, setActive] = useState(tabs[0]?.id);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onKey = (e: React.KeyboardEvent, i: number) => {
    let n = -1;
    if (e.key === "ArrowRight") n = (i + 1) % tabs.length;
    else if (e.key === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = tabs.length - 1;
    if (n < 0) return;
    e.preventDefault();
    setActive(tabs[n].id);
    refs.current[tabs[n].id]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label={label} className="flex gap-1 border-b border-border">
        {tabs.map((t, i) => {
          const on = t.id === active;
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[t.id] = el;
              }}
              role="tab"
              type="button"
              id={`${uid}-tab-${t.id}`}
              aria-selected={on}
              aria-controls={`${uid}-panel-${t.id}`}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(t.id)}
              onKeyDown={(e) => onKey(e, i)}
              className={`relative min-h-12 px-5 text-sm font-semibold transition-colors ${
                on ? "text-accent" : "text-muted hover:text-foreground"
              }`}
            >
              {t.label}
              <span
                aria-hidden="true"
                className={`absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-accent transition-opacity ${on ? "opacity-100" : "opacity-0"}`}
              />
            </button>
          );
        })}
      </div>
      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${uid}-panel-${t.id}`}
          aria-labelledby={`${uid}-tab-${t.id}`}
          hidden={t.id !== active}
          className="pt-6"
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
