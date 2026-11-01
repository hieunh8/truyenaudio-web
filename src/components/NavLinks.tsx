"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV_ITEMS = [
  { href: "/", label: "Trang chủ" },
  { href: "/the-loai", label: "Thể loại" },
  { href: "/moi-cap-nhat", label: "Mới cập nhật" },
  { href: "/gioi-thieu", label: "Giới thiệu" },
];

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Điều hướng chính" className="hidden md:block">
      <ul className="flex items-center gap-1">
        {NAV_ITEMS.map((it) => {
          const active = isActive(pathname, it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={`relative inline-flex min-h-11 items-center whitespace-nowrap px-2.5 text-sm lg:px-3 font-medium transition-colors ${
                  active ? "text-accent" : "text-muted hover:text-foreground"
                }`}
              >
                {it.label}
                {active && <span className="absolute inset-x-2.5 bottom-1.5 lg:inset-x-3 h-0.5 rounded bg-accent" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
