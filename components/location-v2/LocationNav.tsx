"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import PublicQuoteRequest from "@/components/PublicQuoteRequest";

export type NavItem = { id: string; label: string };

/**
 * Sticky sub-navigation: scroll-spy underline that slides between items,
 * a hairline progress bar for the whole page, and a persistent quote button.
 */
export default function LocationNav({ items, location, countryCode }: { items: NavItem[]; location: string; countryCode?: string }) {
  const [active, setActive] = useState(items[0]?.id);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.3 });

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 112 - 56, behavior: "smooth" });
  };

  return (
    <div className="sticky top-16 z-[900] border-b border-[#E4E6E8] bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1320px] items-center justify-between gap-6 px-5 md:px-8">
        <div className="relative min-w-0 flex-1">
          <nav aria-label="On this page" className="-mx-2 flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((i) => (
            <button
              key={i.id}
              onClick={() => go(i.id)}
              aria-current={active === i.id}
              className={`relative shrink-0 whitespace-nowrap px-2.5 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors md:px-3 md:text-[12px] md:tracking-[0.16em] ${
                active === i.id ? "text-[#252525]" : "text-[#5B5C5D] hover:text-[#252525]"
              }`}
            >
              {i.label}
              {active === i.id && <motion.span layoutId="loc-nav-underline" className="absolute inset-x-3 bottom-0 h-[2px] bg-[#E03A3A]" />}
            </button>
          ))}
          </nav>
          {/* fade + hint that the tab strip scrolls, on narrow screens where it doesn't all fit */}
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent lg:hidden" />
        </div>
        <PublicQuoteRequest
          location={location}
          countryCode={countryCode}
          buttonText="Get quotes"
          size="sm"
          className="hidden h-9 shrink-0 rounded-none bg-[#E03A3A] px-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#252525] lg:inline-flex"
        />
      </div>
      <motion.div aria-hidden style={{ scaleX }} className="absolute inset-x-0 bottom-[-1px] h-[2px] origin-left bg-[#CC2E2E]" />
    </div>
  );
}
