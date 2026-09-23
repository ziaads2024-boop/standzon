"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export type Hub = {
  name: string;
  href: string;
  builders: number;
  venues: string[];
  blurb: string;
  /** shown while this panel is open */
  imageSquare?: string;
  /** shown while this panel is collapsed */
  imageVertical?: string;
  credit?: string;
};

/**
 * Emirate selector. Every panel always carries a photo — the square crop while
 * open, the vertical crop while collapsed — crossfading between the two, with a
 * scrim tuned so the number, name and copy stay readable on any photo.
 */
export default function HubsExplorer({ hubs }: { hubs: Hub[] }) {
  const [open, setOpen] = useState(0);
  const n = hubs.length;
  const go = (d: number) => setOpen((o) => (o + d + n) % n);
  const pad = (i: number) => String(i + 1).padStart(2, "0");

  return (
    <>
      {/* controls */}
      <div className="mb-4 hidden items-center justify-between lg:flex">
        <p className="flex items-center gap-3 text-sm text-[#5B5C5D]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E03A3A] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#E03A3A]" />
          </span>
          Hover or click a city to preview it, then choose <b className="font-medium text-[#252525]">Explore</b> to open its page.
        </p>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold tabular-nums tracking-[0.2em] text-[#5B5C5D]">
            {pad(open)} / {pad(n - 1)}
          </span>
          <button onClick={() => go(-1)} aria-label="Previous emirate" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#252525]/25 transition-colors hover:border-[#E03A3A] hover:bg-[#E03A3A] hover:text-white">←</button>
          <button onClick={() => go(1)} aria-label="Next emirate" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#252525]/25 transition-colors hover:border-[#E03A3A] hover:bg-[#E03A3A] hover:text-white">→</button>
        </div>
      </div>

      <div className="hidden h-[430px] gap-3 lg:flex">
        {hubs.map((h, i) => {
          const on = open === i;
          return (
            <motion.div
              key={h.name}
              layout
              role="button"
              tabIndex={0}
              aria-expanded={on}
              aria-label={on ? `${h.name} (selected)` : `Preview ${h.name}`}
              onMouseEnter={() => setOpen(i)}
              onClick={() => setOpen(i)}
              onFocus={() => setOpen(i)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") go(1);
                if (e.key === "ArrowLeft") go(-1);
              }}
              transition={{ type: "spring", stiffness: 190, damping: 28 }}
              style={{ flexGrow: on ? 3.2 : 1, flexBasis: 0 }}
              className="group relative flex min-w-0 cursor-pointer flex-col justify-between overflow-hidden border border-white/10 p-7 text-white outline-none focus-visible:ring-2 focus-visible:ring-[#E03A3A]"
            >
              {/* background photo — crossfades between the vertical (collapsed) and square (open) crop */}
              <div className="absolute inset-0 bg-[#141414]">
                {h.imageVertical && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={h.imageVertical}
                    alt=""
                    className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out ${
                      on ? "scale-105 opacity-0" : "scale-100 opacity-100 grayscale-[.25] brightness-[.62]"
                    }`}
                  />
                )}
                {h.imageSquare && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={h.imageSquare}
                    alt={`${h.name} skyline`}
                    className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out ${
                      on ? "scale-100 opacity-100" : "scale-110 opacity-0"
                    }`}
                  />
                )}
              </div>
              {/* scrim — heavier at the bottom/left where the copy sits, tuned so
                  white text stays legible over any photo in either state */}
              <div
                className={`absolute inset-0 transition-opacity duration-700 ${on ? "opacity-100" : "opacity-90"}`}
                style={{
                  background: on
                    ? "linear-gradient(200deg,rgba(20,20,20,.15) 0%,rgba(20,20,20,.55) 45%,rgba(10,10,10,.92) 100%)"
                    : "linear-gradient(180deg,rgba(20,20,20,.35) 0%,rgba(20,20,20,.35) 55%,rgba(10,10,10,.85) 100%)",
                }}
              />
              {!on && <div className="absolute inset-0 bg-[#141414]/35 transition-colors duration-500 group-hover:bg-[#141414]/15" />}

              <div className="relative flex items-start justify-between">
                <span className="text-[11px] font-semibold tracking-[0.26em] text-[#EC6A6A]">{pad(i)}</span>
                {!on && (
                  <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
                    Preview
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-black/20 text-base leading-none backdrop-blur-sm">+</span>
                  </span>
                )}
              </div>

              <div className="relative">
                <h3
                  className={`font-light leading-none tracking-[-0.03em] drop-shadow-[0_2px_10px_rgba(0,0,0,.55)] transition-all duration-500 ${
                    on ? "text-[clamp(2.75rem,4.4vw,4.5rem)]" : "rotate-180 text-[clamp(1.6rem,2vw,2rem)] [writing-mode:vertical-rl]"
                  }`}
                >
                  {h.name}
                </h3>
                {on && (
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }} className="mt-5 max-w-md">
                    <p className="text-[15px] leading-relaxed text-white/85">{h.blurb}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {h.venues.map((v) => (
                        <span key={v} className="border border-white/35 bg-black/20 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-white/90 backdrop-blur-sm">{v}</span>
                      ))}
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
                      <Link href={h.href} className="group/btn inline-flex items-center gap-3 bg-[#E03A3A] px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-[#252525]">
                        Explore {h.name} builders <span className="transition-transform duration-500 group-hover/btn:translate-x-1">→</span>
                      </Link>
                      <span className="text-sm text-white/85">
                        <span className="text-lg font-light text-white">{h.builders > 0 ? `${h.builders}+` : "New"}</span> local builders
                      </span>
                    </div>
                    {h.credit && <p className="mt-5 text-[10px] tracking-wide text-white/40">Photo: {h.credit}</p>}
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:hidden">
        {hubs.map((h, i) => (
          <Link
            key={h.name}
            href={h.href}
            className="group relative block overflow-hidden border border-white/10 p-6 text-white"
          >
            {h.imageVertical && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={h.imageVertical} alt={`${h.name} skyline`} className="absolute inset-0 h-full w-full object-cover brightness-[.6] transition-transform duration-700 group-hover:scale-105" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/25" />
            <div className="relative">
              <span className="text-[11px] font-semibold tracking-[0.26em] text-[#EC6A6A]">{pad(i)}</span>
              <h3 className="mt-5 text-4xl font-light tracking-[-0.03em] drop-shadow-[0_2px_10px_rgba(0,0,0,.55)]">{h.name}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-white/85">{h.blurb}</p>
              <div className="mt-4 text-sm text-white/85">
                <b className="font-medium text-white">{h.builders > 0 ? `${h.builders}+` : "New"}</b> local builders · {h.venues.join(" · ")}
              </div>
              <span className="mt-5 inline-flex items-center gap-2 bg-[#E03A3A] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                Explore {h.name} <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
