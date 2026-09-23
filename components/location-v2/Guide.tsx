"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PublicQuoteRequest from "@/components/PublicQuoteRequest";
import { EASE } from "@/components/home-v2/motion";

export type GuideSection = { id: string; title: string; html: string };

const prose =
  "text-[16px] leading-[1.75] text-[#434444] [&_p]:mb-4 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-[#252525] [&_a]:text-[#CC2E2E] [&_a]:underline [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1.5";

/**
 * FAQ accordion for the CMS services copy — answers objections right where a
 * buyer is deciding, and doubles as FAQPage-schema content for Google.
 * No sticky reading-progress rail: this is supporting content, not the main event.
 */
export default function Guide({
  intro,
  sections,
  location,
  countryCode,
}: {
  intro: string;
  sections: GuideSection[];
  location: string;
  countryCode?: string;
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    // Long-form answer text reads best at ~65-75 characters per line — stretching it
    // edge-to-edge to match the card grids in Venues/Builders is the wrong goal and is
    // what kept leaving a "blank" gap next to the text. Instead: a comfortable text
    // column plus one deliberate, labelled watermark for the whole section, together
    // spanning the same full section width as every sibling section.
    <div className="grid gap-x-16 lg:grid-cols-12">
      <div className="lg:col-span-8">
        {intro && <div className={`${prose} mb-9 max-w-2xl text-[17px] leading-[1.7]`} dangerouslySetInnerHTML={{ __html: intro }} />}

        <div className="divide-y divide-[#E4E6E8] border-y border-[#E4E6E8]">
          {sections.map((s, i) => {
            const isOpen = open === i;
            return (
              <div key={s.id} id={s.id}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`${s.id}-panel`}
                  className="flex w-full items-start justify-between gap-6 py-6 text-left"
                >
                  <span className="flex items-start gap-4">
                    <span className="pt-1 text-[11px] font-semibold tabular-nums tracking-[0.2em] text-[#CC2E2E]">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[clamp(1.15rem,2vw,1.4rem)] font-medium leading-snug tracking-[-0.01em] text-[#252525]">{s.title}</span>
                  </span>
                  <span
                    className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-base transition-all duration-300 ${
                      isOpen ? "rotate-45 border-[#E03A3A] bg-[#E03A3A] text-white" : "border-[#252525]/25 text-[#252525]"
                    }`}
                  >
                    +
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`${s.id}-panel`}
                      role="region"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <div className={`${prose} max-w-2xl pb-7 pl-8 md:pl-[2.6rem]`} dangerouslySetInnerHTML={{ __html: s.html }} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="mt-9 flex flex-col items-start gap-4 md:flex-row md:items-center">
          <PublicQuoteRequest
            location={location}
            countryCode={countryCode}
            buttonText="Get matched with a builder →"
            className="h-auto w-full max-w-full whitespace-normal rounded-none border-0 bg-[#252525] px-7 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#E03A3A] md:w-auto"
          />
          <span className="text-sm text-[#5B5C5D]">Free · no obligation · up to 5 quotes</span>
        </div>
      </div>

      {/* Section-scale watermark, not per-row: one bold, clearly-labelled mark reading
          as a deliberate design choice, instead of a faint number lost beside whatever
          the currently open answer's own (unpredictable) height happens to leave blank. */}
      <div aria-hidden className="pointer-events-none relative mt-2 hidden select-none lg:col-span-4 lg:block">
        <div className="sticky top-40 text-right">
          <span className="block text-[clamp(7rem,11vw,12rem)] font-extralight leading-none tracking-[-0.05em] text-[#252525]/[0.08]">
            {String(sections.length).padStart(2, "0")}
          </span>
          <span className="mt-2 block text-[11px] font-semibold uppercase tracking-[0.3em] text-[#252525]/30">Questions answered</span>
        </div>
      </div>
    </div>
  );
}
