import { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import CountryPageClientWrapper from "@/components/CountryPageClientWrapper";
import UaeLocationPage from "@/components/location-v2/UaeLocationPage";
import CountryLocationPage from "@/components/location-v2/CountryLocationPage";
import { GLOBAL_EXHIBITION_DATA } from "@/lib/data/globalCities";
import { getCountryCodeByName } from "@/lib/utils/countryUtils";
import { getCitiesByCountry } from "@/lib/supabase/client";
// Import the global database function
import { getCitiesByCountry as getGlobalCitiesByCountry } from "@/lib/data/globalExhibitionDatabase";
import ServerPageWithBreadcrumbs from "@/components/ServerPageWithBreadcrumbs";
import { getServerPageContent } from "@/lib/data/serverPageContent";
import JsonLd from "@/components/JsonLd";
import { getLocationSchema, getBreadcrumbSchema } from "@/lib/seo/structuredData";

// ✅ ISR: cache rendered country pages for 1 hour (was force-dynamic, which
// re-rendered on every crawl and hurt TTFB / crawl budget). No generateStaticParams,
// so pages are still built on-demand — just cached afterwards.
export const revalidate = 3600;

const SITE_URL = "https://standszone.com";

// Create a map for easy lookup
const COUNTRY_DATA: Record<string, any> = {};
GLOBAL_EXHIBITION_DATA.countries.forEach((country: any) => {
  COUNTRY_DATA[country.slug] = {
    name: country.name,
    code: country.countryCode,
    flag: '🏳️' // Placeholder flag
  };
});

interface CountryPageProps {
  params: Promise<{
    country: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

// Fetch CMS content for the country page (cached + deduped via getServerPageContent).
async function getCountryPageContent(countrySlug: string) {
  try {
    return (await getServerPageContent(countrySlug)) || null;
  } catch (error) {
    console.error("❌ Error fetching country page content:", error);
    return null;
  }
}

/**
 * Shared, error-aware "does this country page have real content?" check.
 * Cached per request so generateMetadata and the page body share the same work.
 * `errored: true` means "unknown" — never treat it as "empty" (avoids deindexing
 * a live page on a transient DB blip).
 */
const loadCountrySignals = cache(async (countrySlug: string, countryName: string) => {
  let builderTotal = 0;
  let errored = false;
  try {
    const { getFilteredBuilders } = await import("@/lib/supabase/builders");
    const r = await getFilteredBuilders({ country: countryName, page: 1, itemsPerPage: 1 });
    builderTotal = r.total || 0;
  } catch (e) {
    errored = true;
    console.log("⚠️ loadCountrySignals: builder check failed:", e);
  }
  const cms = await getCountryPageContent(countrySlug);
  return { builderTotal, cms, errored };
});

export async function generateMetadata({ params, searchParams }: { params: Promise<{ country: string }>; searchParams: Promise<{ page?: string }> }): Promise<Metadata> {
  const { country: countrySlug } = await params;
  const { page } = await searchParams;
  const currentPageNum = parseInt(page || "1", 10);
  const countryInfo = COUNTRY_DATA[countrySlug as keyof typeof COUNTRY_DATA];



  // Better error handling for missing country data
  if (!countryInfo) {
    console.warn(`⚠️ Country metadata not found for slug: ${countrySlug}`);
    return {
      title: 'Country Not Found',
      description: 'The requested country page was not found.',
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  }

  // Cached, error-aware signals (shared with the page body).
  const { builderTotal, cms, errored } = await loadCountrySignals(countrySlug, countryInfo.name);

  let cmsMetadata = null;
  if (cms) {
    const seo = cms.seo || {};
    const hero = cms.hero || {};
    cmsMetadata = {
      title: seo.metaTitle || hero.title || `Exhibition Stand Builders in ${countryInfo.name} | Professional Trade Show Displays`,
      description: seo.metaDescription || `Find professional exhibition stand builders across ${countryInfo.name}. Custom trade show displays, booth design, and comprehensive exhibition services.`,
      keywords: seo.keywords || [`exhibition stands ${countryInfo.name}`, `booth builders ${countryInfo.name}`, `trade show displays ${countryInfo.name}`, `${countryInfo.name} exhibition builders`, `${countryInfo.name} booth design`, `${countryInfo.name} exhibition stands`],
    };
  }

  // Handle pagination for SEO: canonical and robots tags
  const isPaginated = currentPageNum > 1;
  const canonicalUrl = `https://standszone.com/exhibition-stands/${countrySlug}`;

  // Thin-content guard: a country hub with zero matching builders is thin
  // (templated boilerplate only) — keep it out of the index for now. Still
  // crawlable/followed; recovers automatically once builders serve the country.
  // If the check errored we don't know the count, so we stay indexable.
  const thin = !errored && builderTotal === 0;
  const indexable = !isPaginated && !thin;

  // Use CMS metadata if available, otherwise fall back to default
  const title = cmsMetadata?.title || `Exhibition Stand Builders in ${countryInfo.name} | Professional Trade Show Displays`;
  const description = cmsMetadata?.description || `Find professional exhibition stand builders across ${countryInfo.name}. Custom trade show displays, booth design, and comprehensive exhibition services.`;
  const keywords = cmsMetadata?.keywords || [`exhibition stands ${countryInfo.name}`, `booth builders ${countryInfo.name}`, `trade show displays ${countryInfo.name}`, `${countryInfo.name} exhibition builders`, `${countryInfo.name} booth design`, `${countryInfo.name} exhibition stands`];

  return {
    title: isPaginated ? `${title} - Page ${currentPageNum}` : title,
    description,
    keywords,
    robots: {
      index: indexable,
      follow: true,
      googleBot: {
        index: indexable,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: isPaginated ? `${title} - Page ${currentPageNum}` : title,
      description,
      type: 'website',
      locale: 'en_US',
      url: canonicalUrl,
      images: ['/og-image.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: isPaginated ? `${title} - Page ${currentPageNum}` : title,
      description,
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function CountryPage({ params, searchParams }: CountryPageProps) {
  const { country: countrySlug } = await params;
  const { page } = await searchParams;
  const currentPageNum = parseInt(page || "1", 10);
  const countryInfo = COUNTRY_DATA[countrySlug as keyof typeof COUNTRY_DATA];

  // Better error handling to prevent 5xx errors
  if (!countryInfo) {
    console.warn(`⚠️ Country not found: ${countrySlug}`);
    notFound();
  }

  console.log(`${countryInfo.flag} Loading ${countryInfo.name} page with modern UI...`);

  const countrySignals = await loadCountrySignals(countrySlug, countryInfo.name);
  const cmsContent = countrySignals.cms;

  // Get country code for fetching cities
  const countryCode = getCountryCodeByName(countryInfo.name);
  console.log(`🔍 Country code for ${countryInfo.name}: ${countryCode}`);

  // Fetch cities from Supabase
  let cities: any[] = [];
  try {
    if (countryCode) {
      const rawCities = await getCitiesByCountry(countryCode);
      console.log(`✅ Fetched ${rawCities.length} cities for ${countryInfo.name} (${countryCode}) from Supabase`);

      // Transform cities data to match expected format
      cities = rawCities.map((city: any) => ({
        name: city.city_name,
        slug: city.city_slug,
        builderCount: city.builder_count || 0
      }));
    } else {
      console.warn(`⚠️ Could not find country code for ${countryInfo.name}`);
    }
  } catch (error) {
    console.error(`❌ Error fetching cities for ${countryInfo.name}:`, error);
  }

  // If no cities from Supabase, fallback to global database
  if (cities.length === 0) {
    console.log(`🔄 Falling back to global database for cities in ${countryInfo.name}`);
    try {
      const globalCities = getGlobalCitiesByCountry(countrySlug);
      console.log(`✅ Found ${globalCities.length} cities for ${countryInfo.name} in global database`);

      // Transform global cities data to match expected format and deduplicate
      const cityMap = new Map();
      globalCities.forEach((city: any) => {
        // Use city name as key to deduplicate
        if (!cityMap.has(city.name)) {
          cityMap.set(city.name, {
            name: city.name,
            slug: city.slug,
            builderCount: city.builderCount || 0
          });
        }
      });

      cities = Array.from(cityMap.values());
      console.log(`✅ Deduplicated to ${cities.length} unique cities for ${countryInfo.name}`);
    } catch (error) {
      console.error(`❌ Error fetching cities from global database for ${countryInfo.name}:`, error);
    }
  }

  // Fetch builders directly from Supabase using optimized query
  let builders: any[] = [];
  let totalBuilders = 0;
  let totalPages = 0;

  try {
    const { getFilteredBuilders } = await import('@/lib/supabase/builders');

    const result = await getFilteredBuilders({
      country: countryInfo.name,
      page: currentPageNum,
      itemsPerPage: 12
    });

    builders = result.builders;
    totalBuilders = result.total;
    totalPages = result.totalPages;

    // Transform builders to match consistent interface
    builders = builders.map((b: any) => ({
      id: b.id,
      companyName: b.company_name || b.companyName || "",
      slug: b.slug || (b.company_name || b.companyName || "").toLowerCase().replace(/[^a-z0-9]/g, "-"),
      headquarters: {
        city: b.headquarters_city || b.headquarters?.city || "Unknown",
        country: b.headquarters_country || b.headquartersCountry || b.headquarters?.country || "Unknown",
      },
      serviceLocations: b.service_locations || b.serviceLocations || [],
      rating: b.rating || 0,
      reviewCount: b.reviewCount || 0,
      projectsCompleted: b.projects_completed || b.projectsCompleted || 0,
      responseTime: b.response_time || b.responseTime || "Within 24 hours",
      verified: b.verified || b.isVerified || false,
      premiumMember: b.premium_member || b.premiumMember || false,
      services: b.services || [],
      specializations: b.specializations || [],
      companyDescription: b.description || b.company_description || "",
      keyStrengths: b.key_strengths || b.keyStrengths || [],
      featured: b.featured || false,
      logo: b.logo || b.profile_image || "/images/builders/default-logo.png",
      planType: b.plan_type || b.planType || "free",
      portfolio: b.portfolio || b.gallery_images || b.images || [],
    }));

    console.log(`📍 Fetched ${builders.length} builders for country: ${countryInfo.name} (page ${currentPageNum}/${totalPages}, total: ${totalBuilders})`);
  } catch (error) {
    console.error("❌ Error loading builders:", error);
    builders = [];
  }

  const defaultContent = {
    id: `${countrySlug}-main`,
    title: `Exhibition Stand Builders in ${countryInfo.name}`,
    metaTitle: `${countryInfo.name} Exhibition Stand Builders | Trade Show Booth Design`,
    metaDescription: `Leading exhibition stand builders across ${countryInfo.name}. Custom trade show displays, booth design, and professional exhibition services.`,
    description: `${countryInfo.name} is a significant market for international trade shows and exhibitions.`,
    heroContent: `Partner with ${countryInfo.name}'s premier exhibition stand builders for trade show success.`,
    seoKeywords: [`${countryInfo.name} exhibition stands`, `${countryInfo.name} trade show builders`]
  };

  const countryBlock = cmsContent?.sections?.countryPages?.[countrySlug] || cmsContent || null;
  const mergedContent = {
    ...defaultContent,
    ...(countryBlock || {})
  };

  // Soft-404 prevention: only 404 when we are CONFIRMED to have no content.
  // If the content lookups errored (transient DB issue), render rather than 404 —
  // deindexing a live page over a blip is far more costly than serving one thin page.
  const hasMeaningfulContent = totalBuilders > 0 || (cmsContent && (cmsContent as any).content);
  if (!hasMeaningfulContent && !countrySignals.errored) {
    console.warn(`⚠️ Soft 404: No meaningful content for ${countryInfo.name}. Builders: ${totalBuilders}, CMS: ${!!cmsContent}`);
    notFound();
  }

  const jsonLd = [
    getBreadcrumbSchema([
      { name: "Home", url: `${SITE_URL}/` },
      { name: "Exhibition Stands", url: `${SITE_URL}/exhibition-stands` },
      { name: countryInfo.name, url: `${SITE_URL}/exhibition-stands/${countrySlug}` },
    ]),
    getLocationSchema(countryInfo.name, undefined, builders, {
      totalBuilders,
      verifiedBuilders: builders.filter((b: any) => b.verified).length,
    }),
  ];

  return (
    <ServerPageWithBreadcrumbs pathname={`/exhibition-stands/${countrySlug}`}>
      <JsonLd data={jsonLd} />
      <div className="font-inter">
        <CountryPageClientWrapper>
          {countrySlug === "united-arab-emirates" ? (
            <UaeLocationPage
              builders={builders}
              cities={cities}
              cmsContent={cmsContent}
              mergedContent={mergedContent}
              totalBuilders={totalBuilders}
            />
          ) : (
            <CountryLocationPage
              countrySlug={countrySlug}
              countryName={countryInfo.name}
              builders={builders}
              cities={cities}
              cmsContent={cmsContent}
              totalBuilders={totalBuilders}
            />
          )}
        </CountryPageClientWrapper>
      </div>
    </ServerPageWithBreadcrumbs>
  );
}
