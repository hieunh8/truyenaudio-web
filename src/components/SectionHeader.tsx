import Link from "next/link";
import { ChevronRightIcon } from "./icons";

export default function SectionHeader({
  title,
  href,
  linkLabel = "Xem tất cả",
  id,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  id?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <h2 id={id} className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
        {title}
      </h2>
      {href && (
        <Link href={href} className="inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-medium text-accent hover:underline">
          {linkLabel}
          <ChevronRightIcon width={16} height={16} />
        </Link>
      )}
    </div>
  );
}
