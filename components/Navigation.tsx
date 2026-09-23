"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FiChevronDown, FiMenu, FiUser, FiX } from "react-icons/fi";
import logoImg from "@/components/logo-standszone.png";

type LinkItem = { label: string; href: string };
type NavItem = LinkItem & { submenu?: LinkItem[] };
type SiteUser = { name?: string; email?: string; role?: string; id?: string; isLoggedIn?: boolean };

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Find Builders", href: "/builders", submenu: [
    { label: "All builders", href: "/builders" },
    { label: "Top rated", href: "/builders?sort=rating" },
    { label: "Browse by location", href: "/exhibition-stands" },
    { label: "Verified only", href: "/builders?verified=true" },
  ] },
  { label: "Trade Shows", href: "/trade-shows", submenu: [
    { label: "All trade shows", href: "/trade-shows" },
    { label: "Technology", href: "/trade-shows?industry=technology" },
    { label: "Healthcare & medical", href: "/trade-shows?industry=healthcare" },
    { label: "Manufacturing", href: "/trade-shows?industry=manufacturing" },
    { label: "Upcoming events", href: "/trade-shows?status=upcoming" },
  ] },
  { label: "Locations", href: "/exhibition-stands", submenu: [
    { label: "All locations", href: "/exhibition-stands" },
    { label: "Germany", href: "/exhibition-stands/germany" },
    { label: "United States", href: "/exhibition-stands/united-states" },
    { label: "United Arab Emirates", href: "/exhibition-stands/united-arab-emirates" },
    { label: "France", href: "/exhibition-stands/france" },
  ] },
  { label: "Services", href: "/services", submenu: [
    { label: "All services", href: "/services" },
    { label: "Custom stand design", href: "/custom-booth" },
    { label: "Stand construction", href: "/booth-rental" },
    { label: "3D visualization", href: "/3d-rendering-and-concept-development" },
    { label: "Installation", href: "/trade-show-installation-and-dismantle" },
    { label: "Project management", href: "/trade-show-project-management" },
    { label: "Graphics & branding", href: "/trade-show-graphics-printing" },
  ] },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
];

function accountItems(user: SiteUser | null): LinkItem[] {
  if (!user) return [
    { label: "Builder login", href: "/auth/login?type=builder" },
    { label: "Join as a builder", href: "/builder/register" },
    { label: "Admin portal", href: "/auth/login?type=admin" },
  ];
  if (user.role === "builder") return [
    { label: "Builder dashboard", href: "/builder/dashboard" },
    { label: "My profile", href: `/builders/${user.id || "profile"}` },
  ];
  return [
    { label: "Dashboard", href: "/admin/dashboard" },
    ...(user.role === "admin" ? [{ label: "Settings", href: "/admin/settings" }] : []),
  ];
}

