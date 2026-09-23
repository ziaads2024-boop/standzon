"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface SuperAdminCommandCenterProps {
  adminId: string;
  permissions: string[];
}

interface DashboardStats {
  totalLeads: number;
  totalBuilders: number;
  quoteMatchRate: string;
  totalCountries: number;
  totalCities: number;
  totalUsers: number;
  totalExhibitions: number;
  pendingPartnerRequests: number;
  leadsChange: string;
}

interface AuditTrailEntry {
  icon: string;
  iconBg: string;
  title: string;
  description: string;
  time: string;
}

interface PartnerRequest {
  id: string;
  initials: string;
  name: string;
  email: string;
  contactPerson: string;
  status: string;
  claimStatus: string;
}

export default function SuperAdminCommandCenter({
  adminId,
  permissions,
}: SuperAdminCommandCenterProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [auditTrail, setAuditTrail] = useState<AuditTrailEntry[]>([]);
  const [partnerRequests, setPartnerRequests] = useState<PartnerRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Cache clear dialog state
  const [showClearCacheDialog, setShowClearCacheDialog] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [cacheClearResult, setCacheClearResult] = useState<{ success: boolean; message: string } | null>(null);

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    try {
      setError(null);
      
      // Fetch stats
      const statsRes = await fetch('/api/admin/dashboard-stats');
      const statsData = await statsRes.json();
      
      if (statsData.success) {
        setStats(statsData.data.stats);
      }

      // Fetch audit trail
      const auditRes = await fetch('/api/admin/audit-trail');
      const auditData = await auditRes.json();
      
      if (auditData.success) {
        setAuditTrail(auditData.data);
      }

      // Fetch partner requests
      const partnersRes = await fetch('/api/admin/partner-requests');
      const partnersData = await partnersRes.json();
      
      if (partnersData.success) {
        setPartnerRequests(partnersData.data);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load some data');
    }
  };

  // Handle cache clearing
  const handleClearCache = async () => {
    setClearingCache(true);
    setCacheClearResult(null);
    
    try {
      const response = await fetch('/api/admin/clear-cache', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCacheClearResult({
          success: true,
          message: data.message || 'Cache cleared successfully!'
        });
      } else {
        setCacheClearResult({
          success: false,
          message: data.message || 'Failed to clear cache'
        });
      }
    } catch (err) {
      setCacheClearResult({
        success: false,
        message: err instanceof Error ? err.message : 'An unexpected error occurred'
      });
    } finally {
      setClearingCache(false);
      // Auto-close dialog after 3 seconds on success
      setTimeout(() => {
        setShowClearCacheDialog(false);
        setCacheClearResult(null);
      }, 3000);
    }
  };

  // Handle refresh - revalidates cache and reloads data
  const handleRefresh = async () => {
    setRefreshing(true);
    
    try {
      // First clear the cache
      await fetch('/api/admin/clear-cache', {
        method: 'POST',
      });
      
      // Then fetch fresh data
      await fetchDashboardData();
      
    } catch (err) {
      console.error('Error refreshing dashboard:', err);
      setError('Failed to refresh some data');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const initData = async () => {
      await fetchDashboardData();
      setLoading(false);
    };
    
    initData();
  }, []);

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  // Stats data - now using real data
  const statsData = stats ? [
    {
      icon: "leaderboard",
      label: "Total Leads",
      value: formatNumber(stats.totalLeads),
      change: stats.leadsChange || "+0%",
      positive: stats.leadsChange?.includes('+') || false,
    },
    {
      icon: "engineering",
      label: "Active Builders",
      value: formatNumber(stats.totalBuilders),
      change: stats.pendingPartnerRequests > 0 ? `+${stats.pendingPartnerRequests} pending` : "Active",
      positive: true,
    },
    {
      icon: "fact_check",
      label: "Quote Match Rate",
      value: stats.quoteMatchRate || "0%",
      change: "+0%",
      positive: true,
    },
    {
      icon: "location_city",
      label: "Countries Covered",
      value: formatNumber(stats.totalCountries),
      change: `${formatNumber(stats.totalCities)} cities`,
      positive: true,
    },
  ] : [
    {
      icon: "leaderboard",
      label: "Total Leads",
      value: "---",
      change: "...",
      positive: true,
    },
    {
      icon: "engineering",
      label: "Active Builders",
      value: "---",
      change: "...",
      positive: true,
    },
    {
      icon: "fact_check",
      label: "Quote Match Rate",
      value: "---%",
      change: "...",
      positive: true,
    },
    {
      icon: "location_city",
      label: "Countries Covered",
      value: "---",
      change: "...",
      positive: true,
    },
  ];

  // Audit trail data - now using real data
  const auditTrailData = auditTrail.length > 0 ? auditTrail : [
    {
      icon: "info",
      iconBg: "bg-slate-100 text-slate-500",
      title: "No Recent Activity:",
      description: "Waiting for new events...",
      time: "Just now • System",
    },
  ];

  // Partner requests data - now using real data
  const partnerRequestsData = partnerRequests.length > 0 ? partnerRequests : [];

  useEffect(() => {
    const initData = async () => {
      await fetchDashboardData();
      setLoading(false);
    };
    
    initData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E03A3A] mx-auto" />
          <p className="mt-4 text-slate-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* ── Summary Stats ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {statsData.map((stat: any, i: any) => (
          <div
            key={i}
            className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[#E03A3A]/10 text-[#E03A3A] rounded-lg">
                <span className="material-symbols-outlined text-2xl">
                  {stat.icon}
                </span>
              </div>
              <span
                className={`text-xs font-bold px-2 py-1 rounded ${
                  stat.positive
                    ? "text-emerald-500 bg-emerald-500/10"
                    : "text-[#CC2E2E] bg-[#CC2E2E]/10"
                }`}
              >
                {stat.change}
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl md:text-3xl font-light tracking-tight text-[#252525] mt-1">
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      {/* ── Main Grid: Content (2/3) + Sidebar (1/3) ─────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        {/* ── Left Column (2/3) ─────────────────────────────── */}
        <div className="xl:col-span-2 space-y-6 md:space-y-8">
          {/* Global Network Status */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 md:p-6 border-b border-slate-100 flex flex-wrap gap-3 justify-between items-center">
              <h4 className="font-bold text-[#252525] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#E03A3A]">
                  public
                </span>
                Global Network Status
              </h4>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors uppercase tracking-wider">
                  Live Map
                </button>
                <button className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors uppercase tracking-wider">
                  Data View
                </button>
              </div>
            </div>
            <div className="h-56 md:h-96 relative bg-slate-100 flex items-center justify-center">
              {/* Abstract radial glow */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,_#E03A3A_0%,_transparent_100%)]" />
              <div className="text-slate-400 flex flex-col items-center">
                <span className="material-symbols-outlined text-6xl mb-2 opacity-30">
                  map
                </span>
                <p className="text-sm font-medium tracking-widest uppercase opacity-40">
                  Regional Performance Visualization
                </p>
              </div>
              {/* Animated data-point dots */}
              <div className="absolute top-20 left-1/4 size-4 bg-emerald-500/40 rounded-full animate-pulse flex items-center justify-center">
                <div className="size-2 bg-emerald-500 rounded-full" />
              </div>
              <div className="absolute bottom-1/3 right-1/3 size-4 bg-[#E03A3A]/40 rounded-full flex items-center justify-center">
                <div className="size-2 bg-[#E03A3A] rounded-full" />
              </div>
              <div className="absolute top-1/2 right-1/4 size-4 bg-[#CC2E2E]/40 rounded-full flex items-center justify-center">
                <div className="size-2 bg-[#CC2E2E] rounded-full" />
              </div>
            </div>
          </div>

          {/* System Audit Trail */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h4 className="font-bold text-[#252525] uppercase tracking-wider text-sm">
                System Audit Trail
              </h4>
            </div>
            <div className="divide-y divide-slate-100">
              {auditTrailData.map((entry: any, i: any) => (
                <div
                  key={i}
                  className="p-4 md:p-6 flex gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div
                    className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${entry.iconBg}`}
                  >
                    <span className="material-symbols-outlined">
                      {entry.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-800">
                      <span className="font-bold">{entry.title}</span>{" "}
                      {entry.description}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-tight">
                      {entry.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-50 text-center">
              <Link
                href="/admin/data-audit"
                className="text-xs font-bold text-[#E03A3A] hover:text-[#252525] transition-colors uppercase tracking-widest"
              >
                View Full Audit Log
              </Link>
            </div>
          </div>
        </div>

        {/* ── Right Column (1/3) ────────────────────────────── */}
        <div className="space-y-8">
          {/* Control Panel */}
          <div className="bg-[#141414] text-white p-5 md:p-8 rounded-xl shadow-xl space-y-6">
            <h4 className="font-bold text-sm uppercase tracking-[0.2em] opacity-60">
              Control Panel
            </h4>
            <div className="grid grid-cols-1 gap-4">
              {/* Clear System Cache */}
              <button
                onClick={() => setShowClearCacheDialog(true)}
                disabled={clearingCache}
                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all group disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#E03A3A] group-hover:text-white transition-colors">
                    cached
                  </span>
                  <span className="text-sm font-semibold">
                    Clear System Cache
                  </span>
                </div>
                <span className="material-symbols-outlined text-sm opacity-40">
                  chevron_right
                </span>
              </button>

              {/* Refresh Dashboard Data */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all group disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-emerald-400 group-hover:text-white transition-colors ${refreshing ? 'animate-spin' : ''}`}>
                    refresh
                  </span>
                  <span className="text-sm font-semibold">
                    {refreshing ? 'Refreshing...' : 'Refresh Dashboard'}
                  </span>
                </div>
                <span className="material-symbols-outlined text-sm opacity-40">
                  chevron_right
                </span>
              </button>

              {/* Generate Monthly Report */}
              <Link
                href="/admin/reports"
                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-400 group-hover:text-white transition-colors">
                    cloud_download
                  </span>
                  <span className="text-sm font-semibold">
                    Generate Monthly Report
                  </span>
                </div>
                <span className="material-symbols-outlined text-sm opacity-40">
                  chevron_right
                </span>
              </Link>

              {/* Emergency Broadcast */}
              <button className="w-full flex items-center justify-between p-4 bg-[#CC2E2E]/10 hover:bg-[#CC2E2E] rounded-lg border border-[#CC2E2E]/20 transition-all group">
                <div className="flex items-center gap-3 text-[#CC2E2E] group-hover:text-white">
                  <span className="material-symbols-outlined">warning</span>
                  <span className="text-sm font-semibold">
                    Emergency Broadcast
                  </span>
                </div>
                <span className="material-symbols-outlined text-sm opacity-40 group-hover:text-white/40">
                  chevron_right
                </span>
              </button>
            </div>
          </div>

          {/* Partner Requests */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h4 className="font-bold text-[#252525] uppercase tracking-wider text-sm mb-6">
              Partner Requests
            </h4>
            <div className="space-y-6">
              {partnerRequestsData.map((partner: any, i: any) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="size-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-400">
                    {partner.initials}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#252525]">
                      {partner.name}
                    </p>
                    <p className="text-xs text-slate-500 uppercase font-medium">
                      {partner.status}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button className="size-8 rounded-lg border border-slate-200 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-colors">
                      <span className="material-symbols-outlined text-lg">
                        check
                      </span>
                    </button>
                    <button className="size-8 rounded-lg border border-slate-200 flex items-center justify-center text-[#CC2E2E] hover:bg-rose-50 transition-colors">
                      <span className="material-symbols-outlined text-lg">
                        close
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Clear Cache Confirmation Dialog */}
      {showClearCacheDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <span className="material-symbols-outlined text-red-600 text-2xl">
                    warning
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Clear System Cache?</h3>
                  <p className="text-sm text-slate-500">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-slate-600 mb-6">
                This will clear all cached data and force the website to fetch fresh data from the database. 
                The website may load slightly slower for a few moments after clearing.
              </p>

              {cacheClearResult && (
                <div className={`p-3 rounded-lg mb-4 ${cacheClearResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  <p className="text-sm font-medium">{cacheClearResult.message}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowClearCacheDialog(false);
                    setCacheClearResult(null);
                  }}
                  disabled={clearingCache}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearCache}
                  disabled={clearingCache}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {clearingCache ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                      Clearing...
                    </>
                  ) : (
                    'Clear Cache'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}