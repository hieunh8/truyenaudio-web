"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClockIcon, GridIcon, HomeIcon, SearchIcon } from "./icons";
import { isActive } from "./NavLinks";

const ITEMS = [
  { href: "/", label: "Trang chủ", Icon: HomeIcon },
  { href: "/the-loai", label: "Thể loại", Icon: GridIcon },
  { href: "/moi-cap-nhat", label: "Mới", Icon: ClockIcon },
  { href: "/tim-kiem", label: "Tìm kiếm", Icon: SearchIcon },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Điều hướng nhanh"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="grid h-14 grid-cols-4">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-full min-h-11 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
                  active ? "text-accent" : "text-muted"
                }`}
              >
                <Icon width={22} height={22} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
