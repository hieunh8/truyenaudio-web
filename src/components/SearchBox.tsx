"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchIndex } from "@/lib/useSearchIndex";
import { filterIndex } from "@/lib/search-client";
import StoryCover from "./StoryCover";
import { CloseIcon, SearchIcon } from "./icons";

const MAX_RESULTS = 6;

/** Header search: icon button on mobile, inline field on desktop. One input, ARIA combobox. */
export default function SearchBox() {
  const router = useRouter();
  const uid = useId();
  const listId = `${uid}-list`;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [raw, setRaw] = useState("");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  const index = useSearchIndex(focused || mobileOpen);

  // Debounce 150ms
  useEffect(() => {
    const t = setTimeout(() => setQuery(raw.trim()), 150);
    return () => clearTimeout(t);
  }, [raw]);

  const results = useMemo(() => (index ? filterIndex(index, query) : []), [index, query]);
  const shown = results.slice(0, MAX_RESULTS);
  const open = (focused || mobileOpen) && query.length > 0;

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setFocused(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function close() {
    setFocused(false);
    setMobileOpen(false);
    setActive(-1);
  }

  function go(href: string) {
    close();
    inputRef.current?.blur();
    router.push(href);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, shown.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, -1));
    } else if (e.key === "Escape") {
      if (open || mobileOpen) {
        e.preventDefault();
        close();
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      const q = raw.trim();
      if (active >= 0 && active < shown.length) go(`/truyen/${shown[active].slug}`);
      else if (q) {
        go(`/tim-kiem?q=${encodeURIComponent(q)}`);
        if (typeof window !== "undefined") {
          try { (window as any).umami?.track("search_performed", { query: q }); } catch {}
        }
      }
    }
  }

  const activeId = active >= 0 ? `${uid}-opt-${active}` : undefined;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Mở tìm kiếm"
        aria-expanded={mobileOpen}
        onClick={() => {
          setMobileOpen((v) => !v);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="inline-flex size-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface2 hover:text-foreground md:hidden"
      >
        {mobileOpen ? <CloseIcon /> : <SearchIcon />}
      </button>

      <div
        className={`${
          mobileOpen ? "fixed inset-x-0 top-16 border-b border-border bg-background p-3 shadow-lg" : "hidden"
        } md:static md:block md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
      >
        <div className="relative md:w-52 lg:w-80">
          <SearchIcon width={18} height={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-label="Tìm truyện"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={activeId}
            autoComplete="off"
            placeholder="Tìm truyện, thể loại..."
            value={raw}
            onChange={(e) => {
              setRaw(e.target.value);
              setActive(-1);
            }}
            onFocus={() => setFocused(true)}
            onKeyDown={onKeyDown}
            className="h-11 w-full rounded-full border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted focus:border-accent"
          />
        </div>

        <div
          id={listId}
          role="listbox"
          aria-label="Kết quả tìm kiếm"
          hidden={!open}
          className="mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-border bg-card p-1.5 shadow-2xl md:absolute md:right-0 md:top-full md:w-[26rem]"
        >
          {open && !index && <p className="px-3 py-3 text-sm text-muted">Đang tải...</p>}
          {open && index && shown.length === 0 && (
            <p className="px-3 py-3 text-sm text-muted">Không tìm thấy truyện phù hợp.</p>
          )}
          {shown.map((it, i) => (
            <Link
              key={it.slug}
              id={`${uid}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              href={`/truyen/${it.slug}`}
              onClick={close}
              onMouseEnter={() => setActive(i)}
              className={`flex min-h-14 items-center gap-3 rounded-xl p-2 ${i === active ? "bg-surface2" : ""}`}
            >
              <span className="w-10 shrink-0">
                <StoryCover slug={it.slug} title={it.title} showTitle={false} className="!rounded-md" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{it.title}</span>
                <span className="block truncate text-xs text-muted">{it.genre}</span>
              </span>
            </Link>
          ))}
          {open && index && results.length > 0 && (
            <Link
              id={`${uid}-opt-${shown.length}`}
              role="option"
              aria-selected={active === shown.length}
              href={`/tim-kiem?q=${encodeURIComponent(query)}`}
              onClick={close}
              onMouseEnter={() => setActive(shown.length)}
              className={`mt-1 flex min-h-11 items-center justify-center rounded-xl border-t border-border text-sm font-medium text-accent ${
                active === shown.length ? "bg-surface2" : ""
              }`}
            >
              Xem tất cả kết quả ({results.length})
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
