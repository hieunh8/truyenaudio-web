import type { Metadata } from "next";
import { Suspense } from "react";
import PageHeader from "@/components/PageHeader";
import SearchResults from "@/components/SearchResults";

export const metadata: Metadata = {
  title: "Tìm kiếm",
  description: "Tìm truyện audio theo tên, thể loại hoặc từ khóa.",
  alternates: { canonical: "/tim-kiem" },
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <>
      <PageHeader title="Tìm kiếm" eyebrow="Khám phá" />
      <Suspense fallback={<div className="skeleton h-12 max-w-xl" aria-hidden="true" />}>
        <SearchResults />
      </Suspense>
    </>
  );
}
