"use client";

import Script from "next/script";

/**
 * Conditionally renders the Umami analytics script when both env vars are set.
 * NEXT_PUBLIC_ vars are inlined at build time by Next.js.
 */
export default function UmamiScript() {
  const scriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

  if (!scriptUrl || !websiteId) return null;

  return (
    <Script
      src={scriptUrl}
      strategy="afterInteractive"
      data-website-id={websiteId}
    />
  );
}
