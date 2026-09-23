"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiArrowUpRight, FiFacebook, FiInstagram, FiLinkedin, FiTwitter } from "react-icons/fi";
import logoImg from "@/components/logo-standszone.png";
import { getCountryPageUrl } from "@/lib/utils/slugUtils";

type FooterLink = { label: string; href: string };
type FooterColumn = { heading?: string; items?: FooterLink[] };
type FooterData = {
  paragraph?: string;
  contact?: { phone?: string; phoneLink?: string; email?: string; emailLink?: string; address?: string; addressLink?: string };
  columns?: { services?: FooterColumn; locations?: FooterColumn; resources?: FooterColumn };
  bottom?: { copyright?: string; links?: FooterLink[] };
  social?: (FooterLink & { icon?: string })[];
};

const defaults: FooterData = {
  paragraph: "Connect with trusted exhibition stand builders worldwide and make your next trade show booth truly unforgettable.",
  contact: {
    phone: "+1 909-600-0210", phoneLink: "tel:19096000210",
    email: "enquiry@standszone.com", emailLink: "mailto:enquiry@standszone.com",
    address: "72-32 Broadway, Flushing, NY 11372, USA",
  },
  columns: {
    services: { heading: "Services", items: [
      { label: "Custom stand design", href: "/custom-booth" },
      { label: "Stand construction", href: "/booth-rental" },
      { label: "3D visualization", href: "/3d-rendering-and-concept-development" },
      { label: "Installation services", href: "/trade-show-installation-and-dismantle" },
      { label: "Project management", href: "/trade-show-project-management" },
      { label: "Graphics & branding", href: "/trade-show-graphics-printing" },
    ] },
    locations: { heading: "Global locations", items: [
      { label: "United Arab Emirates", href: getCountryPageUrl("United Arab Emirates") },
      { label: "United States", href: getCountryPageUrl("United States") },
      { label: "Germany", href: getCountryPageUrl("Germany") },
      { label: "Italy", href: getCountryPageUrl("Italy") },
      { label: "France", href: getCountryPageUrl("France") },
      { label: "India", href: getCountryPageUrl("India") },
    ] },
    resources: { heading: "Explore", items: [
      { label: "About StandsZone", href: "/about" },
      { label: "Find builders", href: "/builders" },
      { label: "Trade shows", href: "/trade-shows" },
      { label: "Journal", href: "/blog" },
      { label: "Get a quote", href: "/quote" },
    ] },
  },
  bottom: { links: [
    { label: "Privacy", href: "/legal/privacy-policy" },
    { label: "Terms", href: "/legal/terms-of-service" },
    { label: "Cookie policy", href: "/legal/cookie-policy" },
    { label: "Sitemap", href: "/sitemap.xml" },
  ] },
};

const iconByName = {
  linkedin: FiLinkedin, twitter: FiTwitter, instagram: FiInstagram, facebook: FiFacebook,
};

