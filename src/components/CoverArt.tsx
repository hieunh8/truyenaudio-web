import { coverGeometry } from "@/lib/cover";

/** Pure SVG artwork (no title). Server-renderable and usable inside next/og ImageResponse. */
export default function CoverArt({ slug, width, height }: { slug: string; width?: number; height?: number }) {
  const g = coverGeometry(slug);
  const p = g.palette;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 300 400"
      width={width}
      height={height}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", width: width ?? "100%", height: height ?? "100%" }}
    >
      <defs>
        <linearGradient id={`${g.id}-bg`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor={p.from} />
          <stop offset="1" stopColor={p.to} />
        </linearGradient>
        <radialGradient id={`${g.id}-moon`}>
          <stop offset="0" stopColor={p.moon} stopOpacity="0.9" />
          <stop offset="1" stopColor={p.moon} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="300" height="400" fill={`url(#${g.id}-bg)`} />
      {g.stars.map((s, i) => (
        <circle key={i} cx={s.x.toFixed(1)} cy={s.y.toFixed(1)} r={s.r.toFixed(1)} fill={p.moon} opacity="0.55" />
      ))}
      <circle cx={g.moon.cx.toFixed(1)} cy={g.moon.cy.toFixed(1)} r={(g.moon.r * 2.2).toFixed(1)} fill={`url(#${g.id}-moon)`} opacity="0.5" />
      <circle cx={g.moon.cx.toFixed(1)} cy={g.moon.cy.toFixed(1)} r={g.moon.r.toFixed(1)} fill={p.moon} opacity="0.95" />
      <path d={g.paths.far} fill={p.far} opacity="0.75" />
      <path d={g.paths.mid} fill={p.mid} opacity="0.92" />
      {g.sword && (
        <g transform={`rotate(${g.sword.tilt.toFixed(1)} ${g.sword.x.toFixed(1)} ${g.sword.y2})`}>
          <line x1={g.sword.x.toFixed(1)} y1={g.sword.y1.toFixed(1)} x2={g.sword.x.toFixed(1)} y2={g.sword.y2} stroke={p.moon} strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />
          <line x1={(g.sword.x - 9).toFixed(1)} y1={(g.sword.y2 - 14).toFixed(1)} x2={(g.sword.x + 9).toFixed(1)} y2={(g.sword.y2 - 14).toFixed(1)} stroke={p.moon} strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />
        </g>
      )}
      <path d={g.paths.near} fill={p.near} />
    </svg>
  );
}
