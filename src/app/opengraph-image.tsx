import { ogCard, OG_SIZE, OG_TYPE } from "@/lib/og";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

export const alt = BRAND_NAME;
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default function Image() {
  return ogCard({ slug: "truyen-audio-brand", title: BRAND_NAME, subtitle: BRAND_TAGLINE });
}
