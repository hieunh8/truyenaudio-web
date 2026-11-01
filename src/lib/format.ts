/** Format seconds as Vietnamese duration, e.g. "1 giờ 5 phút 3 giây". */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const parts: string[] = [];
  if (h) parts.push(`${h} giờ`);
  if (m) parts.push(`${m} phút`);
  if (sec || parts.length === 0) parts.push(`${sec} giây`);
  return parts.join(" ");
}

/** Format seconds as ISO 8601 duration, e.g. "PT1H5M3S". */
export function toIsoDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `PT${h ? `${h}H` : ""}${m ? `${m}M` : ""}${sec || (!h && !m) ? `${sec}S` : ""}`;
}

/** Serialize JSON-LD safely for embedding in a script tag. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** Format seconds as m:ss (minutes may exceed 59). */
export function formatClock(sec: number): string {
  const s = Math.max(0, Math.floor(Number.isFinite(sec) ? sec : 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
