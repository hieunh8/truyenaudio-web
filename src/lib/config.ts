import path from "node:path";
import { BRAND_NAME, SITE_DESCRIPTION as BRAND_DESCRIPTION } from "./brand";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/+$/, "");


if (
  process.env.NODE_ENV === "production" &&
  !process.env.NEXT_PUBLIC_SITE_URL &&
  process.env.NEXT_PHASE === "phase-production-build"
) {
  console.warn(
    "\n[WARNING] NEXT_PUBLIC_SITE_URL is not set: canonical, Open Graph, sitemap and feed URLs " +
      "will use http://localhost:3000. Set it (e.g. https://truyen.example.com) before deploying.\n",
  );
}

export const SITE_NAME = BRAND_NAME;
export const SITE_DESCRIPTION = BRAND_DESCRIPTION;

// Repository root (web/ is one level below it)
export const WORKSPACE_ROOT = path.resolve(process.cwd(), "..");

export type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  endpoint: string;
};

/** Returns R2 config only when all four variables are set. */
export function getR2Config(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) return null;
  // Prefer explicit R2_ENDPOINT; fall back to building from account ID
  const endpoint =
    process.env.R2_ENDPOINT ??
    `https://${accountId}.r2.cloudflarestorage.com`;
  return { accountId, accessKeyId, secretAccessKey, bucket, endpoint };
}
