import { NextResponse } from "next/server";
import { getSearchIndex } from "@/lib/catalog";

export const revalidate = 3600;

export function GET() {
  return NextResponse.json(getSearchIndex(), {
    headers: { "Cache-Control": "public, max-age=60, s-maxage=3600" },
  });
}
