"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useReducedMotion } from "framer-motion";
import { Eyebrow, WordReveal, EASE } from "./motion";

type Step = { title: string; text: string };

/**
 * Desktop: section is 100vh × steps tall; the inner panel is pinned (sticky) and
 * scroll progress drives which step is shown. Mobile: plain stacked list.
 */
export default function ProcessPinned({
  heading,
  paragraph,
  steps,
}: {
  heading: string;
  paragraph?: string;
  steps: Step[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.min(steps.length - 1, Math.max(0, Math.floor(v * steps.length)));
    setIdx((p) => (p === i ? p : i));
  });
  const n = (i: number) => String(i + 1).padStart(2, "0");

  return (
    <section id="process" className="bg-[#F5F6F7] text-[#252525]">
      {/* Mobile */}
      <div className="px-6 py-24 lg:hidden">
        <Eyebrow>How it works</Eyebrow>
        <h2 className="mt-6 text-4xl font-light leading-[1.05] tracking-[-0.03em]">{heading}</h2>
        {paragraph && <p className="mt-5 text-[#252525]/80" dangerouslySetInnerHTML={{ __html: paragraph }} />}
        <ol className="mt-12 divide-y divide-[#252525]/10 border-t border-[#252525]/10">
          {steps.map((s, i) => (
            <li key={i} className="py-8">
              <div className="text-xs font-semibold tracking-[0.25em] text-[#E03A3A]">{n(i)}</div>
              <h3 className="mt-3 text-2xl font-light tracking-tight">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#252525]/80">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Desktop pinned */}
      <div ref={ref} className="relative hidden lg:block" style={{ height: `${steps.length * 70 + 30}vh` }}>
        <div className="sticky top-16 flex h-[calc(100vh-4rem)] items-center overflow-hidden">
          <div className="mx-auto grid w-full max-w-[1400px] grid-cols-12 gap-10 px-10 pr-28">
            <div className="col-span-5 flex flex-col justify-between py-4">
              <div>
                <Eyebrow>How it works</Eyebrow>
                <WordReveal text={heading} className="mt-6 text-[clamp(2.25rem,3.6vw,3.75rem)] font-light leading-[1.02] tracking-[-0.035em]" />
                {paragraph && (
                  <p className="mt-6 max-w-md text-[#252525]/80" dangerouslySetInnerHTML={{ __html: paragraph }} />
                )}
              </div>
              <ol className="mt-12 space-y-1">
                {steps.map((s, i) => (
                  <li
                    key={i}
                    className={`flex items-center gap-5 py-2 text-sm font-medium uppercase tracking-[0.18em] transition-all duration-500 ${
                      i === idx ? "text-[#252525]" : "text-[#252525]/65"
                    }`}
                  >
                    <span className={`h-px transition-all duration-500 ${i === idx ? "w-14 bg-[#E03A3A]" : "w-6 bg-current"}`} />
                    {s.title}
                  </li>
                ))}
              </ol>
            </div>

            <div className="relative col-span-7 border-l border-[#252525]/10 pl-14">
              {/* progress rail */}
              <div className="absolute left-[-1px] top-0 h-full w-px bg-[#252525]/10">
                <motion.div style={{ scaleY: scrollYProgress }} className="h-full w-full origin-top bg-[#E03A3A]" />
              </div>
              <div className="relative flex h-[min(62vh,560px)] flex-col justify-between">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={idx}
                    initial={reduce ? false : { opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: -40 }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="flex h-full flex-col justify-between"
                  >
                    <div className="select-none text-[clamp(8rem,17vw,16rem)] font-extralight leading-none tracking-[-0.06em] text-[#252525]/[0.16]">
                      {n(idx)}
                    </div>
                    <div>
                      <h3 className="text-[clamp(2rem,3.4vw,3.5rem)] font-light leading-[1.05] tracking-[-0.03em]">
                        {steps[idx].title}
                      </h3>
                      <p className="mt-5 max-w-lg text-lg font-light leading-relaxed text-[#252525]/80">
                        {steps[idx].text}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
