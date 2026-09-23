"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

type Stat = { value: number; suffix: string; label: string; decimals?: number };

function Count({ to, suffix, decimals = 0 }: { to: number; suffix: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();
  const [v, setV] = useState(reduce ? to : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    let raf = 0;
    const t0 = performance.now();
    const dur = 1800;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setV(to * (1 - Math.pow(1 - p, 4)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, reduce]);

  return (
    <span ref={ref}>
      {v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

export default function StatsBand({ stats }: { stats: Stat[] }) {
  return (
    <section className="border-y border-white/10 bg-[#141414] text-white">
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 md:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} className={`px-4 py-6 md:px-10 md:py-20 ${i > 0 ? "md:border-l md:border-white/10" : ""} ${i % 2 === 1 ? "border-l border-white/10 md:border-l" : ""} ${i > 1 ? "border-t border-white/10 md:border-t-0" : ""}`}>
            <div className="text-[clamp(1.7rem,7vw,4.5rem)] font-extralight leading-none tracking-[-0.04em]">
              <Count to={s.value} suffix={s.suffix} decimals={s.decimals} />
            </div>
            <div className="mt-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/80 md:mt-4 md:text-[10px] md:tracking-[0.25em]">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
