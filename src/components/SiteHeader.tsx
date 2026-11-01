import Link from "next/link";
import Logo from "./Logo";
import NavLinks from "./NavLinks";
import SearchBox from "./SearchBox";
import ThemeToggle from "./ThemeToggle";
import { BRAND_NAME } from "@/lib/brand";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-2 px-4 sm:px-6">
        <Link href="/" className="mr-2 flex min-h-11 shrink-0 items-center gap-2.5 rounded-lg" aria-label={`${BRAND_NAME} - Trang chủ`}>
          <Logo size={36} />
          <span className="whitespace-nowrap font-display text-xl font-bold tracking-tight md:hidden lg:inline">{BRAND_NAME}</span>
        </Link>
        <NavLinks />
        <div className="ml-auto flex items-center gap-1">
          <SearchBox />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
