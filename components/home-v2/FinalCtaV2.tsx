"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { WordReveal } from "./motion";

export default function FinalCtaV2({
  heading,
  paragraph,
  buttons,
}: {
  heading?: string;
  paragraph?: string;
  buttons?: { text?: string; href?: string }[];
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["8%", "-28%"]);
  const btns = buttons?.length
    ? buttons
    : [
        { text: "Post a quote RFP", href: "/quote" },
        { text: "Register as a builder", href: "/builder/register" },
      ];

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#141414] px-6 py-32 text-white md:px-10 md:py-40">
      <motion.div
        aria-hidden
        style={{ x }}
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none whitespace-nowrap text-[26vw] font-extralight leading-none tracking-[-0.06em] text-white/[0.07]"
      >
        STANDS ZONE — STANDS ZONE
      </motion.div>
      <div className="relative mx-auto max-w-[1400px] lg:pr-20">
        <WordReveal
          text={heading || "Start your world-class journey"}
          className="max-w-[14ch] text-[clamp(3rem,9vw,9rem)] font-light leading-[0.95] tracking-[-0.045em]"
        />
        <div className="mt-14 flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <p
            className="max-w-lg text-lg font-light leading-relaxed text-white/80"
            dangerouslySetInnerHTML={{
              __html: paragraph || "Connect with certified partners and elevate your global brand presence.",
            }}
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            {btns.map((b, i) => (
              <Link
                key={i}
                href={b.href || "#"}
                className={`group flex items-center justify-between gap-6 px-8 py-5 text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors ${
                  i === 0 ? "bg-[#E03A3A] hover:bg-white hover:text-[#252525]" : "border border-white/30 hover:border-white"
                }`}
              >
                {b.text}
                <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
