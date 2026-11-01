"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSearchIndex } from "@/lib/useSearchIndex";
import { filterIndex } from "@/lib/search-client";
import StoryCover from "./StoryCover";
import { SearchIcon } from "./icons";

export default function SearchResults() {
  const router = useRouter();
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const [value, setValue] = useState(q);
  const index = useSearchIndex(true);
  const results = useMemo(() => (index ? filterIndex(index, q) : []), [index, q]);

  return (
    <div>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          router.replace(`/tim-kiem?q=${encodeURIComponent(value.trim())}`);
        }}
        className="relative max-w-xl"
      >
        <label htmlFor="q" className="sr-only">Từ khóa tìm kiếm</label>
        <SearchIcon width={20} height={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          id="q"
          type="search"
          value={value}
          autoComplete="off"
          placeholder="Nhập tên truyện, thể loại, từ khóa..."
          onChange={(e) => {
            setValue(e.target.value);
            router.replace(`/tim-kiem?q=${encodeURIComponent(e.target.value.trim())}`);
          }}
          className="h-12 w-full rounded-full border border-border bg-card pl-12 pr-4 text-base placeholder:text-muted focus:border-accent"
        />
      </form>

      <div className="mt-8" aria-live="polite">
        {!q.trim() ? (
          <p className="text-muted">Nhập từ khóa để bắt đầu tìm truyện.</p>
        ) : !index ? (
          <div className="skeleton h-24 max-w-xl" aria-hidden="true" />
        ) : results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
            <p className="font-display text-xl font-bold">Không tìm thấy kết quả</p>
            <p className="mt-2 text-sm text-muted">
              Không có truyện nào khớp với “{q}”. Thử từ khóa ngắn hơn hoặc{" "}
              <Link href="/the-loai" className="text-accent underline">duyệt theo thể loại</Link>.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted">{results.length} kết quả cho “{q}”</p>
            <ul className="grid gap-3 md:grid-cols-2">
              {results.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/truyen/${s.slug}`}
                    className="flex gap-4 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-accent"
                  >
                    <div className="w-16 shrink-0">
                      <StoryCover slug={s.slug} title={s.title} showTitle={false} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="line-clamp-2 font-display text-lg font-bold leading-snug">{s.title}</h2>
                      <p className="mt-0.5 text-xs text-muted">{s.genre}</p>
                      <p className="mt-1.5 line-clamp-2 text-sm text-foreground/85">{s.description}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
