"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { useTheme } from '@/components/ThemeProvider';
import { useRouter, usePathname } from 'next/navigation';

export default function Topbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  // Derive page title from pathname
  const getPageTitle = () => {
    if (!pathname) return "Command Center";
    const segment = pathname.replace("/admin/", "").replace("/admin", "").split("/")[0];
    if (!segment) return "Command Center";
    return segment
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const handleLogout = async () => {
    try {
      // Get session ID from localStorage
      const sessionId = typeof window !== 'undefined' ? localStorage.getItem('adminSessionId') : null;

      // Call logout API
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('adminSessionId');
      }

      // Redirect to login page
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect to login page even if API call fails
      if (typeof window !== 'undefined') {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('adminSessionId');
      }
      router.push('/admin/login');
    }
  };

  return (
    <div className="w-full flex items-center justify-between">
      {/* Left side: page title + status */}
      <div className="flex min-w-0 items-center gap-6">
        <h2 className="truncate text-base font-bold tracking-tight text-[#252525] md:text-xl">{getPageTitle()}</h2>
        <div className="h-6 w-px bg-slate-200 hidden sm:block" />
        <div className="hidden sm:flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
          <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider">System: Operational</span>
        </div>
      </div>

      {/* Right side: search, notifications, profile */}
      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        {/* Global Search */}
        <div className="relative hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
          <input
            type="text"
            placeholder="Global search..."
            className="bg-slate-100 border-none rounded-lg py-2 pl-10 pr-4 text-sm w-64 focus:ring-2 focus:ring-[#E03A3A] focus:outline-none transition-all text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Theme Toggle removed */}

        {/* Notifications */}
        <div className="relative">
          <button
            className="size-9 md:size-10 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors relative"
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileOpen(false);
            }}
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2 right-2 size-2 bg-[#CC2E2E] rounded-full border-2 border-white" />
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-1.5rem))] bg-white border border-slate-200 rounded-xl shadow-lg z-50">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-bold text-[#252525]">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {[
                  { text: "New builder registration pending review", time: "14 min ago", icon: "person_add", color: "emerald" },
                  { text: "CMS sync complete — 42 listings updated", time: "2 hours ago", icon: "update", color: "blue" },
                  { text: "Security alert from unknown IP", time: "5 hours ago", icon: "report", color: "red" },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3">
                    <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${
                      item.color === "emerald" ? "bg-emerald-100 text-emerald-600" :
                      item.color === "blue" ? "bg-blue-100 text-blue-600" :
                      "bg-red-100 text-red-600"
                    }`}>
                      <span className="material-symbols-outlined text-lg">{item.icon}</span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-700">{item.text}</p>
                      <p className="text-xs text-slate-400 mt-0.5 uppercase font-bold tracking-tight">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-slate-50 text-center rounded-b-xl">
                <button className="text-xs font-bold text-[#E03A3A] hover:text-[#252525] transition-colors uppercase tracking-widest">
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationsOpen(false);
            }}
          >
            <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-400">person</span>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-[18px]">expand_more</span>
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-[min(16rem,calc(100vw-1.5rem))] bg-white border border-slate-200 rounded-xl shadow-lg z-50">
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-400">person</span>
                  </div>
                  <div>
                    <p className="font-bold text-[#252525]">Super Admin</p>
                    <p className="text-sm text-slate-500">admin@standzon.com</p>
                  </div>
                </div>
              </div>
              <div className="py-1">
                <a href="/admin/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#252525] transition-colors">
                  <span className="material-symbols-outlined text-[18px]">settings</span>
                  Settings
                </a>
              </div>
              <div className="border-t border-slate-100 py-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-[#CC2E2E] hover:bg-red-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}