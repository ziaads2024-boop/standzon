import React, { Suspense } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PublicQuoteRequest from '@/components/PublicQuoteRequest';
import { BuilderCard } from '@/components/BuilderCard';
import {
  MapPin, Building, Building2, Users, Star, ArrowRight,
  TrendingUp, Award, CheckCircle, Zap, Globe,
  Calendar, DollarSign, Clock, Shield
} from 'lucide-react';
import { getServerSupabase } from '@/lib/supabase';
import { getAllBuilders } from '@/lib/supabase/builders';
import { getServerPageContent } from '@/lib/data/serverPageContent';
import { convertToProxyUrl } from '@/lib/utils/imageProxyUtils';
import { placeholderFor, isMissingImage } from '@/lib/utils/placeholders';
import Image from 'next/image';
import HeroSearchFilter from '@/components/HeroSearchFilter';
import { normalizeCountrySlug } from '@/lib/utils/slugUtils';

/**
 * Props: flexible and permissive so this component can be used server-side or client-side.
 */
export interface ServerEnhancedLocationPageProps {
  locationType?: 'country' | 'city' | string;
  locationName?: string;
  countryName?: string;
  country?: string;
  city?: string;
  initialBuilders?: any[];
  builders?: any[];
  exhibitions?: any[];
  venues?: any[];
  pageContent?: any;
  isEditable?: boolean;
  searchTerm?: string;
  suppressPostBuildersContent?: boolean;
  suppressBuilders?: boolean;
  buildersSlot?: React.ReactNode;
  locationStats?: {
    totalBuilders?: number;
    averageRating?: number;
    completedProjects?: number;
    averagePrice?: number;
  };
  upcomingEvents?: Array<{ name: string; date: string; venue?: string }>;
  serverCmsContent?: any;
  serverBuilders?: any[];
  serverPageContent?: any;
}

