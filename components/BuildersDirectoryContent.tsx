"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { Eyebrow, Reveal, WordReveal } from "@/components/home-v2/motion";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
const TradeStyleBanner = dynamic(() => import("@/components/TradeStyleBanner"), {
  loading: () => <div className="h-48 bg-slate-100 animate-pulse rounded-xl" />,
  ssr: false
});
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import Link from "next/link";
import {
  FiMapPin,
  FiStar,
  FiUsers,
  FiClock,
  FiSearch,
  FiFilter,
  FiArrowRight,
  FiShield,
  FiAward,
  FiEye,
  FiPhone,
  FiMail,
  FiGlobe,
} from "react-icons/fi";
import { builderStats } from "@/lib/data/exhibitionBuilders";
import { GLOBAL_EXHIBITION_DATA } from "@/lib/data/globalCities";
// Unused import removed: PublicQuoteRequest

// Add null checks for icons to prevent runtime errors
const SafeIcon = ({ IconComponent, ...props }: { IconComponent: any } & React.SVGProps<SVGSVGElement>) => {
  if (!IconComponent) {
    return null;
  }
  return <IconComponent {...props} />;
};

interface BuilderRaw {
  id: string;
  company_name?: string;
  companyName?: string;
  description?: string;
  companyDescription?: string;
  headquarters_city?: string;
  headquartersCountry?: string;
  headquarters_country?: string;
  headquarters?: {
    city?: string;
    country?: string;
    countryCode?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  keyStrengths?: string[];
  verified?: boolean;
  isVerified?: boolean;
  rating?: number;
  projectsCompleted?: number;
  projects_completed?: number;
  importedFromGMB?: boolean;
  gmbImported?: boolean;
  logo?: string;
  establishedYear?: number;
  established_year?: number;
  teamSize?: number;
  reviewCount?: number;
  responseTime?: string;
  languages?: string[];
  premiumMember?: boolean;
  premium_member?: boolean;
  slug?: string;
  primary_email?: string;
  primaryEmail?: string;
  phone?: string;
  website?: string;
  contact_person?: string;
  contactPerson?: string;
  position?: string;
  services?: any[];
  service_locations?: any[];
  serviceLocations?: any[];
  basicStandMin?: number;
  basicStandMax?: number;
  customStandMin?: number;
  customStandMax?: number;
  premiumStandMin?: number;
  premiumStandMax?: number;
  currency?: string;
  averageProject?: number;
  businessLicense?: string;
  _id?: string;
  source?: string;
}

interface BuilderTransformed {
  id: string;
  companyName: string;
  companyDescription: string;
  headquarters: {
    city: string;
    country: string;
    countryCode: string;
    address: string;
    latitude: number;
    longitude: number;
    isHeadquarters: boolean;
  };
  serviceLocations: any[];
  keyStrengths: string[];
  verified: boolean;
  rating: number;
  projectsCompleted: number;
  importedFromGMB: boolean;
  logo: string;
  establishedYear: number;
  teamSize: number;
  reviewCount: number;
  responseTime: string;
  languages: string[];
  premiumMember: boolean;
  slug: string;
  primary_email: string;
  phone: string;
  website: string;
  contact_person: string;
  position: string;
  gmbImported: boolean;
  [key: string]: any;
}

export default function BuildersDirectoryContent() {
  const searchParams = useSearchParams();
  const initialCountry = searchParams?.get('country') || "all";
  const initialCity = searchParams?.get('city') || "all";

  console.log("🚀 Builders Directory: Page loaded, initial filters:", { initialCountry, initialCity });

  const [saved, setSaved] = useState<any>(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          "/api/admin/pages-editor?action=get-content&path=%2Fbuilders",
          { cache: "no-store" }
        );
        const data = await res.json();
        if (data?.success && data?.data) setSaved(data.data);
      } catch (error) {
        console.warn("Failed to load CMS data for builders page:", error);
      }
    })();
  }, []);

  const [realTimeBuilders, setRealTimeBuilders] = useState<
    BuilderTransformed[]
  >([]);
  const [realTimeStats, setRealTimeStats] = useState({
    totalBuilders: 0,
    verifiedBuilders: 0,
    totalCountries: 0,
    totalCities: 0,
    averageRating: 0,
    totalProjectsCompleted: 0,
    importedFromGMB: 0,
    totalReviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const loadRealTimeData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "/api/admin/builders?limit=500&prioritize_real=true&include_all_countries=true"
        );
        const buildersData = await response.json();

        if (
          buildersData &&
          buildersData.data &&
          Array.isArray(buildersData.data.builders)
        ) {
          const allBuilders: BuilderRaw[] = buildersData.data.builders;

          const transformedBuilders: BuilderTransformed[] = allBuilders.map(
            (b: BuilderRaw) => ({
              id: b.id,
              companyName: b.company_name || b.companyName || "",
              companyDescription: (() => {
                let desc = b.description || b.companyDescription || "";
                // Remove SERVICE_LOCATIONS JSON from description more aggressively
                desc = desc.replace(/\n\nSERVICE_LOCATIONS:.*$/g, '');
                desc = desc.replace(/SERVICE_LOCATIONS:.*$/g, '');
                desc = desc.replace(/SERVICE_LOCATIONS:\[.*?\]/g, '');
                desc = desc.replace(/\n\n.*SERVICE_LOCATIONS.*$/g, '');
                desc = desc.replace(/.*SERVICE_LOCATIONS.*$/g, '');
                // Remove any remaining raw data patterns
                desc = desc.replace(/sdfghjl.*$/g, '');
                desc = desc.replace(/testing.*$/g, '');
                desc = desc.replace(/sdfghj.*$/g, '');
                desc = desc.trim();
                return desc || "";
              })(),
              headquarters: {
                city: b.headquarters_city || b.headquarters?.city || "Unknown",
                country:
                  b.headquarters_country ||
                  b.headquartersCountry ||
                  b.headquarters?.country ||
                  "Unknown",
                countryCode: b.headquarters?.countryCode || "XX",
                address: b.headquarters?.address || "",
                latitude: b.headquarters?.latitude || 0,
                longitude: b.headquarters?.longitude || 0,
                isHeadquarters: true,
              },
              serviceLocations: b.serviceLocations || b.service_locations || [],
              keyStrengths: b.keyStrengths || [],
              verified: b.verified || b.isVerified || false,
              rating: b.rating || 0,
              projectsCompleted:
                b.projectsCompleted || b.projects_completed || 0,
              importedFromGMB: b.importedFromGMB || b.gmbImported || false,
              logo: b.logo || "/images/builders/default-logo.png",
              establishedYear: b.establishedYear || b.established_year || 2020,
              teamSize: b.teamSize || 10,
              reviewCount: b.reviewCount || 0,
              responseTime: b.responseTime || "Within 24 hours",
              languages: b.languages || ["English"],
              premiumMember: b.premiumMember || b.premium_member || false,
              slug:
                b.slug ||
                (b.company_name || b.companyName || "")
                  .toLowerCase()
                  .replace(/[^a-z0-9]/g, "-"),
              primary_email: b.primary_email || b.primaryEmail || "",
              phone: b.phone || "",
              website: b.website || "",
              contact_person: b.contact_person || b.contactPerson || "",
              position: b.position || "",
              gmbImported:
                b.gmbImported ||
                b.importedFromGMB ||
                b.source === "GMB_API" ||
                false,
            })
          );

          setRealTimeBuilders(transformedBuilders);

          const calculatedStats = {
            totalBuilders: allBuilders.length,
            verifiedBuilders: allBuilders.filter((b) => b.verified).length,
            totalCountries: Array.from(
              new Set(
                allBuilders.map((b) => b.headquartersCountry || "Unknown")
              )
            ).length,
            totalCities: Array.from(
              new Set(allBuilders.map((b) => b.headquarters_city || "Unknown"))
            ).length,
            averageRating:
              allBuilders.length > 0
                ? allBuilders.reduce(
                  (sum, builder) => sum + (builder.rating || 0),
                  0
                ) / allBuilders.length
                : 0,
            totalProjectsCompleted: allBuilders.reduce(
              (sum, builder) =>
                sum +
                (builder.projectsCompleted || builder.projects_completed || 0),
              0
            ),
            importedFromGMB: allBuilders.filter(
              (builder) =>
                builder.importedFromGMB ||
                builder.gmbImported ||
                builder.source === "GMB_API"
            ).length,
            totalReviews: allBuilders.reduce(
              (sum, builder) => sum + (builder.reviewCount || 0),
              0
            ),
          };

          setRealTimeStats(calculatedStats);
        } else {
          setRealTimeBuilders([]);
          // Reset stats to zero when no builders found
          setRealTimeStats({
            totalBuilders: 0,
            verifiedBuilders: 0,
            totalCountries: 0,
            totalCities: 0,
            averageRating: 0,
            totalProjectsCompleted: 0,
            importedFromGMB: 0,
            totalReviews: 0,
          });
        }
      } catch (error) {
        console.error("❌ Error loading builder data:", error);
        setRealTimeBuilders([]);
        // Reset stats to zero on error
        setRealTimeStats({
          totalBuilders: 0,
          verifiedBuilders: 0,
          totalCountries: 0,
          totalCities: 0,
          averageRating: 0,
          totalProjectsCompleted: 0,
          importedFromGMB: 0,
          totalReviews: 0,
        });
      } finally {
        setLoading(false);
        setLastUpdated(new Date());
      }
    };

    // Load data once on mount only
    loadRealTimeData();

    // Removed auto-refresh to prevent unwanted page reloads
    // Data will refresh when user navigates back to this page
  }, []);

  // Manual refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(
        "/api/admin/builders?limit=500&prioritize_real=true&include_all_countries=true"
      );
      const buildersData = await response.json();

      if (
        buildersData &&
        buildersData.data &&
        Array.isArray(buildersData.data.builders)
      ) {
        const allBuilders: BuilderRaw[] = buildersData.data.builders;
        const transformedBuilders: BuilderTransformed[] = allBuilders.map(
          (b: BuilderRaw) => ({
            id: b.id,
            companyName: b.company_name || b.companyName || "",
            companyDescription: (() => {
              let desc = b.description || b.companyDescription || "";
              desc = desc.replace(/\n\nSERVICE_LOCATIONS:.*$/g, '');
              desc = desc.replace(/SERVICE_LOCATIONS:.*$/g, '');
              desc = desc.replace(/SERVICE_LOCATIONS:\[.*?\]/g, '');
              desc = desc.replace(/\n\n.*SERVICE_LOCATIONS.*$/g, '');
              desc = desc.replace(/.*SERVICE_LOCATIONS.*$/g, '');
              desc = desc.replace(/sdfghjl.*$/g, '');
              desc = desc.replace(/testing.*$/g, '');
              desc = desc.replace(/sdfghj.*$/g, '');
              desc = desc.trim();
              return desc || "";
            })(),
            headquarters: {
              city: b.headquarters_city || b.headquarters?.city || "Unknown",
              country:
                b.headquarters_country ||
                b.headquartersCountry ||
                b.headquarters?.country ||
                "Unknown",
              countryCode: b.headquarters?.countryCode || "XX",
              address: b.headquarters?.address || "",
              latitude: b.headquarters?.latitude || 0,
              longitude: b.headquarters?.longitude || 0,
              isHeadquarters: true,
            },
            serviceLocations: b.serviceLocations || b.service_locations || [],
            keyStrengths: b.keyStrengths || [],
            verified: b.verified || b.isVerified || false,
            rating: b.rating || 0,
            projectsCompleted:
              b.projectsCompleted || b.projects_completed || 0,
            importedFromGMB: b.importedFromGMB || b.gmbImported || false,
            logo: b.logo || "/images/builders/default-logo.png",
            establishedYear: b.establishedYear || b.established_year || 2020,
            teamSize: b.teamSize || 10,
            reviewCount: b.reviewCount || 0,
            responseTime: b.responseTime || "Within 24 hours",
            languages: b.languages || ["English"],
            premiumMember: b.premiumMember || b.premium_member || false,
            slug:
              b.slug ||
              (b.company_name || b.companyName || "")
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "-"),
            primary_email: b.primary_email || b.primaryEmail || "",
            phone: b.phone || "",
            website: b.website || "",
            contact_person: b.contact_person || b.contactPerson || "",
            position: b.position || "",
            gmbImported:
              b.gmbImported ||
              b.importedFromGMB ||
              b.source === "GMB_API" ||
              false,
          })
        );

        setRealTimeBuilders(transformedBuilders);

        const calculatedStats = {
          totalBuilders: allBuilders.length,
          verifiedBuilders: allBuilders.filter((b) => b.verified).length,
          totalCountries: Array.from(
            new Set(
              allBuilders.map((b) => b.headquartersCountry || "Unknown")
            )
          ).length,
          totalCities: Array.from(
            new Set(allBuilders.map((b) => b.headquarters_city || "Unknown"))
          ).length,
          averageRating:
            allBuilders.length > 0
              ? allBuilders.reduce(
                (sum, builder) => sum + (builder.rating || 0),
                0
              ) / allBuilders.length
              : 0,
          totalProjectsCompleted: allBuilders.reduce(
            (sum, builder) =>
              sum +
              (builder.projectsCompleted || builder.projects_completed || 0),
            0
          ),
          importedFromGMB: allBuilders.filter(
            (builder) =>
              builder.importedFromGMB ||
              builder.gmbImported ||
              builder.source === "GMB_API"
          ).length,
          totalReviews: allBuilders.reduce(
            (sum, builder) => sum + (builder.reviewCount || 0),
            0
          ),
        };

        setRealTimeStats(calculatedStats);
      } else {
        setRealTimeBuilders([]);
        // Reset stats to zero when no builders found
        setRealTimeStats({
          totalBuilders: 0,
          verifiedBuilders: 0,
          totalCountries: 0,
          totalCities: 0,
          averageRating: 0,
          totalProjectsCompleted: 0,
          importedFromGMB: 0,
          totalReviews: 0,
        });
      }
    } catch (error) {
      console.error("❌ Error refreshing builder data:", error);
      // Reset stats to zero on error
      setRealTimeStats({
        totalBuilders: 0,
        verifiedBuilders: 0,
        totalCountries: 0,
        totalCities: 0,
        averageRating: 0,
        totalProjectsCompleted: 0,
        importedFromGMB: 0,
        totalReviews: 0,
      });
    } finally {
      setIsRefreshing(false);
      setLastUpdated(new Date());
    }
  };

  // Filters and sorting states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [minRating, setMinRating] = useState([0]);
  const [showFilters, setShowFilters] = useState(true);
  const [sortBy, setSortBy] = useState("rating");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [buildersPerPage] = useState(12);

  const countries = useMemo(
    () => Array.from(new Set(GLOBAL_EXHIBITION_DATA.countries.map((c) => c.name))).sort(),
    []
  );

  const cities = useMemo(() => {
    const allCities = GLOBAL_EXHIBITION_DATA.cities;
    if (selectedCountry === "all")
      return Array.from(new Set(allCities.map((c) => c.name))).sort();
    return Array.from(
      new Set(
        allCities
          .filter((c) => c.country === selectedCountry)
          .map((c) => c.name)
      )
    ).sort();
  }, [selectedCountry]);

  const filteredBuilders = useMemo(() => {
    const filtered = realTimeBuilders.filter((builder) => {
      const matchesSearch =
        searchTerm === "" ||
        builder.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        builder.companyDescription
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesCountry =
        selectedCountry === "all" ||
        builder.headquarters.country === selectedCountry ||
        (builder.serviceLocations && builder.serviceLocations.some(loc => loc.country === selectedCountry));
      const matchesCity =
        selectedCity === "all" ||
        builder.headquarters.city === selectedCity ||
        (builder.serviceLocations && builder.serviceLocations.some(loc => loc.cities.includes(selectedCity)));
      const matchesRating = builder.rating >= minRating[0];
      return matchesSearch && matchesCountry && matchesCity && matchesRating;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "projects":
          return b.projectsCompleted - a.projectsCompleted;
        case "experience":
          return b.establishedYear - a.establishedYear;
        case "name":
          return a.companyName.localeCompare(b.companyName);
        default:
          return b.rating - a.rating;
      }
    });
    return filtered;
  }, [
    realTimeBuilders,
    searchTerm,
    selectedCountry,
    selectedCity,
    minRating,
    sortBy,
  ]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredBuilders.length / buildersPerPage);
  const startIndex = (currentPage - 1) * buildersPerPage;
  const endIndex = startIndex + buildersPerPage;
  const currentBuilders = filteredBuilders.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCountry, selectedCity, minRating, sortBy]);

  const h2 = "mt-6 text-[clamp(2rem,4.4vw,4rem)] font-light leading-[1.02] tracking-[-0.04em]";
  const pageNums = Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1);
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCountry("all");
    setSelectedCity("all");
    setMinRating([0]);
  };
  const triggerCls = "rounded-none border-[#252525]/20";

  return (
    <main className="bg-white text-[#252525]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#141414] px-6 pb-14 pt-32 text-white md:px-10 md:pb-20 md:pt-44">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_70%_40%,black,transparent_70%)]" />
        <div aria-hidden className="pointer-events-none absolute -right-40 top-0 h-[560px] w-[560px] rounded-full bg-[#E03A3A]/25 blur-[140px]" />
        <div className="relative mx-auto max-w-[1400px]">
          <Eyebrow light>Global directory</Eyebrow>
          <WordReveal as="h1" onLoad text="Exhibition stand builders directory" className="mt-8 max-w-4xl text-[clamp(2.25rem,5.6vw,5rem)] font-light leading-[1] tracking-[-0.04em]" />
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-xl text-base font-light leading-relaxed text-white/70 md:text-lg">
              Find verified exhibition stand builders worldwide. Connect with professionals who deliver exceptional results.
            </p>
            <div className="mt-10">
              <Link href="/quote" className="inline-block bg-[#E03A3A] px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-white hover:text-[#252525]">Get free quote</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/10 bg-[#141414] text-white">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 md:grid-cols-4">
          {[
            { v: realTimeStats.totalBuilders, l: "Total builders" },
            { v: realTimeStats.verifiedBuilders, l: "Verified builders" },
            { v: realTimeStats.totalCountries, l: "Countries" },
            { v: realTimeStats.averageRating.toFixed(1), l: "Avg rating" },
          ].map((st, i) => (
            <div key={st.l} className={`px-4 py-6 md:px-10 md:py-14 ${i % 2 === 1 ? "border-l border-white/10" : ""} ${i > 0 ? "md:border-l md:border-white/10" : ""} ${i > 1 ? "border-t border-white/10 md:border-t-0" : ""}`}>
              <div className="text-[clamp(1.7rem,5vw,3.5rem)] font-extralight leading-none tracking-[-0.04em]">{st.v}</div>
              <div className="mt-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/80 md:mt-4 md:text-[10px] md:tracking-[0.25em]">{st.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-0 z-30 border-b border-[#252525]/10 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-[1400px] px-6 py-4 md:px-10">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#252525]/65">
              {loading ? "Loading…" : `${filteredBuilders.length} builders`}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowFilters(!showFilters)} className="border border-[#252525]/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition-colors hover:border-[#E03A3A] hover:text-[#E03A3A]">
                {showFilters ? "Hide filters" : "Show filters"}
              </button>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className={`w-40 ${triggerCls}`}>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="projects">Most Projects</SelectItem>
                  <SelectItem value="experience">Most Experience</SelectItem>
                  <SelectItem value="name">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="relative lg:col-span-2">
                <SafeIcon IconComponent={FiSearch} className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#252525]/50" />
                <Input placeholder="Search builders, services, locations..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="rounded-none border-[#252525]/20 pl-10 focus-visible:ring-[#E03A3A]" />
              </div>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className={triggerCls}><SelectValue placeholder="Country" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map((country) => (<SelectItem key={country} value={country}>{country}</SelectItem>))}
                </SelectContent>
              </Select>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className={triggerCls}><SelectValue placeholder="City" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (<SelectItem key={city} value={city}>{city}</SelectItem>))}
                </SelectContent>
              </Select>
              <div>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-[0.15em] text-[#252525]/65">Min rating</span>
                  <span className="font-semibold text-[#E03A3A]">{minRating[0]}+</span>
                </div>
                <Slider value={minRating} onValueChange={setMinRating} max={5} step={0.5} className="w-full" />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      <section className="bg-[#F0EDE8] px-6 py-12 md:px-10 md:py-20">
        <div className="mx-auto max-w-[1400px]">
          <Eyebrow>Browse builders</Eyebrow>
          <h2 className={h2}>Find your stand partner</h2>

          {loading && (
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (<div key={i} className="h-72 animate-pulse bg-white" />))}
            </div>
          )}

          {!loading && currentBuilders.length === 0 && (
            <div className="mt-12 border border-dashed border-[#252525]/25 bg-white p-10 text-center">
              <h3 className="text-2xl font-light tracking-tight">No builders found</h3>
              <p className="mt-2 text-[#252525]/70">Try adjusting your search or filter criteria</p>
              <button onClick={resetFilters} className="mt-6 bg-[#E03A3A] px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-[#141414]">Clear filters</button>
            </div>
          )}

          {!loading && currentBuilders.length > 0 && (
            <>
              <div className="mt-12 grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
                {currentBuilders.map((builder, i) => (
                  <Reveal key={builder.id} delay={Math.min(i, 3) * 0.05} y={18}>
                    <div className="group flex h-full flex-col border border-transparent bg-white transition-all duration-500 hover:border-[#E03A3A] hover:shadow-[0_16px_40px_rgba(37,37,37,0.08)]">
                      <div className="flex-1 p-6 md:p-7">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#141414] text-lg font-light text-white transition-colors duration-500 group-hover:bg-[#E03A3A]">{builder.companyName.charAt(0)}</div>
                            <div className="min-w-0">
                              <h3 className="truncate text-lg font-medium tracking-tight">{builder.companyName}</h3>
                              <div className="truncate text-xs text-[#252525]/65">{builder.headquarters.city}, {builder.headquarters.country}</div>
                            </div>
                          </div>
                          {builder.verified && <span className="shrink-0 bg-[#E03A3A] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-white">Verified</span>}
                        </div>
                        <div className="mt-5 flex items-center justify-between text-sm">
                          <span className="text-[#E03A3A]">★ <span className="font-medium text-[#252525]">{builder.rating.toFixed(1)}</span></span>
                          <span className="text-xs text-[#252525]/65">{builder.reviewCount} reviews</span>
                        </div>
                        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-[#252525]/70">{builder.companyDescription || "Professional exhibition stand builder with years of experience."}</p>
                        <div className="mt-5 grid grid-cols-2 gap-px bg-[#252525]/10 text-center">
                          <div className="bg-[#F0EDE8]/60 py-3"><div className="text-lg font-light">{builder.projectsCompleted}</div><div className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#252525]/65">Projects</div></div>
                          <div className="bg-[#F0EDE8]/60 py-3"><div className="text-lg font-light">{builder.establishedYear}</div><div className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#252525]/65">Established</div></div>
                        </div>
                        {builder.keyStrengths && builder.keyStrengths.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {builder.keyStrengths.slice(0, 3).map((strength, index) => (<span key={index} className="border border-[#252525]/15 px-2 py-1 text-[11px] text-[#252525]/70">{strength}</span>))}
                            {builder.keyStrengths.length > 3 && <span className="px-1 py-1 text-[11px] text-[#252525]/60">+{builder.keyStrengths.length - 3}</span>}
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 border-t border-[#252525]/10 text-[11px] font-semibold uppercase tracking-[0.15em]">
                        <Link href={`/builders/${builder.slug}`} className="py-4 text-center transition-colors hover:bg-[#F5F6F7]">View profile</Link>
                        <Link href={`/quote?builder=${builder.id}`} className="bg-[#141414] py-4 text-center text-white transition-colors hover:bg-[#E03A3A]">Get quote</Link>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-10 flex flex-col gap-4 border-t border-[#252525]/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-[#252525]/70">Showing {startIndex + 1}-{Math.min(endIndex, filteredBuilders.length)} of {filteredBuilders.length} builders</div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="border border-[#252525]/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition-colors hover:border-[#E03A3A] disabled:opacity-40">Prev</button>
                    {pageNums.map((n) => (
                      <button key={n} onClick={() => setCurrentPage(n)} className={`h-9 w-9 border text-xs font-semibold transition-colors ${currentPage === n ? "border-[#E03A3A] bg-[#E03A3A] text-white" : "border-[#252525]/20 hover:border-[#E03A3A]"}`}>{n}</button>
                    ))}
                    {totalPages > 5 && (
                      <>
                        <span className="px-1 text-[#252525]/50">…</span>
                        <button onClick={() => setCurrentPage(totalPages)} className={`h-9 min-w-9 border px-2 text-xs font-semibold transition-colors ${currentPage === totalPages ? "border-[#E03A3A] bg-[#E03A3A] text-white" : "border-[#252525]/20 hover:border-[#E03A3A]"}`}>{totalPages}</button>
                      </>
                    )}
                    <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="border border-[#252525]/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition-colors hover:border-[#E03A3A] disabled:opacity-40">Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Why */}
      <section className="bg-[#141414] px-6 py-16 text-white md:px-10 md:py-32">
        <div className="mx-auto max-w-[1400px]">
          <Eyebrow light>Why StandsZone</Eyebrow>
          <WordReveal text="Why choose our verified builders" className={h2} />
          <p className="mt-6 max-w-xl text-white/70">Our platform connects you with pre-vetted exhibition stand builders who deliver exceptional results.</p>
          <div className="mt-12 grid border-t border-white/20 md:mt-16 md:grid-cols-3">
            {[
              { t: "Verified professionals", d: "Every builder undergoes a rigorous verification process to ensure quality and reliability." },
              { t: "Award-winning work", d: "Our builders have won industry recognition for innovative designs and exceptional craftsmanship." },
              { t: "On-time delivery", d: "Guaranteed project completion within agreed timelines with transparent communication throughout." },
            ].map((b, i) => (
              <Reveal key={b.t} delay={i * 0.06}>
                <div className="h-full border-b border-white/10 py-8 md:border-b-0 md:border-r md:border-white/10 md:px-8 md:first:pl-0 md:last:border-r-0">
                  <div className="text-xs font-semibold tabular-nums tracking-[0.2em] text-[#E03A3A]">{String(i + 1).padStart(2, "0")}</div>
                  <h3 className="mt-6 text-2xl font-light tracking-tight">{b.t}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-white/70">{b.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#E03A3A] px-6 py-16 text-white md:px-10 md:py-28">
        <Reveal className="mx-auto grid max-w-[1400px] gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <h2 className="max-w-[18ch] text-[clamp(2rem,5vw,4.5rem)] font-light leading-[1] tracking-[-0.04em]">Ready to find your perfect builder?</h2>
            <p className="mt-5 max-w-xl text-white/90">Get matched with verified exhibition stand builders who meet your specific requirements.</p>
          </div>
          <Link href="/quote" className="whitespace-nowrap bg-[#141414] px-8 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors hover:bg-white hover:text-[#252525]">Get free quote</Link>
        </Reveal>
      </section>
    </main>
  );
}
