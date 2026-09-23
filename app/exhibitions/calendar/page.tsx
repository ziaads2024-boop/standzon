import { Metadata } from "next";
import ExhibitionCalendarClient from "@/components/exhibitions/ExhibitionCalendarClient";
import { GLOBAL_EXHIBITION_DATA } from "@/lib/data/globalCities";

export const metadata: Metadata = {
  title: "Exhibition Calendar • Country & City Wise | StandZone",
  description:
    "Browse source-verified future exhibitions across 58 countries and 204 exhibition cities. Filter by country, city, year, and industry.",
  keywords: [
    "exhibition calendar",
    "trade show calendar",
    "country wise exhibitions",
    "city wise exhibitions",
    "exhibition dates 2026",
    "trade fair dates",
  ],
};

export const revalidate = 3600; // ISR 1h

export default function ExhibitionCalendarPage() {
  const totalCountries = GLOBAL_EXHIBITION_DATA.countries.length;
  const totalCities = GLOBAL_EXHIBITION_DATA.cities.length;

  return (
    <>
      {/* SEO: structured data for calendar */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Global Exhibition Calendar - Country & City Wise",
            description: `Verified exhibition calendar covering ${totalCountries} countries and ${totalCities} cities`,
            url: "https://standszone.com/exhibitions/calendar",
            isPartOf: { "@type": "WebSite", name: "StandZone", url: "https://standszone.com" },
          }),
        }}
      />
      <ExhibitionCalendarClient />
    </>
  );
}