function locationHref(item: FooterLink) {
  const href = item.href?.trim();
  if (!href || href === "#") return getCountryPageUrl(item.label);
  if (/^\/(?:exhibition-stands\/)?[^/?#]+\/?$/.test(href) && !["/exhibition-stands", "/"].includes(href)) {
    const segments = href.split("/").filter(Boolean);
    return getCountryPageUrl(segments[segments.length - 1] || item.label);
  }
  return href;
}

function columnHref(item: FooterLink, fallbackItems: FooterLink[], location: boolean) {
  if (location) return locationHref(item);
  if (item.href && item.href !== "#") return item.href;
  const label = item.label.toLowerCase();
  const known: Record<string, string> = {
    about: "/about", blog: "/blog", quote: "/quote",
    "contact us": "/quote", "global services": "/services",
    "exhibition calendar": "/trade-shows",
  };
  return known[label] || fallbackItems.find((entry) => entry.label.toLowerCase() === label)?.href || "";
}

function Column({ title, items, fallbackItems, location = false }: { title: string; items: FooterLink[]; fallbackItems: FooterLink[]; location?: boolean }) {
  return <div className="min-w-0">
    <h3 className="mb-7 text-[10px] font-semibold uppercase tracking-[0.27em] text-[#EC6A6A]">{title}</h3>
    <ul className="space-y-3.5">
      {items.filter((item) => item?.label).map((item, index) => {
        const href = columnHref(item, fallbackItems, location);
        return <li key={`${item.label}-${index}`}>
          {href && href !== "#" ? <Link href={href} className="group inline-flex items-start gap-2 text-[13px] leading-relaxed text-white/70 transition-colors duration-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EC6A6A]">
            {item.label}<FiArrowUpRight aria-hidden className="mt-0.5 h-3 w-3 shrink-0 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
          </Link> : <span className="text-[13px] leading-relaxed text-white/55">{item.label}</span>}
        </li>;
      })}
    </ul>
  </div>;
}

export default function Footer() {
  const [footerData, setFooterData] = useState<FooterData | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchFooter = () => {
      fetch(`/api/admin/footer?ts=${Date.now()}`, { cache: "no-store" })
        .then((response) => response.json())
        .then((json) => { if (mounted) setFooterData(json?.data || null); })
        .catch(() => {});
    };
    const onVisible = () => { if (document.visibilityState === "visible") fetchFooter(); };
    fetchFooter();
    window.addEventListener("focus", fetchFooter);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("footer:updated", fetchFooter);
    window.addEventListener("global-pages:updated", fetchFooter);
    return () => {
      mounted = false;
      window.removeEventListener("focus", fetchFooter);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("footer:updated", fetchFooter);
      window.removeEventListener("global-pages:updated", fetchFooter);
    };
  }, []);

  const contact = { ...defaults.contact, ...footerData?.contact };
  const columns = footerData?.columns;
  const legalLinks = footerData?.bottom?.links || defaults.bottom?.links || [];
  const socialLinks = (footerData?.social || []).filter((item) => item?.href && item.href !== "#");

  return <footer className="relative overflow-hidden border-t border-white/10 bg-[#141414] text-white">
    <div className="mx-auto max-w-[1400px] px-6 pt-20 md:px-10 md:pt-24">
      <div className="grid gap-10 border-b border-white/15 pb-16 lg:grid-cols-[1fr_auto] lg:items-end lg:pb-20">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#EC6A6A]"><span className="h-px w-9 bg-[#E03A3A]" />Your next exhibition starts here</div>
          <p className="mt-7 max-w-[18ch] text-[clamp(2.4rem,5.5vw,5.5rem)] font-light leading-[0.98] tracking-[-0.045em]">Make your next stand count.</p>
        </div>
        <Link href="/quote" className="group inline-flex min-h-14 items-center justify-between gap-10 bg-[#E03A3A] px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:bg-white hover:text-[#252525] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#EC6A6A]">
          Get free quotes <span aria-hidden className="text-xl leading-none transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Link>
      </div>

      <div className="grid gap-x-10 gap-y-14 py-16 sm:grid-cols-2 lg:grid-cols-[1.45fr_1fr_1fr_1fr] lg:py-20">
        <div className="sm:col-span-2 lg:col-span-1">
          <Link href="/" aria-label="StandsZone home" className="inline-block focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EC6A6A]">
            <Image src={logoImg} alt="StandsZone" width={140} height={48} className="h-auto w-[140px] brightness-0 invert" />
          </Link>
          <p className="mt-7 max-w-xs text-sm font-light leading-relaxed text-white/65">{footerData?.paragraph || defaults.paragraph}</p>
          <div className="mt-9 space-y-3 text-[13px] text-white/75">
            {contact.email && <div><a href={contact.emailLink || `mailto:${contact.email}`} className="break-all transition-colors hover:text-[#EC6A6A]">{contact.email}</a></div>}
            {contact.phone && <div><a href={contact.phoneLink || `tel:${contact.phone.replace(/[^+\d]/g, "")}`} className="transition-colors hover:text-[#EC6A6A]">{contact.phone}</a></div>}
            {contact.address && <div>{contact.addressLink ? <a href={contact.addressLink} className="transition-colors hover:text-[#EC6A6A]">{contact.address}</a> : <span>{contact.address}</span>}</div>}
          </div>
        </div>
        <Column title={columns?.services?.heading || defaults.columns?.services?.heading || "Services"} items={columns?.services?.items || defaults.columns?.services?.items || []} fallbackItems={defaults.columns?.services?.items || []} />
        <Column title={columns?.locations?.heading || defaults.columns?.locations?.heading || "Global locations"} items={columns?.locations?.items || defaults.columns?.locations?.items || []} fallbackItems={defaults.columns?.locations?.items || []} location />
        <Column title={columns?.resources?.heading || defaults.columns?.resources?.heading || "Explore"} items={columns?.resources?.items || defaults.columns?.resources?.items || []} fallbackItems={defaults.columns?.resources?.items || []} />
      </div>

      <div aria-hidden className="overflow-hidden border-t border-white/10 py-6 text-center text-[clamp(4.5rem,14vw,14rem)] font-extrabold leading-none tracking-[-0.05em] bg-gradient-to-b from-white/[0.16] via-[#E03A3A]/[0.14] to-transparent bg-clip-text text-transparent">STANDSZONE</div>
      <div className="flex flex-col gap-6 border-t border-white/15 py-7 text-[11px] text-white/55 md:flex-row md:items-center md:justify-between">
        <span>{footerData?.bottom?.copyright || `© ${new Date().getFullYear()} StandsZone. All rights reserved.`}</span>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {legalLinks.filter((item) => item?.href && item.href !== "#").map((item, index) => <Link key={`${item.label}-${index}`} href={item.href} className="transition-colors hover:text-white">{item.label}</Link>)}
        </div>
        {socialLinks.length > 0 && <div className="flex items-center gap-4">
          {socialLinks.map((social, index) => {
            const Icon = iconByName[social.icon as keyof typeof iconByName] || FiArrowUpRight;
            return <a key={`${social.label}-${index}`} href={social.href} aria-label={social.label} className="flex h-8 w-8 items-center justify-center border border-white/20 text-white/70 transition-colors hover:border-[#E03A3A] hover:bg-[#E03A3A] hover:text-white" target="_blank" rel="noopener noreferrer"><Icon aria-hidden className="h-4 w-4" /></a>;
          })}
        </div>}
      </div>
    </div>
  </footer>;
}
