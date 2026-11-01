"use client";

import { useState } from "react";

export default function Synopsis({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 220;
  return (
    <div>
      <p id="synopsis-text" className={`max-w-2xl leading-relaxed text-foreground/90 ${open || !long ? "" : "line-clamp-3"}`}>
        {text}
      </p>
      {long && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls="synopsis-text"
          onClick={() => setOpen((v) => !v)}
          className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-accent hover:underline"
        >
          {open ? "Thu gọn" : "Xem thêm"}
        </button>
      )}
    </div>
  );
}
