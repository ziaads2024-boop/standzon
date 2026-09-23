"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { CONTINENTS } from "./locationsData";
import { Eyebrow, Reveal, WordReveal, EASE } from "./motion";

type SectionText = { heading?: string; paragraph?: string } | undefined;

export default function NetworkV2({
  globalPresence,
  moreCountries,
  expandingMarkets,
}: {
  globalPresence?: SectionText;
  moreCountries?: SectionText;
  expandingMarkets?: SectionText;
}) {
  const names = Object.keys(CONTINENTS);
  const [tab, setTab] = useState(names[0]);
  const [hover, setHover] = useState<string | null>(null);
  const cur = CONTINENTS[tab];

  return (
    <>
      <section id="network" className="bg-[#141414] px-6 py-24 text-white md:px-10 md:py-32">
        <div className="mx-auto max-w-[1400px] lg:pr-20">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Eyebrow light>Global reach</Eyebrow>
              <WordReveal
                text={globalPresence?.heading || "Your global network for local exhibition success"}
                className="mt-6 text-[clamp(2.25rem,5vw,4.75rem)] font-light leading-[1] tracking-[-0.04em]"
              />
            </div>
            <Reveal className="lg:col-span-4 lg:col-start-9 lg:self-end" delay={0.1}>
              <p className="font-light leading-relaxed text-white/80">
                {globalPresence?.paragraph ||
                  "Navigating international markets requires local expertise. We connect you with regional leaders who understand venue regulations, cultural nuance and logistics."}
              </p>
            </Reveal>
          </div>

          {/* Region tabs */}
          <div role="tablist" className="mt-20 flex flex-wrap gap-x-10 gap-y-3 border-b border-white/15">
            {names.map((n) => (
              <button
                key={n}
                role="tab"
                aria-selected={tab === n}
                onClick={() => setTab(n)}
                className={`relative pb-5 text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors ${
                  tab === n ? "text-white" : "text-white/80 hover:text-white/80"
                }`}
              >
                {n}
                {tab === n && <motion.span layoutId="net-tab" className="absolute inset-x-0 -bottom-px h-px bg-[#E03A3A]" />}
              </button>
            ))}
          </div>

          {/* Countries */}
          <AnimatePresence mode="wait">
            <motion.ul
              key={tab}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: EASE }}
              onMouseLeave={() => setHover(null)}
            >
              {cur.countries.map((c) => (
                <li key={c.name} onMouseEnter={() => setHover(c.name)} onFocus={() => setHover(c.name)}>
                  <Link
                    href={c.href}
                    className={`group grid grid-cols-12 items-center gap-4 border-b border-white/10 py-7 transition-opacity duration-500 md:py-9 ${
                      hover && hover !== c.name ? "opacity-35" : "opacity-100"
                    }`}
                  >
                    <div className="col-span-9 flex items-baseline gap-5 md:col-span-6">
                      <span className="text-2xl md:text-3xl">{c.flag}</span>
                      <span className="text-[clamp(1.75rem,3.6vw,3.5rem)] font-light leading-none tracking-[-0.03em] transition-transform duration-500 group-hover:translate-x-3">
                        {c.name}
                      </span>
                    </div>
                    <div className="col-span-3 hidden text-sm text-white/80 md:col-span-3 md:block">
                      {c.cities.slice(0, 3).join(" · ")}
                      {c.cities.length > 3 ? ` +${c.cities.length - 3}` : ""}
                    </div>
                    <div className="col-span-2 hidden text-sm md:block">
                      <span className="text-white/80">Builders </span>
                      {c.builders}
                    </div>
                    <div className="col-span-3 flex justify-end md:col-span-1">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 transition-all duration-500 group-hover:border-[#E03A3A] group-hover:bg-[#E03A3A]">
                        →
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </div>
      </section>

      {/* More countries */}
      <section className="bg-[#F5F6F7] px-6 py-24 text-[#252525] md:px-10 md:py-32">
        <div className="mx-auto max-w-[1400px] lg:pr-20">
          <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 className="max-w-[18ch] text-3xl font-light leading-[1.05] tracking-[-0.03em] md:text-5xl">
              {(moreCountries?.heading || "More countries in {country}").replace(/\{country\}/gi, tab)}
            </h2>
            <p className="max-w-md text-[#252525]/80">
              {(moreCountries?.paragraph || "Explore builders across every major market in this region and get instant quotes.").replace(/\{country\}/gi, tab)}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {cur.interlinkingCountries.map((c) => (
              <Link
                key={c}
                href={`/exhibition-stands/${c.toLowerCase().replace(/\s+/g, "-")}`}
                className="border border-[#252525]/20 px-5 py-3 text-sm transition-colors duration-300 hover:border-[#E03A3A] hover:bg-[#E03A3A] hover:text-white"
              >
                {c}
              </Link>
            ))}
            <Link
              href="/exhibition-stands"
              className="bg-[#252525] px-5 py-3 text-sm text-white transition-colors duration-300 hover:bg-[#E03A3A]"
            >
              Browse all locations →
            </Link>
          </div>
        </div>
      </section>

      {/* Expansion band */}
      <section className="bg-[#E03A3A] px-6 py-16 text-white md:px-10 md:py-20">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-8 md:flex-row md:items-center lg:pr-20">
          <div>
            <h3 className="text-3xl font-light tracking-[-0.03em] md:text-5xl">
              {expandingMarkets?.heading || "Expanding to new markets?"}
            </h3>
            <p className="mt-3 max-w-xl text-white/80">
              {expandingMarkets?.paragraph || "Get a dedicated strategist to manage your global stand deployment."}
            </p>
          </div>
          <Link
            href="/quote"
            className="whitespace-nowrap bg-white px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#252525] transition-colors hover:bg-[#252525] hover:text-white"
          >
            Contact global team
          </Link>
        </div>
      </section>
    </>
  );
}