const slugify = (s?: string) =>
  (s || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

// Unified HTML sanitizer that works on both server and client
function sanitizeHtml(html?: string): string {
  // Handle null, undefined, or non-string values
  if (!html || typeof html !== 'string') return '';

  try {
    // Convert line breaks to <br/> tags
    let result = html.replace(/\r?\n/g, '<br/>');

    // Simple regex-based sanitizer for consistent server/client behavior
    // Remove script tags and their content
    result = result.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

    // Remove on* event attributes
    result = result.replace(/\s(on\w+)=["'][^"']*["']/gi, '');

    // Remove javascript: links
    result = result.replace(/href=["']javascript:[^"']*["']/gi, 'href="#"');

    // Whitelist allowed tags and clean attributes
    const allowedTags = ['h2', 'h3', 'h4', 'p', 'strong', 'em', 'ul', 'ol', 'li', 'br', 'a'];

    // Process opening tags
    result = result.replace(/<([a-zA-Z]+)([^>]*)>/g, (match, tag, attrs) => {
      const lowerTag = tag.toLowerCase();

      // Transform h1 to h2 for heading hierarchy
      if (lowerTag === 'h1') {
        return '<h2>';
      }

      if (!allowedTags.includes(lowerTag)) {
        return '';
      }

      // For <a> tags, only allow href and add security attributes
      if (lowerTag === 'a') {
        const hrefMatch = attrs.match(/href=["']([^"']*)["']/i);
        if (hrefMatch && hrefMatch[1] && !hrefMatch[1].toLowerCase().startsWith('javascript:')) {
          return `<a href="${hrefMatch[1]}" rel="noopener noreferrer" target="_blank">`;
        }
        return '<a>';
      }

      // For other tags, remove all attributes
      return `<${lowerTag}>`;
    });

    // Process closing tags
    result = result.replace(/<\/([a-zA-Z]+)>/g, (match, tag) => {
      const lowerTag = tag.toLowerCase();

      // Transform closing h1 to h2
      if (lowerTag === 'h1') {
        return '</h2>';
      }

      if (!allowedTags.includes(lowerTag)) {
        return '';
      }
      return `</${lowerTag}>`;
    });

    return result;
  } catch (error) {
    // In case of any error, return the original HTML or empty string
    console.warn('HTML sanitization failed:', error);
    return '';
  }
}

export default async function ServerEnhancedLocationPage({
  locationType,
  locationName,
  countryName,
  country,
  city,
  initialBuilders = [],
  builders = [],
  exhibitions = [],
  venues = [],
  pageContent,
  isEditable = false,
  searchTerm,
  suppressPostBuildersContent = false,
  suppressBuilders = false,
  buildersSlot,
  locationStats,
  upcomingEvents = [],
  serverCmsContent,
  serverBuilders,
  serverPageContent
}: ServerEnhancedLocationPageProps) {
  const isCity = locationType === 'city' || Boolean(city);
  const finalLocationName = locationName || city || country || 'Unknown Location';
  const finalCountryName = countryName || (isCity && country) || country || undefined;
  const displayLocation = isCity && finalCountryName ? `${finalLocationName}, ${finalCountryName}` : finalLocationName;
  const countrySlug = normalizeCountrySlug(finalCountryName || finalLocationName);

  // Fetch content on the server
  let cmsData = serverCmsContent;
  if (!cmsData) {
    try {
      const path = isCity
        ? `/exhibition-stands/${countrySlug}/${slugify(finalLocationName)}`
        : `/exhibition-stands/${countrySlug}`;
      cmsData = await getServerPageContent(path === '/exhibition-stands' ? 'exhibition-stands' : countrySlug);
    } catch (error) {
      console.error('Error fetching CMS data on server:', error);
    }
  }

  // Fetch builders on the server
  let filteredBuilders = serverBuilders || initialBuilders || builders || [];
  if (!serverBuilders && !initialBuilders.length && !builders.length) {
    try {
      const allBuilders = await getAllBuilders();

      // Filter builders by location if provided
      if (displayLocation) {
        const normalizedLocation = displayLocation.toLowerCase().replace(/-/g, " ").trim();
        const locationVariations = [normalizedLocation];

        if (normalizedLocation.includes("united arab emirates")) {
          locationVariations.push("uae");
        } else if (normalizedLocation === "uae") {
          locationVariations.push("united arab emirates");
        }

        filteredBuilders = allBuilders.filter((builder: any) => {
          // Check headquarters country
          const headquartersCountry = (builder.headquarters_country || builder.country || '').toLowerCase().trim();
          const countryMatch = locationVariations.some(variation =>
            headquartersCountry.includes(variation)
          );

          // Check headquarters city
          const headquartersCity = (builder.headquarters_city || builder.city || '').toLowerCase().trim();
          const cityMatch = headquartersCity.includes(normalizedLocation);

          // Check service locations
          const serviceLocations = builder.service_locations || builder.serviceLocations || [];
          const serviceLocationMatch = serviceLocations.some((loc: any) => {
            const serviceCountry = (loc.country || '').toLowerCase().trim();
            const serviceCity = (loc.city || '').toLowerCase().trim();
            return locationVariations.some(variation =>
              serviceCountry.includes(variation)
            ) || serviceCity.includes(normalizedLocation);
          });

          return countryMatch || cityMatch || serviceLocationMatch;
        });
      } else {
        filteredBuilders = allBuilders;
      }

      // Transform to match ExhibitionBuilder interface
      filteredBuilders = filteredBuilders.map((builder: any) => ({
        // Basic fields
        id: builder.id || '',
        companyName: builder.company_name || builder.name || 'Unknown Builder',
        slug: builder.slug || builder.id || '',
        logo: builder.logo || '/images/builders/default-logo.png',
        establishedYear: builder.established_year || new Date().getFullYear(),

        // Headquarters
        headquarters: {
          city: builder.headquarters_city || builder.city || 'Unknown',
          country: builder.headquarters_country || builder.country || 'Unknown',
          countryCode: builder.headquarters_country_code || builder.country_code || 'XX',
          address: builder.headquarters_address || builder.address || '',
          latitude: builder.headquarters_latitude || builder.latitude || 0,
          longitude: builder.headquarters_longitude || builder.longitude || 0,
          isHeadquarters: true
        },

        // Service locations
        serviceLocations: builder.service_locations || [
          {
            city: builder.headquarters_city || builder.city || 'Unknown',
            country: builder.headquarters_country || builder.country || 'Unknown',
            countryCode: builder.headquarters_country_code || builder.country_code || 'XX',
            address: builder.headquarters_address || builder.address || '',
            latitude: builder.headquarters_latitude || builder.latitude || 0,
            longitude: builder.headquarters_longitude || builder.longitude || 0,
            isHeadquarters: false
          }
        ],

        // Contact info
        contactInfo: {
          primaryEmail: builder.primary_email || builder.email || '',
          phone: builder.phone || '',
          website: builder.website || '',
          contactPerson: builder.contact_person || builder.contact_name || '',
          position: builder.position || ''
        },

        // Services and specializations (empty arrays as defaults)
        services: builder.services || [],
        specializations: builder.specializations || [],
        certifications: builder.certifications || [],
        awards: builder.awards || [],
        portfolio: builder.portfolio || [],

        // Stats
        teamSize: builder.team_size || 0,
        projectsCompleted: builder.projects_completed || builder.completed_projects || 0,
        rating: builder.rating || 0,
        reviewCount: builder.review_count || 0,

        // Response info
        responseTime: builder.response_time || '24 hours',
        languages: builder.languages || ['English'],

        // Status flags
        verified: builder.verified || false,
        premiumMember: builder.premium_member || builder.premiumMember || false,

        // Additional fields
        tradeshowExperience: builder.tradeshow_experience || [],
        priceRange: builder.price_range || { min: 0, max: 0, currency: 'USD' },
        companyDescription: builder.description || builder.company_description || '',
        whyChooseUs: builder.why_choose_us || [],
        clientTestimonials: builder.client_testimonials || [],
        socialMedia: builder.social_media || {},
        businessLicense: builder.business_license || '',
        insurance: builder.insurance || {},
        sustainability: builder.sustainability || {},
        keyStrengths: builder.key_strengths || [],
        recentProjects: builder.recent_projects || [],

        // Claim system
        claimed: builder.claimed || false,
        claimStatus: builder.claim_status || "unclaimed",
        planType: builder.plan_type || "free",
        gmbImported: builder.gmb_imported || builder.gmbImported || false,
        importedFromGMB: builder.imported_from_gmb || false,
        source: builder.source || '',
        importedAt: builder.imported_at || '',
        lastUpdated: builder.last_updated || builder.updated_at || new Date().toISOString(),

        // Lead routing
        status: builder.status || "active",
        plan: builder.plan || "free",
        contactEmail: builder.contact_email || builder.primary_email || builder.email || ''
      }));
    } catch (error) {
      console.error('Error fetching builders on server:', error);
      filteredBuilders = [];
    }
  }

  // Compute stats
  const stats = {
    totalBuilders: filteredBuilders.length || (locationStats?.totalBuilders ?? 0),
    averageRating: locationStats?.averageRating ?? (filteredBuilders.length > 0
      ? Math.round((filteredBuilders.reduce((s: number, b: any) => s + (b.rating || 4.5), 0) / filteredBuilders.length) * 10) / 10
      : 4.8),
    completedProjects: locationStats?.completedProjects ?? filteredBuilders.reduce((s: number, b: any) => s + (b.projectsCompleted || 0), 0),
    averagePrice: locationStats?.averagePrice ?? 450
  };

  // Resolve CMS block for page (country or city)
  let resolvedCmsBlock = cmsData;
  if (isCity) {
    const citySlug = slugify(finalLocationName);
    const key = `${countrySlug}-${citySlug}`;

    // Handle the specific nested structure for city pages
    if (cmsData?.sections?.cityPages?.[key]?.countryPages?.[citySlug]) {
      resolvedCmsBlock = cmsData.sections.cityPages[key].countryPages[citySlug];
    } else if (cmsData?.sections?.cityPages?.[key]) {
      resolvedCmsBlock = cmsData.sections.cityPages[key];
    } else {
      resolvedCmsBlock = cmsData;
    }
  } else {
    resolvedCmsBlock = cmsData?.sections?.countryPages?.[countrySlug] || cmsData;
  }

  // --- render ---
  return (
    <div className="min-h-screen bg-[#F5F6F7] font-sans">

      {/* ── HERO ── */}
      <section className="relative bg-[#252525] py-20 overflow-visible">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#E03A3A]/30 via-transparent to-[#CC2E2E]/20" />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: '32px 32px' }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 bg-[#E03A3A]/20 border border-[#E03A3A]/40 text-white rounded-full text-xs font-black tracking-widest uppercase mb-5">
              {isCity ? `${finalCountryName} Exhibition Hub` : 'World-Class Exhibition Logistics'}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 tracking-tight">
              {(() => {
                const accent = "text-transparent bg-clip-text bg-gradient-to-r from-[#EC6A6A] to-[#E03A3A]";

                // The CMS hero title is the SEO-managed H1 — use it.
                let headingRaw =
                  serverCmsContent?.hero?.title ||
                  serverCmsContent?.hero?.heading ||
                  resolvedCmsBlock?.hero?.title ||
                  resolvedCmsBlock?.hero?.heading ||
                  resolvedCmsBlock?.title ||
                  resolvedCmsBlock?.heroHeading ||
                  serverCmsContent?.title;

                if (!headingRaw && resolvedCmsBlock?.countryPages) {
                  for (const key of Object.keys(resolvedCmsBlock.countryPages)) {
                    if (resolvedCmsBlock.countryPages[key]?.title) {
                      headingRaw = resolvedCmsBlock.countryPages[key].title;
                      break;
                    }
                  }
                }

                let heading = '';
                if (typeof headingRaw === 'string') heading = headingRaw;
                else if (headingRaw && typeof headingRaw === 'object') heading = headingRaw.title || headingRaw.heading || '';
                heading = heading.trim();

                // Location-specific fallback (never the generic "Global Directory…").
                if (!heading) {
                  heading = isCity
                    ? `Exhibition Stand Builders in ${finalLocationName}, ${finalCountryName}`
                    : `Exhibition Stand Builders in ${finalCountryName}`;
                }

                // Style: put the trailing "in <Location>" part in the red accent.
                const m = heading.match(/^(.*?\bin)\s+(.+?)\.?$/i);
                if (m && /builders?|contractors?|companies|directory/i.test(m[1])) {
                  return <>{m[1]} <span className={accent}>{m[2]}.</span></>;
                }
                return heading;
              })()}
            </h1>
            <p className="text-lg text-slate-300 mb-10 leading-relaxed max-w-2xl">
              {(() => {
                let heroContent = resolvedCmsBlock?.heroDescription || resolvedCmsBlock?.hero?.description || resolvedCmsBlock?.hero;
                if (!heroContent && resolvedCmsBlock) heroContent = resolvedCmsBlock.description || resolvedCmsBlock.content?.introduction || resolvedCmsBlock.heroContent;
                const extractText = (content: any): string => {
                  if (typeof content === 'string') return content;
                  if (typeof content === 'object' && content !== null) return content.description || content.text || content.heading || '';
                  return String(content || '');
                };
                heroContent = extractText(heroContent);
                return heroContent || `Source the top 1% of exhibition contractors for ${displayLocation}. Data-driven matching for high-stakes brand activations.`;
              })()}
            </p>

            {/* Dynamic search filter */}
            <HeroSearchFilter
              defaultCountrySlug={countrySlug}
              defaultCitySlug={isCity ? slugify(finalLocationName) : undefined}
            />
          </div>
        </div>
      </section>

      {/* ── STATS RIBBON ── */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-7 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { val: `${stats.totalBuilders}+`, label: 'Vetted Builders' },
            { val: stats.averageRating || '4.8', label: 'Avg. Rating' },
            { val: stats.completedProjects > 0 ? `${stats.completedProjects.toLocaleString()}+` : '15k+', label: 'Stands Built' },
            { val: '24h', label: 'Quote Response' }
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center md:items-start">
              <span className="text-2xl md:text-3xl font-black text-[#252525]">{s.val}</span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── BUILDERS SLOT (injected from parent) ── */}
      {buildersSlot}

      {/* ── VERIFIED BUILDERS LIST (internal, only when not suppressed) ── */}
      {!suppressBuilders && filteredBuilders.length > 0 && (
        <section id="builders-grid" className="py-20 bg-[#F5F6F7]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-[#252525] uppercase tracking-tight mb-2">
                  {(() => {
                    let content = resolvedCmsBlock?.buildersHeading;
                    if (!content && resolvedCmsBlock?.countryPages) {
                      for (const key of Object.keys(resolvedCmsBlock.countryPages)) {
                        if (resolvedCmsBlock.countryPages[key]?.buildersHeading) { content = resolvedCmsBlock.countryPages[key].buildersHeading; break; }
                      }
                    }
                    if (typeof content === 'object' && content !== null) return content.heading || content.title || `Verified Builders in ${displayLocation}`;
                    return content || `Verified Premier Builders in ${displayLocation}`;
                  })()}
                </h2>
                <p className="text-slate-600 text-sm">Top-rated contractors with verified project history and client testimonials.</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold hover:border-[#E03A3A] transition-colors">Filter by Rating</button>
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold hover:border-[#E03A3A] transition-colors">{isCity ? 'City Specialists' : 'Country Specialists'}</button>
              </div>
            </div>

            {/* Premium list-style builder cards */}
            <div className="space-y-5">
              {filteredBuilders.map((b: any, idx: number) => {
                const logo = b.logo || b.profile_image || b.image_url;
                const portfolioImg = b.portfolio?.[0]?.image || b.portfolio?.[0]?.imageUrl || b.portfolio?.[0] || logo;
                const rating = b.rating || 4.8;
                const reviewCount = b.reviewCount || b.review_count || 0;
                const isPremium = b.premiumMember || b.premium_member || b.planType === 'professional' || b.planType === 'enterprise';
                const isVerified = b.verified || b.isVerified;
                const hq = b.headquarters?.city || b.headquarters_city || b.city || displayLocation;
                const hqCountry = b.headquarters?.country || b.headquarters_country || b.country || '';
                const estYear = b.establishedYear || b.established_year || '';
                const desc = b.companyDescription || b.description || b.company_description || '';
                const projDone = b.projectsCompleted || b.projects_completed || 0;
                const responseTime = b.responseTime || b.response_time || 'Within 24 hours';
                const badgeLabel = idx === 0 ? 'Verified Platinum' : isPremium ? 'Recommended' : isVerified ? 'Verified' : '';
                const badgeBg = idx === 0 ? 'bg-emerald-500' : 'bg-[#E03A3A]';

                return (
                  <div key={b.id || b.slug || idx} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col lg:flex-row gap-6 hover:shadow-xl transition-shadow duration-300 group">
                    {/* Image */}
                    <div className="lg:w-56 h-44 rounded-lg overflow-hidden bg-slate-100 relative shrink-0">
                      {portfolioImg ? (
                        <Image
                          src={convertToProxyUrl(typeof portfolioImg === 'string' ? portfolioImg : (portfolioImg as any).image || (portfolioImg as any).url || '')}
                          alt={b.companyName}
                          fill
                          sizes="224px"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                          <Building className="w-12 h-12 text-slate-400" />
                        </div>
                      )}
                      {badgeLabel && (
                        <div className={`absolute top-3 left-3 ${badgeBg} text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-tight`}>
                          {badgeLabel}
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2 gap-4">
                        <div>
                          <h3 className="text-lg font-black text-[#252525] group-hover:text-[#E03A3A] transition-colors leading-tight">{b.companyName}</h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" /> {hq}{hqCountry && hqCountry !== hq ? `, ${hqCountry}` : ''}{estYear ? ` • Est. ${estYear}` : ''}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="flex items-center text-yellow-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-base font-black ml-1 text-[#252525]">{rating}</span>
                          </div>
                          {reviewCount > 0 && <span className="text-[10px] text-slate-400 uppercase font-bold">{reviewCount} Reviews</span>}
                        </div>
                      </div>
                      {desc && <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2">{desc}</p>}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: 'Projects Done', val: projDone > 0 ? `${projDone.toLocaleString()}+` : 'Available', color: '' },
                          { label: 'Response', val: responseTime, color: '' },
                          { label: 'Status', val: isVerified ? 'Verified' : 'Active', color: isVerified ? 'text-emerald-600' : '' },
                          { label: 'Plan', val: (b.planType || 'Standard').charAt(0).toUpperCase() + (b.planType || 'Standard').slice(1), color: isPremium ? 'text-[#E03A3A]' : '' }
                        ].map((stat, si) => (
                          <div key={si} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            <span className="block text-[9px] uppercase font-black text-slate-400 mb-0.5">{stat.label}</span>
                            <span className={`text-xs font-black text-[#252525] ${stat.color}`}>{stat.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA Sidebar */}
                    <div className="lg:w-40 flex flex-col justify-center gap-3 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 shrink-0">
                      <a
                        href={`/builders/${b.slug || b.id}`}
                        className="w-full bg-[#252525] text-white text-xs font-black py-2.5 px-3 rounded-lg hover:bg-[#E03A3A] transition-all text-center"
                      >
                        View Portfolio
                      </a>
                      <PublicQuoteRequest
                        location={displayLocation}
                        builderId={b.id}
                        buttonText="Request Quote"
                        className="w-full bg-white border border-slate-200 text-[#252525] text-xs font-black py-2.5 px-3 h-auto rounded-lg hover:border-[#E03A3A] transition-all"
                        size="sm"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 text-center">
              <PublicQuoteRequest
                location={displayLocation}
                buttonText={`Get Free Quotes from All ${displayLocation} Builders`}
                className="px-8 py-3 bg-white border border-slate-200 text-[#252525] font-black rounded-lg hover:border-[#E03A3A] transition-all"
              />
            </div>
          </div>
        </section>
      )}

      {/* No builders state */}
      {!suppressBuilders && filteredBuilders.length === 0 && (
        <section className="py-20 bg-[#F5F6F7]">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="bg-white rounded-2xl border border-slate-200 p-16">
              <Building className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-[#252525] mb-2">No Builders Listed Yet</h2>
              <p className="text-slate-500 mb-8">We're expanding our directory for {displayLocation}. Get notified when builders are added.</p>
              <PublicQuoteRequest location={displayLocation} buttonText="Request Builders for This Location" className="bg-[#E03A3A] text-white font-black px-8 py-3 h-auto rounded-lg hover:bg-[#CC2E2E] transition-all border-0" />
            </div>
          </div>
        </section>
      )}

      {/* ── WHY CHOOSE LOCAL (dark section) ── */}
      <section className="py-20 bg-[#252525] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-6 uppercase tracking-tighter leading-tight">
                {(() => {
                  let content = resolvedCmsBlock?.whyChooseHeading;
                  if (!content && resolvedCmsBlock?.countryPages) {
                    for (const key of Object.keys(resolvedCmsBlock.countryPages)) {
                      if (resolvedCmsBlock.countryPages[key]?.whyChooseHeading) { content = resolvedCmsBlock.countryPages[key].whyChooseHeading; break; }
                    }
                  }
                  if (typeof content === 'object' && content !== null) return content.heading || content.title || `Built for ${displayLocation},`;
                  return content || `Built for Professionals,`;
                })()}
                <br />
                <span className="text-blue-400">
                  Trusted by Global Brands.
                </span>
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                {(() => {
                  let content = resolvedCmsBlock?.whyChooseParagraph;
                  if (!content && resolvedCmsBlock?.countryPages) {
                    for (const key of Object.keys(resolvedCmsBlock.countryPages)) {
                      if (resolvedCmsBlock.countryPages[key]?.whyChooseParagraph) { content = resolvedCmsBlock.countryPages[key].whyChooseParagraph; break; }
                    }
                  }
                  if (typeof content === 'object' && content !== null) return content.description || content.text || '';
                  return content || `We eliminate the risk of exhibition failure by providing a transparent, data-driven directory of ${displayLocation}'s most capable builders.`;
                })()}
              </p>

              <div className="space-y-6">
                {(() => {
                  let infoCards = resolvedCmsBlock?.infoCards;
                  if (!infoCards && resolvedCmsBlock?.countryPages) {
                    for (const key of Object.keys(resolvedCmsBlock.countryPages)) {
                      if (resolvedCmsBlock.countryPages[key]?.infoCards) { infoCards = resolvedCmsBlock.countryPages[key].infoCards; break; }
                    }
                  }
                  const defaultCards = [
                    { icon: 'shield', color: 'bg-[#E03A3A]/20 border-[#E03A3A]/40 text-blue-400', title: 'Strict Quality Audits', text: `Every builder undergoes a 25-point verification including financial stability checks specific to ${displayLocation}.` },
                    { icon: 'quote', color: 'bg-[#CC2E2E]/20 border-[#CC2E2E]/40 text-red-400', title: 'Competitive Tender System', text: 'Receive up to 5 detailed quotes within 24 hours from builders specialized in your industry.' },
                    { icon: 'hub', color: 'bg-blue-500/20 border-blue-500/40 text-blue-300', title: 'Dedicated Hub Support', text: `Local experts on the ground in ${displayLocation} to oversee your project delivery.` }
                  ];
                  const cards = Array.isArray(infoCards) ? infoCards.map((c: any) => ({
                    icon: 'shield',
                    color: 'bg-[#E03A3A]/20 border-[#E03A3A]/40 text-blue-400',
                    title: typeof c.title === 'object' ? c.title?.heading || c.title?.title || '' : c.title || '',
                    text: typeof c.text === 'object' ? c.text?.description || c.text?.text || '' : c.text || ''
                  })) : defaultCards;

                  const icons = [
                    <Shield key="s" className="w-5 h-5" />,
                    <CheckCircle key="c" className="w-5 h-5" />,
                    <Globe key="g" className="w-5 h-5" />
                  ];
                  const colorClasses = [
                    'bg-[#E03A3A]/20 border border-[#E03A3A]/40 text-blue-400',
                    'bg-[#CC2E2E]/20 border border-[#CC2E2E]/40 text-red-400',
                    'bg-blue-500/20 border border-blue-500/40 text-blue-300'
                  ];

                  return cards.slice(0, 3).map((card: any, i: number) => (
                    <div key={i} className="flex gap-4">
                      <div className={`size-12 rounded-lg ${colorClasses[i]} flex items-center justify-center shrink-0`}>
                        {icons[i]}
                      </div>
                      <div>
                        <h4 className="font-black text-base mb-1">{card.title}</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">{card.text}</p>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Image column */}
            <div className="relative">
              <div className="aspect-square bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 relative">
                {(() => {
                  const allValidImages: string[] = [];

                  // 1. Try to get images from resolved CMS gallery (like the main gallery does)
                  let cmsGallery = resolvedCmsBlock?.galleryImages || resolvedCmsBlock?.gallery_images;
                  if (!cmsGallery && resolvedCmsBlock?.countryPages) {
                    for (const key of Object.keys(resolvedCmsBlock.countryPages)) {
                      if (resolvedCmsBlock.countryPages[key]?.galleryImages) {
                        cmsGallery = resolvedCmsBlock.countryPages[key].galleryImages;
                        break;
                      }
                    }
                  }
                  if (Array.isArray(cmsGallery)) {
                    cmsGallery.forEach((item: any) => {
                      const src = typeof item === 'string' ? item : (item?.image || item?.imageUrl || item?.url || item?.src);
                      if (src && typeof src === 'string' && src.trim() !== '' && !src.includes('default-logo.png')) {
                        allValidImages.push(src);
                      }
                    });
                  }

                  // 2. Pool valid portfolio images from all builders
                  if (Array.isArray(filteredBuilders)) {
                    filteredBuilders.forEach((b: any) => {
                      if (b.portfolio && Array.isArray(b.portfolio)) {
                        b.portfolio.forEach((item: any) => {
                          const src = typeof item === 'string' ? item : (item?.image || item?.imageUrl || item?.url || item?.src);
                          if (src && typeof src === 'string' && src.trim() !== '' && !src.includes('default-logo.png') && !allValidImages.includes(src)) {
                            allValidImages.push(src);
                          }
                        });
                      }
                    });
                  }

                  // Prefer the 2nd overall image to prevent overlap with the gallery's 1st image
                  let imgSrc = allValidImages.length > 1 ? allValidImages[1] : allValidImages[0];

                  if (imgSrc && !isMissingImage(imgSrc)) {
                    return <Image src={convertToProxyUrl(imgSrc)} alt={`Exhibition stand project in ${displayLocation}`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover opacity-90" />;
                  }
                  return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={placeholderFor('gallery')} alt="" className="w-full h-full object-cover" />
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GET QUOTES CTA FORM ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#E03A3A]/5 to-transparent hidden lg:block" />
            <div className="max-w-2xl relative z-10">
              <h2 className="text-2xl md:text-3xl font-black text-[#252525] mb-3">Ready to Build Your Presence in {displayLocation}?</h2>
              <p className="text-slate-600 mb-8 text-sm leading-relaxed">
                {(() => {
                  let content = resolvedCmsBlock?.quotesParagraph;
                  if (!content && resolvedCmsBlock?.countryPages) {
                    for (const key of Object.keys(resolvedCmsBlock.countryPages)) {
                      if (resolvedCmsBlock.countryPages[key]?.quotesParagraph) { content = resolvedCmsBlock.countryPages[key].quotesParagraph; break; }
                    }
                  }
                  if (typeof content === 'object' && content !== null) return content.description || content.text || '';
                  return content || `Tell us about your next exhibition and we'll match you with the best-fit builders from our directory. Free of charge.`;
                })()}
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <input className="bg-white border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#E03A3A] text-sm" placeholder="Full Name" type="text" />
                <input className="bg-white border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#E03A3A] text-sm" placeholder="Company Email" type="email" />
                <select className="bg-white border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#E03A3A] text-sm text-slate-700">
                  <option>Expected Stand Size</option>
                  <option>9 – 36 sqm</option>
                  <option>36 – 100 sqm</option>
                  <option>100+ sqm</option>
                </select>
                <select className="bg-white border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#E03A3A] text-sm text-slate-700">
                  <option>Budget Range</option>
                  <option>$10k – $25k</option>
                  <option>$25k – $50k</option>
                  <option>$50k – $100k</option>
                  <option>$100k+</option>
                </select>
                <div className="md:col-span-2">
                  <PublicQuoteRequest
                    location={displayLocation}
                    buttonText="Submit for Quotes"
                    className="w-full bg-[#CC2E2E] hover:bg-[#AC2424] text-white font-black py-4 h-auto rounded-lg text-base border-0 uppercase tracking-widest shadow-xl shadow-red-900/10 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section className="py-20 bg-[#F5F6F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-black text-[#252525] uppercase tracking-tighter">Design Inspiration Gallery</h2>
            <div className="w-14 h-1 bg-[#CC2E2E] mx-auto mt-4 rounded-full" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(() => {
              let portfolioImages: string[] = [];
              let cmsGallery = resolvedCmsBlock?.galleryImages || resolvedCmsBlock?.gallery_images;
              if (!cmsGallery && resolvedCmsBlock?.countryPages) {
                for (const key of Object.keys(resolvedCmsBlock.countryPages)) {
                  if (resolvedCmsBlock.countryPages[key]?.galleryImages) { cmsGallery = resolvedCmsBlock.countryPages[key].galleryImages; break; }
                }
              }
              if (Array.isArray(cmsGallery) && cmsGallery.length > 0) portfolioImages = [...cmsGallery];
              if (portfolioImages.length < 8 && Array.isArray(filteredBuilders)) {
                filteredBuilders.forEach((builder: any) => {
                  if (builder.portfolio && Array.isArray(builder.portfolio)) {
                    builder.portfolio.forEach((item: any) => {
                      let imgUrl = typeof item === 'string' ? item : (item?.image || item?.imageUrl || item?.url || item?.src || '');
                      if (imgUrl && !portfolioImages.includes(imgUrl)) portfolioImages.push(imgUrl);
                    });
                  }
                });
              }
              portfolioImages = portfolioImages.filter((u) => !isMissingImage(typeof u === 'string' ? u : (u as any)?.image || (u as any)?.url));
              const labels = ['Custom Pavilion', 'Eco-Flow Modular', 'Double Decker Hub', 'Healthcare Booth', 'Tech Showcase', 'Automotive Stand', 'Retail Activation', 'Government Pavilion'];
              const sectors = ['Custom Design', 'Sustainable Tech', 'Enterprise IT', 'Healthcare', 'Technology', 'Automotive', 'Retail', 'Government'];
              if (portfolioImages.length === 0) {
                return Array.from({ length: 4 }, (_, i) => (
                  <div
                    key={i}
                    className={`aspect-[3/4] rounded-xl overflow-hidden border border-[#E4E6E8] ${i % 2 === 1 ? 'md:mt-8' : ''}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={placeholderFor('gallery')} alt="" className="w-full h-full object-cover" />
                  </div>
                ));
              }
              return portfolioImages.slice(0, 4).map((img, i) => (
                <div key={i} className={`aspect-[3/4] rounded-xl overflow-hidden relative group ${i % 2 === 1 ? 'md:mt-8' : ''}`}>
                  <Image
                    src={convertToProxyUrl(img)}
                    alt={labels[i] || `Portfolio ${i + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-5 flex flex-col justify-end">
                    <span className="text-xs text-blue-400 font-black uppercase">{sectors[i]}</span>
                    <h4 className="text-white font-black text-sm">{labels[i]}</h4>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </section>

      {/* ── UPCOMING EVENTS (conditional) ── */}
      {Array.isArray(upcomingEvents) && upcomingEvents.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-black text-[#252525] uppercase tracking-tighter mb-10">Upcoming Exhibitions in {displayLocation}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {upcomingEvents.slice(0, 3).map((ev: any, i: number) => (
                <div key={i} className="group cursor-pointer">
                  <div className="h-48 rounded-2xl overflow-hidden mb-5 relative bg-slate-200">
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute bottom-5 left-5">
                      <h3 className="text-xl font-black text-white leading-tight">{ev.name}</h3>
                      <p className="text-xs text-slate-200">{ev.date}</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm font-medium text-slate-600">
                    {ev.venue && <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#E03A3A]" />{ev.venue}</li>}
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#E03A3A]" />Fast-track builder matching</li>
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CONTENT + SIDEBAR ── */}
      {!suppressPostBuildersContent && (
        <section className="py-20 bg-[#F5F6F7] border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Main article */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl md:text-3xl font-black text-[#252525] mb-8 uppercase tracking-tighter">Professional Exhibition Insights</h2>
                <article className="bg-white rounded-xl p-8 border border-slate-200 mb-8">
                  <h3 className="text-xl font-black text-[#252525] mb-4">
                    {(() => {
                      let content = resolvedCmsBlock?.servicesHeading;
                      if (!content && resolvedCmsBlock?.countryPages) {
                        for (const key of Object.keys(resolvedCmsBlock.countryPages)) {
                          if (resolvedCmsBlock.countryPages[key]?.servicesHeading) { content = resolvedCmsBlock.countryPages[key].servicesHeading; break; }
                        }
                      }
                      if (typeof content === 'object' && content !== null) return content.heading || content.title || `Navigating the ${displayLocation} Exhibition Landscape`;
                      return content || `Navigating the ${displayLocation} Exhibition Landscape in 2024`;
                    })()}
                  </h3>
                  <div className="prose max-w-none text-slate-600 prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-4 prose-headings:text-[#252525] prose-li:text-slate-600 prose-strong:text-[#252525] text-sm" dangerouslySetInnerHTML={{
                    __html: sanitizeHtml((() => {
                      let content = resolvedCmsBlock?.servicesParagraph;
                      if (!content && resolvedCmsBlock?.countryPages) {
                        for (const key of Object.keys(resolvedCmsBlock.countryPages)) {
                          if (resolvedCmsBlock.countryPages[key]?.servicesParagraph) { content = resolvedCmsBlock.countryPages[key].servicesParagraph; break; }
                        }
                      }
                      if (typeof content === 'object' && content !== null) return content.description || content.text || '';
                      return content || `<p>${displayLocation} has cemented its status as a world-leading exhibition hub. With major events reaching record attendance, the demand for high-quality stand construction is at an all-time high. Successful exhibiting in ${displayLocation} requires more than just a good design — it requires a builder who understands local regulations, venue specifics, and cultural nuances.</p>`;
                    })())
                  }} />
                  <a href="#builders-grid" className="text-[#E03A3A] font-black inline-flex items-center gap-2 hover:gap-4 transition-all text-sm mt-4">
                    Browse All Builders <ArrowRight className="w-4 h-4" />
                  </a>
                </article>
              </div>

              {/* Sidebar */}
              <div>
                <h2 className="text-lg font-black text-[#252525] mb-6 uppercase tracking-tighter">Directory Stats</h2>
                <div className="space-y-3 mb-6">
                  {[
                    { label: `Active ${displayLocation} Builders`, val: stats.totalBuilders || 0 },
                    { label: 'Industry Categories', val: 34 },
                    { label: 'Avg. Trust Score', val: stats.averageRating || '4.8', highlight: true }
                  ].map((s, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-lg">
                      <span className="text-sm font-semibold text-slate-500">{s.label}</span>
                      <span className={`text-lg font-black ${s.highlight ? 'text-emerald-600' : 'text-[#252525]'}`}>{typeof s.val === 'number' ? s.val.toLocaleString() : s.val}{s.highlight ? '/5' : ''}</span>
                    </div>
                  ))}
                </div>
                <div className="p-6 bg-[#E03A3A]/10 rounded-xl border border-[#E03A3A]/20">
                  <h4 className="font-black text-[#E03A3A] mb-2 text-sm">Need Help Choosing?</h4>
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">Our consultants can provide a shortlist of builders matching your specific technical requirements.</p>
                  <PublicQuoteRequest location={displayLocation} buttonText="Get Expert Consultation" className="text-xs font-black uppercase text-[#E03A3A] p-0 h-auto bg-transparent border-0 hover:bg-transparent shadow-none" size="sm" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── FINAL CTA (bold red) ── */}
      {/* <section className="py-20 bg-[#CC2E2E] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-black mb-6 uppercase tracking-tighter leading-tight">
            {(() => {
              let content = resolvedCmsBlock?.finalCtaHeading;
              if (!content && resolvedCmsBlock?.countryPages) {
                for (const key of Object.keys(resolvedCmsBlock.countryPages)) {
                  if (resolvedCmsBlock.countryPages[key]?.finalCtaHeading) { content = resolvedCmsBlock.countryPages[key].finalCtaHeading; break; }
                }
              }
              if (typeof content === 'object' && content !== null) return content.heading || content.title || `Start Your World-Class Exhibition Journey`;
              return content || `Start Your World-Class Exhibition Journey`;
            })()}
          </h2>
          <p className="text-lg text-white/80 mb-10 leading-relaxed max-w-2xl mx-auto">
            {(() => {
              let content = resolvedCmsBlock?.finalCtaParagraph;
              if (!content && resolvedCmsBlock?.countryPages) {
                for (const key of Object.keys(resolvedCmsBlock.countryPages)) {
                  if (resolvedCmsBlock.countryPages[key]?.finalCtaParagraph) { content = resolvedCmsBlock.countryPages[key].finalCtaParagraph; break; }
                }
              }
              if (typeof content === 'object' && content !== null) return content.description || content.text || '';
              return content || `Don't leave your brand representation to chance. Connect with the best builders in ${displayLocation} today.`;
            })()}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <PublicQuoteRequest
              location={displayLocation}
              buttonText="Browse Full Directory"
              className="bg-white text-[#CC2E2E] px-10 py-4 h-auto rounded-lg font-black text-base hover:shadow-2xl transition-all uppercase tracking-widest border-0"
            />
            <PublicQuoteRequest
              location={displayLocation}
              buttonText="Post a Project Tender"
              className="bg-transparent border-2 border-white text-white px-10 py-4 h-auto rounded-lg font-black text-base hover:bg-white/10 transition-all uppercase tracking-widest"
            />
          </div>
        </div>
      </section> */}
    </div>
  );
}
