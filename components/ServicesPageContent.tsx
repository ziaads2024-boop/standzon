"use client";

import Link from "next/link";
import { Eyebrow, Reveal, WordReveal } from "@/components/home-v2/motion";

const services = [
  {
    id: 'custom-design',
    title: 'Custom Stand Design',
    description: 'Stands designed from scratch around your brand, products and stand space',
    features: ['3D Visualization', 'Brand Integration', 'Space Optimization', 'Interactive Elements'],
    priceRange: '$200-800/sqm',
    popular: true,
    href: '/custom-booth'
  },
  {
    id: 'construction',
    title: 'Stand Construction',
    description: 'Workshop fabrication and finishing to the approved design and drawings',
    features: ['Quality Materials', 'Expert Craftsmanship', 'On-time Delivery', 'Safety Compliance'],
    priceRange: '$150-600/sqm',
    popular: true,
    href: '/custom-booth'
  },
  {
    id: 'installation',
    title: 'Installation & Dismantling',
    description: 'Complete setup and breakdown services at exhibition venues',
    features: ['Venue Coordination', 'Professional Team', 'Equipment Handling', 'Post-event Cleanup'],
    priceRange: '$50-200/sqm',
    popular: false,
    href: '/trade-show-installation-and-dismantle'
  },
  {
    id: 'project-management',
    title: 'Project Management',
    description: 'End-to-end project coordination and management services',
    features: ['Timeline Management', 'Vendor Coordination', 'Quality Control', 'Budget Management'],
    priceRange: '$100-300/day',
    popular: false,
    href: '/trade-show-project-management'
  },
  {
    id: '3d-visualization',
    title: '3D Visualization',
    description: 'Photorealistic 3D renders and virtual walkthroughs',
    features: ['Photorealistic Renders', 'Virtual Reality', 'Design Iterations', 'Client Presentations'],
    priceRange: '$500-2000/project',
    popular: false,
    href: '/3d-rendering-and-concept-development'
  },
  {
    id: 'graphics-printing',
    title: 'Graphics & Printing',
    description: 'High-quality graphics, signage, and promotional materials',
    features: ['Large Format Printing', 'Digital Graphics', 'Fabric Displays', 'LED Screens'],
    priceRange: '$20-100/sqm',
    popular: false,
    href: '/trade-show-graphics-printing'
  }
];

const benefits = [
  { title: "Global network", description: "Vetted stand builders across 60+ countries, matched to your show" },
  { title: "Fast turnaround", description: "Most quote requests are answered within 24 hours" },
  { title: "Quality assured", description: "Profiles, project history and client feedback are reviewed before listing" },
  { title: "Expert support", description: "A real person to help from first brief through to build day" },
];

const steps = [
  { title: "Submit requirements", description: "Tell us about your exhibition needs and preferences" },
  { title: "Get quotes", description: "Receive competitive quotes from verified builders" },
  { title: "Choose builder", description: "Compare and select the best builder for your project" },
  { title: "Project delivery", description: "Your stand is designed, built, and installed on time" },
];

const pad = (i: number) => String(i + 1).padStart(2, "0");
const h2 = "mt-6 text-[clamp(2rem,4.4vw,4rem)] font-light leading-[1.02] tracking-[-0.04em]";

