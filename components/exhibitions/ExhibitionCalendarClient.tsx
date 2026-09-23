"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FiCalendar, FiMapPin, FiExternalLink, FiCheckCircle, FiFilter, FiGlobe, FiSearch, FiArrowUpRight } from "react-icons/fi";
import { GLOBAL_EXHIBITION_DATA } from "@/lib/data/globalCities";

interface ExhibitionRow {
  id: string;
  name: string;
  slug: string;
  city_name: string;
  country_name: string;
  country_code: string;
  venue?: string | null;
  start_date: string;
  end_date: string;
  industry?: string | null;
  website?: string | null;
  source_url?: string | null;
  verified: boolean;
  featured: boolean;
}

export default function ExhibitionCalendarClient({
  initialExhibitions = [],
  initialTotal = 0,
  initialGroupedCountries = [],
}: {
  initialExhibitions?: ExhibitionRow[];
  initialTotal?: number;
  initialGroupedCountries?: any[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialCountry = searchParams?.get("country") || "all";
  const initialCity = searchParams?.get("city") || "all";
  const initialYear = searchParams?.get("year") || "all";
  const initialSearch = searchParams?.get("q") || "";

  const [country, setCountry] = useState(initialCountry);
  const [city, setCity] = useState(initialCity);
  const [year, setYear] = useState(initialYear);
  const [search, setSearch] = useState(initialSearch);
  const [exhibitions, setExhibitions] = useState<ExhibitionRow[]>(initialExhibitions);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(initialTotal);
  const [groupedCountries, setGroupedCountries] = useState<any[]>(initialGroupedCountries);
  const [skipFirstFetch, setSkipFirstFetch] = useState(!initialSearch && initialExhibitions.length > 0);

  // UAE emirates (7 + Al Ain as part of Abu Dhabi)
  const UAE_EMIRATES = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Fujairah", "Ras Al Khaimah", "Umm Al Quwain", "Al Ain"];
  const isUAE = country === "United Arab Emirates";

  const allCountries = useMemo(() => GLOBAL_EXHIBITION_DATA.countries.map(c => c.name).sort(), []);
  const citiesForSelectedCountry = useMemo(() => {
    if (country === "all") return [];
    if (country === "United Arab Emirates") return UAE_EMIRATES;
    return GLOBAL_EXHIBITION_DATA.countries.find((candidate) => candidate.name === country)?.majorCities || [];
  }, [country]);

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return [current, current + 1, current + 2].map(String);
  }, []);

  const updateUrl = (next: { country?: string; city?: string; year?: string; q?: string }) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (next.country !== undefined) {
      if (next.country === "all") params.delete("country");
      else params.set("country", next.country);
    }
    if (next.city !== undefined) {
      if (next.city === "all") params.delete("city");
      else params.set("city", next.city);
    }
    if (next.year !== undefined) {
      if (next.year === "all") params.delete("year");
      else params.set("year", next.year);
    }
    if (next.q !== undefined) {
      if (!next.q) params.delete("q");
      else params.set("q", next.q);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const fetchCalendar = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (country !== "all") params.set("country", country);
      if (city !== "all" && country !== "all") params.set("city", city);
      if (year !== "all") params.set("year", year);
      if (search) params.set("q", search);
      params.set("upcoming", "true");
      params.set("limit", "100");

      const res = await fetch(`/api/exhibitions/calendar?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setExhibitions(json.data || []);
        setTotal(json.pagination?.total || json.data?.length || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrouped = async () => {
    try {
      const res = await fetch(`/api/exhibitions/calendar?groupBy=country`);
      const json = await res.json();
      if (json.success) setGroupedCountries(json.data || []);
    } catch {}
  };

  useEffect(() => {
    if (skipFirstFetch) { setSkipFirstFetch(false); return; }
    fetchCalendar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, city, year]);

  useEffect(() => {
    if (initialGroupedCountries.length > 0) return;
    fetchGrouped();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCountryChange = (val: string) => {
    setCountry(val);
    setCity("all");
    updateUrl({ country: val, city: "all" });
  };

  const handleCityChange = (val: string) => {
    setCity(val);
    updateUrl({ city: val });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ q: search });
    fetchCalendar();
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return iso;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#252525]">
      {/* Hero */}
      <section className="bg-[#141414] pb-14 pt-28 text-white md:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-[1400px] px-6 md:px-10"
        >
          <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#EC6A6A]">
            <span className="h-px w-9 bg-[#E03A3A]" />
            Live, source-verified data
          </div>
          <h1 className="mt-7 max-w-2xl text-[clamp(2.2rem,5vw,4.2rem)] font-light leading-[1.02] tracking-[-0.03em]">
            {isUAE ? "UAE exhibition calendar" : "Global exhibition calendar"}
          </h1>
          <p className="mt-5 max-w-xl text-sm font-light leading-relaxed text-white/60 md:text-base">
            {isUAE
              ? "Every UAE emirate — Dubai, Abu Dhabi, Sharjah, Ajman, Fujairah, Ras Al Khaimah, Umm Al Quwain — sourced only from DWTC, ADNEC, Expo Centre Sharjah & UFI-certified calendars."
              : "Genuine exhibitions sourced only from official venue & organizer sites and UFI-certified calendars. Every entry links to its official source."}
          </p>

          {groupedCountries.length > 0 && (
            <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden border border-white/15 bg-white/15 md:grid-cols-4">
              {[
                { label: "Countries with shows", value: groupedCountries.length },
                { label: "Upcoming exhibitions", value: total },
                { label: isUAE ? "Emirates" : "Countries covered", value: isUAE ? "7" : allCountries.length },
                { label: isUAE ? "Emirate cities" : "Cities covered", value: isUAE ? "8" : GLOBAL_EXHIBITION_DATA.cities.length },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#141414] p-5">
                  <div className="text-2xl font-light tracking-tight">{stat.value}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/50">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </section>

      {/* Filters */}
      <section className="sticky top-0 z-30 border-b border-[#252525]/10 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-[1400px] px-6 py-4 md:px-10">
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5B5C5D]">
                <FiFilter className="text-[#E03A3A]" /> Filter
              </div>

              <Select value={country} onValueChange={handleCountryChange}>
                <SelectTrigger className="w-56 rounded-none border-[#252525]/20">
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries ({allCountries.length})</SelectItem>
                  {allCountries.map(c => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={city} onValueChange={handleCityChange} disabled={country === "all"}>
                <SelectTrigger className="w-56 rounded-none border-[#252525]/20">
                  <SelectValue placeholder={country === "all" ? "Select country first" : "All Cities"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities {citiesForSelectedCountry.length ? `(${citiesForSelectedCountry.length})` : ""}</SelectItem>
                  {citiesForSelectedCountry.map(ci => (
                    <SelectItem key={ci} value={ci}>
                      {ci}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={year} onValueChange={(v) => { setYear(v); updateUrl({ year: v }); }}>
                <SelectTrigger className="w-32 rounded-none border-[#252525]/20">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map(y => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <form onSubmit={handleSearchSubmit} className="flex w-full gap-2 lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5B5C5D]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search exhibition, venue, industry..."
                  className="w-full border border-[#252525]/20 py-2 pl-10 pr-4 text-sm focus:border-[#E03A3A] focus:outline-none"
                />
              </div>
              <Button type="submit" size="sm" className="rounded-none bg-[#E03A3A] hover:bg-[#141414]">
                Search
              </Button>
            </form>
          </div>

          {(country !== "all" || city !== "all" || year !== "all" || search) && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-[#5B5C5D]">Active:</span>
              {country !== "all" && <Badge variant="secondary">{country}</Badge>}
              {city !== "all" && <Badge variant="secondary">{city}</Badge>}
              {year !== "all" && <Badge variant="secondary">{year}</Badge>}
              {search && <Badge variant="secondary">q: {search}</Badge>}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCountry("all"); setCity("all"); setYear("all"); setSearch("");
                  router.push("/trade-shows");
                }}
                className="h-7 text-xs"
              >
                Clear
              </Button>
              <span className="ml-2 text-[#5B5C5D]/70">
                {loading ? "Loading..." : `${total} results`}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Country quick nav */}
      <section className="border-b border-[#252525]/10 bg-white py-6">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <h3 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5B5C5D]">
            <FiGlobe className="text-[#E03A3A]" /> Browse by country ({groupedCountries.length} with exhibitions)
          </h3>
          <div className="flex flex-wrap gap-2">
            {groupedCountries.slice(0, 20).map((g: any) => (
              <button
                key={g.country}
                onClick={() => handleCountryChange(g.country)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${country === g.country ? "border-[#E03A3A] bg-[#E03A3A] text-white" : "border-[#252525]/20 bg-white hover:border-[#E03A3A] hover:text-[#E03A3A]"}`}
              >
                {g.country} <span className="ml-1 opacity-60">({g.totalExhibitions})</span>
              </button>
            ))}
            {groupedCountries.length > 20 && <span className="px-2 py-1.5 text-sm text-[#5B5C5D]/60">+ {groupedCountries.length - 20} more</span>}
          </div>
          {country !== "all" && citiesForSelectedCountry.length > 0 && (
            <div className="mt-4">
              <h4 className="mb-2 text-xs font-semibold text-[#5B5C5D]">{country} — Cities</h4>
              <div className="flex flex-wrap gap-2">
                {citiesForSelectedCountry.map(ci => (
                  <button
                    key={ci}
                    onClick={() => handleCityChange(ci)}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${city === ci ? "border-[#141414] bg-[#141414] text-white" : "border-[#252525]/15 bg-white hover:border-[#141414]"}`}
                  >
                    {ci}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      <section className="py-10">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse rounded-none border-[#252525]/10">
                  <CardHeader><div className="h-5 w-3/4 rounded bg-[#252525]/10" /></CardHeader>
                  <CardContent><div className="h-20 rounded bg-[#252525]/5" /></CardContent>
                </Card>
              ))}
            </div>
          ) : exhibitions.length === 0 ? (
            <Card className="rounded-none border-[#252525]/10 p-12 text-center">
              <FiCalendar className="mx-auto mb-4 h-12 w-12 text-[#252525]/20" />
              <h3 className="text-lg font-semibold text-[#252525]">No exhibitions found</h3>
              <p className="mt-2 max-w-xl mx-auto text-[#5B5C5D]">
                {country !== "all" || city !== "all"
                  ? `No verified exhibitions for ${[country !== "all" ? country : "", city !== "all" ? city : ""].filter(Boolean).join(" • ")} yet. Our sub-agent crawls official venue sites weekly - check back soon or try another city.`
                  : "No upcoming exhibitions match your filters. Try clearing filters or searching a different term."}
              </p>
              <div className="mt-6 flex justify-center gap-2">
                <Button variant="outline" className="rounded-none" onClick={() => { setCountry("all"); setCity("all"); setYear("all"); setSearch(""); router.push("/trade-shows"); }}>
                  View All
                </Button>
                <a href="/api/exhibitions/calendar?groupBy=country" target="_blank" className="flex items-center gap-1 px-4 py-2 text-sm text-[#E03A3A] hover:underline">
                  View API <FiExternalLink className="h-3 w-3" />
                </a>
              </div>
            </Card>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-light tracking-tight text-[#252525]">
                  {total} {country !== "all" ? `exhibitions in ${city !== "all" ? `${city}, ${country}` : country}` : "upcoming exhibitions"}
                </h2>
                <span className="text-sm text-[#5B5C5D]">Sorted by start date • Only verified sources</span>
              </div>

              <motion.div
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              >
                <AnimatePresence>
                  {exhibitions.map((ex) => (
                    <motion.div
                      key={ex.slug}
                      variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                    >
                      <Card className="group flex h-full flex-col rounded-none border-[#252525]/10 transition-colors duration-300 hover:border-[#E03A3A]">
                        <CardHeader className="pb-3">
                          <div className="mb-2 flex items-start justify-between gap-2">
                            <Badge variant={ex.verified ? "default" : "secondary"} className={ex.verified ? "rounded-none bg-[#141414]" : "rounded-none bg-amber-100 text-amber-700"}>
                              {ex.verified ? <><FiCheckCircle className="mr-1 h-3 w-3" /> Verified • Official</> : "Unverified • Pending check"}
                            </Badge>
                            {ex.featured && <Badge variant="outline" className="rounded-none border-[#EC6A6A]/40 bg-[#EC6A6A]/10 text-[#E03A3A]">Featured</Badge>}
                          </div>
                          <CardTitle className="text-lg font-medium leading-tight line-clamp-2">
                            {ex.name}
                          </CardTitle>
                          {ex.industry && <Badge variant="secondary" className="mt-2 w-fit rounded-none text-xs">{ex.industry}</Badge>}
                        </CardHeader>
                        <CardContent className="flex flex-1 flex-col">
                          <div className="flex-1 space-y-2 text-sm text-[#5B5C5D]">
                            <div className="flex items-center gap-2">
                              <FiMapPin className="h-4 w-4 flex-shrink-0 text-[#E03A3A]" />
                              <span>{ex.city_name}, {ex.country_name} • {ex.venue || "TBA venue"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FiCalendar className="h-4 w-4 flex-shrink-0 text-[#E03A3A]" />
                              <span>{formatDate(ex.start_date)} — {formatDate(ex.end_date)}</span>
                            </div>
                            {ex.website && (
                              <div className="flex items-center gap-2 truncate">
                                <FiExternalLink className="h-4 w-4 flex-shrink-0 text-[#5B5C5D]/60" />
                                <a href={ex.website} target="_blank" rel="noopener noreferrer" className="truncate text-[#E03A3A] hover:underline">
                                  Official site
                                </a>
                                {ex.source_url && ex.source_url !== ex.website && (
                                  <span className="truncate text-xs text-[#5B5C5D]/60">• src: {new URL(ex.source_url).hostname}</span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="mt-4 flex gap-2 border-t border-[#252525]/10 pt-4">
                            <Button asChild size="sm" className="flex-1 rounded-none bg-[#E03A3A] hover:bg-[#141414]">
                              <a href={ex.website || ex.source_url || "#"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1">
                                View Dates <FiArrowUpRight className="h-3 w-3" />
                              </a>
                            </Button>
                            <Button asChild variant="outline" size="sm" className="flex-1 rounded-none border-[#252525]/20">
                              <Link href={`/trade-shows?country=${encodeURIComponent(ex.country_name)}&city=${encodeURIComponent(ex.city_name)}`}>
                                {ex.city_name} shows
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </>
          )}
        </div>
      </section>

      {/* Footer note */}
      <section className="border-t border-[#252525]/10 bg-white py-8">
        <div className="mx-auto max-w-[1400px] px-6 text-center text-sm text-[#5B5C5D] md:px-10">
          <p>
            Calendar built by the Standzon Exhibition Calendar Sub-Agent • Sources:{" "}
            <span className="font-medium text-[#252525]">10Times (UFI), TradeFairDates (m+a), ExpoDataBase, EventsEye, AUMA, DWTC, Messe Frankfurt/München/Berlin, Koelnmesse, Fira Barcelona, Javits, CES, Canton Fair</span>
            {" • "}Every entry stores its <code className="rounded bg-[#252525]/5 px-1">source_url</code> and <code className="rounded bg-[#252525]/5 px-1">verified</code> flag. No dummy dates.
          </p>
          <p className="mt-2">
            Admin: trigger full refresh via <code className="rounded bg-[#252525]/5 px-1">POST /api/admin/exhibitions/sync</code> with service role key. Or run locally: <code className="rounded bg-[#252525]/5 px-1">npx ts-node scripts/agents/exhibition-calendar-sync.ts</code>
          </p>
        </div>
      </section>
    </div>
  );
}
