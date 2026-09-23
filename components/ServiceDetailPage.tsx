"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Eyebrow, Reveal, WordReveal } from "@/components/home-v2/motion";

type Stat = { icon: "calendar" | "map-pin" | "users" | "chart-line"; value: string; label: string };
type Item = { heading: string; paragraph: string };
export type ServiceCard = {
  title: string;
  description: string;
  price: string;
  features: string[];
  badge?: string;
  buttonText?: string;
  buttonLink?: string;
};

export interface ServiceDetailContent {
  cmsPath: string;
  /** CMS key map. `section` is the wrapper under `sections`; omit it when the
   *  blocks live directly under `sections` (as the custom-booth row does). */
  cmsKeys: {
    section?: string;
    hero: string;
    whyChoose: string;
    process: string;
    services: string;
    cta: string;
  };
  badge: string;
  heroHeading: string;
  heroHighlight: string;
  heroDescription: string;
  stats: Stat[];
  whyChoose: { heading: string; paragraph: string; features: Item[] };
  process: { heading: string; paragraph: string; steps: Item[] };
  services: { heading: string; paragraph: string; cards: ServiceCard[] };
  cta: { heading: string; paragraph: string; buttons: { text: string; href: string }[] };
}

const pad = (i: number) => String(i + 1).padStart(2, "0");
const h2 = "mt-6 text-[clamp(2rem,4.4vw,4rem)] font-light leading-[1.02] tracking-[-0.04em]";

