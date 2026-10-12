"use client";

import { useEffect, useRef } from "react";

export function SearchNotice() {
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const term = new URLSearchParams(window.location.search).get("q");
    if (term && labelRef.current) {
      labelRef.current.textContent = `Búsqueda activa: ${term}`;
    }
  }, []);

  return (
    <span
      ref={labelRef}
      className="inline-flex items-center gap-2 rounded-full border border-gold-200 bg-gold-100/70 px-4 py-1.5 text-xs font-semibold text-gold-500 shadow-sm backdrop-blur"
    />
  );
}