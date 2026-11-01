import { ImageResponse } from "next/og";
import CoverArt from "@/components/CoverArt";
import { BRAND_NAME } from "./brand";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_TYPE = "image/png";

const GOLD = "#D9B25F";
const PAPER = "#F5EFE0";

function Mark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <rect width="64" height="64" rx="15" fill="#0B1020" />
      <path d="M15 38v-6a17 17 0 0 1 34 0v6" fill="none" stroke={GOLD} strokeWidth="4" strokeLinecap="round" />
      <rect x="10.5" y="36" width="8" height="14" rx="4" fill={GOLD} />
      <rect x="45.5" y="36" width="8" height="14" rx="4" fill={GOLD} />
      <line x1="25" y1="35" x2="25" y2="45" stroke={PAPER} strokeWidth="3.4" strokeLinecap="round" />
      <line x1="32" y1="28" x2="32" y2="52" stroke={PAPER} strokeWidth="3.4" strokeLinecap="round" />
      <line x1="39" y1="33" x2="39" y2="47" stroke={PAPER} strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  );
}

/** Shared OG card in the procedural-cover style. `slug` seeds the artwork. */
export function ogCard(opts: { slug: string; title: string; kicker?: string; subtitle?: string }) {
  const { slug, title, kicker, subtitle } = opts;
  const big = title.length > 48 ? 54 : title.length > 28 ? 64 : 76;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#0B1020", color: PAPER }}>
        <div style={{ position: "absolute", top: -420, left: 0, display: "flex", width: 1200, height: 1600 }}>
          <CoverArt slug={slug} width={1200} height={1600} />
        </div>
        <div style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, display: "flex", background: "linear-gradient(90deg, rgba(11,16,32,0.92) 0%, rgba(11,16,32,0.7) 55%, rgba(11,16,32,0.15) 100%)" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 72px", width: 900, height: 630, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Mark size={56} />
            <div style={{ display: "flex", fontSize: 32, fontWeight: 700 }}>{BRAND_NAME}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {kicker && (
              <div style={{ display: "flex", fontSize: 28, color: GOLD, marginBottom: 18, letterSpacing: 3 }}>{kicker}</div>
            )}
            <div style={{ display: "flex", fontSize: big, fontWeight: 700, lineHeight: 1.12 }}>{title}</div>
            {subtitle && (
              <div style={{ display: "flex", fontSize: 30, marginTop: 22, color: "#CFC8B6" }}>{subtitle}</div>
            )}
          </div>
          <div style={{ display: "flex", width: 120, height: 3, background: GOLD }} />
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
