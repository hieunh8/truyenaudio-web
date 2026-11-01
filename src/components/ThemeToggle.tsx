"use client";

import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "./icons";

const KEY = "truyenaudio:theme";

function subscribe(cb: () => void) {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => obs.disconnect();
}
const getSnapshot = () => document.documentElement.dataset.theme === "light";
const getServerSnapshot = () => false;

export default function ThemeToggle() {
  const isLight = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next = isLight ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* storage unavailable: theme still applies for this session */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isLight}
      aria-label="Chuyển giao diện sáng/tối"
      title="Chuyển giao diện sáng/tối"
      className="inline-flex size-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface2 hover:text-foreground"
    >
      <MoonIcon className="theme-icon-moon" />
      <SunIcon className="theme-icon-sun" />
    </button>
  );
}
