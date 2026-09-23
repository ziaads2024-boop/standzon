"use client";

import { useState } from 'react';
import { FiGlobe, FiUsers, FiStar, FiMapPin, FiArrowRight, FiExternalLink } from 'react-icons/fi';
import Link from 'next/link';
import { getCountryPageUrl } from '@/lib/utils/slugUtils';

type SectionText = { heading?: string; paragraph?: string } | undefined;

export default function LocationsSection({
  globalPresence,
  moreCountries,
  expandingMarkets,
}: {
  globalPresence?: SectionText;
  moreCountries?: SectionText;
  expandingMarkets?: SectionText;
}) {
  const [activeTab, setActiveTab] = useState('North America');

  const continents = {
    'North America': {
      icon: '🌎',
      countries: [
        { name: 'United States', flag: '🇺🇸', cities: ['New York', 'Las Vegas', 'Chicago', 'Miami', 'Atlanta', 'Los Angeles', 'Boston', 'Detroit'], builders: 145, rating: 4.8, projects: 500, href: '/exhibition-stands/united-states' },
        { name: 'Canada', flag: '🇨🇦', cities: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Edmonton'], builders: 45, rating: 4.7, projects: 200, href: '/exhibition-stands/canada' },
        { name: 'Mexico', flag: '🇲🇽', cities: ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana'], builders: 35, rating: 4.6, projects: 150, href: '/exhibition-stands/mexico' }
      ],
      interlinkingCountries: ['Brazil', 'Argentina', 'Chile', 'Colombia', 'Costa Rica', 'Panama', 'Guatemala', 'Ecuador']
    },
    'Europe': {
      icon: '🌍',
      countries: [
        { name: 'Germany', flag: '🇩🇪', cities: ['Berlin', 'Frankfurt', 'Munich', 'Hamburg', 'Cologne', 'Stuttgart', 'Dusseldorf'], builders: 180, rating: 4.9, projects: 750, href: '/exhibition-stands/germany' },
        { name: 'United Kingdom', flag: '🇬🇧', cities: ['London', 'Birmingham', 'Manchester', 'Edinburgh', 'Glasgow', 'Leeds'], builders: 120, rating: 4.8, projects: 400, href: '/exhibition-stands/united-kingdom' },
        { name: 'France', flag: '🇫🇷', cities: ['Paris', 'Lyon', 'Marseille', 'Nice', 'Toulouse', 'Bordeaux'], builders: 95, rating: 4.7, projects: 350, href: '/exhibition-stands/france' },
        { name: 'Italy', flag: '🇮🇹', cities: ['Milan', 'Rome', 'Bologna', 'Turin', 'Florence', 'Venice'], builders: 85, rating: 4.6, projects: 280, href: '/exhibition-stands/italy' },
        { name: 'Spain', flag: '🇪🇸', cities: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Bilbao'], builders: 78, rating: 4.5, projects: 240, href: '/exhibition-stands/spain' },
        { name: 'Netherlands', flag: '🇳🇱', cities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht'], builders: 65, rating: 4.8, projects: 200, href: '/exhibition-stands/netherlands' }
      ],
      interlinkingCountries: ['Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Poland', 'Czech Republic', 'Portugal', 'Greece', 'Turkey']
    },
    'Asia Pacific': {
      icon: '🌏',
      countries: [
        { name: 'China', flag: '🇨🇳', cities: ['Shanghai', 'Beijing', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Hangzhou'], builders: 250, rating: 4.7, projects: 600, href: '/exhibition-stands/china' },
        { name: 'Japan', flag: '🇯🇵', cities: ['Tokyo', 'Osaka', 'Chiba'], builders: 140, rating: 4.8, projects: 450, href: '/exhibition-stands/japan' },
        { name: 'Singapore', flag: '🇸🇬', cities: ['Singapore'], builders: 55, rating: 4.9, projects: 200, href: '/exhibition-stands/singapore' },
        { name: 'India', flag: '🇮🇳', cities: ['Mumbai', 'New Delhi', 'Bangalore', 'Hyderabad', 'Kolkata'], builders: 180, rating: 4.6, projects: 350, href: '/exhibition-stands/india' },
        { name: 'South Korea', flag: '🇰🇷', cities: ['Seoul', 'Busan', 'Incheon', 'Daegu'], builders: 95, rating: 4.7, projects: 280, href: '/exhibition-stands/south-korea' }
      ],
      interlinkingCountries: ['Australia', 'Thailand', 'Malaysia', 'Indonesia', 'Philippines', 'Vietnam', 'Taiwan', 'Hong Kong', 'New Zealand']
    },
    'Middle East': {
      icon: '🏛️',
      countries: [
        { name: 'United Arab Emirates', flag: '🇦🇪', cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah'], builders: 120, rating: 4.8, projects: 400, href: '/exhibition-stands/united-arab-emirates' },
        { name: 'Saudi Arabia', flag: '🇸🇦', cities: ['Riyadh', 'Jeddah', 'Dammam', 'Khobar', 'Mecca', 'Medina'], builders: 85, rating: 4.7, projects: 300, href: '/exhibition-stands/saudi-arabia' },
        { name: 'Qatar', flag: '🇶🇦', cities: ['Doha', 'Al Rayyan', 'Al Wakrah'], builders: 45, rating: 4.6, projects: 150, href: '/exhibition-stands/qatar' },
        { name: 'Kuwait', flag: '🇰🇼', cities: ['Kuwait City', 'Al Ahmadi', 'Hawalli'], builders: 35, rating: 4.5, projects: 120, href: '/exhibition-stands/kuwait' },
        { name: 'Oman', flag: '🇴🇲', cities: ['Mascat', 'Salalah', 'Sohar'], builders: 28, rating: 4.4, projects: 90, href: '/exhibition-stands/oman' }
      ],
      interlinkingCountries: ['Bahrain', 'Jordan', 'Lebanon', 'Egypt', 'Israel', 'Iran', 'Iraq']
    }
  };

  const currentContinent = continents[activeTab as keyof typeof continents];

  return (
    <>
      {/* Global Network Section — Navy background */}
      <section className="py-24 bg-[#252525] text-white px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row gap-16 items-start mb-16">
            <div className="lg:w-1/2">
              <span className="text-[#CC2E2E] font-black text-xs uppercase tracking-widest">Global Reach</span>
              <h3 className="text-4xl font-black mt-4 mb-8 leading-tight uppercase tracking-tighter">
                {globalPresence?.heading || 'YOUR GLOBAL NETWORK FOR LOCAL EXHIBITION SUCCESS'}
              </h3>
              <p className="text-slate-400 mb-10 leading-relaxed">
                {globalPresence?.paragraph || 'Navigating international markets requires local expertise. We bridge the gap by connecting you with regional leaders who understand cultural nuances, venue regulations, and logistical complexities.'}
              </p>

              {/* Region grid */}
              <div className="grid grid-cols-4 gap-8">
                {Object.entries(continents).map(([continent, data]) => (
                  <div key={continent}>
                    <h5 className="font-black text-[#CC2E2E] mb-2 uppercase tracking-tighter text-sm">{continent}</h5>
                    <ul className="text-sm text-slate-400 space-y-1">
                      {data.countries.slice(0, 2).map(c => (
                        <li key={c.name}>{c.name}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Map placeholder */}
            <div className="lg:w-1/2 w-full h-[400px] bg-slate-800 relative overflow-hidden flex items-center justify-center">
              <FiGlobe className="w-32 h-32 text-slate-700 opacity-50" />
              <div className="absolute bottom-8 right-8 bg-[#CC2E2E] p-4 shadow-xl">
                <p className="text-[10px] font-black uppercase tracking-widest">Currently Active</p>
                <p className="text-2xl font-black">214 Projects</p>
              </div>
            </div>
          </div>

          {/* Continent Tabs */}
          <div className="flex flex-wrap gap-4 mb-12">
            {Object.entries(continents).map(([continent, data]) => (
              <button
                key={continent}
                onClick={() => setActiveTab(continent)}
                className={`flex items-center space-x-2 px-6 py-3 font-bold uppercase text-xs tracking-widest transition-all touch-active no-tap-highlight ${activeTab === continent
                  ? 'bg-white text-[#252525]'
                  : 'border border-white/20 hover:border-white text-white'
                  }`}
              >
                <span className="text-lg">{data.icon}</span>
                <span>{continent}</span>
              </button>
            ))}
          </div>

          {/* Country Cards */}
          <div className="space-y-4">
            {currentContinent.countries.map((country) => (
              <div key={country.name} className="bg-white/5 border border-white/10 hover:bg-white/10 transition-colors p-6 flex flex-col lg:flex-row items-center gap-8 group">
                <div className="w-20 h-20 flex items-center justify-center text-5xl">
                  {country.flag}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold uppercase tracking-tight mb-1">{country.name}</h3>
                  <p className="text-slate-400 text-sm flex items-center gap-2">
                    <FiMapPin className="w-3 h-3" />
                    {country.cities.slice(0, 4).join(', ')}{country.cities.length > 4 ? ` +${country.cities.length - 4} more` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-12">
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1">Builders</span>
                    <span className="text-lg font-black">{country.builders}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1">Rating</span>
                    <span className="text-lg font-black flex items-center gap-1">
                      <FiStar className="w-3 h-3 text-yellow-400 fill-current" />
                      {country.rating}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1">Projects</span>
                    <span className="text-lg font-black">{country.projects}</span>
                  </div>
                </div>
                <Link
                  href={country.href}
                  className="bg-white text-[#252525] px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#CC2E2E] hover:text-white transition-all whitespace-nowrap"
                >
                  View Builders
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* More Countries Section */}
      <section className="py-24 bg-slate-50 border-t border-slate-200 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-6 mb-16">
            <h2 className="text-3xl font-black uppercase tracking-tighter shrink-0 text-[#252525]">
              {(moreCountries?.heading ? (moreCountries.heading as string) : 'More Countries in {country}').replace(/\{country\}/ig, activeTab)}
            </h2>
            <div className="h-px bg-slate-200 w-full"></div>
          </div>
          <p className="text-slate-500 max-w-2xl mb-12">
            {moreCountries?.paragraph || 'Discover exhibition stand builders across all major markets in this region. Click on any country to explore local professionals and get instant quotes.'}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
            {currentContinent.interlinkingCountries.map((country) => (
              <Link
                key={country}
                href={getCountryPageUrl(country)}
                className="group"
              >
                <div className="bg-white border border-slate-200 hover:border-[#E03A3A] p-4 text-center transition-all hover:shadow-md">
                  <div className="text-sm font-bold text-[#252525] group-hover:text-[#E03A3A] mb-1 uppercase tracking-tight">
                    {country}
                  </div>
                  <FiExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#E03A3A] transition-colors mx-auto" />
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/exhibition-stands"
              className="inline-flex items-center gap-2 bg-[#E03A3A] hover:bg-[#252525] text-white px-10 py-4 font-bold uppercase tracking-widest transition-all text-sm"
            >
              Browse All Locations
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Expanding Markets CTA */}
      <section className="py-16 bg-[#CC2E2E] text-white overflow-hidden relative px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-3xl font-black tracking-tighter uppercase italic">
              {expandingMarkets?.heading || 'Expanding to New Markets?'}
            </h3>
            <p className="text-white/80 mt-2 font-medium">
              {expandingMarkets?.paragraph || "Get a dedicated strategist to manage your global stand deployment."}
            </p>
          </div>
          <Link
            href="/quote"
            className="bg-white text-[#CC2E2E] hover:bg-slate-100 font-black uppercase tracking-widest px-10 py-5 transition-all shadow-xl whitespace-nowrap text-sm"
          >
            Contact Global Team
          </Link>
        </div>
      </section>
    </>
  );
}