export default function ServiceDetailPage({ content, initialSaved = null }: { content: ServiceDetailContent; initialSaved?: any }) {
  const [saved, setSaved] = useState<any>(initialSaved);

  useEffect(() => {
    const url = `/api/admin/pages-editor?action=get-content&path=${encodeURIComponent(content.cmsPath)}`;
    const load = async () => {
      try {
        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json();
        if (data?.success && data?.data) setSaved(data.data);
      } catch {
        /* keep defaults */
      }
    };
    const handler = (e: Event) => {
      const id = (e as CustomEvent)?.detail?.pageId;
      if (!id || id === content.cmsPath.replace(/^\//, "")) load();
    };
    window.addEventListener("global-pages:updated", handler as EventListener);
    return () => window.removeEventListener("global-pages:updated", handler as EventListener);
  }, [content.cmsPath]);

  const { cmsKeys } = content;
  const block = (key: keyof typeof cmsKeys) => {
    const k = cmsKeys[key];
    if (!k) return undefined;
    return cmsKeys.section ? saved?.sections?.[cmsKeys.section]?.[k] : saved?.sections?.[k];
  };

  const hero = block("hero") || {};
  const why = block("whyChoose") || {};
  const proc = block("process") || {};
  const svc = block("services") || {};
  const cta = block("cta") || {};

  const features: Item[] = Array.isArray(why.features) && why.features.length ? why.features : content.whyChoose.features;
  const steps: Item[] = Array.isArray(proc.steps) && proc.steps.length ? proc.steps : content.process.steps;
  const cards: ServiceCard[] = Array.isArray(svc.serviceCards) && svc.serviceCards.length ? svc.serviceCards : content.services.cards;
  const ctaButtons = Array.isArray(cta.buttons) && cta.buttons.length
    ? cta.buttons
    : content.cta.buttons;

  return (
    <main className="bg-white text-[#252525]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#141414] px-6 pb-14 pt-32 text-white md:px-10 md:pb-20 md:pt-44">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_70%_40%,black,transparent_70%)]" />
        <div aria-hidden className="pointer-events-none absolute -right-40 top-0 h-[560px] w-[560px] rounded-full bg-[#E03A3A]/25 blur-[140px]" />
        <div className="relative mx-auto max-w-[1400px]">
          <Eyebrow light>{content.badge}</Eyebrow>
          <WordReveal
            as="h1"
            onLoad
            text={`${hero.heading || content.heroHeading} ${content.heroHighlight || ""}`.trim()}
            className="mt-8 max-w-5xl text-[clamp(2.25rem,5.6vw,5rem)] font-light leading-[1] tracking-[-0.04em]"
          />
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-xl text-base font-light leading-relaxed text-white/70 md:text-lg">{hero.description || content.heroDescription}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/quote" className="bg-[#E03A3A] px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-white hover:text-[#252525]">Get free quotes</Link>
              <Link href="/builders" className="border border-white/30 px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors hover:border-white">Browse builders</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/10 bg-[#141414] text-white">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 md:grid-cols-4">
          {content.stats.map((st, i) => (
            <div key={st.label} className={`px-4 py-6 md:px-10 md:py-14 ${i % 2 === 1 ? "border-l border-white/10" : ""} ${i > 0 ? "md:border-l md:border-white/10" : ""} ${i > 1 ? "border-t border-white/10 md:border-t-0" : ""}`}>
              <div className="text-[clamp(1.7rem,5vw,3.5rem)] font-extralight leading-none tracking-[-0.04em]">{st.value}</div>
              <div className="mt-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/80 md:mt-4 md:text-[10px] md:tracking-[0.25em]">{st.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Why choose */}
      <section className="bg-[#F0EDE8] px-6 py-16 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1400px]">
          <Eyebrow>Why choose us</Eyebrow>
          <WordReveal text={why.heading || content.whyChoose.heading} className={h2} />
          <p className="mt-6 max-w-xl text-[#252525]/75">{why.paragraph || content.whyChoose.paragraph}</p>
          <div className="mt-12 grid border-t border-[#252525] sm:grid-cols-2 md:mt-16 lg:grid-cols-4">
            {features.map((feature, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div className="h-full border-b border-[#252525]/15 py-8 sm:pr-8 lg:border-b-0 lg:border-r lg:border-[#252525]/15 lg:px-8 lg:first:pl-0 lg:last:border-r-0">
                  <div className="text-xs font-semibold tabular-nums tracking-[0.2em] text-[#E03A3A]">{pad(i)}</div>
                  <h3 className="mt-6 text-2xl font-light tracking-tight">{feature.heading}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-[#252525]/75">{feature.paragraph}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-[#141414] px-6 py-16 text-white md:px-10 md:py-32">
        <div className="mx-auto max-w-[1400px]">
          <Eyebrow light>Process</Eyebrow>
          <WordReveal text={proc.heading || content.process.heading} className={h2} />
          <p className="mt-6 max-w-xl text-white/70">{proc.paragraph || content.process.paragraph}</p>
          <div className="mt-12 border-t border-white/20 md:mt-16">
            {steps.map((step, i) => (
              <Reveal key={i} y={16} delay={Math.min(i, 4) * 0.04}>
                <div className="grid gap-3 border-b border-white/10 py-7 md:grid-cols-12 md:items-baseline md:gap-6 md:py-8">
                  <div className="text-xs font-semibold tabular-nums tracking-[0.2em] text-[#E03A3A] md:col-span-1">{pad(i)}</div>
                  <h3 className="text-2xl font-light tracking-tight md:col-span-5 md:text-3xl">{step.heading}</h3>
                  <p className="text-white/70 md:col-span-6">{step.paragraph}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="bg-white px-6 py-16 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1400px]">
          <Eyebrow>Packages</Eyebrow>
          <WordReveal text={svc.heading || content.services.heading} className={h2} />
          <p className="mt-6 max-w-xl text-[#252525]/75">{svc.paragraph || content.services.paragraph}</p>
          <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {cards.map((card, i) => (
              <Reveal key={i} delay={Math.min(i, 3) * 0.06}>
                <div className="group relative flex h-full flex-col border border-[#252525]/15 bg-white p-7 transition-colors duration-500 hover:border-[#E03A3A] md:p-9">
                  {card.badge && <span className="absolute right-5 top-5 bg-[#E03A3A] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white">{card.badge}</span>}
                  <h3 className="pr-16 text-2xl font-light tracking-tight">{card.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#252525]/70">{card.description}</p>
                  <div className="mt-6 flex items-baseline justify-between border-y border-[#252525]/10 py-4">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#252525]/65">Starting from</span>
                    <span className="text-lg font-medium text-[#E03A3A]">{card.price}</span>
                  </div>
                  <ul className="mt-6 flex-1 space-y-3">
                    {(card.features || []).map((f, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-[#252525]/80">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E03A3A]" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={card.buttonLink || "/quote"} className="mt-8 flex items-center justify-between bg-[#141414] px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#E03A3A]">
                    {card.buttonText || "Get a quote"}
                    <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#E03A3A] px-6 py-16 text-white md:px-10 md:py-28">
        <Reveal className="mx-auto grid max-w-[1400px] gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <h2 className="max-w-[20ch] text-[clamp(2rem,5vw,4.5rem)] font-light leading-[1] tracking-[-0.04em]">{cta.heading || content.cta.heading}</h2>
            <p className="mt-5 max-w-xl text-white/90">{cta.paragraph || content.cta.paragraph}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {ctaButtons.map((b: any, i: number) => (
              <Link key={i} href={b.href || "/quote"} className={`whitespace-nowrap px-8 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors ${i === 0 ? "bg-[#141414] hover:bg-white hover:text-[#252525]" : "border border-white/60 hover:bg-white hover:text-[#252525]"}`}>
                {b.text || "Get started"}
              </Link>
            ))}
          </div>
        </Reveal>
      </section>
    </main>
  );
}
