"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import React, { useState, createContext, useContext } from "react";
import { usePathname } from "next/navigation";

// ─── Sidebar context ───────────────────────────────────────────────
interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider");
  return context;
};

// ─── Navigation schema ─────────────────────────────────────────────
interface NavItem {
  label: string;
  href: string;
  icon: string;          // Material Symbols Outlined name
  badge?: string;
  disabled?: boolean;
  external?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    title: "Navigation",
    items: [
      { label: "Command Center", href: "/admin/dashboard", icon: "dashboard" },
      { label: "Builders & Partners", href: "/admin/builders", icon: "corporate_fare" },
      { label: "Featured Builders", href: "/admin/featured-builders", icon: "star" },
      { label: "Profile Claims", href: "/admin/profile-claims", icon: "verified_user" },
    ],
  },
    {
    title: "Content & CMS",
    items: [
      { label: "Pages Editor", href: "/admin/pages-editor", icon: "edit_document" },
      { label: "Tradeshows", href: "/admin/tradeshows", icon: "event" },
      { label: "Portfolio", href: "/admin/portfolio", icon: "photo_library" },
    ],
  },
  {
    title: "Revenue & Leads",
    items: [
      { label: "Leads", href: "/admin/leads", icon: "contact_mail" },
      { label: "Quote Analytics", href: "/admin/quote-matching-analytics", icon: "analytics" },
      { label: "Billing", href: "/admin/billing", icon: "payments" },
      { label: "Marketplace", href: "/admin/marketplace", icon: "storefront" },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Global Settings", href: "/admin/settings", icon: "settings" },
      { label: "Website Settings", href: "/admin/website-settings", icon: "tune" },
      { label: "Users & RBAC", href: "/admin/users", icon: "group" },
      { label: "Activity Stream", href: "/admin/activities", icon: "timeline" },
      { label: "Audit Logs", href: "/admin/data-audit", icon: "security" },
      { label: "GMB Integration", href: "/admin/gmb-integration", icon: "integration_instructions" },
      { label: "GMB Listings", href: "/admin/gmb-listings", icon: "place" },
      { label: "Integrations", href: "/admin/integrations", icon: "hub" },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Bulk Import", href: "/admin/bulk-import", icon: "cloud_upload" },
      { label: "Clear Cache", href: "/admin/clear-cache", icon: "cached" },
      { label: "Reports", href: "/admin/reports", icon: "summarize" },
      { label: "Performance", href: "/admin/performance-monitoring", icon: "speed" },
      { label: "Deployments", href: "/admin/deployments", icon: "rocket_launch" },
      { label: "Inspect DB", href: "/admin/inspect-db", icon: "database" },
      { label: "Data Summary", href: "/admin/data-summary", icon: "fact_check" },
    ],
  },
];

// ─── Components ─────────────────────────────────────────────────────

function SidebarLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  if (item.disabled) {
    return (
      <div
        className="flex items-center gap-3 px-4 py-2.5 rounded text-slate-600 cursor-not-allowed select-none"
        title="Coming soon"
      >
        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
        <span className="text-sm font-medium">{item.label}</span>
        {item.badge && (
          <span className="ml-auto text-[10px] font-bold bg-slate-700 text-slate-400 px-2 py-0.5 rounded">
            {item.badge}
          </span>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 transition-all duration-200 group",
        isActive
          ? "bg-white/10 border-l-4 border-[#E03A3A] text-white font-semibold"
          : "text-slate-400 hover:bg-white/5 hover:text-white border-l-4 border-transparent"
      )}
    >
      <span className={cn(
        "material-symbols-outlined text-[20px]",
        isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
      )}>
        {item.icon}
      </span>
      <span className="text-sm">{item.label}</span>
      {item.badge && (
        <span className="ml-auto text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded">
          {item.badge}
        </span>
      )}
      {item.external && (
        <span className="material-symbols-outlined text-[14px] ml-auto text-slate-600">open_in_new</span>
      )}
    </Link>
  );
}

function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto pb-4">
      {sections.map((section) => (
        <div key={section.title} className="mb-4">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-2 mt-4">
            {section.title}
          </div>
          <div className="space-y-0.5">
            {section.items.map((item) => (
              <SidebarLink
                key={item.href}
                item={item}
                isActive={pathname === item.href || !!pathname?.startsWith(item.href + "/")}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

// ─── Main Sidebar Exports ───────────────────────────────────────────

export function Sidebar({
  children,
  open,
  setOpen,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [openState, setOpenState] = useState(true);
  const finalOpen = open !== undefined ? open : openState;
  const finalSetOpen = setOpen !== undefined ? setOpen : setOpenState;

  return (
    <SidebarContext.Provider value={{ open: finalOpen, setOpen: finalSetOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function SidebarBody() {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 bg-[#141414] flex-col h-full text-slate-300 border-r border-white/10 shrink-0">
        {/* Logo / Header */}
        <div className="p-8 flex items-center gap-3 shrink-0">
          <div className="size-10 bg-[#E03A3A] flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white text-2xl">architecture</span>
          </div>
          <div>
            <h1 className="text-white text-lg font-extrabold tracking-tight uppercase">Stands Zone</h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Super Admin Console</p>
          </div>
        </div>

        {/* Navigation */}
        <SidebarNav />

        {/* Footer / Profile */}
        <div className="p-6 mt-auto border-t border-white/5 shrink-0">
          <div className="flex items-center gap-3 px-2">
            <div className="size-9 rounded-full bg-slate-700 overflow-hidden ring-2 ring-[#E03A3A]/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-300 text-lg">person</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">Super Admin</p>
              <p className="text-xs text-slate-500 truncate">Administrator</p>
            </div>
          </div>
          <div className="mt-4 px-2 text-xs text-slate-500">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span>System Online</span>
            </div>
            <div>v1.0.0</div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Trigger */}
      <MobileSidebar />
    </>
  );
}

function MobileSidebar() {
  const { open, setOpen } = useSidebar();
  const pathname = usePathname();
  React.useEffect(() => { setOpen(false); }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* Mobile header bar */}
      <div className="h-12 px-4 flex md:hidden shrink-0 items-center justify-between bg-[#141414] w-full border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="size-7 bg-[#E03A3A] flex items-center justify-center rounded">
            <span className="material-symbols-outlined text-white text-base">architecture</span>
          </div>
          <span className="text-white text-sm font-bold">Stands Zone</span>
        </div>
        <button
          aria-label="Toggle menu"
          className="flex size-10 items-center justify-center text-slate-300 hover:text-white transition-colors"
          onClick={() => setOpen(!open)}
        >
          <span className="material-symbols-outlined">{open ? "close" : "menu"}</span>
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          {/* Panel */}
          <aside className="absolute left-0 top-0 h-full w-[85vw] max-w-72 bg-[#141414] flex flex-col text-slate-300 shadow-2xl">
            <div className="p-6 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="size-8 bg-[#E03A3A] flex items-center justify-center rounded-lg">
                  <span className="material-symbols-outlined text-white text-xl">architecture</span>
                </div>
                <div>
                  <h1 className="text-white text-base font-extrabold uppercase">Stands Zone</h1>
                  <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Super Admin</p>
                </div>
              </div>
              <button className="text-slate-400 hover:text-white" onClick={() => setOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <SidebarNav />
          </aside>
        </div>
      )}
    </>
  );
}

// Keep the old export name for compatibility
export const SidebarLinks = SidebarNav;
export const SidebarProvider = Sidebar;