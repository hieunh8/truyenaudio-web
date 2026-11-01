/** Deterministic procedural cover geometry derived from a story slug. Pure, usable on server and in OG images. */

export type Palette = {
  name: string;
  from: string;
  to: string;
  moon: string;
  far: string;
  mid: string;
  near: string;
};

export const PALETTES: Palette[] = [
  { name: "ink", from: "#0F1B3D", to: "#25386B", moon: "#F3E3B3", far: "#33477E", mid: "#1C2B57", near: "#0A1230" },
  { name: "jade", from: "#06302B", to: "#1B6B5A", moon: "#F1EBC8", far: "#2D8470", mid: "#14584A", near: "#06231F" },
  { name: "crimson", from: "#3A0F1A", to: "#86283A", moon: "#F7DDB0", far: "#9C3A4C", mid: "#63202E", near: "#2A0A12" },
  { name: "violet", from: "#1F1440", to: "#4B3490", moon: "#EADFFB", far: "#5E48A8", mid: "#382872", near: "#150D2E" },
  { name: "gold", from: "#3A2606", to: "#8A5E12", moon: "#FFF0C2", far: "#A87A25", mid: "#6B4809", near: "#2B1B03" },
  { name: "teal", from: "#0A2C3A", to: "#1D6A82", moon: "#E6F4EF", far: "#2F83A0", mid: "#14506A", near: "#071F2A" },
];

export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let a = seed || 1;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n: number) => n.toFixed(1);

function ridge(rand: () => number, baseY: number, amp: number, steps: number): string {
  // 300 x 400 coordinate space
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const x = (300 / steps) * i;
    const peak = i % 2 === 1 ? rand() * amp : rand() * amp * 0.4;
    pts.push([x, baseY - peak]);
  }
  let d = `M0 400 L0 ${f(pts[0][1])}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    d += ` Q${f((x0 + x1) / 2)} ${f(Math.min(y0, y1) - 6)} ${f(x1)} ${f(y1)}`;
  }
  return `${d} L300 400 Z`;
}

export type CoverGeometry = {
  id: string;
  palette: Palette;
  moon: { cx: number; cy: number; r: number };
  paths: { far: string; mid: string; near: string };
  sword: { x: number; y1: number; y2: number; tilt: number } | null;
  stars: { x: number; y: number; r: number }[];
};

export function coverGeometry(slug: string): CoverGeometry {
  const h = hashString(slug);
  const rand = rng(h);
  const palette = PALETTES[h % PALETTES.length];
  const moon = { cx: 60 + rand() * 180, cy: 70 + rand() * 80, r: 26 + rand() * 20 };
  const paths = {
    far: ridge(rand, 270 + rand() * 20, 60 + rand() * 30, 5),
    mid: ridge(rand, 305 + rand() * 15, 55 + rand() * 25, 6),
    near: ridge(rand, 350 + rand() * 10, 40 + rand() * 20, 4),
  };
  const hasSword = (h >> 5) % 3 !== 0;
  const sword = hasSword
    ? { x: 40 + rand() * 220, y1: 190 + rand() * 20, y2: 320, tilt: (rand() - 0.5) * 8 }
    : null;
  const stars = Array.from({ length: 9 }, () => ({ x: rand() * 300, y: rand() * 160, r: 0.6 + rand() * 1.2 }));
  return { id: `c${h.toString(36)}`, palette, moon, paths, sword, stars };
}
