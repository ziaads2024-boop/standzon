"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE } from "@/components/home-v2/motion";

/**
 * Featured-image gallery: one large stage, thumbnail strip beneath, prev/next,
 * counter, and a full-screen lightbox (click, Esc, ← →).
 */
export default function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  const [box, setBox] = useState(false);
  const n = images.length;
  const go = useCallback((d: number) => setI((v) => (v + d + n) % n), [n]);
  const pad = (v: number) => String(v + 1).padStart(2, "0");

  useEffect(() => {
    if (!box) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBox(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("keydown", key);
      document.body.style.overflow = prev;
    };
  }, [box, go]);

  const arrow =
    "flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-black/30 text-white backdrop-blur transition-colors hover:border-[#E03A3A] hover:bg-[#E03A3A]";

  return (
    <div>
      {/* stage */}
      <div className="group relative aspect-[4/3] overflow-hidden bg-[#141414] sm:aspect-[16/9] lg:aspect-[21/9]">
        <AnimatePresence mode="wait">
          <motion.button
            key={images[i]}
            type="button"
            onClick={() => setBox(true)}
            aria-label={`Enlarge image ${i + 1} of ${n}`}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="absolute inset-0 block h-full w-full cursor-zoom-in"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[i]} alt={`${alt} ${i + 1}`} className="h-full w-full object-cover" />
          </motion.button>
        </AnimatePresence>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white md:p-7">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/80">Project</div>
            <div className="mt-1 text-3xl font-extralight tabular-nums tracking-tight md:text-5xl">
              {pad(i)} <span className="text-white/50">/ {pad(n - 1)}</span>
            </div>
          </div>
          <span className="hidden items-center gap-2 border border-white/40 bg-black/30 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] backdrop-blur sm:flex">
            ⤢ Click to enlarge
          </span>
        </div>

        <button onClick={() => go(-1)} aria-label="Previous image" className={`${arrow} absolute left-4 top-1/2 -translate-y-1/2`}>←</button>
        <button onClick={() => go(1)} aria-label="Next image" className={`${arrow} absolute right-4 top-1/2 -translate-y-1/2`}>→</button>

        {/* progress */}
        <div className="absolute inset-x-0 top-0 h-[3px] bg-white/15">
          <motion.div className="h-full bg-[#E03A3A]" animate={{ width: `${((i + 1) / n) * 100}%` }} transition={{ duration: 0.5, ease: EASE }} />
        </div>
      </div>

      {/* thumbnails */}
      <div className="mt-3 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {images.map((src, k) => (
          <button
            key={src}
            onClick={() => setI(k)}
            aria-label={`Show image ${k + 1}`}
            aria-current={k === i}
            className={`relative h-20 w-32 shrink-0 overflow-hidden border-2 transition-all duration-300 md:h-24 md:w-40 ${
              k === i ? "border-[#E03A3A]" : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      {/* lightbox */}
      <AnimatePresence>
        {box && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setBox(false)}
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#141414]/95 p-4 md:p-10"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[i]} alt={`${alt} ${i + 1}`} onClick={(e) => e.stopPropagation()} className="max-h-full max-w-full object-contain" />
            <button onClick={() => setBox(false)} aria-label="Close" className={`${arrow} absolute right-5 top-5`}>✕</button>
            <button onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous image" className={`${arrow} absolute left-5 top-1/2 -translate-y-1/2`}>←</button>
            <button onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next image" className={`${arrow} absolute right-5 top-1/2 -translate-y-1/2`}>→</button>
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs font-semibold tabular-nums tracking-[0.2em] text-white/80">{pad(i)} / {pad(n - 1)} · Esc to close</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
