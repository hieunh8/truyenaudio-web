import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <svg width="180" height="180" viewBox="0 0 64 64">
        <rect width="64" height="64" fill="#0B1020" />
        <path d="M15 38v-6a17 17 0 0 1 34 0v6" fill="none" stroke="#D9B25F" strokeWidth="4" strokeLinecap="round" />
        <rect x="10.5" y="36" width="8" height="14" rx="4" fill="#D9B25F" />
        <rect x="45.5" y="36" width="8" height="14" rx="4" fill="#D9B25F" />
        <line x1="25" y1="35" x2="25" y2="45" stroke="#EDE8DC" strokeWidth="3.4" strokeLinecap="round" />
        <line x1="32" y1="28" x2="32" y2="52" stroke="#EDE8DC" strokeWidth="3.4" strokeLinecap="round" />
        <line x1="39" y1="33" x2="39" y2="47" stroke="#EDE8DC" strokeWidth="3.4" strokeLinecap="round" />
      </svg>
    ),
    size,
  );
}