export default function ServicesPageContent() {
  return (
    <main className="bg-white text-[#252525]">
      <section className="relative overflow-hidden bg-[#141414] px-6 pb-16 pt-32 text-white md:px-10 md:pb-24 md:pt-44">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_70%_40%,black,transparent_70%)]" />
        <div aria-hidden className="pointer-events-none absolute -right-40 top-0 h-[560px] w-[560px] rounded-full bg-[#E03A3A]/25 blur-[140px]" />
        <div className="relative mx-auto max-w-[1400px]">
          <Eyebrow light>Services</Eyebrow>
          <WordReveal as="h1" onLoad text="Exhibition stand services: design, build, graphics & installation" className="mt-8 max-w-5xl text-[clamp(2.25rem,5.6vw,5rem)] font-light leading-[1] tracking-[-0.04em]" />
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-2xl text-base font-light leading-relaxed text-white/70 md:text-lg">
              Everything your trade show stand needs, in one place: custom design, construction, 3D visualisation, graphics &amp; printing, installation &amp; dismantle, and full project management. Get matched with verified builders worldwide and compare quotes in 24 hours.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/quote" className="bg-[#E03A3A] px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-white hover:text-[#252525]">Get free quote</Link>
              <Link href="/builders" className="border border-white/30 px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors hover:border-white">Browse builders</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#F0EDE8] px-6 py-16 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1400px]">
          <Eyebrow>Full-service solutions</Eyebrow>
          <WordReveal text="From concept to carpet" className={h2} />
          <p className="mt-6 max-w-xl text-[#252525]/75">Design, build, graphics, AV, logistics and on-site support for exhibitions in any market.</p>
          <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {services.map((service, i) => (
              <Reveal key={service.id} delay={Math.min(i, 3) * 0.06}>
                <Link href={service.href} className="group relative flex h-full flex-col bg-white p-7 transition-shadow duration-500 hover:shadow-[0_16px_40px_rgba(37,37,37,0.1)] md:p-9">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tabular-nums tracking-[0.2em] text-[#E03A3A]">{pad(i)}</span>
                    {service.popular && <span className="bg-[#E03A3A] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white">Popular</span>}
                  </div>
                  <h3 className="mt-6 text-2xl font-light tracking-tight">{service.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#252525]/70">{service.description}</p>
                  <ul className="mt-6 flex-1 space-y-2">
                    {service.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm text-[#252525]/80">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#E03A3A]" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 flex items-center justify-between border-t border-[#252525]/10 pt-5 text-sm">
                    <span className="text-[#252525]/65">From <span className="font-medium text-[#E03A3A]">{service.priceRange}</span></span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] transition-transform duration-500 group-hover:translate-x-1">Learn more →</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#141414] px-6 py-16 text-white md:px-10 md:py-32">
        <div className="mx-auto max-w-[1400px]">
          <Eyebrow light>Why StandsZone</Eyebrow>
          <WordReveal text="Why exhibitors choose us" className={h2} />
          <p className="mt-6 max-w-xl text-white/70">A single brief gets you matched with vetted builders, then real quotes you can compare side by side.</p>
          <div className="mt-12 grid border-t border-white/20 sm:grid-cols-2 md:mt-16 lg:grid-cols-4">
            {benefits.map((b, i) => (
              <Reveal key={b.title} delay={i * 0.06}>
                <div className="h-full border-b border-white/10 py-8 sm:pr-8 lg:border-b-0 lg:border-r lg:border-white/10 lg:px-8 lg:first:pl-0 lg:last:border-r-0">
                  <div className="text-xs font-semibold tabular-nums tracking-[0.2em] text-[#E03A3A]">{pad(i)}</div>
                  <h3 className="mt-6 text-2xl font-light tracking-tight">{b.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-white/70">{b.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1400px]">
          <Eyebrow>How it works</Eyebrow>
          <WordReveal text="Four steps from brief to build" className={h2} />
          <div className="mt-12 border-t border-[#252525] md:mt-16">
            {steps.map((st, i) => (
              <Reveal key={st.title} y={16} delay={Math.min(i, 4) * 0.04}>
                <div className="grid gap-3 border-b border-[#252525]/10 py-7 md:grid-cols-12 md:items-baseline md:gap-6 md:py-8">
                  <div className="text-xs font-semibold tabular-nums tracking-[0.2em] text-[#E03A3A] md:col-span-1">{pad(i)}</div>
                  <h3 className="text-2xl font-light tracking-tight md:col-span-5 md:text-3xl">{st.title}</h3>
                  <p className="text-[#252525]/75 md:col-span-6">{st.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#E03A3A] px-6 py-16 text-white md:px-10 md:py-28">
        <Reveal className="mx-auto grid max-w-[1400px] gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <h2 className="max-w-[20ch] text-[clamp(2rem,5vw,4.5rem)] font-light leading-[1] tracking-[-0.04em]">Get matched with verified stand builders</h2>
            <p className="mt-5 max-w-xl text-white/90">Send one brief and receive quotes from vetted builders who work at your show.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/quote" className="whitespace-nowrap bg-[#141414] px-8 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors hover:bg-white hover:text-[#252525]">Get free quote</Link>
            <Link href="/builders" className="whitespace-nowrap border border-white/60 px-8 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors hover:bg-white hover:text-[#252525]">Browse builders</Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
