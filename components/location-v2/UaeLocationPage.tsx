import Link from "next/link";
import { sanitizeHtml } from "@/lib/utils/html";
import { getCountryPageUrl, normalizeCitySlug } from "@/lib/utils/slugUtils";
import { convertToProxyUrl } from "@/lib/utils/imageProxyUtils";
import { isMissingImage } from "@/lib/utils/placeholders";
import HeroSearchFilter from "@/components/HeroSearchFilter";
import PublicQuoteRequest from "@/components/PublicQuoteRequest";
import { Reveal } from "@/components/home-v2/motion";
import { MaskLine, Tag, BannerBackdrop, BannerBreadcrumb } from "./locMotion";
import LocationNav from "./LocationNav";
import FactStrip from "./FactStrip";
import HubsExplorer, { type Hub } from "./HubsExplorer";
import Guide, { type GuideSection } from "./Guide";
import BuilderList from "./BuilderList";
import Gallery from "./Gallery";
import InlineCta from "./InlineCta";
import { BackToTop, MobileCta, ScrollCue, NextLink } from "./PageAids";
import JsonLd from "@/components/JsonLd";
import { getFAQSchema } from "@/lib/seo/structuredData";

const SLUG = "united-arab-emirates";
const NAME = "United Arab Emirates";

// Al Wasl Dome, Expo City Dubai — the UAE's flagship exhibition venue (built for
// Expo 2020, now home to GITEX and dozens of the country's major trade shows).
// Real, geo-tagged photo. Free to use under the Unsplash License.
const BANNER_IMAGE = {
  src: "https://images.unsplash.com/photo-1643904767484-94927c50359b",
  alt: "The golden lattice Al Wasl Dome at Expo City Dubai, the UAE's flagship exhibition venue",
  credit: "Al Wasl Dome, Expo City Dubai — Ahmed Shabana / Unsplash",
};

// Free-to-use Unsplash photos (Unsplash License — no attribution required) per emirate.
// `square` is used while a panel is open, `vertical` while it's collapsed.
const HUB_INFO: Record<string, { venues: string[]; blurb: string; square: string; vertical: string; credit: string }> = {
  dubai: {
    venues: ["DWTC", "Dubai Exhibition Centre", "Expo City"],
    blurb: "The region's busiest show calendar. Overnight builds at DWTC and large-format halls at Expo City are routine for local teams.",
    square: "https://images.unsplash.com/photo-1748373452031-ee1ae4eb624d?auto=format&fit=crop&w=1200&h=1200&q=80",
    vertical: "https://images.unsplash.com/photo-1744407374630-ad33579a5024?auto=format&fit=crop&w=900&h=1500&q=80",
    credit: "Nejc Soklič / Meg von Haartman — Unsplash",
  },
  "abu-dhabi": {
    venues: ["ADNEC"],
    blurb: "Government, energy and defence shows at ADNEC — multi-day set-ups with strict compliance and long lead times.",
    square: "https://images.unsplash.com/photo-1512632578888-169bbbc64f33?auto=format&fit=crop&w=1200&h=1200&q=80",
    vertical: "https://images.unsplash.com/photo-1725979390736-bc77a03ca878?auto=format&fit=crop&w=900&h=1500&q=80",
    credit: "David Rodrigio / Tahmeed Ahmad — Unsplash",
  },
  sharjah: {
    venues: ["Expo Centre Sharjah"],
    blurb: "A cost-efficient base for trade and consumer shows, minutes from Dubai's fabrication yards.",
    square: "https://images.unsplash.com/photo-1643085439638-e8490dbaedae?auto=format&fit=crop&w=1200&h=1200&q=80",
    vertical: "https://images.unsplash.com/photo-1481541211135-1cca64f58554?auto=format&fit=crop&w=900&h=1500&q=80",
    credit: "Ahmed Aldaie / Alisa Olaivar — Unsplash",
  },
};

