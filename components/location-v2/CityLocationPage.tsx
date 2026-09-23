import Link from "next/link";
import { sanitizeHtml } from "@/lib/utils/html";
import { normalizeCitySlug } from "@/lib/utils/slugUtils";
import { convertToProxyUrl } from "@/lib/utils/imageProxyUtils";
import { isMissingImage } from "@/lib/utils/placeholders";
import { getCityBySlug, getCountryBySlug, getCitiesByCountry } from "@/lib/data/globalExhibitionDatabase";
import HeroSearchFilter from "@/components/HeroSearchFilter";
import PublicQuoteRequest from "@/components/PublicQuoteRequest";
import { Reveal } from "@/components/home-v2/motion";
import { MaskLine, Tag, BannerBackdrop, BannerBreadcrumb } from "./locMotion";
import LocationNav from "./LocationNav";
import FactStrip from "./FactStrip";
import Guide, { type GuideSection } from "./Guide";
import BuilderList from "./BuilderList";
import Gallery from "./Gallery";
import InlineCta from "./InlineCta";
import { BackToTop, MobileCta, ScrollCue, NextLink } from "./PageAids";
import JsonLd from "@/components/JsonLd";
import { getFAQSchema } from "@/lib/seo/structuredData";
import { CITY_IMAGES } from "./locationImages";

const text = (raw: any, fallback = ""): string => {
  if (!raw) return fallback;
  if (typeof raw === "string") return raw;
  if (typeof raw === "object") return raw.description || raw.text || raw.heading || raw.title || fallback;
  return fallback;
};

/** Split the CMS article into intro + titled sections at each <h2>/<h3>. Same as
 * CountryLocationPage.tsx — raw CMS heading used as the FAQ question verbatim. */
function splitGuide(html: string): { intro: string; sections: GuideSection[] } {
  const raw = html.replace(/\r?\n/g, "<br/>");
  const clean = (h: string) => sanitizeHtml(h.replace(/^(\s|<br\s*\/?>)+|(\s|<br\s*\/?>)+$/gi, ""));
  const parts = raw.split(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/i);
  const sections: GuideSection[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    const title = parts[i].replace(/<[^>]+>/g, "").trim();
    sections.push({ id: `guide-${sections.length + 1}`, title, html: clean(parts[i + 1] || "") });
  }
  return { intro: clean(parts[0]), sections };
}

