"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export const SECTIONS = [
  { id: "top", label: "Start" },
  { id: "process", label: "Process" },
  { id: "leads", label: "Live leads" },
  { id: "network", label: "Network" },
  { id: "clients", label: "Clients" },
  { id: "contact", label: "Contact" },
];

/** Top progress bar + right-hand section rail that tracks the section in view. */
export default function ScrollChrome() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.3 });
  const [active, setActive] = useState("top");

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <>
      <motion.div
        aria-hidden
        style={{ scaleX }}
        className="fixed left-0 right-0 top-16 z-[999] h-[3px] origin-left bg-[#E03A3A]"
      />
      <nav
        aria-label="Sections"
        className="fixed right-6 top-1/2 z-[900] hidden -translate-y-1/2 flex-col items-end gap-4 mix-blend-difference lg:flex"
      >
        {SECTIONS.map((s) => {
          const on = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => go(s.id)}
              aria-current={on}
              className="group flex items-center gap-3 text-white"
            >
              <span
                className={`text-[10px] font-semibold uppercase tracking-[0.22em] transition-all duration-500 ${
                  on ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-70"
                }`}
              >
                {s.label}
              </span>
              <span className={`block h-px bg-white transition-all duration-500 ${on ? "w-10" : "w-4 opacity-60 group-hover:w-7"}`} />
            </button>
          );
        })}
      </nav>
    </>
  );
}