const VENUES = [
  { name: "Dubai World Trade Centre", city: "Dubai", href: "dubai", note: "Overnight builds and tight load-in windows." },
  { name: "Dubai Exhibition Centre", city: "Dubai", href: "dubai", note: "Expo City's large-format halls." },
  { name: "Expo City Dubai", city: "Dubai", href: "dubai", note: "Purpose-built campus for international events." },
  { name: "Abu Dhabi National Exhibition Centre", city: "Abu Dhabi", href: "abu-dhabi", note: "Multi-day set-ups with strict fire and electrical approvals." },
  { name: "Expo Centre Sharjah", city: "Sharjah", href: "sharjah", note: "Trade and consumer shows close to Dubai's workshops." },
];

const NEARBY = ["Saudi Arabia", "Qatar", "Kuwait", "Oman", "Bahrain"];

const text = (raw: any, fallback = ""): string => {
  if (!raw) return fallback;
  if (typeof raw === "string") return raw;
  if (typeof raw === "object") return raw.description || raw.text || raw.heading || raw.title || fallback;
  return fallback;
};

// Known UAE services-article headings, rephrased as the question a buyer actually
// has. Falls back to the raw CMS title for any heading this doesn't recognise, so
// splitGuide keeps working for content this map wasn't written for.
const QUESTION_MAP: Record<string, string> = {
  "design innovation & custom fabrication": "What can UAE exhibition stand builders actually design and build?",
  "compliance, safety & sustainability": "Are UAE exhibition stands compliant with venue and safety regulations?",
  "project management & logistics support": "Who manages logistics, install and dismantle for my stand?",
};
const asQuestion = (title: string) => QUESTION_MAP[title.trim().toLowerCase()] || title;

/** Split the CMS article into intro + titled sections at each <h2>/<h3>. */
function splitGuide(html: string): { intro: string; sections: GuideSection[] } {
  // Split on the RAW html first: sanitizeHtml's server path mangles <h2>/<h3> tags.
  const raw = html.replace(/\r?\n/g, "<br/>");
  const clean = (h: string) => sanitizeHtml(h.replace(/^(\s|<br\s*\/?>)+|(\s|<br\s*\/?>)+$/gi, ""));
  const parts = raw.split(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/i);
  const sections: GuideSection[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    const title = parts[i].replace(/<[^>]+>/g, "").trim();
    sections.push({ id: `guide-${sections.length + 1}`, title: asQuestion(title), html: clean(parts[i + 1] || "") });
  }
  return { intro: clean(parts[0]), sections };
}

