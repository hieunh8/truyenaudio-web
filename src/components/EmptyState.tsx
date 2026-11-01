import Link from "next/link";

export default function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
      <p className="font-display text-xl font-bold">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{text}</p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-11 items-center rounded-full bg-accent px-5 font-semibold text-accent-fg hover:brightness-110"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
