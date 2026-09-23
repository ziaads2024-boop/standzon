'use client';

import React from 'react';
import { Eyebrow, Reveal } from '@/components/home-v2/motion';

type ContentOverrides = {
  heroTagline?: string;
  aboutTitle?: string;
  strengthsTitle?: string;
  establishedTitle?: string;
  specializationsTitle?: string;
  locationsTitle?: string;
  locationsSubtitle?: string;
  portfolioTitle?: string;
  portfolioSubtitle?: string;
  ctaRequestQuote?: string;
  ctaRequestPortfolio?: string;
};

interface BuilderProfileTemplateProps {
  builder: any;
  isGmbImported: boolean;
  displayServices: any[];
  onOpenQuote: () => void;
  content?: ContentOverrides;
}

const h2 = 'mt-6 text-[clamp(1.8rem,3.6vw,3rem)] font-light leading-[1.05] tracking-[-0.03em]';
const btnRed = 'w-full bg-[#E03A3A] px-8 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-[#141414]';

export default function BuilderProfileTemplate({ builder, isGmbImported, displayServices, onOpenQuote, content }: BuilderProfileTemplateProps) {
  const c = {
    heroTagline: content?.heroTagline || builder.companyDescription,
    aboutTitle: content?.aboutTitle || 'Company information',
    strengthsTitle: content?.strengthsTitle || 'Key strengths',
    locationsTitle: content?.locationsTitle || 'Service locations',
    locationsSubtitle: content?.locationsSubtitle || `Countries and cities where ${builder.companyName} provides services`,
    portfolioTitle: content?.portfolioTitle || 'Portfolio gallery',
    portfolioSubtitle: content?.portfolioSubtitle || `Request a quote to view ${builder.companyName}'s complete portfolio and project gallery.`,
    ctaRequestQuote: content?.ctaRequestQuote || 'Request quote',
    ctaRequestPortfolio: content?.ctaRequestPortfolio || 'Request portfolio access',
  };
  const hasLogo = builder.logo && builder.logo !== '/images/builders/default-logo.png';
  const facts = [
    { k: 'Established', v: builder.establishedYear },
    builder.teamSize > 0 && { k: 'Team size', v: `${builder.teamSize} employees` },
    builder.projectsCompleted > 0 && { k: 'Projects completed', v: builder.projectsCompleted },
    { k: 'Response time', v: builder.responseTime },
  ].filter(Boolean) as { k: string; v: any }[];
  const location = `${builder.headquarters.city}, ${builder.headquarters.country}`;

  return (
    <main className="bg-white text-[#252525]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#141414] px-6 pb-14 pt-32 text-white md:px-10 md:pb-20 md:pt-40">
        <div aria-hidden className="pointer-events-none absolute -right-40 top-0 h-[520px] w-[520px] rounded-full bg-[#E03A3A]/25 blur-[140px]" />
        <div className="relative mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <Eyebrow light>Builder profile</Eyebrow>
            <div className="mt-8 flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden border border-white/20 bg-white/10 md:h-20 md:w-20">
                {hasLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={builder.logo} alt={builder.companyName} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-light">{String(builder.companyName || '?')[0]}</span>
                )}
              </div>
              <h1 className="min-w-0 break-words text-[clamp(1.9rem,4.6vw,4rem)] font-light leading-[1.02] tracking-[-0.04em]">{builder.companyName}</h1>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/75">
              <span>{location}</span>
              <span className="text-[#EC6A6A]">★ {builder.rating} <span className="text-white/65">({builder.reviewCount} reviews)</span></span>
            </div>
            <p className="mt-6 max-w-2xl text-base font-light leading-relaxed text-white/75 md:text-lg">{c.heroTagline}</p>
            <div className="mt-8 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.18em]">
              {builder.verified && <span className="bg-[#E03A3A] px-3 py-2">Verified builder</span>}
              {isGmbImported && !builder.verified && <span className="border border-white/30 px-3 py-2">Imported listing</span>}
              <span className="border border-white/30 px-3 py-2">{builder.projectsCompleted} projects</span>
              <span className="border border-white/30 px-3 py-2">{builder.responseTime}</span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="border border-white/15 bg-white/[0.04] p-7 backdrop-blur-sm md:p-9">
              <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#EC6A6A]">Get free quote</div>
              <p className="mt-3 text-sm text-white/70">Connect with verified exhibition stand builders in {location}.</p>
              <dl className="mt-6 divide-y divide-white/10 border-y border-white/10 text-sm">
                <div className="flex justify-between py-3"><dt className="text-white/65">Response time</dt><dd>{builder.responseTime}</dd></div>
                <div className="flex justify-between py-3"><dt className="text-white/65">Projects completed</dt><dd>{builder.projectsCompleted}</dd></div>
                <div className="flex justify-between py-3"><dt className="text-white/65">Average rating</dt><dd>{builder.rating}/5</dd></div>
              </dl>
              <button onClick={onOpenQuote} className={`${btnRed} mt-6`}>{c.ctaRequestQuote}</button>
              <p className="mt-4 text-xs text-white/60">Your request goes to verified builders in this location — multiple builders will respond with quotes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section id="overview" className="bg-[#F0EDE8] px-6 py-16 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Eyebrow>{c.aboutTitle}</Eyebrow>
            <h2 className={h2}>About {builder.companyName}</h2>
            <p className="mt-8 max-w-2xl whitespace-pre-line leading-relaxed text-[#252525]/80">{builder.companyDescription}</p>
            {builder.keyStrengths?.length > 0 && (
              <div className="mt-10 max-w-2xl">
                <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#252525]/65">{c.strengthsTitle}</div>
                <ul className="mt-3 border-t border-[#252525]/15">
                  {builder.keyStrengths.map((s: string, i: number) => (
                    <li key={i} className="flex items-center gap-4 border-b border-[#252525]/10 py-3">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#E03A3A]" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <Reveal className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-px bg-[#252525]/15">
              {facts.map((f) => (
                <div key={f.k} className="bg-white p-6">
                  <div className="text-2xl font-light tracking-tight">{f.v}</div>
                  <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#252525]/65">{f.k}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Services */}
      {displayServices?.length > 0 && (
        <section id="services" className="bg-[#141414] px-6 py-16 text-white md:px-10 md:py-28">
          <div className="mx-auto max-w-[1400px]">
            <Eyebrow light>Services</Eyebrow>
            <h2 className={h2}>What {builder.companyName} offers</h2>
            <div className="mt-12 grid gap-px border border-white/15 bg-white/15 md:grid-cols-2 lg:grid-cols-3">
              {displayServices.map((service: any, i: number) => (
                <div key={i} className="bg-[#141414] p-7 md:p-8">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-xl font-light tracking-tight">{service.name}</h3>
                    {service.autoAssigned && <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#EC6A6A]">Available</span>}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">{service.description}</p>
                  {service.priceFrom ? (
                    <div className="mt-5 text-sm text-white/75">From <span className="text-[#EC6A6A]">${service.priceFrom}</span>{service.unit && ` ${service.unit}`}</div>
                  ) : null}
                  {service.turnoverTime && <div className="mt-1 text-xs text-white/60">Typical delivery: {service.turnoverTime}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Portfolio */}
      <section id="portfolio" className="bg-white px-6 py-16 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1400px]">
          <Eyebrow>Portfolio</Eyebrow>
          <h2 className={h2}>{c.portfolioTitle}</h2>
          {builder.portfolio?.length > 0 ? (
            <div className="mt-12 grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {builder.portfolio.map((project: any, i: number) => (
                <Reveal key={i} delay={Math.min(i, 3) * 0.05}>
                  <div className="group h-full border border-[#252525]/10 bg-white transition-colors duration-500 hover:border-[#E03A3A]">
                    <div className="aspect-video overflow-hidden bg-[#F0EDE8]">
                      {project.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={project.imageUrl} alt={project.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-[#252525]/40">No image</div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-light tracking-tight">{project.title}</h3>
                      {project.description && <p className="mt-2 line-clamp-2 text-sm text-[#252525]/70">{project.description}</p>}
                      <div className="mt-4 flex justify-between text-xs text-[#252525]/65">
                        <span>{[project.projectYear, project.tradeShow].filter(Boolean).join(' · ')}</span>
                        {project.standSize > 0 && <span>{project.standSize} sqm</span>}
                      </div>
                      {project.client && <div className="mt-1 text-xs text-[#252525]/65">Client: {project.client}</div>}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="mt-10 max-w-xl border border-dashed border-[#252525]/25 p-8">
              <p className="text-[#252525]/75">{c.portfolioSubtitle}</p>
              <button onClick={onOpenQuote} className="mt-6 bg-[#141414] px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-[#E03A3A]">{c.ctaRequestPortfolio}</button>
            </div>
          )}
        </div>
      </section>

      {/* Locations + reviews */}
      <section id="locations" className="bg-[#F0EDE8] px-6 py-16 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Eyebrow>Locations</Eyebrow>
            <h2 className={h2}>{c.locationsTitle}</h2>
            <p className="mt-4 max-w-xl text-[#252525]/70">{c.locationsSubtitle}</p>
            <div className="mt-8 border-t border-[#252525]">
              {builder.serviceLocations.map((loc: any, i: number) => (
                <div key={i} className="grid gap-1 border-b border-[#252525]/10 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-6">
                  <div className="font-medium">{loc.country}</div>
                  <div className="text-sm text-[#252525]/70">{loc.cities?.join(', ')}</div>
                </div>
              ))}
            </div>
          </div>
          <div id="reviews" className="lg:col-span-5">
            <Eyebrow>Reviews</Eyebrow>
            <div className="mt-8 bg-white p-8">
              <div className="text-5xl font-extralight tracking-[-0.04em]">{builder.rating}<span className="text-2xl text-[#252525]/50">/5</span></div>
              <div className="mt-3 text-[#E03A3A]" aria-hidden>{[1, 2, 3, 4, 5].map((s) => (s <= Math.round(builder.rating) ? '★' : '☆')).join(' ')}</div>
              <div className="mt-2 text-sm text-[#252525]/65">{builder.reviewCount} reviews</div>
              <button onClick={onOpenQuote} className={`${btnRed} mt-8`}>{c.ctaRequestQuote}</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
