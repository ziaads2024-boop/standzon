'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ClientPageWithBreadcrumbs from '@/components/ClientPageWithBreadcrumbs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Globe, MapPin, Building, Search, ArrowRight, ChevronDown, ChevronUp, Filter
} from 'lucide-react';
import { getAllCountries, getAllCities, GLOBAL_STATS } from '@/lib/data/globalExhibitionDatabase';

interface CountryData {
  name: string;
  code: string;
  continent: string;
  builderCount: number;
  averageRating?: number;
  cities?: string[];
  slug: string;
  marketSize: number;
  annualEvents: number;
}

export default function ExhibitionStandsContent() {
  const [saved, setSaved] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContinent, setSelectedContinent] = useState('all');
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set());
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGlobalCountriesData();
    (async () => {
      try {
        const res = await fetch('/api/admin/pages-editor?action=get-content&path=%2Fexhibition-stands', { cache: 'no-store' });
        const data = await res.json();
        if (data?.success && data?.data) setSaved(data.data);
      } catch {}
    })();
  }, []);

  const loadGlobalCountriesData = async () => {
    try {
      const allCountries = getAllCountries();
      const allCities = getAllCities();

      let buildersByCountry: { [key: string]: number } = {};
      let averageRatingByCountry: { [key: string]: number } = {};
      try {
        const response = await fetch('/api/admin/builders?action=countries');
        const result = await response.json();

        if (result.success && result.data) {
          result.data.forEach((country: any) => {
            buildersByCountry[country.name] = country.builderCount || 0;
            averageRatingByCountry[country.name] = typeof country.averageRating === 'number' ? country.averageRating : 0;
            if (country.name === 'UAE') {
              buildersByCountry['United Arab Emirates'] = country.builderCount || 0;
              averageRatingByCountry['United Arab Emirates'] = typeof country.averageRating === 'number' ? country.averageRating : 0;
            } else if (country.name === 'United Arab Emirates') {
              buildersByCountry['UAE'] = country.builderCount || 0;
              averageRatingByCountry['UAE'] = typeof country.averageRating === 'number' ? country.averageRating : 0;
            }
          });
        }
      } catch (apiError) {
        console.warn('Could not load real builder data, using static data:', apiError);
      }

      const processedCountries = allCountries.map(country => {
        const countryCities = allCities.filter(city => city.countrySlug === country.slug);
        const realBuilderCount = buildersByCountry[country.name] || 0;
        const averageRating = averageRatingByCountry[country.name] || 0;

        return {
          name: country.name,
          code: country.code,
          continent: country.continent,
          builderCount: realBuilderCount,
          averageRating,
          cities: countryCities.map(city => city.name),
          slug: country.slug,
          marketSize: country.marketSize,
          annualEvents: country.annualEvents
        };
      });

      const uniqueCountries = processedCountries.filter((country, index, self) =>
        index === self.findIndex(c => c.code === country.code)
      );

      const sortedCountries = uniqueCountries.sort((a, b) => {
        if (a.builderCount > 0 && b.builderCount === 0) return -1;
        if (a.builderCount === 0 && b.builderCount > 0) return 1;
        if (a.builderCount > 0 && b.builderCount > 0) return b.builderCount - a.builderCount;
        if (a.builderCount === 0 && b.builderCount === 0) {
          if (a.marketSize !== b.marketSize) return b.marketSize - a.marketSize;
          return a.name.localeCompare(b.name);
        }
        return 0;
      });

      setCountries(sortedCountries);
    } catch (error) {
      console.error('Error loading global countries data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCountries = countries.filter(country => {
    const matchesSearch = searchQuery === '' ||
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (country.cities && country.cities.some(city => city.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesContinent = selectedContinent === 'all' || country.continent === selectedContinent;
    return matchesSearch && matchesContinent;
  });

  const continentGroups = filteredCountries.reduce((groups: { continent: string; items: CountryData[] }[], country) => {
    const group = groups.find(g => g.continent === country.continent);
    if (group) group.items.push(country);
    else groups.push({ continent: country.continent, items: [country] });
    return groups;
  }, []);

  const toggleCountryExpansion = (countryCode: string) => {
    const newExpanded = new Set(expandedCountries);
    if (newExpanded.has(countryCode)) newExpanded.delete(countryCode);
    else newExpanded.add(countryCode);
    setExpandedCountries(newExpanded);
  };

  const totalCountries = countries.length;
  const totalCities = GLOBAL_STATS.totalCities;
  const totalBuilders = GLOBAL_STATS.totalBuilders;
  const activeCountries = countries.filter(c => c.builderCount > 0).length;
  const totalMarketSize = GLOBAL_STATS.totalMarketSize;

  const continents = ['Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania'];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#141414] text-white">
        <div className="text-center">
          <Globe className="mx-auto mb-4 h-10 w-10 animate-spin text-[#E03A3A]" />
          <p className="text-white/70">Loading global exhibition directory…</p>
        </div>
      </div>
    );
  }

  return (
    <ClientPageWithBreadcrumbs className="min-h-screen bg-[#F0EDE8] text-[#252525]">
      {/* Hero */}
      <section className="bg-[#141414] pb-14 pt-28 text-white md:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mx-auto max-w-[1400px] px-6 md:px-10"
        >
          <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#EC6A6A]">
            <span className="h-px w-9 bg-[#E03A3A]" />
            Global exhibition directory
          </div>
          <h1 className="mt-7 max-w-2xl text-[clamp(2.2rem,5vw,4.2rem)] font-light leading-[1.02] tracking-[-0.03em]">
            Exhibition stands, by location.
          </h1>
          <p className="mt-5 max-w-xl text-sm font-light leading-relaxed text-white/60 md:text-base">
            Verified builders across {totalCountries} countries and {totalCities}+ cities — ${totalMarketSize}B+ market coverage.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden border border-white/15 bg-white/15 md:grid-cols-4">
            {[
              { label: 'Expert builders', value: totalBuilders.toLocaleString() },
              { label: 'Countries', value: totalCountries },
              { label: 'Major cities', value: totalCities },
              { label: 'Active markets', value: activeCountries },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#141414] p-5">
                <div className="text-2xl font-light tracking-tight">{stat.value}</div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {saved?.content?.extra?.rawHtml && (
        <section className="py-12">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10">
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: saved.content.extra.rawHtml }} />
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="sticky top-0 z-30 border-b border-[#252525]/10 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-[1400px] px-6 py-4 md:px-10">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex w-full flex-1 items-center gap-3 md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5B5C5D]" />
                <Input
                  placeholder="Search countries or cities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-none border-[#252525]/20 pl-10 focus-visible:ring-[#E03A3A]"
                />
              </div>
              <Select value={selectedContinent} onValueChange={setSelectedContinent}>
                <SelectTrigger className="w-48 rounded-none border-[#252525]/20">
                  <Filter className="mr-2 h-4 w-4 text-[#E03A3A]" />
                  <SelectValue placeholder="All Continents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Continents</SelectItem>
                  {continents.map(continent => (
                    <SelectItem key={continent} value={continent}>{continent}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-[#5B5C5D]">
              {filteredCountries.length} of {totalCountries} countries
            </div>
          </div>
        </div>
      </section>

      {/* Countries directory, grouped by continent for visual rhythm */}
      {continentGroups.map((group, groupIndex) => (
        <section key={group.continent} className={groupIndex % 2 === 1 ? 'bg-white py-12' : 'py-12'}>
          <div className="mx-auto max-w-[1400px] px-6 md:px-10">
            <div className="mb-6 flex items-center gap-4">
              <h2 className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.24em] text-[#E03A3A]">{group.continent}</h2>
              <span className="h-px flex-1 bg-[#252525]/10" />
              <span className="whitespace-nowrap text-xs text-[#5B5C5D]">{group.items.length} {group.items.length === 1 ? 'country' : 'countries'}</span>
            </div>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {group.items.map((country) => {
                const isExpanded = expandedCountries.has(country.code);
                const isActive = country.builderCount > 0;

                return (
                  <motion.div
                    key={country.code}
                    variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    whileHover={{ scale: 1.02 }}
                    className={`group flex flex-col overflow-hidden rounded-3xl border transition-shadow duration-300 hover:shadow-[0_12px_28px_rgba(224,58,58,0.12)] ${isActive ? 'border-[#252525]/10 bg-white' : 'border-dashed border-[#252525]/15 bg-white/60'}`}
                  >
                    {isActive && <div className="h-1.5 w-full bg-gradient-to-r from-[#E03A3A] to-[#FF9472]" />}
                    <div className="flex items-start justify-between gap-3 p-6 pb-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl text-xs font-bold ${isActive ? 'bg-gradient-to-br from-[#E03A3A] to-[#FF9472] text-white' : 'bg-[#252525]/10 text-[#5B5C5D]'}`}>
                          {country.code}
                        </div>
                        <div>
                          <div className={`text-lg font-semibold ${isActive ? 'text-[#252525]' : 'text-[#5B5C5D]'}`}>{country.name}</div>
                          <p className="flex items-center gap-1 text-sm text-[#5B5C5D]">
                            <MapPin className="h-3 w-3" /> {country.continent}
                          </p>
                        </div>
                      </div>
                      {country.cities && country.cities.length > 0 && (
                        <button
                          onClick={() => toggleCountryExpansion(country.code)}
                          aria-label="Toggle cities"
                          className="rounded-full p-1.5 text-[#5B5C5D] transition-colors hover:bg-[#E03A3A]/10 hover:text-[#E03A3A]"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      )}
                    </div>

                    <div className="flex-1 px-6">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-[#F6F3EE] px-3 py-1.5 text-xs font-medium text-[#252525]">{country.builderCount} builders</span>
                        <span className="rounded-full bg-[#E03A3A]/10 px-3 py-1.5 text-xs font-medium text-[#E03A3A]">{isActive && country.averageRating ? `★ ${country.averageRating.toFixed(1)}` : 'No rating'}</span>
                        <span className="rounded-full bg-[#F6F3EE] px-3 py-1.5 text-xs font-medium text-[#252525]">{country.cities?.length || 0} cities</span>
                      </div>

                      {isExpanded && country.cities && country.cities.length > 0 && (
                        <div className="py-4">
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {country.cities.slice(0, 8).map((city, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-[#5B5C5D]">
                                <Building className="h-3 w-3 text-[#E03A3A]" />
                                {city}
                              </div>
                            ))}
                          </div>
                          {country.cities.length > 8 && (
                            <div className="pt-2 text-center text-xs text-[#5B5C5D]/70">+{country.cities.length - 8} more cities</div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="p-6 pt-5">
                      <Link
                        href={`/exhibition-stands/${country.slug}`}
                        className="group/link flex items-center justify-between rounded-full bg-[#141414] px-5 py-3 text-sm font-medium text-white transition-colors duration-300 hover:bg-[#E03A3A]"
                      >
                        Explore {country.name} builders
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
          </div>
        </section>
      ))}

      {filteredCountries.length === 0 && (
        <div className="py-16 text-center">
          <Globe className="mx-auto mb-4 h-12 w-12 text-[#252525]/20" />
          <h3 className="text-lg font-medium text-[#252525]">No countries found</h3>
          <p className="mt-1 text-[#5B5C5D]">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </ClientPageWithBreadcrumbs>
  );
}
