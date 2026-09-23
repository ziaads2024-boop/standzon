"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { convertToProxyUrl } from "@/lib/utils/imageProxyUtils";
import { isMissingImage } from "@/lib/utils/placeholders";
import { EASE } from "@/components/home-v2/motion";


type Cand = { src: string; kind: "photo" | "logo" };

/** Portfolio photo → company logo → monogram tile. Falls through on load errors too. */
function BuilderThumb({ b }: { b: any }) {
  const first = b.portfolio?.[0];
  const photo = first?.image || first?.imageUrl || (typeof first === "string" ? first : null);
  const logo = b.logo || b.profile_image || b.image_url;
  const cands: Cand[] = [];
  if (photo && !isMissingImage(photo)) cands.push({ src: convertToProxyUrl(photo), kind: "photo" });
  if (logo && typeof logo === "string" && !isMissingImage(logo) && !logo.includes("default-logo")) cands.push({ src: convertToProxyUrl(logo), kind: "logo" });
  const [i, setI] = useState(0);
  const cur = cands[i];
  const initials = (b.companyName || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

  if (!cur) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#E9EAEB] to-[#F5F6F7]">
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[#CC2E2E]/25 bg-white text-xl font-light tracking-wide text-[#CC2E2E]">{initials}</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5B5C5D]">Portfolio coming soon</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={cur.src}
      src={cur.src}
      alt={`${b.companyName} ${cur.kind === "logo" ? "logo" : "exhibition stand project"}`}
      loading="lazy"
      onError={() => setI((n) => n + 1)}
      className={cur.kind === "logo" ? "h-full w-full bg-white object-contain p-6" : "h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"}
    />
  );
}

export default function BuilderList({ builders, country, initial = 5, step = 5 }: { builders: any[]; country: string; initial?: number; step?: number }) {
  const [n, setN] = useState(initial);
  const [filter, setFilter] = useState<"all" | "local" | "intl">("all");
  const isLocal = (b: any) => {
    const c = (b.headquarters?.country || "").toLowerCase();
    return c.includes("emirates") || c === "uae";
  };
  const counts = { all: builders.length, local: builders.filter(isLocal).length, intl: builders.filter((b) => !isLocal(b)).length };
  const list = builders.filter((b) => (filter === "all" ? true : filter === "local" ? isLocal(b) : !isLocal(b)));
  const chips: { id: "all" | "local" | "intl"; label: string }[] = [
    { id: "all", label: "All builders" },
    { id: "local", label: "Based in UAE" },
    { id: "intl", label: "International" },
  ];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-2" role="tablist" aria-label="Filter builders">
        <span className="mr-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5B5C5D]">Filter</span>
        {chips.map((c) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={filter === c.id}
            onClick={() => { setFilter(c.id); setN(initial); }}
            className={`border px-4 py-2 text-[12px] font-medium transition-colors ${
              filter === c.id ? "border-[#252525] bg-[#252525] text-white" : "border-[#252525]/25 text-[#252525] hover:border-[#E03A3A] hover:text-[#E03A3A]"
            }`}
          >
            {c.label} <span className={filter === c.id ? "text-white/70" : "text-[#5B5C5D]"}>({counts[c.id]})</span>
          </button>
        ))}
      </div>
      <ul className="border-t border-[#252525]">
        <AnimatePresence initial={false}>
          {list.slice(0, n).map((b, i) => {
            const hq = b.headquarters?.city || "";
            const hqCountry = b.headquarters?.country || "";
            const local = hqCountry.toLowerCase().includes("emirates") || hqCountry.toLowerCase() === "uae";
            const rating = Number(b.rating) > 0 ? Number(b.rating).toFixed(1) : null;
            return (
              <motion.li
                key={`${filter}-${b.id || b.slug || i}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: (i % step) * 0.05, ease: EASE }}
                className="group grid gap-6 border-b border-[#E4E6E8] py-5 transition-colors hover:bg-[#F5F6F7] md:grid-cols-[220px_1fr_auto] md:items-center md:gap-10 md:px-4"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#E9EAEB]">
                  <BuilderThumb b={b} />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
                    {b.verified && <span className="text-[#1F7A4D]">● Verified</span>}
                    {b.premiumMember && <span className="text-[#8A6A2F]">Recommended</span>}
                    <span className="text-[#5B5C5D]">
                      {local ? "Based in UAE" : `HQ ${hq}${hqCountry ? `, ${hqCountry}` : ""} · serves ${country}`}
                    </span>
                  </div>
                  <h3 className="mt-2 text-2xl font-light leading-tight tracking-[-0.02em] text-[#252525] md:text-[1.75rem]">{b.companyName}</h3>
                  {b.companyDescription && (
                    <p className="mt-3 line-clamp-2 max-w-2xl text-[15px] leading-relaxed text-[#5B5C5D]">{b.companyDescription}</p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-[#5B5C5D]">
                    {rating && <b className="font-medium text-[#252525]">★ {rating}</b>}
                    <span><b className="font-medium text-[#252525]">{b.projectsCompleted > 0 ? `${b.projectsCompleted.toLocaleString()}+` : "New"}</b> projects</span>
                    <span>Responds <b className="font-medium text-[#252525]">{b.responseTime}</b></span>
                  </div>
                </div>

                <div className="flex gap-3 md:flex-col">
                  <Link href={`/builders/${b.slug || b.id}`} className="flex-1 bg-[#252525] px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#E03A3A]">
                    View profile
                  </Link>
                  <a href="#quote" className="flex-1 border border-[#252525]/25 px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#252525] transition-colors hover:border-[#E03A3A] hover:text-[#E03A3A]">
                    Request quote
                  </a>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      <div className="mt-6 flex flex-col items-center gap-3">
        {n < list.length && (
          <button onClick={() => setN((v) => v + step)} className="border border-[#252525] px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#252525] transition-colors hover:bg-[#252525] hover:text-white">
            Show more builders
          </button>
        )}
        <p className="text-xs text-[#5B5C5D]">Showing {Math.min(n, list.length)} of {list.length}</p>
      </div>
    </div>
  );
}
