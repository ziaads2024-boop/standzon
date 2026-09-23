import { Metadata } from "next";
import ExhibitionCalendarClient from "@/components/exhibitions/ExhibitionCalendarClient";
import { GLOBAL_EXHIBITION_DATA } from "@/lib/data/globalCities";
import { getDefaultExhibitionCalendar } from "@/lib/data/exhibitionCalendarServer";

export const metadata: Metadata = {
  title: "Global Trade Show & Exhibition Calendar | StandZone",
  description:
    "Browse source-verified upcoming trade shows and exhibitions across 58 countries and 204 cities. Filter by country, city, year, and industry.",
  keywords: [
    "trade shows",
    "exhibition calendar",
    "trade show calendar",
    "country wise exhibitions",
    "exhibition dates 2026",
  ],
};

export const revalidate = 3600;

export default async function TradeShowsPage({
  searchParams,
}: {
  searchParams?: Promise<{ country?: string; city?: string; year?: string }>;
}) {
  const totalCountries = GLOBAL_EXHIBITION_DATA.countries.length;
  const totalCities = GLOBAL_EXHIBITION_DATA.cities.length;
  const sp = (await searchParams) || {};
  const initial = await getDefaultExhibitionCalendar({ country: sp.country, city: sp.city, year: sp.year });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Global Trade Show & Exhibition Calendar",
            description: `Verified exhibition calendar covering ${totalCountries} countries and ${totalCities} cities`,
            url: "https://standszone.com/trade-shows",
            isPartOf: { "@type": "WebSite", name: "StandZone", url: "https://standszone.com" },
          }),
        }}
      />
      <ExhibitionCalendarClient
        initialExhibitions={initial.exhibitions}
        initialTotal={initial.total}
        initialGroupedCountries={initial.groupedCountries}
      />
    </>
  );
}
