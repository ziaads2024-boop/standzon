"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { PageContent as SavedPageContent } from "@/lib/data/storage";
import { Eyebrow, Reveal, WordReveal } from "@/components/home-v2/motion";
import StatsBand from "@/components/home-v2/StatsBand";

const stats = [
  { value: 40, suffix: "+", label: "Countries served" },
  { value: 500, suffix: "+", label: "Verified contractors" },
  { value: 5000, suffix: "+", label: "Successful projects" },
  { value: 4.8, suffix: "/5", label: "Average rating", decimals: 1 },
];

const values = [
  { title: "Trust & Reliability", description: "Every contractor in our network is thoroughly vetted, certified, and continuously monitored to ensure exceptional quality and reliability." },
  { title: "Global Reach", description: "From major trade show destinations to emerging markets, our extensive network ensures you have access to top talent wherever your next exhibition takes place." },
  { title: "Efficiency", description: "Our streamlined platform saves you time and effort by connecting you directly with the right contractors for your specific needs and budget." },
  { title: "Partnership", description: "We don't just connect you with contractors; we build lasting relationships and provide ongoing support throughout your exhibition journey." },
];

const team = [
  { name: "Marcus Weber", role: "Founder & CEO", bio: "15+ years in exhibition industry, former trade show director at major European venues", specialties: ["Business Strategy", "Industry Relations", "Global Expansion"] },
  { name: "Sarah Chen", role: "Head of Operations", bio: "Operations expert with background in international logistics and project management", specialties: ["Operations Management", "Quality Assurance", "Contractor Relations"] },
  { name: "David Rodriguez", role: "Technical Director", bio: "Former exhibition stand designer with deep technical expertise and innovation focus", specialties: ["Technical Standards", "Innovation", "Design Excellence"] },
  { name: "Emma Thompson", role: "Client Success Manager", bio: "Client relationship specialist ensuring exceptional experience throughout the journey", specialties: ["Client Relations", "Support Services", "Success Optimization"] },
];

const process = [
  { step: "1", title: "Submit your requirements", description: "Tell us about your exhibition needs, budget, timeline, and preferences through our simple online form." },
  { step: "2", title: "Receive matched proposals", description: "Get up to 5 customized proposals from pre-vetted contractors who specialize in your industry and location." },
  { step: "3", title: "Compare & choose", description: "Review detailed proposals, portfolios, and ratings to select the perfect partner for your exhibition project." },
  { step: "4", title: "Project success", description: "Work directly with your chosen contractor while we provide ongoing support to ensure project success." },
];

const pad = (i: number) => String(i + 1).padStart(2, "0");

