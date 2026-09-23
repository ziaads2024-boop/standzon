"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

function Count({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [v, setV] = useState(reduce ? to : 0);
  useEffect(() => {
    if (!inView || reduce) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 1600);
      setV(Math.round(to * (1 - Math.pow(1 - p, 4))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, reduce]);
  return <span ref={ref}>{v}{suffix}</span>;
}

export type Fact = { value: number; suffix?: string; label: string };

export default function FactStrip({ facts }: { facts: Fact[] }) {
  return (
    <div className="grid grid-cols-2 border-y border-[#E4E6E8] md:grid-cols-4">
      {facts.map((f, i) => (
        <div key={f.label} className={`px-5 py-6 md:px-8 md:py-8 ${i % 2 === 1 ? "border-l border-[#E4E6E8]" : ""} ${i > 0 ? "md:border-l md:border-[#E4E6E8]" : ""} ${i > 1 ? "border-t border-[#E4E6E8] md:border-t-0" : ""}`}>
          <div className="text-[clamp(2.25rem,4vw,3.5rem)] font-extralight leading-none tracking-[-0.04em] text-[#141414]">
            <Count to={f.value} suffix={f.suffix} />
          </div>
          <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#5B5C5D]">{f.label}</div>
        </div>
      ))}
    </div>
  );
}
