import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
  focusable: false as const,
  ...p,
});

export const HomeIcon = (p: P) => (
  <svg {...base(p)}><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v9.5h13V10" /><path d="M10 19.5v-5h4v5" /></svg>
);
export const GridIcon = (p: P) => (
  <svg {...base(p)}><rect x="4" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" /></svg>
);
export const ClockIcon = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>
);
export const SearchIcon = (p: P) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>
);
export const SunIcon = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" /></svg>
);
export const MoonIcon = (p: P) => (
  <svg {...base(p)}><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" /></svg>
);
export const PlayIcon = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none"><path d="M8 5.5v13a1 1 0 0 0 1.5.9l10.5-6.5a1 1 0 0 0 0-1.8L9.5 4.6A1 1 0 0 0 8 5.5Z" /></svg>
);
export const ChevronRightIcon = (p: P) => (
  <svg {...base(p)}><path d="m9 6 6 6-6 6" /></svg>
);
export const RssIcon = (p: P) => (
  <svg {...base(p)}><path d="M5 11a8 8 0 0 1 8 8M5 5a14 14 0 0 1 14 14" /><circle cx="6" cy="18" r="1.4" fill="currentColor" /></svg>
);
export const CloseIcon = (p: P) => (
  <svg {...base(p)}><path d="m6 6 12 12M18 6 6 18" /></svg>
);
export const PauseIcon = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none"><rect x="6" y="4.5" width="4.5" height="15" rx="1.2" /><rect x="13.5" y="4.5" width="4.5" height="15" rx="1.2" /></svg>
);
export const SkipPrevIcon = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none"><rect x="5" y="5" width="2.4" height="14" rx="1" /><path d="M19 6v12a.8.8 0 0 1-1.25.66L9.6 12.66a.8.8 0 0 1 0-1.32l8.15-5.99A.8.8 0 0 1 19 6Z" /></svg>
);
export const SkipNextIcon = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none"><rect x="16.6" y="5" width="2.4" height="14" rx="1" /><path d="M5 6v12a.8.8 0 0 0 1.25.66l8.15-6a.8.8 0 0 0 0-1.32l-8.15-5.99A.8.8 0 0 0 5 6Z" /></svg>
);
export const Back15Icon = (p: P) => (
  <svg {...base(p)}><path d="M4 12a8 8 0 1 0 2.6-5.9" /><path d="M4 4.5v4h4" /><text x="12" y="15.2" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="currentColor" stroke="none">15</text></svg>
);
export const Forward30Icon = (p: P) => (
  <svg {...base(p)}><path d="M20 12a8 8 0 1 1-2.6-5.9" /><path d="M20 4.5v4h-4" /><text x="12" y="15.2" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="currentColor" stroke="none">30</text></svg>
);
export const TimerIcon = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="13.5" r="7" /><path d="M12 10v4l2.5 1.5M9.5 3h5" /></svg>
);
export const ListIcon = (p: P) => (
  <svg {...base(p)}><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" /></svg>
);
export const ChevronDownIcon = (p: P) => (
  <svg {...base(p)}><path d="m6 9 6 6 6-6" /></svg>
);
export const ChevronUpIcon = (p: P) => (
  <svg {...base(p)}><path d="m6 15 6-6 6 6" /></svg>
);
export const ChevronLeftIcon = (p: P) => (
  <svg {...base(p)}><path d="m15 6-6 6 6 6" /></svg>
);
export const VolumeIcon = (p: P) => (
  <svg {...base(p)}><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4Z" /><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" /></svg>
);
export const CheckIcon = (p: P) => (
  <svg {...base(p)}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
);
export const SortIcon = (p: P) => (
  <svg {...base(p)}><path d="M7 4v16m0 0-3-3m3 3 3-3M17 20V4m0 0-3 3m3-3 3 3" /></svg>
);