export default function UaeLocationPage({
  builders,
  cities,
  cmsContent,
  totalBuilders,
}: {
  builders: any[];
  cities: any[];
  cmsContent: any;
  mergedContent?: any;
  totalBuilders: number;
}) {
  const block = cmsContent?.sections?.countryPages?.[SLUG] || cmsContent || {};

  // ── Banner copy (CMS H1 stays the H1) ──
  const headingRaw =
    cmsContent?.hero?.title || cmsContent?.hero?.heading || block?.hero?.title || block?.hero?.heading || block?.title || `Exhibition Stand Builders in ${NAME}`;
  const heading = text(headingRaw, `Exhibition Stand Builders in ${NAME}`).trim();
  const m = heading.match(/^(.*?\bin)\s+(.+?)\.?$/i);
  const [line1, line2] = m && /builders?|contractors?|companies|directory/i.test(m[1]) ? [m[1], m[2]] : ["Exhibition stand builders in", NAME];
  const heroDesc =
    text(block?.heroDescription || block?.hero?.description || block?.hero, "") ||
    "Source verified exhibition stand contractors across Dubai, Abu Dhabi and Sharjah.";

  // ── Hubs ──
  const hubs: Hub[] = (cities.length ? cities : [{ name: "Dubai" }, { name: "Abu Dhabi" }, { name: "Sharjah" }]).slice(0, 4).map((c: any) => {
    const slug = normalizeCitySlug(c.name);
    const info = HUB_INFO[slug];
    const cmsImg = (() => { const i = c.image || c.imageUrl || c.photo; return i && !isMissingImage(i) ? convertToProxyUrl(i) : undefined; })();
    return {
      name: c.name,
      href: `/exhibition-stands/${SLUG}/${slug}`,
      builders: c.builderCount || 0,
      venues: info?.venues || ["Local venues"],
      blurb: info?.blurb || `Exhibition stand builders serving ${c.name} venues, from design to dismantle.`,
      // CMS photo (if the city has one) wins for the "open" crop; the curated stock
      // shot is always available as the vertical / collapsed background.
      imageSquare: cmsImg || info?.square,
      imageVertical: info?.vertical || cmsImg,
      credit: info?.credit,
    };
  });

  // ── Guide (CMS services article) ──
  const headingG = text(block?.servicesHeading || cmsContent?.servicesHeading, `Exhibition booth contractors in ${NAME}`);
  const paraG = text(
    block?.servicesParagraph || cmsContent?.servicesParagraph,
    `<p>${NAME} offers exceptional exhibition stand building services with skilled craftsmen and innovative designers.</p>`
  );
  const guide = splitGuide(paraG);

  // ── Gallery (CMS images only; no placeholders) ──
  const gallery: string[] = [];
  const cg = block?.galleryImages || block?.gallery_images;
  if (Array.isArray(cg))
    cg.forEach((it: any) => {
      const s = typeof it === "string" ? it : it?.image || it?.imageUrl || it?.url || it?.src;
      if (s && !isMissingImage(s) && !gallery.includes(s)) gallery.push(convertToProxyUrl(s));
    });

  const finalHeading = text(block?.finalCtaHeading, "Start your world-class exhibition journey");
  const finalPara = text(block?.finalCtaParagraph, `Connect with the best builders in ${NAME} today.`);
  const total = totalBuilders || builders.length;
  const verifiedCount = builders.filter((b: any) => b.verified).length;
  const ratedBuilders = builders.filter((b: any) => Number(b.rating) > 0);
  const avgRating = ratedBuilders.length
    ? (ratedBuilders.reduce((s: number, b: any) => s + Number(b.rating), 0) / ratedBuilders.length).toFixed(1)
    : null;

  const navItems = [
    { id: "overview", label: "Overview" },
    { id: "emirates", label: "Emirates" },
    { id: "venues", label: "Venues" },
    { id: "builders", label: "Builders" },
    { id: "guide", label: "FAQ" },
    { id: "quote", label: "Quote" },
  ];

  const h2 = "mt-4 font-light leading-[1] tracking-[-0.04em] text-[#252525]";

  const faqSchema = guide.sections.length
    ? getFAQSchema(
        guide.sections.map((s) => ({
          question: s.title,
          answer: s.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
        }))
      )
    : null;

  return (
    <div className="bg-white text-[#252525]">
      {faqSchema && <JsonLd data={faqSchema} />}
      <BackToTop />
      <MobileCta location={NAME} countryCode="AE" />
      {/* ── BANNER — exactly one screen (minus the site nav), never taller ── */}
      <section className="relative flex h-[calc(100svh-4rem)] flex-col justify-end bg-[#141414] text-white">
        <BannerBackdrop image={BANNER_IMAGE} />
        <BannerBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Exhibition Stands", href: "/exhibition-stands" }, { label: NAME }]} />
        <div className="relative z-10 mx-auto w-full max-w-[1320px] px-5 pb-6 md:px-8 md:pb-8">
          <div className="mb-[2.2vh] flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#EC6A6A]">
            <span className="h-px w-10 bg-[#E03A3A]" />
            {total}+ verified builders · Free quotes in 24h
          </div>

          <h1 className="font-light leading-[0.95] tracking-[-0.045em]">
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
                <HeroSearchFilter defaultCountrySlug={SLUG} />
              </div>
              <div className="mt-[2.4vh] flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/75 [@media(max-height:720px)]:hidden">
                <span className="mr-2">Jump to</span>
                {hubs.map((h) => (
                  <Link key={h.name} href={h.href} className="border border-white/30 bg-black/20 px-3 py-2 backdrop-blur-sm transition-colors hover:border-[#E03A3A] hover:bg-[#E03A3A] hover:text-white">
                    {h.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Frosted glass card, not a plain divider — guarantees these numbers stay
                legible over the photo regardless of what's behind them, and reads as
                a deliberate, premium hero element in its own right. */}
            <dl className="hidden grid-cols-3 divide-x divide-white/15 rounded-2xl border border-white/15 bg-black/25 px-6 py-5 shadow-[0_8px_40px_rgba(0,0,0,.35)] backdrop-blur-md lg:col-span-4 lg:col-start-9 lg:grid [@media(max-height:720px)]:!hidden">
              {[
                ["Emirates", "7"],
                ["Time zone", "UTC+4"],
                ["Currency", "AED"],
              ].map(([k, v], i) => (
                <div key={k} className={i > 0 ? "pl-6" : undefined}>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/70">{k}</dt>
                  <dd className="mt-2 text-3xl font-extralight tracking-tight">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <ScrollCue target="#overview" />
      </section>

      <LocationNav items={navItems} location={NAME} countryCode="AE" />

      {/* ── OVERVIEW ── */}
      <section id="overview" className="scroll-mt-32 mx-auto max-w-[1320px] px-5 pt-10 md:px-8 md:pt-14">
        <FactStrip
          facts={[
            { value: total, suffix: "+", label: "Vetted builders" },
            { value: hubs.length, label: "Exhibition hubs" },
            { value: VENUES.length, label: "Major venues" },
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

      {/* ── 01 EMIRATES ── */}
      <section id="emirates" className="scroll-mt-32 mx-auto max-w-[1320px] px-5 py-14 md:px-8 md:py-20">
        <div className="mb-8 grid gap-4 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Tag n="01">Exhibition hubs</Tag>
            <h2 className={`${h2} text-[clamp(2rem,4.2vw,3.5rem)]`}>
              Choose your <span className="text-[#CC2E2E]">emirate</span>
            </h2>
          </div>
          <p className="text-[17px] leading-relaxed text-[#5B5C5D] lg:col-span-4 lg:col-start-9">
            Where your show is decides who builds it. Pick a hub to see local builders, venues and lead times.
          </p>
        </div>
        <HubsExplorer hubs={hubs} />
        <InlineCta
          eyebrow="Not sure which emirate?"
          heading="Tell us about your show and we'll point you to the right city."
          body="One quick brief. We match it to builders who already work that venue."
          buttonText="Get matched →"
          location={NAME}
          countryCode="AE"
        />
        <NextLink href="#venues" label="Venues" />
      </section>

      {/* ── 02 VENUES ── */}
      <section id="venues" className="scroll-mt-32 mx-auto max-w-[1320px] px-5 pb-14 md:px-8 md:pb-20">
        <div className="mb-8 border-t border-[#E4E6E8] pt-14">
          <Tag n="02">Venues</Tag>
          <h2 className={`${h2} max-w-[16ch] text-[clamp(2rem,4.2vw,3.5rem)]`}>
            Where you&apos;ll be <span className="text-[#CC2E2E]">building</span>
          </h2>
          <p className="mt-3 text-[15px] text-[#5B5C5D]">Select a venue to see the builders who work there.</p>
        </div>
        <ul className="border-t border-[#252525]">
          {VENUES.map((v, i) => (
            <li key={v.name}>
              <Reveal y={16} delay={i * 0.04}>
                <Link
                  href={`/exhibition-stands/${SLUG}/${v.href}`}
                  className="group grid grid-cols-12 items-center gap-4 border-b border-[#E4E6E8] py-5 transition-colors duration-500 hover:bg-[#F5F6F7] md:px-4"
                >
                  <span className="col-span-2 text-[11px] font-semibold tracking-[0.26em] text-[#CC2E2E] md:col-span-1">{String(i + 1).padStart(2, "0")}</span>
                  <span className="col-span-10 text-2xl font-light tracking-[-0.02em] transition-transform duration-500 group-hover:translate-x-2 md:col-span-5 md:text-3xl">{v.name}</span>
                  <span className="col-span-10 col-start-3 text-[15px] text-[#5B5C5D] md:col-span-4 md:col-start-auto">{v.note}</span>
                  <span className="col-span-10 col-start-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-[#252525] md:col-span-2 md:col-start-auto md:justify-end md:gap-4">
                    {v.city}
                    <span className="text-[#E03A3A] transition-transform duration-500 group-hover:translate-x-1">→</span>
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
        <NextLink href="#builders" label="Builders" />
      </section>

      {/* ── 03 BUILDERS ── */}
      <section id="builders" className="scroll-mt-32 mx-auto max-w-[1320px] px-5 pb-14 md:px-8 md:pb-20">
        <div className="mb-8 flex flex-col justify-between gap-4 border-t border-[#E4E6E8] pt-14 md:flex-row md:items-end">
          <div>
            <Tag n="03">Directory</Tag>
            <h2 className={`${h2} max-w-[18ch] text-[clamp(2rem,4.2vw,3.5rem)]`}>
              Verified builders for the <span className="text-[#CC2E2E]">UAE</span>
            </h2>
          </div>
          <p className="max-w-sm text-[15px] leading-relaxed text-[#5B5C5D]">
            Filter by where the builder is based, open a profile to compare their portfolio, or request a quote straight from the row below.
          </p>
        </div>
        {builders.length > 0 ? (
          <BuilderList builders={builders} country="UAE" />
        ) : (
          <div className="border border-[#E4E6E8] bg-[#F5F6F7] p-14 text-center">
            <h3 className="text-2xl font-light">No builders listed yet</h3>
            <p className="mt-2 text-[#5B5C5D]">We&apos;re expanding the UAE directory. Tell us about your show and we&apos;ll match you manually.</p>
          </div>
        )}
        <InlineCta
          eyebrow="Didn't find the right fit?"
          heading="Get up to 5 quotes from vetted UAE builders instead of scrolling through all of them."
          body="One brief goes to every builder that matches your city, size and budget."
          buttonText="Request quotes →"
          location={NAME}
          countryCode="AE"
        />
        <NextLink href="#guide" label="Common questions" />
      </section>

      {/* ── GALLERY (only with real images) ── */}
      {gallery.length >= 2 && (
        <section className="mx-auto max-w-[1320px] px-5 pb-14 md:px-8 md:pb-20">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#CC2E2E]">Recent UAE stand projects</div>
            <span className="text-sm text-[#5B5C5D]">Tap an image to view it full screen</span>
          </div>
          <Gallery images={gallery.slice(0, 12)} alt="Exhibition stand project in the UAE" />
        </section>
      )}

      {/* ── 04 GUIDE ── */}
      <section id="guide" className="scroll-mt-32 mx-auto max-w-[1320px] px-5 pb-14 md:px-8 md:pb-20">
        <div className="mb-10 max-w-3xl border-t border-[#E4E6E8] pt-14">
          <Tag n="04">Frequently asked</Tag>
          <h2 className={`${h2} text-[clamp(2rem,3.8vw,3.25rem)] leading-[1.02]`}>{headingG}</h2>
          <p className="mt-4 text-[15px] text-[#5B5C5D]">Answers before you request a quote — tap a question to expand it.</p>
        </div>
        <Guide intro={guide.intro} sections={guide.sections} location={NAME} countryCode="AE" />
        <NextLink href="#quote" label="Get quotes" />
      </section>

      {/* ── NEARBY MARKETS ── */}
      <section className="mx-auto max-w-[1320px] px-5 pb-12 md:px-8">
        <div className="flex flex-col gap-5 border-t border-[#E4E6E8] pt-10 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-light tracking-[-0.02em] md:text-3xl">Exhibiting elsewhere in the Gulf?</h2>
          <div className="flex flex-wrap gap-2">
            {NEARBY.map((c) => (
              <Link key={c} href={getCountryPageUrl(c)} className="border border-[#252525]/25 px-5 py-3 text-sm transition-colors hover:border-[#CC2E2E] hover:bg-[#F5F6F7] hover:text-[#CC2E2E]">
                {c}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUOTE ── */}
      <section id="quote" className="scroll-mt-32 mx-auto max-w-[1320px] px-5 pb-14 md:px-8 md:pb-20">
        <div className="relative overflow-hidden bg-[#E9EAEB] px-6 py-10 md:px-14 md:py-14">
          <div aria-hidden className="pointer-events-none absolute -bottom-1/2 -right-1/4 h-[120%] w-[70%] rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,.7),transparent_70%)]" />
          <div className="relative grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <Tag n="05">Get quotes</Tag>
              <h2 className={`${h2} max-w-[16ch] text-[clamp(2.2rem,4.6vw,4rem)] leading-[0.98]`}>{finalHeading}</h2>
              <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-[#434444]">{finalPara}</p>
            </div>
            <div className="flex flex-col gap-3 lg:col-span-4">
              <PublicQuoteRequest
                location={NAME}
                countryCode="AE"
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