export default function AboutPageContent() {
  const [saved, setSaved] = useState<SavedPageContent | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/pages-editor?action=get-content&path=%2Fabout", { cache: "no-store" });
        const data = await res.json();
        if (data?.success && data?.data) setSaved(data.data);
      } catch {}
    };
    load();
    const handler = (e: Event) => {
      const detail = (e as CustomEvent)?.detail as { pageId?: string; path?: string } | undefined;
      if (!detail?.pageId || detail.pageId === "about" || detail?.path === "/about") load();
    };
    window.addEventListener("global-pages:updated", handler as EventListener);
    return () => window.removeEventListener("global-pages:updated", handler as EventListener);
  }, []);

  const s: any = (saved as any)?.sections || {};

  const bannerDescription = useMemo(() => {
    const html = (saved as any)?.content?.extra?.rawHtml || (saved as any)?.content?.introduction || "";
    if (!html || typeof html !== "string") return "";
    return html
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 220);
  }, [saved]);

  const heroDesc =
    s.hero?.description ||
    bannerDescription ||
    "We connect exhibitors with vetted stand builders worldwide — transparent proposals, local expertise, one platform.";
  const coreValues: any[] = s.coreValues?.length ? s.coreValues : values.map((v) => ({ heading: v.title, paragraph: v.description }));
  const steps: any[] = s.howItWorks?.length ? s.howItWorks : process;
  const members: any[] = s.team?.length ? s.team : team;
  const points: string[] = s.mission?.points || [
    "Thoroughly vetted contractor network",
    "Transparent pricing and proposals",
    "Ongoing project support and guidance",
    "Global coverage with local expertise",
  ];
  const ctaButtons: any[] = s.cta?.buttons || [
    { text: "Get started today", href: "/quote" },
    { text: "Browse builders", href: "/builders" },
  ];

  return (
    <main className="bg-white text-[#252525]">
      {/* Hero */}
      <section className="relative flex min-h-[calc(100svh-112px)] items-center overflow-hidden bg-[#141414] px-6 py-16 text-white md:px-10">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_70%_50%,black,transparent_70%)]" />
        <div aria-hidden className="pointer-events-none absolute -right-40 top-1/2 h-[640px] w-[640px] -translate-y-1/2 rounded-full bg-[#E03A3A]/25 blur-[140px]" />
        <div className="relative mx-auto grid w-full max-w-[1400px] items-center gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Eyebrow light>About StandsZone</Eyebrow>
            <WordReveal
              as="h1"
              onLoad
              text={s.hero?.heading || "Built to make exhibiting effortless"}
              className="mt-8 max-w-4xl text-[clamp(2.5rem,5.6vw,5.25rem)] font-light leading-[1] tracking-[-0.04em]"
            />
            <Reveal delay={0.2}>
              <p className="mt-8 max-w-xl text-base font-light leading-relaxed text-white/70 md:text-lg">{heroDesc}</p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/quote" className="bg-[#E03A3A] px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-white hover:text-[#252525]">Get free quotes</Link>
                <Link href="/builders" className="border border-white/30 px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors hover:border-white">Browse builders</Link>
              </div>
            </Reveal>
          </div>
          <Reveal className="hidden lg:col-span-5 lg:block" delay={0.3}>
            <div className="border border-white/15 bg-white/[0.03] backdrop-blur-sm">
              <div className="border-b border-white/15 px-8 py-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/70">Why exhibitors choose us</div>
              {["Vetted builders in every market", "Side-by-side transparent quotes", "Local teams, one point of contact"].map((t, i) => (
                <div key={t} className="flex items-center gap-5 border-b border-white/10 px-8 py-6 last:border-b-0">
                  <span className="text-xs font-semibold tabular-nums tracking-[0.2em] text-[#E03A3A]">{pad(i)}</span>
                  <span className="text-lg font-light tracking-tight">{t}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <StatsBand stats={stats} />

      {/* Mission */}
      <section className="bg-[#F0EDE8] px-6 py-16 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Eyebrow>Our mission</Eyebrow>
            <WordReveal text={s.mission?.heading || "Removing the guesswork from exhibition stands"} className="mt-6 text-[clamp(2rem,4.4vw,4rem)] font-light leading-[1.02] tracking-[-0.04em]" />
            <Reveal delay={0.1}>
              {s.mission?.paragraph ? (
                <div className="prose mt-8 max-w-xl text-[#252525]/80" dangerouslySetInnerHTML={{ __html: s.mission.paragraph }} />
              ) : (
                <div className="mt-8 max-w-xl space-y-5 text-[#252525]/80">
                  <p>StandsZone was founded with a simple vision: to eliminate the complexity and uncertainty from finding the right exhibition stand builder. Every business deserves access to exceptional exhibition experiences, regardless of size or location.</p>
                  <p>Our platform bridges the gap between exhibitors and top-rated contractors worldwide, ensuring quality, reliability, and success for every project. We're not just a directory — we're your trusted partner in exhibition success.</p>
                </div>
              )}
              <ul className="mt-10 max-w-xl">
                {points.map((pt, i) => (
                  <li key={i} className="flex items-center gap-4 border-t border-[#252525]/10 py-4 last:border-b">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#E03A3A]" />
                    <span dangerouslySetInnerHTML={{ __html: pt }} />
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <Reveal className="lg:col-span-5" delay={0.15}>
            <div className="flex h-full flex-col justify-between bg-[#141414] p-10 text-white md:p-14">
              <div>
                <Eyebrow light>{s.vision?.heading || "Our vision"}</Eyebrow>
                <p className="mt-8 text-2xl font-light leading-snug tracking-[-0.02em] md:text-3xl" dangerouslySetInnerHTML={{ __html: s.vision?.paragraph || "To become the world's most trusted platform for exhibition stand services, empowering businesses to create memorable brand experiences at every trade show." }} />
              </div>
              <div className="mt-14 border-t border-white/15 pt-6">
                <div className="text-5xl font-extralight tracking-[-0.04em]">2019</div>
                <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/70">Founded in Berlin</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="bg-[#141414] px-6 py-16 text-white md:px-10 md:py-32">
        <div className="mx-auto max-w-[1400px]">
          <Eyebrow light>Core values</Eyebrow>
          <WordReveal text="What we stand for" className="mt-6 text-[clamp(2rem,4.4vw,4rem)] font-light leading-[1.02] tracking-[-0.04em]" />
          <div className="mt-12 grid border-t border-white/20 md:mt-16 md:grid-cols-2 lg:grid-cols-4">
            {coreValues.map((v, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div className="h-full border-b border-white/10 py-8 md:pr-8 lg:border-b-0 lg:border-r lg:border-white/10 lg:px-8 lg:first:pl-0 lg:last:border-r-0">
                  <div className="text-xs font-semibold tabular-nums tracking-[0.2em] text-[#E03A3A]">{pad(i)}</div>
                  <h3 className="mt-6 text-2xl font-light tracking-tight">{v.heading || v.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-white/70" dangerouslySetInnerHTML={{ __html: v.paragraph || v.description || "" }} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-white px-6 py-16 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1400px]">
          <Eyebrow>How it works</Eyebrow>
          <WordReveal text="From brief to build in four steps" className="mt-6 max-w-3xl text-[clamp(2rem,4.4vw,4rem)] font-light leading-[1.02] tracking-[-0.04em]" />
          <div className="mt-12 border-t border-[#252525] md:mt-16">
            {steps.map((st, i) => (
              <Reveal key={i} y={16} delay={Math.min(i, 4) * 0.04}>
                <div className="grid gap-4 border-b border-[#252525]/10 py-8 md:grid-cols-12 md:items-baseline">
                  <div className="text-xs font-semibold tabular-nums tracking-[0.2em] text-[#E03A3A] md:col-span-1">{pad(i)}</div>
                  <h3 className="text-2xl font-light tracking-tight md:col-span-5 md:text-3xl">{st.title || st.heading}</h3>
                  <p className="text-[#252525]/75 md:col-span-6" dangerouslySetInnerHTML={{ __html: st.paragraph || st.description || "" }} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-[#F0EDE8] px-6 py-16 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1400px]">
          <Eyebrow>The team</Eyebrow>
          <WordReveal text="Meet our team" className="mt-6 text-[clamp(2rem,4.4vw,4rem)] font-light leading-[1.02] tracking-[-0.04em]" />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 md:mt-16 md:gap-6 lg:grid-cols-4">
            {members.map((m, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div className="group h-full bg-white p-8 transition-shadow duration-500 hover:shadow-[0_16px_40px_rgba(37,37,37,0.08)]">
                  <div className="flex h-16 w-16 items-center justify-center bg-[#141414] text-lg font-light text-white transition-colors duration-500 group-hover:bg-[#E03A3A]">
                    {String(m.name || "").split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  <h3 className="mt-6 text-xl font-medium tracking-tight">{m.name}</h3>
                  <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E03A3A]">{m.role}</div>
                  {m.bio && <p className="mt-4 text-sm leading-relaxed text-[#252525]/75" dangerouslySetInnerHTML={{ __html: m.bio }} />}
                  {Array.isArray(m.specialties) && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {m.specialties.map((sp: string) => (
                        <span key={sp} className="border border-[#252525]/15 px-2.5 py-1 text-[11px] text-[#252525]/70">{sp}</span>
                      ))}
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#E03A3A] px-6 py-16 text-white md:px-10 md:py-32">
        <Reveal className="mx-auto grid max-w-[1400px] gap-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <h2 className="max-w-[18ch] text-[clamp(2.25rem,5vw,4.75rem)] font-light leading-[1] tracking-[-0.04em]">
              {s.cta?.heading || "Ready to transform your exhibition experience?"}
            </h2>
            <p className="mt-6 max-w-xl text-white/90" dangerouslySetInnerHTML={{ __html: s.cta?.paragraph || "Join thousands of satisfied clients who trust StandsZone to connect them with the world's best exhibition stand builders." }} />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {ctaButtons.map((b, i) => (
              <Link
                key={i}
                href={b.href || "#"}
                className={`whitespace-nowrap px-8 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors ${i === 0 ? "bg-[#141414] hover:bg-white hover:text-[#252525]" : "border border-white/60 hover:bg-white hover:text-[#252525]"}`}
              >
                {b.text}
              </Link>
            ))}
          </div>
        </Reveal>
      </section>
    </main>
  );
}
