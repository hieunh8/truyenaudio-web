import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <p className="font-display text-7xl font-bold text-accent" aria-hidden="true">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold">Không tìm thấy trang</h1>
      <p className="mt-3 text-muted">Trang bạn tìm không tồn tại hoặc đã được di chuyển.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="inline-flex min-h-12 items-center rounded-full bg-accent px-6 font-semibold text-accent-fg hover:brightness-110">
          Về trang chủ
        </Link>
        <Link href="/the-loai" className="inline-flex min-h-12 items-center rounded-full border border-border px-6 font-semibold hover:border-accent">
          Duyệt thể loại
        </Link>
      </div>
    </div>
  );
}
