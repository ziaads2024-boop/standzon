"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";

export const EASE = [0.22, 1, 0.36, 1] as const;

/** Fade + rise when scrolled into view. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Headline that slides up word-by-word from behind a mask. */
export function WordReveal({
  text,
  className,
  delay = 0,
  as: Tag = "h2",
  onLoad = false,
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3";
  /** animate on mount (hero) instead of on scroll */
  onLoad?: boolean;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLHeadingElement>(null);
  // Observe the (unclipped) heading itself; the masked words can't be observed.
  const seen = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const show = onLoad || seen;
  const words = text.split(" ");
  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden align-bottom pb-[0.1em] -mb-[0.1em]">
          <motion.span
            className="inline-block"
            initial={reduce ? false : { y: "110%" }}
            animate={{ y: show ? "0%" : "110%" }}
            transition={{ duration: 1, delay: delay + i * 0.06, ease: EASE }}
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Small uppercase label with a leading rule — used above every section title. */
export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <div className={`flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] ${light ? "text-white/80" : "text-[#252525]/75"}`}>
      <span className="h-px w-8 bg-[#E03A3A]" />
      {children}
    </div>
  );
}
