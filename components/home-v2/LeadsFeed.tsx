import Link from "next/link";
import { getRecentLeads } from "@/lib/data/leadData";
import { Eyebrow, Reveal, WordReveal } from "./motion";

type CtaButton = { text?: string; href?: string };

const statusDot = (s?: string) => {
  switch ((s || "").toLowerCase()) {
    case "active":
    case "open":
      return "bg-emerald-500";
    case "matched":
    case "responded":
      return "bg-sky-500";
    case "negotiation":
      return "bg-amber-500";
    default:
      return "bg-[#252525]/30";
  }
};

export default async function LeadsFeed({
  ctaHeading,
  ctaParagraph,
  ctaButtons,
}: {
  ctaHeading?: string;
  ctaParagraph?: string;
  ctaButtons?: CtaButton[];
}) {
  let leads: any[] = [];
  try {
    leads = await getRecentLeads(8);
  } catch (e) {
    console.warn("Failed to fetch recent leads:", e);
  }
  const fmt = (d: any) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const buttons = ctaButtons?.length
    ? ctaButtons
    : [
        { text: "Join as builder", href: "/builders" },
        { text: "Learn more", href: "/about" },
      ];

  return (
    <section id="leads" className="bg-white px-6 py-24 text-[#252525] md:px-10 md:py-32">
      <div className="mx-auto max-w-[1400px] lg:pr-20">
        <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <Eyebrow>Real-time activity</Eyebrow>
            <WordReveal text="Recent leads & quotes" className="mt-6 text-[clamp(2.25rem,5vw,4.75rem)] font-light leading-[1] tracking-[-0.04em]" />
          </div>
          <Link href="/builders" className="group inline-flex items-center gap-3 border-b border-[#252525] pb-1 text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors hover:border-[#E03A3A] hover:text-[#E03A3A]">
            View live feed <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {leads.length > 0 ? (
          <div className="border-t border-[#252525]">
            <div className="hidden grid-cols-12 gap-4 py-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#252525]/65 md:grid">
              <div className="col-span-5">Event</div>
              <div className="col-span-2">Stand size</div>
              <div className="col-span-2">Budget</div>
              <div className="col-span-1">Date</div>
              <div className="col-span-2 text-right">Status</div>
            </div>
            {leads.slice(0, 8).map((l, i) => (
              <Reveal key={`${l.id}-${i}`} y={16} delay={Math.min(i, 4) * 0.04}>
                <div className="group grid grid-cols-2 gap-x-4 gap-y-2 border-t border-[#252525]/10 py-6 transition-colors duration-500 hover:bg-[#F5F6F7] md:grid-cols-12 md:items-center md:px-0 md:hover:px-4 md:transition-[padding,background-color]">
                  <div className="col-span-2 min-w-0 break-words text-lg font-light tracking-tight md:col-span-5 md:text-2xl">{l.exhibitionName || "Event not specified"}</div>
                  <div className="min-w-0 truncate text-sm text-[#252525]/80 md:col-span-2">{l.standSize || "—"}</div>
                  <div className="min-w-0 truncate text-sm font-medium md:col-span-2">{l.budget || "—"}</div>
                  <div className="min-w-0 truncate text-sm text-[#252525]/65 md:col-span-1">{fmt(l.submittedAt)}</div>
                  <div className="col-span-2 flex min-w-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] md:justify-end">
                    {l.status && (
                      <>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusDot(l.status)}`} />
                        {l.status}
                      </>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
            <div className="border-t border-[#252525]" />
          </div>
        ) : (
          <div className="border-t border-[#252525] py-16 text-[#252525]/65">New briefs appear here as they come in.</div>
        )}

        <Reveal className="mt-24 grid gap-10 bg-[#141414] p-10 text-white md:grid-cols-[1fr_auto] md:items-center md:p-16">
          <div>
            <h3 className="max-w-[20ch] text-3xl font-light leading-[1.05] tracking-[-0.03em] md:text-5xl">
              {ctaHeading || "Ready to access these leads?"}
            </h3>
            <p className="mt-4 max-w-xl text-white/80">
              {ctaParagraph || "Join as a verified builder and start receiving quote requests."}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {buttons.map((b, i) => (
              <Link
                key={i}
                href={b.href || "#"}
                className={`whitespace-nowrap px-8 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors ${
                  i === 0 ? "bg-[#E03A3A] hover:bg-white hover:text-[#252525]" : "border border-white/30 hover:border-white"
                }`}
              >
                {b.text}
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
