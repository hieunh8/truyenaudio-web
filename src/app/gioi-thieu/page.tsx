import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description: `${BRAND_NAME}: ${BRAND_TAGLINE}.`,
  alternates: { canonical: "/gioi-thieu" },
};

const FEATURES = [
  { t: "Giọng đọc AI tự nhiên", d: "Mỗi chương được chuyển thành audio tiếng Việt, nghe mượt như người kể chuyện." },
  { t: "Nghe liên tục", d: "Trình phát luôn ở lại khi bạn chuyển trang, nhớ vị trí để nghe tiếp lần sau." },
  { t: "Hẹn giờ & tốc độ", d: "Chỉnh tốc độ từ 0.75x đến 2x và hẹn giờ tắt khi nghe trước lúc ngủ." },
  { t: "Miễn phí, không cần tài khoản", d: "Chỉ cần mở trang và bấm nghe. Tiến độ được lưu ngay trên thiết bị của bạn." },
];

const STEPS = [
  "Chọn một truyện ở trang chủ hoặc theo thể loại.",
  "Bấm “Nghe từ đầu” hoặc chọn chương muốn nghe.",
  "Tiếp tục duyệt truyện khác, trình phát vẫn chạy ở phía dưới.",
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={`Về ${BRAND_NAME}`} eyebrow="Giới thiệu">
        {BRAND_TAGLINE}.
      </PageHeader>

      <p className="text-lg leading-relaxed">
        {BRAND_NAME} là nơi nghe truyện tiên hiệp, huyền huyễn và nhiều thể loại khác bằng tiếng Việt.
        Nội dung được sáng tác và đọc bằng công nghệ AI, để bạn có thể thưởng thức khi đi đường, làm việc nhà
        hoặc trước giờ đi ngủ.
      </p>

      <h2 className="mt-12 font-display text-2xl font-bold">Điểm nổi bật</h2>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <li key={f.t} className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-semibold text-accent">{f.t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{f.d}</p>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 font-display text-2xl font-bold">Cách sử dụng</h2>
      <ol className="mt-5 space-y-3">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-start gap-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent font-bold text-accent-fg">
              {i + 1}
            </span>
            <span className="pt-1.5">{s}</span>
          </li>
        ))}
      </ol>

      <h2 className="mt-12 font-display text-2xl font-bold">Theo dõi truyện mới</h2>
      <p className="mt-3 text-muted">
        Đăng ký nguồn cấp <a href="/feed.xml" className="text-accent underline">RSS</a> trong trình nghe
        podcast yêu thích để nhận chương mới. Hoặc xem ngay{" "}
        <Link href="/moi-cap-nhat" className="text-accent underline">truyện mới cập nhật</Link>.
      </p>
    </div>
  );
}