export default function CityLocationPage({
  countrySlug,
  countryName,
  citySlug,
  cityName,
  builders,
  cmsContent,
  totalBuilders,
}: {
  countrySlug: string;
  countryName: string;
  citySlug: string;
  cityName: string;
  builders: any[];
  cmsContent: any;
  totalBuilders: number;
}) {
  const richCity = getCityBySlug(countrySlug, citySlug);
  const richCountry = getCountryBySlug(countrySlug);
  const countryCode = richCountry?.code;
  const otherCities = getCitiesByCountry(countrySlug).filter((c) => c.slug !== citySlug);

  const cityKey = `${countrySlug}-${citySlug}`;
  const raw = cmsContent?.sections?.cityPages?.[cityKey];
  const block = raw?.countryPages?.[citySlug] || raw || cmsContent || {};

  // ── Banner copy (CMS H1 stays the H1) ──
  const headingRaw = cmsContent?.hero?.title || cmsContent?.hero?.heading || block?.hero?.title || block?.hero?.heading || block?.title;
  const heading = text(headingRaw, `Exhibition Stand Builders in ${cityName}, ${countryName}`).trim();
  const m = heading.match(/^(.*?\bin)\s+(.+?)\.?$/i);
  const [line1, line2] = m && /builders?|contractors?|companies|directory/i.test(m[1]) ? [m[1], m[2]] : ["Exhibition stand builders in", cityName];
  const heroDesc =
    text(block?.heroDescription || block?.hero?.description || block?.hero, "") ||
    (richCity?.majorVenues?.length
      ? `Source verified exhibition stand contractors for ${richCity.majorVenues.join(", ")}.`
      : `Source verified exhibition stand contractors in ${cityName}.`);

  // ── Venues — real data only; section omitted entirely if there's none ──
  const venues = richCity?.majorVenues || [];

  // ── Guide / FAQ (CMS services article) ──
  const headingG = text(block?.servicesHeading || cmsContent?.servicesHeading, `Exhibition stand contractors in ${cityName}`);
  const paraG = text(
    block?.servicesParagraph || cmsContent?.servicesParagraph,
    `<p>${cityName} offers exceptional exhibition stand building services with skilled craftsmen and innovative designers.</p>`
  );
  const guide = splitGuide(paraG);
  const faqSchema = guide.sections.length
    ? getFAQSchema(guide.sections.map((s) => ({ question: s.title, answer: s.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() })))
    : null;

  // ── Gallery (CMS images only; no placeholders) ──
  const gallery: string[] = [];
  const cg = block?.galleryImages || block?.gallery_images;
  if (Array.isArray(cg))
    cg.forEach((it: any) => {
      const s = typeof it === "string" ? it : it?.image || it?.imageUrl || it?.url || it?.src;
      if (s && !isMissingImage(s) && !gallery.includes(s)) gallery.push(convertToProxyUrl(s));
    });

  const finalHeading = text(block?.finalCtaHeading, `Start your ${cityName} exhibition journey`);
  const finalPara = text(block?.finalCtaParagraph, `Connect with the best exhibition stand builders in ${cityName} today.`);
  const total = totalBuilders || builders.length;
  const verifiedCount = builders.filter((b: any) => b.verified).length;
  const ratedBuilders = builders.filter((b: any) => Number(b.rating) > 0);
  const avgRating = ratedBuilders.length
    ? (ratedBuilders.reduce((s: number, b: any) => s + Number(b.rating), 0) / ratedBuilders.length).toFixed(1)
    : null;

  const hasVenues = venues.length > 0;

  const navItems = [
    { id: "overview", label: "Overview" },
    ...(hasVenues ? [{ id: "venues", label: "Venues" }] : []),
    { id: "builders", label: "Builders" },
    { id: "guide", label: "FAQ" },
    { id: "quote", label: "Quote" },
  ];

  const h2 = "mt-4 font-light leading-[1] tracking-[-0.04em] text-[#252525]";

  return (
    <div className="bg-white text-[#252525]">
      {faqSchema && <JsonLd data={faqSchema} />}
      <BackToTop />
      <MobileCta location={cityName} countryCode={countryCode} />

      {/* ── BANNER — exactly one screen (minus the site nav), never taller ── */}
      <section className="relative flex h-[calc(100svh-4rem)] flex-col justify-end bg-[#141414] text-white">
        {/* Real, license-verified photo where sourced (locationImages.ts, the square
            crop reused full-bleed) — otherwise BannerBackdrop's gradient fallback
            keeps the same premium feel without borrowing another city's skyline. */}
        <BannerBackdrop
          image={(() => {
            const img = CITY_IMAGES[`${countrySlug}/${citySlug}`];
            return img ? { src: img.square.split("?")[0], alt: `${cityName} skyline`, credit: img.credit } : undefined;
          })()}
        />
        <BannerBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Exhibition Stands", href: "/exhibition-stands" },
            { label: countryName, href: `/exhibition-stands/${countrySlug}` },
            { label: cityName },
          ]}
        />
        <div className="relative z-10 mx-auto w-full max-w-[1320px] px-5 pb-6 md:px-8 md:pb-8">
          <div className="mb-[2.2vh] flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#EC6A6A]">
            <span className="h-px w-10 bg-[#E03A3A]" />
            {total}+ verified builders · Free quotes in 24h
          </div>

          <h1 className="mt-3 font-light leading-[0.95] tracking-[-0.045em]">
            <MaskLine onLoad delay={0.1} className="text-[clamp(1.1rem,min(2.6vw,3.6vh),2.4rem)] tracking-[-0.02em] text-white/85">
              {line1}
            </MaskLine>
            <MaskLine onLoad delay={0.22} className="mt-1 text-[clamp(2.2rem,min(7.2vw,12.5vh),7.5rem)]">
              {line2}.
            </MaskLine>
          </h1>

          <div className="mt-[2.4vh] grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="line-clamp-3 max-w-xl text-[16px] leading-relaxed text-white/80 [@media(max-height:680px)]:hidden">{heroDesc}</p>
              <div className="relative z-[100] mt-[2.6vh] [&>div]:mb-0 [&>div]:max-w-none">
                <HeroSearchFilter defaultCountrySlug={countrySlug} defaultCitySlug={citySlug} />
              </div>
              {otherCities.length > 0 && (
                <div className="mt-[2.4vh] flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/75 [@media(max-height:720px)]:hidden">
                  <span className="mr-2">Also serving</span>
                  {otherCities.slice(0, 4).map((c) => (
                    <Link
                      key={c.slug}
                      href={`/exhibition-stands/${countrySlug}/${c.slug}`}
                      className="border border-white/30 bg-black/20 px-3 py-2 backdrop-blur-sm transition-colors hover:border-[#E03A3A] hover:bg-[#E03A3A] hover:text-white"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {richCity && (
              <dl className="hidden grid-cols-3 divide-x divide-white/15 rounded-2xl border border-white/15 bg-black/25 px-6 py-5 shadow-[0_8px_40px_rgba(0,0,0,.35)] backdrop-blur-md lg:col-span-4 lg:col-start-9 lg:grid [@media(max-height:720px)]:!hidden">
                {[
                  ["Venues", String(Math.max(venues.length, 1))],
                  ["Events/yr", `${richCity.annualEvents}+`],
                  ["Currency", richCountry?.currency || "—"],
                ].map(([k, v], i) => (
                  <div key={k} className={i > 0 ? "pl-6" : undefined}>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/70">{k}</dt>
                    <dd className="mt-2 text-2xl font-extralight tracking-tight md:text-3xl">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
        <ScrollCue target="#overview" />
      </section>

      <LocationNav items={navItems} location={cityName} countryCode={countryCode} />

      {/* ── OVERVIEW ── */}
      <section id="overview" className="scroll-mt-32 mx-auto max-w-[1320px] px-5 pt-10 md:px-8 md:pt-14">
        <FactStrip
          facts={[
            { value: total, suffix: "+", label: "Vetted builders" },
            { value: Math.max(venues.length, 1), label: "Major venues" },
            { value: richCity?.annualEvents || 0, suffix: richCity?.annualEvents ? "+" : "", label: "Annual events" },
            { value: 24, suffix: "h", label: "Quote response" },
          ]}
        />
        <div className="flex flex-wrap gap-x-8 gap-y-3 py-6 text-sm text-[#5B5C5D]">
          <span className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1F7A4D]/10 text-[11px] font-bold text-[#1F7A4D]">✓</span>
            {verifiedCount > 0 ? `${verifiedCount} of ${total} builders ID-verified` : "Builders verified before listing"}
          </span>
          {avgRating && (
            <span className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1F7A4D]/10 text-[11px] font-bold text-[#1F7A4D]">✓</span>
              {avgRating}★ average client rating
            </span>
          )}
          <span className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1F7A4D]/10 text-[11px] font-bold text-[#1F7A4D]">✓</span>
            Free, no-obligation quotes
          </span>
        </div>
      </section>

      {/* ── 01 VENUES (only with real venue data) ── */}
      {hasVenues && (
        <section id="venues" className="scroll-mt-32 mx-auto max-w-[1320px] px-5 py-14 md:px-8 md:py-20">
          <div className="mb-8">
            <Tag n="01">Where you&apos;ll be building</Tag>
            <h2 className={`${h2} max-w-[16ch] text-[clamp(2rem,4.2vw,3.5rem)]`}>
              {cityName}&apos;s <span className="text-[#CC2E2E]">exhibition venues</span>
            </h2>
            <p className="mt-3 max-w-xl text-[15px] text-[#5B5C5D]">Select a venue to see builders experienced with its halls and lead times.</p>
          </div>
          <ul className="border-t border-[#252525]">
            {venues.map((v, i) => (
              <li key={v}>
                <Reveal y={16} delay={i * 0.05}>
                  <a
                    href="#builders"
                    className="group grid grid-cols-12 items-center gap-4 border-b border-[#E4E6E8] py-6 transition-colors duration-500 hover:bg-[#F5F6F7] md:px-4"
                  >
                    <span className="col-span-2 text-[11px] font-semibold tracking-[0.26em] text-[#CC2E2E] md:col-span-1">{String(i + 1).padStart(2, "0")}</span>
                    <span className="col-span-10 text-2xl font-light tracking-[-0.02em] transition-transform duration-500 group-hover:translate-x-2 md:col-span-9 md:text-3xl">{v}</span>
                    <span className="col-span-10 col-start-3 flex items-center justify-end text-[#E03A3A] transition-transform duration-500 group-hover:translate-x-1 md:col-span-2 md:col-start-auto">→</span>
                  </a>
                </Reveal>
              </li>
            ))}
          </ul>
          <InlineCta
            eyebrow="Building at a specific venue?"
            heading="Tell us which hall and dates — we'll match builders who already work there."
            body="One quick brief. No obligation."
            buttonText="Get matched →"
            location={cityName}
            countryCode={countryCode}
          />
          <NextLink href="#builders" label="Builders" />
        </section>
      )}

      {/* ── 02 BUILDERS ── */}
      <section id="builders" className={`scroll-mt-32 mx-auto max-w-[1320px] px-5 pb-14 md:px-8 md:pb-20 ${!hasVenues ? "pt-10" : ""}`}>
        <div className={`mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end ${hasVenues ? "border-t border-[#E4E6E8] pt-14" : ""}`}>
          <div>
            <Tag n="02">Directory</Tag>
            <h2 className={`${h2} max-w-[18ch] text-[clamp(2rem,4.2vw,3.5rem)]`}>
              Verified builders in <span className="text-[#CC2E2E]">{cityName}</span>
            </h2>
          </div>
          <p className="max-w-sm text-[15px] leading-relaxed text-[#5B5C5D]">
            Filter by where the builder is based, open a profile to compare their portfolio, or request a quote straight from the row below.
          </p>
        </div>
        {builders.length > 0 ? (
          <BuilderList builders={builders} country={cityName} />
        ) : (
          <div className="border border-[#E4E6E8] bg-[#F5F6F7] p-14 text-center">
            <h3 className="text-2xl font-light">No builders listed yet</h3>
            <p className="mt-2 text-[#5B5C5D]">We&apos;re expanding the {cityName} directory. Tell us about your show and we&apos;ll match you manually.</p>
          </div>
        )}
        <InlineCta
          eyebrow="Didn't find the right fit?"
          heading={`Get up to 5 quotes from vetted ${cityName} builders instead of scrolling through all of them.`}
          body="One brief goes to every builder that matches your venue, size and budget."
          buttonText="Request quotes →"
          location={cityName}
          countryCode={countryCode}
        />
        <NextLink href="#guide" label="Common questions" />
      </section>

      {/* ── GALLERY (only with real images) ── */}
      {gallery.length >= 2 && (
        <section className="mx-auto max-w-[1320px] px-5 pb-14 md:px-8 md:pb-20">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#CC2E2E]">Recent {cityName} stand projects</div>
            <span className="text-sm text-[#5B5C5D]">Tap an image to view it full screen</span>
          </div>
          <Gallery images={gallery.slice(0, 12)} alt={`Exhibition stand project in ${cityName}`} />
        </section>
      )}

      {/* ── 03 FAQ ── */}
      <section id="guide" className="scroll-mt-32 mx-auto max-w-[1320px] px-5 pb-14 md:px-8 md:pb-20">
        <div className="mb-10 max-w-3xl border-t border-[#E4E6E8] pt-14">
          <Tag n="03">Frequently asked</Tag>
          <h2 className={`${h2} text-[clamp(2rem,3.8vw,3.25rem)] leading-[1.02]`}>{headingG}</h2>
          <p className="mt-4 text-[15px] text-[#5B5C5D]">Answers before you request a quote — tap a question to expand it.</p>
        </div>
        <Guide intro={guide.intro} sections={guide.sections} location={cityName} countryCode={countryCode} />
      </section>

      {/* ── OTHER CITIES IN THIS COUNTRY ── */}
      {otherCities.length > 0 && (
        <section className="mx-auto max-w-[1320px] px-5 pb-12 md:px-8">
          <div className="flex flex-col gap-5 border-t border-[#E4E6E8] pt-10 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-light tracking-[-0.02em] md:text-3xl">Exhibiting elsewhere in {countryName}?</h2>
            <div className="flex flex-wrap gap-2">
              {otherCities.map((c) => (
                <Link
                  key={c.slug}
                  href={`/exhibition-stands/${countrySlug}/${c.slug}`}
                  className="border border-[#252525]/25 px-5 py-3 text-sm transition-colors hover:border-[#CC2E2E] hover:bg-[#F5F6F7] hover:text-[#CC2E2E]"
                >
                  {c.name}
                </Link>
              ))}
              <Link
                href={`/exhibition-stands/${countrySlug}`}
                className="bg-[#252525] px-5 py-3 text-sm text-white transition-colors hover:bg-[#E03A3A]"
              >
                All of {countryName} →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── QUOTE ── */}
      <section id="quote" className="scroll-mt-32 mx-auto max-w-[1320px] px-5 pb-14 md:px-8 md:pb-20">
        <div className="relative overflow-hidden bg-[#E9EAEB] px-6 py-10 md:px-14 md:py-14">
          <div aria-hidden className="pointer-events-none absolute -bottom-1/2 -right-1/4 h-[120%] w-[70%] rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,.7),transparent_70%)]" />
          <div className="relative grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <Tag n="04">Get quotes</Tag>
              <h2 className={`${h2} max-w-[16ch] text-[clamp(2.2rem,4.6vw,4rem)] leading-[0.98]`}>{finalHeading}</h2>
              <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-[#434444]">{finalPara}</p>
            </div>
            <div className="flex flex-col gap-3 lg:col-span-4">
              <PublicQuoteRequest
                location={cityName}
                countryCode={countryCode}
                cityName={cityName}
                buttonText="Post a project tender →"
                className="h-auto w-full max-w-full whitespace-normal rounded-none border-0 bg-[#E03A3A] px-8 py-5 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#252525]"
              />
              <a href="#builders" className="border border-[#252525]/30 bg-white/60 px-8 py-5 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-[#252525] transition-colors hover:border-[#252525] hover:bg-white">
                Browse the directory
              </a>
              <p className="mt-2 text-xs text-[#434444]">Free, no account needed · up to 5 quotes within 24 hours</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
