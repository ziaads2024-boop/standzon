import React from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BuilderCard } from '@/components/BuilderCard';
import {
  MapPin, Building, Users, Star, ArrowRight,
  TrendingUp, Award, CheckCircle, Zap, Globe,
  Calendar, DollarSign, Clock, Shield
} from 'lucide-react';
import { getServerSupabase } from '@/lib/supabase';
import { getAllBuilders } from '@/lib/supabase/builders';
import { getServerPageContent } from '@/lib/data/serverPageContent';
import { sanitizeHtml } from '@/lib/utils/html';
import { normalizeCountrySlug } from '@/lib/utils/slugUtils';

/**
 * Server component version of EnhancedLocationPage for improved performance
 */
interface ServerEnhancedLocationPageProps {
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
  searchTerm?: string;
  suppressPostBuildersContent?: boolean;
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
  searchTerm,
  suppressPostBuildersContent = false,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* HERO */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white pt-24 pb-20">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10" />
        </div>
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-lg px-4 py-2">
                <MapPin className="w-5 h-5 mr-2 inline-block align-middle" />
                <span className="align-middle">{displayLocation}</span>
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="block">Exhibition Stand Builders</span>
              <span className="block bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                in {displayLocation}
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
              {(() => {
                // First try to get hero description from CMS - prioritize heroDescription field over hero.description
                let heroContent = resolvedCmsBlock?.heroDescription || 
                                 resolvedCmsBlock?.hero?.description || 
                                 resolvedCmsBlock?.hero;
                
                // If we still don't have content, try other common fields
                if (!heroContent && resolvedCmsBlock) {
                  heroContent = resolvedCmsBlock.description || 
                               resolvedCmsBlock.content?.introduction || 
                               resolvedCmsBlock.heroContent ||
                               resolvedCmsBlock.content?.hero?.description ||
                               pageContent?.hero?.description ||
                               pageContent?.content?.introduction;
                }
                
                // Handle nested structure for hero description
                // content.countryPages.city.heroDescription
                if (!heroContent && resolvedCmsBlock?.countryPages) {
                  // Try to find hero description in nested country pages
                  const countryPageKeys = Object.keys(resolvedCmsBlock.countryPages);
                  for (const key of countryPageKeys) {
                    const countryPage = resolvedCmsBlock.countryPages[key];
                    if (countryPage && countryPage.heroDescription) {
                      heroContent = countryPage.heroDescription;
                      break;
                    }
                  }
                }
                
                // Handle the specific nested structure for hero description
                // Check if we have serverCmsContent with the nested structure
                if (!heroContent && cmsData?.sections?.cityPages) {
                  const cityPageKeys = Object.keys(cmsData.sections.cityPages);
                  for (const pageKey of cityPageKeys) {
                    const countryPages = cmsData.sections.cityPages[pageKey]?.countryPages;
                    if (countryPages) {
                      const countryPageKeys = Object.keys(countryPages);
                      for (const countryKey of countryPageKeys) {
                        const countryPage = countryPages[countryKey];
                        if (countryPage && countryPage.heroDescription) {
                          heroContent = countryPage.heroDescription;
                          break;
                        }
                      }
                      if (heroContent) break;
                    }
                  }
                }
                
                // Handle case where content might be in nested structure
                if (!heroContent && resolvedCmsBlock?.countryPages) {
                  // Try to find hero content in nested country pages
                  const countryPageKeys = Object.keys(resolvedCmsBlock.countryPages);
                  for (const key of countryPageKeys) {
                    const countryPage = resolvedCmsBlock.countryPages[key];
                    if (countryPage) {
                      heroContent = countryPage.heroDescription || 
                                   countryPage.hero || 
                                   countryPage.description || 
                                   countryPage.content?.introduction;
                      if (heroContent) break;
                    }
                  }
                }
                
                // Handle even deeper nested structure
                if (!heroContent && resolvedCmsBlock?.countryPages) {
                  const countryPageKeys = Object.keys(resolvedCmsBlock.countryPages);
                  for (const key of countryPageKeys) {
                    const nestedCountryPages = resolvedCmsBlock.countryPages[key]?.countryPages;
                    if (nestedCountryPages) {
                      const nestedKeys = Object.keys(nestedCountryPages);
                      for (const nestedKey of nestedKeys) {
                        const nestedPage = nestedCountryPages[nestedKey];
                        if (nestedPage) {
                          heroContent = nestedPage.heroDescription || 
                                       nestedPage.hero || 
                                       nestedPage.description || 
                                       nestedPage.content?.introduction;
                          if (heroContent) break;
                        }
                      }
                      if (heroContent) break;
                    }
                  }
                }
                
                // Handle the specific structure we saw in the logs:
                // sections.cityPages[country-city].cityPages[country-city].countryPages.city
                if (!heroContent && resolvedCmsBlock?.cityPages) {
                  const cityPageKeys = Object.keys(resolvedCmsBlock.cityPages);
                  for (const key of cityPageKeys) {
                    const nestedCityPages = resolvedCmsBlock.cityPages[key]?.countryPages;
                    if (nestedCityPages) {
                      const nestedKeys = Object.keys(nestedCityPages);
                      for (const nestedKey of nestedKeys) {
                        const nestedPage = nestedCityPages[nestedKey];
                        if (nestedPage) {
                          heroContent = nestedPage.heroDescription || 
                                       nestedPage.hero || 
                                       nestedPage.description || 
                                       nestedPage.content?.introduction;
                          if (heroContent) break;
                        }
                      }
                      if (heroContent) break;
                    }
                  }
                }
                
                // Handle even more specific nested structure for hero description
                // content.sections.cityPages[country-city].countryPages.city.heroDescription
                if (!heroContent && cmsData?.sections?.cityPages) {
                  const cityPageKeys = Object.keys(cmsData.sections.cityPages);
                  for (const key of cityPageKeys) {
                    const countryPages = cmsData.sections.cityPages[key]?.countryPages;
                    if (countryPages) {
                      const countryPageKeys = Object.keys(countryPages);
                      for (const countryKey of countryPageKeys) {
                        const countryPage = countryPages[countryKey];
                        if (countryPage && countryPage.heroDescription) {
                          heroContent = countryPage.heroDescription;
                          break;
                        }
                      }
                      if (heroContent) break;
                    }
                  }
                }
                
                // NEW: Handle the specific structure we identified in the test script
                // sections.cityPages["united-arab-emirates-dubai"].countryPages.dubai.heroDescription
                if (!heroContent && cmsData?.sections?.cityPages) {
                  const cityPageKeys = Object.keys(cmsData.sections.cityPages);
                  for (const pageKey of cityPageKeys) {
                    const countryPages = cmsData.sections.cityPages[pageKey]?.countryPages;
                    if (countryPages) {
                      const countryPageKeys = Object.keys(countryPages);
                      for (const countryKey of countryPageKeys) {
                        const countryPage = countryPages[countryKey];
                        if (countryPage && countryPage.heroDescription) {
                          heroContent = countryPage.heroDescription;
                          break;
                        }
                      }
                      if (heroContent) break;
                    }
                  }
                }
                
                // Handle object content properly
                const extractText = (content: any): string => {
                  if (typeof content === 'string') return content;
                  if (typeof content === 'object' && content !== null) {
                    // Try common properties in order of preference
                    return content.description || 
                           content.text || 
                           content.heading || 
                           content.title || 
                           content.content ||
                           JSON.stringify(content);
                  }
                  return String(content);
                };
                
                heroContent = extractText(heroContent);
                
                // Return the content or fallback
                return heroContent || `Find trusted exhibition stand builders in ${displayLocation}.`;
              })()}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 text-white">
              <a href="/quote" className="inline-flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold border border-white/80 rounded-full bg-gradient-to-r from-[#E03A3A] to-[#EC6A6A] active:from-[#C31860] active:to-[#E44080] transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-300 w-full sm:w-auto min-w-[200px]">
                Get Quotes from {displayLocation} Builders
              </a>
              <Button
                variant="outline"
                size="lg"
                className="border-white/20 text-white hover:bg-white/20 hover:text-gray-900 backdrop-blur-sm text-lg px-8 py-4 shadow-lg"
                onClick={() => document.getElementById('builders-grid')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Browse Local Builders
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center">
                <div className="flex items-center justify-center mb-2"><Building className="w-6 h-6 text-blue-400" /></div>
                <div className="text-xl font-bold">{stats.totalBuilders}+</div>
                <div className="text-slate-300 text-xs">Verified Builders</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center">
                <div className="flex items-center justify-center mb-2"><Star className="w-6 h-6 text-yellow-400" /></div>
                <div className="text-xl font-bold">{stats.averageRating}</div>
                <div className="text-slate-300 text-xs">Average Rating</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center">
                <div className="flex items-center justify-center mb-2"><Award className="w-6 h-6 text-green-400" /></div>
                <div className="text-xl font-bold">{stats.completedProjects.toLocaleString()}</div>
                <div className="text-slate-300 text-xs">Projects Completed</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center">
                <div className="flex items-center justify-center mb-2"><DollarSign className="w-6 h-6 text-purple-400" /></div>
                <div className="text-xl font-bold">${stats.averagePrice}</div>
                <div className="text-slate-300 text-xs">Avg. Price/sqm</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rest of the component would continue here */}
      <div className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {(() => {
                  let content = resolvedCmsBlock?.whyChooseHeading;
                  
                  // Handle nested structure for whyChooseHeading
                  if (!content && resolvedCmsBlock?.countryPages) {
                    const countryPageKeys = Object.keys(resolvedCmsBlock.countryPages);
                    for (const key of countryPageKeys) {
                      if (resolvedCmsBlock.countryPages[key]?.whyChooseHeading) {
                        content = resolvedCmsBlock.countryPages[key].whyChooseHeading;
                        break;
                      }
                    }
                  }
                  
                  // Handle deeper nested structure
                  if (!content && resolvedCmsBlock?.countryPages) {
                    const countryPageKeys = Object.keys(resolvedCmsBlock.countryPages);
                    for (const key of countryPageKeys) {
                      const nestedCountryPages = resolvedCmsBlock.countryPages[key]?.countryPages;
                      if (nestedCountryPages) {
                        const nestedKeys = Object.keys(nestedCountryPages);
                        for (const nestedKey of nestedKeys) {
                          if (nestedCountryPages[nestedKey]?.whyChooseHeading) {
                            content = nestedCountryPages[nestedKey].whyChooseHeading;
                            break;
                          }
                        }
                        if (content) break;
                      }
                    }
                  }
                  
                  if (typeof content === 'object' && content !== null) {
                    return content.heading || content.title || JSON.stringify(content);
                  }
                  return content || `Why Choose Local Builders in ${displayLocation}?`;
                })()}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {(() => {
                  let content = resolvedCmsBlock?.whyChooseParagraph;
                  
                  // Handle nested structure for whyChooseParagraph
                  if (!content && resolvedCmsBlock?.countryPages) {
                    const countryPageKeys = Object.keys(resolvedCmsBlock.countryPages);
                    for (const key of countryPageKeys) {
                      if (resolvedCmsBlock.countryPages[key]?.whyChooseParagraph) {
                        content = resolvedCmsBlock.countryPages[key].whyChooseParagraph;
                        break;
                      }
                    }
                  }
                  
                  // Handle deeper nested structure
                  if (!content && resolvedCmsBlock?.countryPages) {
                    const countryPageKeys = Object.keys(resolvedCmsBlock.countryPages);
                    for (const key of countryPageKeys) {
                      const nestedCountryPages = resolvedCmsBlock.countryPages[key]?.countryPages;
                      if (nestedCountryPages) {
                        const nestedKeys = Object.keys(nestedCountryPages);
                        for (const nestedKey of nestedKeys) {
                          if (nestedCountryPages[nestedKey]?.whyChooseParagraph) {
                            content = nestedCountryPages[nestedKey].whyChooseParagraph;
                            break;
                          }
                        }
                        if (content) break;
                      }
                    }
                  }
                  
                  if (typeof content === 'object' && content !== null) {
                    return content.description || content.text || JSON.stringify(content);
                  }
                  return content || `Local builders offer unique advantages including market knowledge, logistical expertise, and established vendor relationships.`;
                })()}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {(() => {
                let infoCards = resolvedCmsBlock?.infoCards;
                
                // Handle nested structure for infoCards
                if (!infoCards && resolvedCmsBlock?.countryPages) {
                  const countryPageKeys = Object.keys(resolvedCmsBlock.countryPages);
                  for (const key of countryPageKeys) {
                    if (resolvedCmsBlock.countryPages[key]?.infoCards) {
                      infoCards = resolvedCmsBlock.countryPages[key].infoCards;
                      break;
                    }
                  }
                }
                
                // Handle deeper nested structure
                if (!infoCards && resolvedCmsBlock?.countryPages) {
                  const countryPageKeys = Object.keys(resolvedCmsBlock.countryPages);
                  for (const key of countryPageKeys) {
                    const nestedCountryPages = resolvedCmsBlock.countryPages[key]?.countryPages;
                    if (nestedCountryPages) {
                      const nestedKeys = Object.keys(nestedCountryPages);
                      for (const nestedKey of nestedKeys) {
                        if (nestedCountryPages[nestedKey]?.infoCards) {
                          infoCards = nestedCountryPages[nestedKey].infoCards;
                          break;
                        }
                      }
                      if (infoCards) break;
                    }
                  }
                }
                
                let cards = [
                  {
                    title: 'Local Market Knowledge',
                    text: `Understand local regulations, venue requirements and cultural preferences specific to ${displayLocation}.`
                  },
                  {
                    title: 'Faster Project Delivery',
                    text: 'Reduced logistics time and faster response for urgent modifications.'
                  },
                  {
                    title: 'Cost-Effective Solutions',
                    text: 'Lower transport costs and local supplier networks.'
                  }
                ];
                
                // Handle case where infoCards is an object instead of array
                if (Array.isArray(infoCards)) {
                  cards = infoCards.map(card => {
                    if (typeof card === 'object' && card !== null) {
                      return {
                        title: typeof card.title === 'object' ? 
                          (card.title.heading || card.title.title || JSON.stringify(card.title)) : 
                          card.title,
                        text: typeof card.text === 'object' ? 
                          (card.text.description || card.text.text || JSON.stringify(card.text)) : 
                          card.text
                      };
                    }
                    return card;
                  });
                }
                
                return cards;
              })().map((card: any, idx: number) => (
                <div key={idx} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${idx === 0 ? 'bg-blue-100' : idx === 1 ? 'bg-green-100' : 'bg-purple-100'}`}>
                    {idx === 0 ? <MapPin className="w-6 h-6 text-blue-600" /> : idx === 1 ? <Clock className="w-6 h-6 text-green-600" /> : <DollarSign className="w-6 h-6 text-purple-600" />}
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">{card.title}</h3>
                  <p className="text-gray-600 text-sm">{card.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