export default function Navigation() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<SiteUser | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const checkUser = () => {
      try {
        const stored = localStorage.getItem("currentUser");
        const parsed = stored ? JSON.parse(stored) : null;
        setUser(parsed?.isLoggedIn ? parsed : null);
      } catch { setUser(null); }
    };
    checkUser();
    window.addEventListener("storage", checkUser);
    window.addEventListener("focus", checkUser);
    return () => {
      window.removeEventListener("storage", checkUser);
      window.removeEventListener("focus", checkUser);
    };
  }, []);

  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
    setMobileSection(null);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpenMenu(null); setMobileOpen(false); }
    };
    const onPointer = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  const active = (href: string) => href === "/" ? pathname === "/" : pathname === href || pathname?.startsWith(`${href}/`);
  const closeMobile = () => setMobileOpen(false);

  return (
    <nav ref={navRef} aria-label="Main navigation" className={`fixed inset-x-0 top-0 z-[1000] h-16 border-b transition-colors duration-300 ${scrolled ? "border-[#E4E6E8] bg-white/95 shadow-[0_8px_32px_rgba(20,20,20,0.06)] backdrop-blur-xl" : "border-[#E4E6E8]/80 bg-white"}`}>
      <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between gap-5 px-5 md:px-8 xl:px-10">
        <Link href="/" aria-label="StandsZone home" className="group flex shrink-0 items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#CC2E2E]">
          <Image src={logoImg} alt="StandsZone" priority className="h-auto w-[122px] transition-transform duration-500 group-hover:scale-[1.03]" sizes="122px" />
        </Link>

        <div className="hidden h-full items-center gap-1 xl:flex">
          {navItems.map((item) => (
            <div key={item.label} className="relative flex h-full items-center" onMouseEnter={() => item.submenu && setOpenMenu(item.label)} onMouseLeave={() => setOpenMenu(null)}>
              <Link href={item.href} aria-current={active(item.href) ? "page" : undefined} onFocus={() => setOpenMenu(null)} className={`relative flex h-full items-center px-2.5 text-[11px] font-semibold uppercase tracking-[0.13em] transition-colors hover:text-[#CC2E2E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-5px] focus-visible:outline-[#CC2E2E] ${active(item.href) ? "text-[#252525]" : "text-[#5B5C5D]"}`}>
                {item.label}
                {active(item.href) && <span className="absolute inset-x-2.5 bottom-0 h-[2px] bg-[#E03A3A]" />}
              </Link>
              {item.submenu && <>
                <button type="button" aria-label={`Show ${item.label} menu`} aria-expanded={openMenu === item.label} aria-controls={`nav-${item.label.replace(/ /g, "-")}`} onFocus={() => setOpenMenu(item.label)} onClick={() => setOpenMenu(openMenu === item.label ? null : item.label)} className="-ml-1 flex h-10 w-5 items-center justify-center text-[#5B5C5D] transition-colors hover:text-[#CC2E2E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#CC2E2E]">
                  <FiChevronDown aria-hidden className={`h-3 w-3 transition-transform duration-300 ${openMenu === item.label ? "rotate-180" : ""}`} />
                </button>
                {openMenu === item.label && <div id={`nav-${item.label.replace(/ /g, "-")}`} className="absolute left-0 top-full w-[260px] border border-[#E4E6E8] bg-white py-3 shadow-[0_24px_55px_rgba(20,20,20,0.13)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-safe:duration-200">
                  <div className="px-5 pb-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#CC2E2E]">Explore {item.label}</div>
                  {item.submenu.map((sub) => <Link key={sub.href} href={sub.href} onClick={() => setOpenMenu(null)} className="group flex items-center justify-between px-5 py-2.5 text-[13px] text-[#252525] transition-colors hover:bg-[#F5F6F7] hover:text-[#CC2E2E] focus-visible:bg-[#F5F6F7] focus-visible:outline-none">
                    {sub.label}<span aria-hidden className="-translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">→</span>
                  </Link>)}
                </div>}
              </>}
            </div>
          ))}
        </div>

        <div className="hidden h-full shrink-0 items-center gap-5 xl:flex">
          <div className="relative flex h-full items-center" onMouseEnter={() => setOpenMenu("Account")} onMouseLeave={() => setOpenMenu(null)}>
            <button type="button" aria-label="Account menu" aria-expanded={openMenu === "Account"} aria-controls="nav-account" onClick={() => setOpenMenu(openMenu === "Account" ? null : "Account")} className="flex h-10 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-[#252525] transition-colors hover:text-[#CC2E2E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#CC2E2E]">
              <FiUser aria-hidden className="h-4 w-4" />{user ? "Account" : "Builder login"}<FiChevronDown aria-hidden className={`h-3 w-3 transition-transform duration-300 ${openMenu === "Account" ? "rotate-180" : ""}`} />
            </button>
            {openMenu === "Account" && <div id="nav-account" className="absolute right-0 top-full w-[240px] border border-[#E4E6E8] bg-white py-3 shadow-[0_24px_55px_rgba(20,20,20,0.13)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2">
              {user && <div className="truncate border-b border-[#E4E6E8] px-5 pb-3 text-xs text-[#5B5C5D]">{user.name || user.email}</div>}
              {accountItems(user).map((item) => <Link key={item.href} href={item.href} onClick={() => setOpenMenu(null)} className="block px-5 py-2.5 text-[13px] text-[#252525] transition-colors hover:bg-[#F5F6F7] hover:text-[#CC2E2E] focus-visible:bg-[#F5F6F7] focus-visible:outline-none">{item.label}</Link>)}
            </div>}
          </div>
          <Link href="/quote" className="group flex h-10 items-center gap-5 bg-[#E03A3A] px-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-[#252525] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CC2E2E]">
            Get free quote <span aria-hidden className="text-base leading-none transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <div className="flex items-center gap-3 xl:hidden">
          <Link href="/quote" onClick={closeMobile} className="flex h-10 items-center bg-[#E03A3A] px-4 text-[10px] font-semibold uppercase tracking-[0.17em] text-white transition-colors hover:bg-[#252525]">Get quotes <span aria-hidden className="ml-3 text-base">→</span></Link>
          <button type="button" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen} aria-controls="mobile-site-menu" className="flex h-11 w-11 items-center justify-center border border-[#E4E6E8] text-[#252525] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#CC2E2E]">{mobileOpen ? <FiX aria-hidden className="h-5 w-5" /> : <FiMenu aria-hidden className="h-5 w-5" />}</button>
        </div>
      </div>

      {mobileOpen && <div id="mobile-site-menu" className="absolute inset-x-0 top-16 h-[calc(100dvh-4rem)] overflow-y-auto border-t border-[#E4E6E8] bg-white px-5 pb-10 pt-4 shadow-xl xl:hidden">
        <div className="mx-auto max-w-[700px]">
          <div className="pb-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#CC2E2E]">Explore StandsZone</div>
          {navItems.map((item) => <div key={item.label} className="border-t border-[#E4E6E8]">
            <div className="flex min-h-14 items-center justify-between">
              <Link href={item.href} onClick={closeMobile} aria-current={active(item.href) ? "page" : undefined} className={`flex min-h-14 flex-1 items-center text-xl font-light tracking-tight ${active(item.href) ? "text-[#CC2E2E]" : "text-[#252525]"}`}>{item.label}</Link>
              {item.submenu && <button type="button" onClick={() => setMobileSection(mobileSection === item.label ? null : item.label)} aria-label={`Show ${item.label} links`} aria-expanded={mobileSection === item.label} className="flex h-11 w-11 items-center justify-center text-[#5B5C5D]"><FiChevronDown aria-hidden className={`h-4 w-4 transition-transform duration-300 ${mobileSection === item.label ? "rotate-180" : ""}`} /></button>}
            </div>
            {item.submenu && mobileSection === item.label && <div className="border-l-2 border-[#E03A3A] pb-3 pl-5 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2">
              {item.submenu.map((sub) => <Link key={sub.href} href={sub.href} onClick={closeMobile} className="block py-2.5 text-sm text-[#5B5C5D] hover:text-[#CC2E2E]">{sub.label}</Link>)}
            </div>}
          </div>)}
          <div className="mt-7 border-t border-[#E4E6E8] pt-6">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#CC2E2E]">Account</div>
            {user && <div className="mb-2 text-sm text-[#5B5C5D]">{user.name || user.email}</div>}
            {accountItems(user).map((item) => <Link key={item.href} href={item.href} onClick={closeMobile} className="block py-2.5 text-sm text-[#252525] hover:text-[#CC2E2E]">{item.label}</Link>)}
          </div>
        </div>
      </div>}
    </nav>
  );
}
