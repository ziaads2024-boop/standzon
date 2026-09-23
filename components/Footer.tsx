
"use client";

import React from 'react';
import Image from 'next/image';
import logoImg from '@/components/logo-standszone.png';
import { FiPhone, FiMail, FiMapPin, FiLinkedin, FiTwitter, FiInstagram, FiFacebook, FiExternalLink } from 'react-icons/fi';

export default function Footer() {
  // Fallback data if settings are not loaded yet
  const fallbackData = {
    companyName: "StandsZone",
    contact: {
      phone: "+1 (555) 123-4567",
      email: "hello@standszone.com",
      address: "123 Exhibition Ave, NYC"
    },
    social: {
      linkedin: "#",
      twitter: "#",
      instagram: "#",
      facebook: "#"
    },
    pages: {
      footerText: "The definitive global network for professional exhibition stand construction and management."
    }
  };

  // Fetch CMS footer settings from API (client-side)
  const [footerData, setFooterData] = React.useState<any | null>(null);
  React.useEffect(() => {
    let mounted = true;
    const fetchFooter = () => {
      const url = `/api/admin/footer?ts=${Date.now()}`;
      fetch(url, { cache: 'no-store' })
        .then(r => r.json())
        .then(json => { if (mounted) setFooterData(json?.data || null); })
        .catch(() => { });
    };
    fetchFooter();
    const onFocus = () => fetchFooter();
    const onVisible = () => { if (document.visibilityState === 'visible') fetchFooter(); };
    const onFooterUpdated = () => fetchFooter();
    const onGlobalPagesUpdated = () => fetchFooter();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('footer:updated', onFooterUpdated as EventListener);
    window.addEventListener('global-pages:updated', onGlobalPagesUpdated as EventListener);
    return () => {
      mounted = false;
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('footer:updated', onFooterUpdated as EventListener);
      window.removeEventListener('global-pages:updated', onGlobalPagesUpdated as EventListener);
    };
  }, []);

  const siteData = fallbackData;

  const services = footerData?.columns?.services?.items || [
    { label: "Custom Stand Design", href: "#" },
    { label: "Build & Installation", href: "#" },
    { label: "Global Services", href: "#" },
    { label: "Event Management", href: "#" },
    { label: "Marketing Integration", href: "#" },
    { label: "Premium Experiences", href: "#" }
  ];

  const locations = footerData?.columns?.locations?.items || [
    { label: "United States", href: "#" },
    { label: "Germany", href: "#" },
    { label: "United Kingdom", href: "#" },
    { label: "UAE", href: "#" },
    { label: "China", href: "#" },
    { label: "Singapore", href: "#" }
  ];

  const resources = footerData?.columns?.resources?.items || [
    { label: "Portfolio", href: "#" },
    { label: "Case Studies", href: "#" },
    { label: "Industry Insights", href: "#" },
    { label: "Exhibition Calendar", href: "#" },
    { label: "Design Trends", href: "#" },
    { label: "Contact Us", href: "#" }
  ];

  const socialLinks = [
    { icon: FiLinkedin, href: siteData.social?.linkedin || fallbackData.social.linkedin, label: "LinkedIn" },
    { icon: FiTwitter, href: siteData.social?.twitter || fallbackData.social.twitter, label: "Twitter" },
    { icon: FiInstagram, href: siteData.social?.instagram || fallbackData.social.instagram, label: "Instagram" },
    { icon: FiFacebook, href: siteData.social?.facebook || fallbackData.social.facebook, label: "Facebook" }
  ];

  return (
    <footer className="bg-[#252525] text-white pt-20 pb-10 px-6 border-t border-white/5 w-full">
      <div className="max-w-7xl mx-auto">
        {/* Main columns */}
        {/*
          Explicit calc() percentage tracks, not `grid-cols-N` (minmax(0,1fr)):
          with this column's real content (a long address + a 7-country list),
          `1fr` tracks resolved unevenly — one column claimed ~300px, its
          sibling was squeezed to ~0–86px and its links stopped wrapping. `fr`
          distributes space based on each track's content, so asymmetric
          content produces asymmetric columns even with minmax(0, 1fr).
          Percentage tracks alone fixed the unevenness but then overflowed by
          the gap itself (2×50% + gap-12 > 100%; 4×25% + 3×gap-12 > 100%,
          since raw percentages don't subtract `gap` the way `fr` does) — each
          track's calc() below subtracts its share of the total gap.
        */}
        <div className="grid grid-cols-[calc(50%-1.5rem)_calc(50%-1.5rem)] gap-12 mb-20 md:grid-cols-[calc(25%-2.25rem)_calc(25%-2.25rem)_calc(25%-2.25rem)_calc(25%-2.25rem)]">
          {/* Company Info */}
          <div className="col-span-2 min-w-0 md:col-span-1">
            <div className="flex items-center gap-2 mb-8">
              <Image src={logoImg} alt="StandsZone" width={120} height={36} className="h-8 w-auto brightness-0 invert" style={{ height: 'auto' }} priority />
            </div>
            <p className="text-xs leading-loose uppercase tracking-widest text-white mb-6">
              {footerData?.paragraph || siteData.pages?.footerText || fallbackData.pages.footerText}
            </p>

            {/* Contact info */}
            <div className="space-y-3">
              <div className="flex min-w-0 items-center gap-3">
                <FiPhone className="w-3 h-3 text-white flex-shrink-0" />
                {footerData?.contact?.phoneLink ? (
                  <a href={footerData.contact.phoneLink} className="flex min-w-0 items-center whitespace-normal break-words text-xs font-bold uppercase tracking-widest text-white transition-colors hover:text-[#CC2E2E]">
                    {footerData.contact.phone}
                    <FiExternalLink className="w-3 h-3 ml-1 opacity-90 flex-shrink-0" />
                  </a>
                ) : (
                  <span className="text-xs font-bold uppercase tracking-widest">{footerData?.contact?.phone || siteData.contact?.phone || fallbackData.contact.phone}</span>
                )}
              </div>
              <div className="flex min-w-0 items-center gap-3">
                <FiMail className="w-3 h-3 text-white flex-shrink-0" />
                {footerData?.contact?.emailLink ? (
                  <a href={footerData.contact.emailLink} className="flex min-w-0 items-center whitespace-normal break-words text-xs font-bold uppercase tracking-widest text-white transition-colors hover:text-[#CC2E2E]">
                    {footerData.contact.email}
                    <FiExternalLink className="w-3 h-3 ml-1 opacity-90 flex-shrink-0" />
                  </a>
                ) : (
                  <span className="text-xs font-bold uppercase tracking-widest">{footerData?.contact?.email || siteData.contact?.email || fallbackData.contact.email}</span>
                )}
              </div>
              <div className="flex min-w-0 items-center gap-3">
                <FiMapPin className="w-3 h-3 text-white flex-shrink-0" />
                {footerData?.contact?.addressLink ? (
                  <a href={footerData.contact.addressLink} className="flex min-w-0 items-center whitespace-normal break-words text-xs font-bold uppercase tracking-widest text-white transition-colors hover:text-[#CC2E2E]">
                    {footerData.contact.address}
                    <FiExternalLink className="w-3 h-3 ml-1 opacity-90 flex-shrink-0" />
                  </a>
                ) : (
                  <span className="text-xs font-bold uppercase tracking-widest">{footerData?.contact?.address || siteData.contact?.address || fallbackData.contact.address}</span>
                )}
              </div>
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h6 className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8">
              {footerData?.columns?.services?.heading || 'Services'}
            </h6>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-widest">
              {services.map((service: any, index: number) => (
                <li key={index}>
                  <a href={service.href || '#'} className="hover:text-[#CC2E2E] transition-colors touch-active no-tap-highlight">
                    {service.label || service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Locations Column */}
          <div>
            <h6 className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8">
              {footerData?.columns?.locations?.heading || 'Global Locations'}
            </h6>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-widest">
              {locations.map((location: any, index: number) => (
                <li key={index}>
                  <a href={location.href || '#'} className="hover:text-[#CC2E2E] transition-colors touch-active no-tap-highlight">
                    {location.label || location}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h6 className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8">
              {footerData?.columns?.resources?.heading || 'Resources'}
            </h6>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-widest">
              {resources.map((resource: any, index: number) => (
                <li key={index}>
                  <a href={resource.href || '#'} className="hover:text-[#CC2E2E] transition-colors touch-active no-tap-highlight">
                    {resource.label || resource}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p className="text-[10px] uppercase tracking-widest font-bold">
              {footerData?.bottom?.copyright || `© 2026 ${siteData.companyName || fallbackData.companyName}. All Rights Reserved.`}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-[10px] uppercase tracking-widest font-bold">
              {(footerData?.bottom?.links || [
                { label: 'Privacy Policy', href: '/legal/privacy-policy' },
                { label: 'Terms of Service', href: '/legal/terms-of-service' },
                { label: 'Sitemap', href: 'https://standszone.com/sitemap.xml' },
              ]).map((l: any, i: number) => (
                <a key={i} href={l.href} className="text-white hover:text-[#CC2E2E] transition-colors touch-active no-tap-highlight whitespace-nowrap">
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="flex gap-6">
            {(footerData?.social || socialLinks).map((social: any, index: number) => (
              <a
                key={index}
                href={social.href}
                aria-label={social.label}
                className="text-white hover:text-[#CC2E2E] transition-colors touch-active no-tap-highlight"
              >
                {social.icon === 'linkedin' ? <FiLinkedin className="w-4 h-4" />
                  : social.icon === 'twitter' ? <FiTwitter className="w-4 h-4" />
                    : social.icon === 'instagram' ? <FiInstagram className="w-4 h-4" />
                      : social.icon === 'facebook' ? <FiFacebook className="w-4 h-4" />
                        : <FiExternalLink className="w-4 h-4" />}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
