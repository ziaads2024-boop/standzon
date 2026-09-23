"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eyebrow, EASE } from "./motion";

export type Quote = { name: string; role: string; company?: string; text: string; location?: string };

const FALLBACK: Quote[] = [
  { name: "Sarah Johnson", role: "Marketing Director", company: "TechFlow Solutions", location: "Berlin, Germany", text: "Stands Zone transformed our European tour. Finding reliable local builders in three countries was seamless, and the quality was superior to anything we've had before." },
  { name: "Michael Chen", role: "CEO", company: "Innovation Labs", location: "San Francisco, USA", text: "The quote comparison saved us over 40 hours of research. We found a niche builder in Tokyo that matched our minimalist brand perfectly." },
  { name: "Emma Rodriguez", role: "Events Manager", company: "Green Energy Corp", location: "Madrid, Spain", text: "An unrivalled database of quality partners. For high-stakes trade shows, this is the only platform we use to vet construction teams." },
  { name: "David Kumar", role: "VP Sales", company: "MedTech Innovations", location: "London, UK", text: "We've used the platform for three trade shows across Europe with consistently excellent results." },
];

const DURATION = 7000;

export default function ClientsV2({ heading, quotes }: { heading?: string; quotes?: Quote[] }) {
  const list = quotes && quotes.length ? quotes : FALLBACK;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setI((p) => (p + 1) % list.length), DURATION);
    return () => clearTimeout(t);
  }, [i, paused, list.length]);

  const q = list[i];
  const initials = q.name.split(" ").map((w) => w[0]).slice(0, 2).join("");

  return (
    <section id="clients" className="bg-white px-6 py-28 text-[#252525] md:px-10 md:py-32">
      <div className="mx-auto max-w-[1400px] lg:pr-20">
        <Eyebrow>{heading || "Trusted by exhibitors worldwide"}</Eyebrow>

        <div className="mt-14 grid gap-12 lg:grid-cols-12" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div className="relative min-h-[22rem] lg:col-span-9 md:min-h-[26rem]">
            <span aria-hidden className="absolute -left-2 -top-10 select-none text-[9rem] font-extralight leading-none text-[#E03A3A]/90 md:-top-14 md:text-[12rem]">“</span>
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.7, ease: EASE }}
                className="relative pt-16"
              >
                <p className="text-[clamp(1.6rem,3.4vw,3.25rem)] font-light leading-[1.15] tracking-[-0.025em]">{q.text}</p>
                <footer className="mt-10 flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#252525] text-xs font-semibold tracking-wider text-white">{initials}</span>
                  <div>
                    <div className="font-medium">{q.name}</div>
                    <div className="text-[11px] uppercase tracking-[0.2em] text-[#252525]/65">
                      {[q.role, q.company].filter(Boolean).join(" · ")}
                      {q.location ? ` — ${q.location}` : ""}
                    </div>
                  </div>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          <div className="flex gap-4 lg:col-span-3 lg:flex-col lg:justify-end">
            {list.map((_, n) => (
              <button key={n} onClick={() => setI(n)} aria-label={`Testimonial ${n + 1}`} aria-current={n === i} className="group flex-1 lg:flex-none">
                <span className="relative block h-px w-full overflow-hidden bg-[#252525]/15">
                  {n === i && (
                    <motion.span
                      key={`${i}-${paused}`}
                      className="absolute inset-y-0 left-0 bg-[#E03A3A] [height:2px] -top-px"
                      initial={{ width: 0 }}
                      animate={{ width: paused ? "100%" : "100%" }}
                      transition={{ duration: paused ? 0 : DURATION / 1000, ease: "linear" }}
                    />
                  )}
                </span>
                <span className={`mt-3 hidden text-left text-[11px] uppercase tracking-[0.2em] transition-colors lg:block ${n === i ? "text-[#252525]" : "text-[#252525]/65 group-hover:text-[#252525]/80"}`}>
                  {list[n].company || list[n].name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
