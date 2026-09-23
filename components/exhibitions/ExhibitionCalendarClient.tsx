"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FiCalendar, FiMapPin, FiExternalLink, FiCheckCircle, FiFilter, FiGlobe, FiSearch } from "react-icons/fi";
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

export default function ExhibitionCalendarClient() {
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
  const [exhibitions, setExhibitions] = useState<ExhibitionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [groupedCountries, setGroupedCountries] = useState<any[]>([]);

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
    fetchCalendar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, city, year]);

  useEffect(() => {
    fetchGrouped();
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="pt-20 pb-12 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
            <FiGlobe className="w-4 h-4 mr-2 text-emerald-400" />
            Country + City Wise Exhibition Calendar
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {isUAE ? "UAE Exhibition Calendar" : "Global Exhibition Calendar"}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              {isUAE ? "7 Emirates • All Venues • 2026-2027" : `${allCountries.length} Countries • ${GLOBAL_EXHIBITION_DATA.cities.length} Cities • 2026-2027`}
            </span>
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            {isUAE
              ? "Deep coverage of all UAE emirates — Dubai, Abu Dhabi, Sharjah, Ajman, Fujairah, Ras Al Khaimah, Umm Al Quwain — sourced only from DWTC, ADNEC, Expo Centre Sharjah & UFI-certified calendars. Filter by emirate to see this year + next year shows."
              : "Genuine exhibitions sourced only from official venue & organizer sites and UFI-certified calendars. Filter by country/city to see only the shows that matter to you. Every entry links to its official source."}
          </p>

          {/* Stats */}
          {groupedCountries.length > 0 && (
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-2xl font-bold">{groupedCountries.length}</div>
                <div className="text-sm text-gray-300">Countries with shows</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-2xl font-bold">{total}</div>
                <div className="text-sm text-gray-300">Upcoming exhibitions</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-2xl font-bold">{isUAE ? "7" : allCountries.length}</div>
                <div className="text-sm text-gray-300">{isUAE ? "Emirates" : "Countries covered"}</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-2xl font-bold">{isUAE ? "8" : GLOBAL_EXHIBITION_DATA.cities.length}</div>
                <div className="text-sm text-gray-300">{isUAE ? "Emirate cities" : "Cities covered"}</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <FiFilter className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter:</span>
              </div>

              <Select value={country} onValueChange={handleCountryChange}>
                <SelectTrigger className="w-56">
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
                <SelectTrigger className="w-56">
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
                <SelectTrigger className="w-32">
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

            <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search exhibition, venue, industry..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">
                Search
              </Button>
            </form>
          </div>

          {/* Active filters summary */}
          {(country !== "all" || city !== "all" || year !== "all" || search) && (
            <div className="mt-3 flex flex-wrap gap-2 items-center text-sm">
              <span className="text-gray-500">Active:</span>
              {country !== "all" && <Badge variant="secondary">{country}</Badge>}
              {city !== "all" && <Badge variant="secondary">{city}</Badge>}
              {year !== "all" && <Badge variant="secondary">{year}</Badge>}
              {search && <Badge variant="secondary">q: {search}</Badge>}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCountry("all"); setCity("all"); setYear("all"); setSearch("");
                  router.push("/exhibitions/calendar");
                }}
                className="h-7 text-xs"
              >
                Clear
              </Button>
              <span className="text-gray-400 ml-2">
                {loading ? "Loading..." : `${total} results`}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Country quick nav */}
      <section className="py-6 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FiGlobe className="w-4 h-4" /> Browse by Country ({groupedCountries.length} with exhibitions)
          </h3>
          <div className="flex flex-wrap gap-2">
            {groupedCountries.slice(0, 20).map((g: any) => (
              <button
                key={g.country}
                onClick={() => handleCountryChange(g.country)}
                className={`px-3 py-1.5 rounded-full text-sm border transition ${country === g.country ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 hover:bg-gray-100 border-gray-200"}`}
              >
                {g.country} <span className="ml-1 opacity-60">({g.totalExhibitions})</span>
              </button>
            ))}
            {groupedCountries.length > 20 && <span className="text-sm text-gray-400 px-2 py-1.5">+ {groupedCountries.length - 20} more</span>}
          </div>
          {country !== "all" && citiesForSelectedCountry.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-gray-600 mb-2">{country} - Cities</h4>
              <div className="flex flex-wrap gap-2">
                {citiesForSelectedCountry.map(ci => (
                  <button
                    key={ci}
                    onClick={() => handleCityChange(ci)}
                    className={`px-3 py-1 rounded-full text-xs border ${city === ci ? "bg-emerald-600 text-white border-emerald-600" : "bg-white hover:bg-gray-50 border-gray-200"}`}
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
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader><div className="h-5 bg-gray-200 rounded w-3/4" /></CardHeader>
                  <CardContent><div className="h-20 bg-gray-100 rounded" /></CardContent>
                </Card>
              ))}
            </div>
          ) : exhibitions.length === 0 ? (
            <Card className="p-12 text-center">
              <FiCalendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">No exhibitions found</h3>
              <p className="text-gray-500 mt-2 max-w-xl mx-auto">
                {country !== "all" || city !== "all"
                  ? `No verified exhibitions for ${[country !== "all" ? country : "", city !== "all" ? city : ""].filter(Boolean).join(" • ")} yet. Our sub-agent crawls official venue sites weekly - check back soon or try another city.`
                  : "No upcoming exhibitions match your filters. Try clearing filters or searching a different term."}
              </p>
              <div className="mt-6 flex justify-center gap-2">
                <Button variant="outline" onClick={() => { setCountry("all"); setCity("all"); setYear("all"); setSearch(""); router.push("/exhibitions/calendar"); }}>
                  View All
                </Button>
                <a href="/api/exhibitions/calendar?groupBy=country" target="_blank" className="text-sm text-blue-600 hover:underline flex items-center gap-1 px-4 py-2">
                  View API <FiExternalLink className="w-3 h-3" />
                </a>
              </div>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {total} {country !== "all" ? `exhibitions in ${city !== "all" ? `${city}, ${country}` : country}` : "upcoming exhibitions"}
                </h2>
                <span className="text-sm text-gray-500">Sorted by start date • Only verified sources</span>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exhibitions.map((ex) => (
                  <Card key={ex.slug} className="hover:shadow-lg transition-shadow border border-gray-200 flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge variant={ex.verified ? "default" : "secondary"} className={ex.verified ? "bg-emerald-600" : "bg-amber-100 text-amber-700"}>
                          {ex.verified ? <><FiCheckCircle className="w-3 h-3 mr-1" /> Verified • Official</> : "Unverified • Pending check"}
                        </Badge>
                        {ex.featured && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Featured</Badge>}
                      </div>
                      <CardTitle className="text-lg leading-tight line-clamp-2">
                        {ex.name}
                      </CardTitle>
                      {ex.industry && <Badge variant="secondary" className="w-fit mt-2 text-xs">{ex.industry}</Badge>}
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <div className="space-y-2 text-sm text-gray-600 flex-1">
                        <div className="flex items-center gap-2">
                          <FiMapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span>{ex.city_name}, {ex.country_name} • {ex.venue || "TBA venue"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiCalendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span>{formatDate(ex.start_date)} — {formatDate(ex.end_date)}</span>
                        </div>
                        {ex.website && (
                          <div className="flex items-center gap-2 truncate">
                            <FiExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <a href={ex.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                              Official site
                            </a>
                            {ex.source_url && ex.source_url !== ex.website && (
                              <span className="text-gray-400 text-xs truncate">• src: {new URL(ex.source_url).hostname}</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t flex gap-2">
                        <Button asChild size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                          <a href={ex.website || ex.source_url || "#"} target="_blank" rel="noopener noreferrer">
                            View Dates
                          </a>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="flex-1">
                          <Link href={`/exhibitions/calendar?country=${encodeURIComponent(ex.country_name)}&city=${encodeURIComponent(ex.city_name)}`}>
                            {ex.city_name} shows
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer note */}
      <section className="py-8 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <p>
            Calendar built by the Standzon Exhibition Calendar Sub-Agent • Sources:{" "}
            <span className="font-medium">10Times (UFI), TradeFairDates (m+a), ExpoDataBase, EventsEye, AUMA, DWTC, Messe Frankfurt/München/Berlin, Koelnmesse, Fira Barcelona, Javits, CES, Canton Fair</span>
            {" • "}Every entry stores its <code className="bg-gray-100 px-1 rounded">source_url</code> and <code className="bg-gray-100 px-1 rounded">verified</code> flag. No dummy dates.
          </p>
          <p className="mt-2">
            Admin: trigger full refresh via <code className="bg-gray-100 px-1 rounded">POST /api/admin/exhibitions/sync</code> with service role key. Or run locally: <code className="bg-gray-100 px-1 rounded">npx ts-node scripts/agents/exhibition-calendar-sync.ts</code>
          </p>
        </div>
      </section>
    </div>
  );
}
