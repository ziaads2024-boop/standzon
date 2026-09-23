"use client";

import Link from "next/link";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { EASE } from "@/components/home-v2/motion";

/**
 * Breadcrumb trail lives inside the banner itself (not a fixed bar stacked
 * under the site nav) — one wayfinding element instead of two, and it never
 * shows twice in a full-page screenshot the way a `position: fixed` bar does.
 */
export function BannerBreadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="absolute inset-x-0 top-0 z-10 px-5 pt-8 md:px-8 md:pt-10">
      <ol className="mx-auto flex max-w-[1320px] flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-x-3">
              {i > 0 && <span className="opacity-50">/</span>}
              {item.href && !isLast ? (
                <Link href={item.href} className="transition-colors hover:text-white">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-white/85" : undefined}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** One masked line of a headline (observes the unclipped wrapper, not the masked child). */
export function MaskLine({
  children,
  delay = 0,
  onLoad = false,
  className,
}: {
  children: ReactNode;
  delay?: number;
  onLoad?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const show = onLoad || seen;
  return (
    <span ref={ref} className={`block overflow-hidden pb-[0.12em] -mb-[0.12em] ${className || ""}`}>
      <motion.span
        className="block"
        initial={reduce ? false : { y: "112%" }}
        animate={{ y: show ? "0%" : "112%" }}
        transition={{ duration: 1.05, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/** Section eyebrow: index number + label. */
export function Tag({ n, children, dark = false }: { n: string; children: ReactNode; dark?: boolean }) {
  return (
    <div className={`flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.26em] ${dark ? "text-[#EC6A6A]" : "text-[#CC2E2E]"}`}>
      <span className="tabular-nums">{n}</span>
      <span className={`h-px w-10 ${dark ? "bg-[#E03A3A]" : "bg-[#CC2E2E]/40"}`} />
      {children}
    </div>
  );
}

export interface BannerImage {
  /** images.unsplash.com (or any allow-listed host) URL, no query string — crop/quality params are added here. */
  src: string;
  alt: string;
  /** "Subject, Venue — Photographer / Unsplash" */
  credit: string;
  /** object-position on narrow screens, e.g. "68% center" — keeps the subject in frame on a tall/narrow crop. */
  focalMobile?: string;
}

/**
 * Premium banner backdrop. Two modes:
 *  - `image` set → a real photo (slow parallax zoom) with a layered scrim tuned
 *    so every word on the banner reads regardless of what's behind it.
 *  - `image` omitted/null → the original pure CSS/SVG backdrop (drifting red
 *    aurora + grid + grain), used for any location that doesn't have a
 *    curated photo yet. There is deliberately NO photo fallback here — a
 *    missing `image` must never silently render a different country's
 *    landmark, so each page passes its own or gets the gradient.
 */
export function BannerBackdrop({ image }: { image?: BannerImage | null }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const grain =
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

  const scale = useTransform(scrollYProgress, [0, 1], [1.06, reduce ? 1.06 : 1.18]);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "6%"]);
  const parY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "18%"]);
  const gridY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "8%"]);

  if (!image) {
    return (
      <div
        ref={ref}
        aria-hidden
        className="absolute inset-0 overflow-hidden"
        style={{ background: "linear-gradient(135deg,#0B0B0B 0%,#181818 42%,#121212 100%)" }}
      >
        <style>{`
          @keyframes sz-drift-a{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(-4%,3%,0) scale(1.08)}}
          @keyframes sz-drift-b{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(5%,-4%,0) scale(1.12)}}
          @keyframes sz-beam{0%,100%{opacity:.55}50%{opacity:.9}}
        `}</style>
        <motion.div style={{ y: parY }} className="absolute inset-0">
          <div
            className="absolute -bottom-[35%] -right-[8%] h-[95%] w-[75%] rounded-full blur-[40px]"
            style={{ background: "radial-gradient(closest-side,rgba(224,58,58,.55),rgba(204,46,46,.22) 45%,transparent 72%)", animation: reduce ? undefined : "sz-drift-a 16s ease-in-out infinite" }}
          />
          <div
            className="absolute -left-[12%] -top-[40%] h-[85%] w-[55%] rounded-full blur-[50px]"
            style={{ background: "radial-gradient(closest-side,rgba(140,31,31,.50),rgba(140,31,31,.14) 55%,transparent 75%)", animation: reduce ? undefined : "sz-drift-b 21s ease-in-out infinite" }}
          />
          <div
            className="absolute left-[38%] top-[8%] h-[55%] w-[34%] rounded-full blur-[70px]"
            style={{ background: "radial-gradient(closest-side,rgba(255,255,255,.10),transparent 70%)" }}
          />
          <div
            className="absolute -top-[10%] right-[6%] h-[120%] w-[38%] origin-top rotate-[18deg]"
            style={{
              background: "linear-gradient(180deg,rgba(255,255,255,.10),rgba(255,255,255,.02) 55%,transparent)",
              clipPath: "polygon(42% 0,58% 0,100% 100%,0 100%)",
              filter: "blur(10px)",
              animation: reduce ? undefined : "sz-beam 9s ease-in-out infinite",
            }}
          />
        </motion.div>
        <motion.div
          style={{
            y: gridY,
            backgroundImage: "linear-gradient(rgba(255,255,255,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.055) 1px,transparent 1px)",
            backgroundSize: "88px 88px",
            WebkitMaskImage: "radial-gradient(ellipse 75% 70% at 60% 45%,#000 20%,transparent 75%)",
            maskImage: "radial-gradient(ellipse 75% 70% at 60% 45%,#000 20%,transparent 75%)",
          }}
          className="absolute inset-[-10%]"
        />
        <div className="absolute inset-0 opacity-[.07] mix-blend-overlay" style={{ backgroundImage: grain }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 120% 90% at 50% 40%,transparent 55%,rgba(0,0,0,.55) 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#E03A3A] to-transparent opacity-80" />
        <div className="absolute inset-x-[10%] bottom-0 h-16 bg-gradient-to-t from-[#E03A3A]/20 to-transparent blur-xl" />
      </div>
    );
  }

  return (
    <div ref={ref} aria-hidden className="absolute inset-0 overflow-hidden bg-[#0B0B0B]">
      <motion.div style={{ scale, y }} className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${image.src}?auto=format&fit=crop&w=2400&q=80`}
          alt={image.alt}
          className="h-full w-full object-cover md:!object-center"
          style={{ objectPosition: image.focalMobile || "68% center" }}
          fetchPriority="high"
        />
      </motion.div>

      {/* uniform dark tint — the floor for legibility, applies everywhere on the banner */}
      <div className="absolute inset-0 bg-[#0B0B0B]/55" />
      {/* reinforcing gradient behind the copy column (left on desktop, full-bleed low on mobile) */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(105deg,rgba(9,9,9,.88) 0%,rgba(9,9,9,.72) 32%,rgba(9,9,9,.32) 62%,rgba(9,9,9,.15) 100%)" }}
      />
      <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#090909] via-[#090909]/70 to-transparent md:h-[40%]" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#090909]/70 to-transparent" />

      {/* brand colour grade — a quiet red cast, not a spotlight */}
      <div
        className="absolute inset-0 mix-blend-overlay"
        style={{ background: "linear-gradient(135deg,rgba(224,58,58,.22),transparent 45%,rgba(140,31,31,.16))" }}
      />

      {/* film grain */}
      <div className="absolute inset-0 opacity-[.06] mix-blend-overlay" style={{ backgroundImage: grain }} />

      {/* vignette */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 120% 90% at 50% 40%,transparent 55%,rgba(0,0,0,.45) 100%)" }} />

      {/* glowing horizon line */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#E03A3A] to-transparent opacity-80" />
      <div className="absolute inset-x-[10%] bottom-0 h-16 bg-gradient-to-t from-[#E03A3A]/20 to-transparent blur-xl" />

      {/* photo credit — required by nothing, offered anyway */}
      <span className="absolute bottom-3 right-4 z-10 hidden text-[10px] font-medium tracking-wide text-white/45 md:block">
        {image.credit}
      </span>
    </div>
  );
}
