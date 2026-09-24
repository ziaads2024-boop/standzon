"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import HeroSearchFilter from "@/components/HeroSearchFilter";
import { WordReveal, EASE } from "./motion";

const TICKER = [
  "New brief · 120 sqm island stand · GITEX Dubai",
  "Matched · Custom booth · CES Las Vegas",
  "New brief · 300 sqm double-deck · EuroShop Düsseldorf",
  "Audit complete · Berlin builder re-certified · 98%",
  "New brief · 45 sqm shell scheme+ · Arab Health",
];

export default function HeroV2({
  heading,
  description,
  bgImage,
}: {
  heading: string;
  description?: string;
  bgImage?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "14%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.02, reduce ? 1.02 : 1.14]);
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-10%"]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative flex min-h-[calc(100svh-4rem)] w-full flex-col overflow-hidden bg-[#141414] text-white"
    >
      {/* Background: CMS image if set, otherwise a quiet architectural grid */}
      <motion.div style={{ y: imgY, scale: imgScale }} className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/videos/hero-poster.jpg"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        >
          <source src="/videos/hero-loop.webm" type="video/webm" />
          <source src="/videos/hero-loop.mp4" type="video/mp4" />
        </video>
      </motion.div>
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(60%_60%_at_85%_10%,rgba(224,58,58,.28),transparent_70%)]" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#141414] via-[#141414]/55 to-[#141414]/30" />

      <motion.div
        style={{ y: copyY, opacity: copyOpacity }}
        className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-end px-6 pb-14 pt-24 md:px-10 lg:pr-28"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.1 }}
          className="mb-8 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/80"
        >
          <span className="h-px w-10 bg-[#E03A3A]" />
          Exhibition stand contractors · 55+ countries
        </motion.div>

        <WordReveal
          as="h1"
          onLoad
          delay={0.15}
          text={heading || "Exhibition stands, built anywhere in the world."}
          className="max-w-[16ch] text-[clamp(2.75rem,8.2vw,8rem)] font-light leading-[0.95] tracking-[-0.04em]"
        />

        <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            {description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.9, ease: EASE }}
                className="mb-8 text-base font-light leading-relaxed text-white/80 md:text-lg"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            )}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.05, ease: EASE }}
              className="relative z-[100] [&>div]:mb-0 [&>div]:max-w-none"
            >
              <HeroSearchFilter />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.3 }}
            className="flex items-end gap-10"
          >
            {[
              ["55+", "Countries"],
              ["120+", "Cities"],
              ["1,500+", "Builders"],
            ].map(([v, l]) => (
              <div key={l}>
                <div className="text-3xl font-light tracking-tight md:text-4xl">{v}</div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/80">{l}</div>
              </div>
            ))}
            <Link
              href="/quote"
              className="group hidden items-center gap-3 border border-white/30 px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors hover:border-[#E03A3A] hover:bg-[#E03A3A] md:flex"
            >
              Free quote
              <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Live ticker */}
      <div className="relative z-10 overflow-hidden border-t border-white/10 bg-black/30 py-4 backdrop-blur">
        <div className="flex w-max animate-[hv2-marquee_60s_linear_infinite] gap-14 whitespace-nowrap pr-14 text-[11px] uppercase tracking-[0.2em] text-white/80">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="flex items-center gap-14">
              <span className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E03A3A]" />
                {t}
              </span>
            </span>
          ))}
        </div>
      </div>
      <style>{`@keyframes hv2-marquee{to{transform:translateX(-50%)}}@media (prefers-reduced-motion:reduce){.animate-\\[hv2-marquee_60s_linear_infinite\\]{animation:none!important}}`}</style>
    </section>
  );
}
