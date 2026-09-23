"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PublicQuoteRequestLazy from "@/components/PublicQuoteRequest";

/** True once the reader is within `px` of the bottom of the document — used to
 * duck fixed/floating UI so it doesn't sit on top of the site footer. */
function useNearBottom(px = 480) {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const on = () => {
      const left = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
      setNear(left < px);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, [px]);
  return near;
}

/** Floating back-to-top button, shown once the reader is well down the page. */
export function BackToTop() {
  const [show, setShow] = useState(false);
  const nearBottom = useNearBottom(360);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 900);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <AnimatePresence>
      {show && !nearBottom && (
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="fixed bottom-20 left-4 z-[900] flex items-center gap-2 border border-[#252525]/20 bg-white/95 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#252525] shadow-lg backdrop-blur transition-colors hover:border-[#E03A3A] hover:bg-[#E03A3A] hover:text-white lg:bottom-6 lg:left-6"
        >
          ↑ Top
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/** Animated scroll hint for the banner. */
export function ScrollCue({ target }: { target: string }) {
  return (
    <a
      href={target}
      className="absolute bottom-3 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/70 transition-colors hover:text-white md:flex [@media(max-height:640px)]:!hidden"
    >
      Scroll
      <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} className="text-base leading-none">
        ↓
      </motion.span>
    </a>
  );
}

/** "Next: …" link at the end of a section so readers always know where to go. */
export function NextLink({ href, label }: { href: string; label: string }) {
  return (
    <div className="mt-8 flex justify-center">
      <a href={href} className="group inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#5B5C5D] transition-colors hover:text-[#CC2E2E]">
        <span className="h-px w-8 bg-current opacity-40" />
        Next: {label}
        <span className="transition-transform duration-500 group-hover:translate-y-1">↓</span>
        <span className="h-px w-8 bg-current opacity-40" />
      </a>
    </div>
  );
}

/** Persistent mobile conversion bar — the desktop nav already carries a "Get quotes" button. */
export function MobileCta({ location, countryCode }: { location: string; countryCode?: string }) {
  const [show, setShow] = useState(false);
  const nearBottom = useNearBottom(600);
  const barRef = useRef<HTMLDivElement>(null);
  const visible = show && !nearBottom;

  useEffect(() => {
    const on = () => setShow(window.scrollY > 700);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // While the bar is on screen, push the site-wide WhatsApp button/bubble up by
  // this bar's real measured height so the two never overlap (see globals.css).
  useEffect(() => {
    const body = document.body;
    if (!visible) {
      body.classList.remove("has-sticky-bottom-cta");
      return;
    }
    const setHeight = () => {
      const h = barRef.current?.offsetHeight;
      if (h) body.style.setProperty("--sticky-bottom-cta-height", `${h}px`);
    };
    setHeight();
    body.classList.add("has-sticky-bottom-cta");
    window.addEventListener("resize", setHeight);
    return () => {
      body.classList.remove("has-sticky-bottom-cta");
      window.removeEventListener("resize", setHeight);
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={barRef}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="fixed inset-x-0 bottom-0 z-[950] border-t border-[#252525]/10 bg-white/95 p-3 shadow-[0_-8px_24px_rgba(0,0,0,.08)] backdrop-blur lg:hidden"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <PublicQuoteRequestLazy
            location={location}
            countryCode={countryCode}
            buttonText="Get free quotes →"
            className="h-auto w-full whitespace-normal rounded-none border-0 bg-[#E03A3A] px-6 py-4 text-center text-[12px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#252525]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
