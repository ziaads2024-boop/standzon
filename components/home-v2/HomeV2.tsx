import { getServerPageContent } from "@/lib/data/serverPageContent";
import { getFooterSettings } from "@/lib/data/footerSettings";
import { sanitizeHtml } from "@/lib/utils/html";
import HeroV2 from "./HeroV2";
import ProcessPinned from "./ProcessPinned";
import StatsBand from "./StatsBand";
import LeadsFeed from "./LeadsFeed";
import NetworkV2 from "./NetworkV2";
import ClientsV2 from "./ClientsV2";
import ContactV2 from "./ContactV2";
import FinalCtaV2 from "./FinalCtaV2";
import ScrollChrome from "./ScrollChrome";

const STEPS = [
  { title: "Submit brief", text: "Detail your requirements, brand guidelines and spatial needs." },
  { title: "Get matched", text: "We identify the best-suited local partners for your project." },
  { title: "Compare & choose", text: "Review portfolios, technical quotes and timelines side by side." },
  { title: "Build & install", text: "Professional on-site delivery and dismantling by expert local teams." },
];

const btnsFor = (top: any[], key: string) =>
  top
    .filter((b) => (b.section || "").toLowerCase() === key)
    .map((b) => ({ text: b.text, href: b.link || b.href }));

export default async function HomeV2() {
  const [saved, footerSettings]: [any, any] = await Promise.all([
    getServerPageContent("home"),
    getFooterSettings(),
  ]);
  const s = saved?.sections || {};
  const top: any[] = Array.isArray(saved?.buttons) ? saved.buttons : [];

  const cards: any[] = s.countryPages?.homeInfoCards || [];
  const steps = cards.length ? cards.slice(0, 4).map((c) => ({ title: c.title || "", text: c.text || "" })) : STEPS;

  const rawReviews: any[] = Array.isArray(s.reviews) ? s.reviews : Array.isArray(saved?.reviews) ? saved.reviews : [];
  const quotes = rawReviews
    .filter((r) => r?.text)
    .map((r) => ({ name: r.name || "Client", role: r.role || "", text: r.text }));

  const finalCta = s.finalCta || {};
  const finalBtns = btnsFor(top, "finalcta");
  const leadBtns = btnsFor(top, "readyleads");

  return (
    <>
      <ScrollChrome />
      <HeroV2
        heading={s.hero?.heading || ""}
        description={sanitizeHtml(s.hero?.description || "")}
        bgImage={s.hero?.bgImage || ""}
      />
      <ProcessPinned
        heading={s.leadsIntro?.heading || "Get 3–5 free quotes in 4 steps"}
        paragraph={s.leadsIntro?.paragraph ? sanitizeHtml(s.leadsIntro.paragraph) : undefined}
        steps={steps}
      />
      <StatsBand
        stats={[
          { value: 55, suffix: "+", label: "Countries" },
          { value: 120, suffix: "+", label: "Major cities" },
          { value: 1500, suffix: "+", label: "Expert builders" },
          { value: 8.2, suffix: "k", label: "Completed projects", decimals: 1 },
        ]}
      />
      <LeadsFeed
        ctaHeading={(s.readyLeads?.heading || "").trim() || undefined}
        ctaParagraph={(s.readyLeads?.paragraph || "").trim() || undefined}
        ctaButtons={leadBtns.length ? leadBtns : s.readyLeads?.buttons}
      />
      <NetworkV2 globalPresence={s.globalPresence} moreCountries={s.moreCountries} expandingMarkets={s.expandingMarkets} />
      <ClientsV2 heading={s.clientSay?.heading} quotes={quotes} />
      <ContactV2 initialContact={footerSettings?.contact} />
      <FinalCtaV2
        heading={finalCta.heading}
        paragraph={finalCta.paragraph ? sanitizeHtml(finalCta.paragraph) : undefined}
        buttons={finalBtns.length ? finalBtns : finalCta.buttons}
      />
    </>
  );
}
