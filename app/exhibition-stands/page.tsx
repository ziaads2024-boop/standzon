import type { Metadata } from 'next';
import siteMetadata from '@/app/metadata.json';
import ExhibitionStandsContent from '@/components/ExhibitionStandsContent';
import { getAllCountries, getAllCities } from '@/lib/data/globalExhibitionDatabase';
import { getAllBuilders } from '@/lib/supabase/builders';

// Export metadata from centralized metadata.json
export const metadata: Metadata = siteMetadata['/exhibition-stands'] || {
  title: 'Exhibition Stands Worldwide | 21+ Countries & 104+ Cities | Global Directory | StandsZone',
  description: 'Comprehensive global directory of exhibition stand builders covering 21+ countries and 104+ major cities. Professional trade show services across Europe, Asia, Americas, Africa, and Oceania. Custom stands, modular systems, and full-service solutions.',
  openGraph: {
    title: 'Exhibition Stands Worldwide | 21+ Countries & 104+ Cities | Global Directory | StandsZone',
    description: 'Comprehensive global directory of exhibition stand builders covering 21+ countries and 104+ major cities. Professional trade show services across Europe, Asia, Americas, Africa, and Oceania. Custom stands, modular systems, and full-service solutions.',
    images: [{ url: '/og-image.jpg' }],
  },
  alternates: {
    canonical: 'https://standszone.com/exhibition-stands',
  },
};

import ClientPageWithBreadcrumbs from '@/components/ClientPageWithBreadcrumbs';

export default async function ExhibitionStandsPage() {
  const allCountries = getAllCountries();
  const allCities = getAllCities();

  const byCountry = new Map<string, { count: number; ratingSum: number; ratingCount: number }>();
  try {
    const builders = await getAllBuilders();
    for (const b of builders as any[]) {
      const country = b.headquarters_country;
      if (!country) continue;
      const entry = byCountry.get(country) || { count: 0, ratingSum: 0, ratingCount: 0 };
      entry.count += 1;
      if (typeof b.rating === 'number') { entry.ratingSum += b.rating; entry.ratingCount += 1; }
      byCountry.set(country, entry);
    }
    // UAE naming can appear as either "UAE" or "United Arab Emirates" in source data
    const uae = byCountry.get('UAE');
    const fullUae = byCountry.get('United Arab Emirates');
    if (uae && !fullUae) byCountry.set('United Arab Emirates', uae);
    if (fullUae && !uae) byCountry.set('UAE', fullUae);
  } catch {}

  const initialCountries = allCountries
    .map(country => {
      const stat = byCountry.get(country.name);
      return {
        name: country.name,
        code: country.code,
        continent: country.continent,
        builderCount: stat?.count || 0,
        averageRating: stat && stat.ratingCount > 0 ? stat.ratingSum / stat.ratingCount : 0,
        cities: allCities.filter(city => city.countrySlug === country.slug).map(city => city.name),
        slug: country.slug,
        marketSize: country.marketSize,
        annualEvents: country.annualEvents,
      };
    })
    .filter((country, index, self) => index === self.findIndex(c => c.code === country.code))
    .sort((a, b) => {
      if (a.builderCount > 0 && b.builderCount === 0) return -1;
      if (a.builderCount === 0 && b.builderCount > 0) return 1;
      if (a.builderCount > 0 && b.builderCount > 0) return b.builderCount - a.builderCount;
      return (b.marketSize - a.marketSize) || a.name.localeCompare(b.name);
    });

  return (
    <ClientPageWithBreadcrumbs pathname="/exhibition-stands">
      <ExhibitionStandsContent initialCountries={initialCountries} />
    </ClientPageWithBreadcrumbs>
  );
}
