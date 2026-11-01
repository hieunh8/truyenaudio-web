import Link from "next/link";
import Logo from "./Logo";
import { RssIcon } from "./icons";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

const COLS = [
  {
    title: "Khám phá",
    links: [
      { href: "/", label: "Trang chủ" },
      { href: "/the-loai", label: "Thể loại" },
      { href: "/moi-cap-nhat", label: "Mới cập nhật" },
      { href: "/tim-kiem", label: "Tìm kiếm" },
    ],
  },
  {
    title: "Thông tin",
    links: [{ href: "/gioi-thieu", label: "Giới thiệu" }],
  },
];

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-card/60 pb-[calc(var(--nav-h)+max(var(--player-h),7rem))] pt-10 md:pb-[calc(max(var(--player-h),0px)+2.5rem)]">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo size={32} />
            <span className="font-display text-lg font-bold">{BRAND_NAME}</span>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            {BRAND_TAGLINE}. Mỗi chương được viết và đọc bằng AI, nghe miễn phí mọi lúc, mọi nơi.
          </p>
        </div>
        {COLS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">{c.title}</h2>
            <ul className="mt-3 space-y-1">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-flex min-h-11 items-center text-sm hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div className="md:col-start-3">
          <a href="/feed.xml" className="inline-flex min-h-11 items-center gap-2 text-sm hover:text-accent">
            <RssIcon width={18} height={18} /> Đăng ký RSS
          </a>
        </div>
      </div>
      <div className="mx-auto mt-8 w-full max-w-6xl px-4 sm:px-6">
        <div className="ornament" />
        <p className="pt-5 text-xs text-muted">
          © {new Date().getFullYear()} {BRAND_NAME}. Truyện được đọc bằng giọng đọc AI.
        </p>
      </div>
    </footer>
  );
}
