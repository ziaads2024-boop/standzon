import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { countriesWithCities } from "@/lib/data/countriesWithCities";
import { FiCalendar, FiMapPin, FiExternalLink, FiCheckCircle } from "react-icons/fi";

export const revalidate = 3600;

function slugToCountry(slug: string): string | null {
  const normalized = slug.replace(/-/g, " ").toLowerCase();
  for (const country of Object.keys(countriesWithCities)) {
    if (country.toLowerCase() === normalized) return country;
    if (country.toLowerCase().replace(/[^a-z0-9]/g, "-") === slug.toLowerCase()) return country;
  }
  // direct match by slugified version
  const found = Object.keys(countriesWithCities).find(c => c.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase());
  return found || null;
}

export async function generateStaticParams() {
  return Object.keys(countriesWithCities).slice(0, 20).map(c => ({
    country: c.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const { country: slug } = await params;
  const country = slugToCountry(slug);
  if (!country) return { title: "Exhibition Calendar" };
  return {
    title: `Exhibitions in ${country} • Calendar 2026 | StandZone`,
    description: `Verified exhibitions in ${country} - browse city wise (${(countriesWithCities as any)[country]?.join(", ") || ""}). Dates from official venues and UFI calendars.`,
  };
}

async function getExhibitionsForCountry(country: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/exhibitions/calendar?country=${encodeURIComponent(country)}&limit=100&upcoming=true`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    // Fallback: direct Supabase fetch via client if base not reachable during build
    return [];
  }
}

export default async function CountryCalendarPage({ params }: { params: Promise<{ country: string }> }) {
  const { country: slug } = await params;
  const country = slugToCountry(slug);
  if (!country) notFound();

  const cities: string[] = (countriesWithCities as any)[country] || [];
  const exhibitions: any[] = await getExhibitionsForCountry(country);

  const byCity: Record<string, any[]> = {};
  for (const ex of exhibitions) {
    if (!byCity[ex.city_name]) byCity[ex.city_name] = [];
    byCity[ex.city_name].push(ex);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="pt-20 pb-10 bg-gradient-to-br from-slate-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-sm text-gray-300 mb-2">
            <Link href="/exhibitions/calendar" className="hover:underline">Calendar</Link> / {country}
          </div>
          <h1 className="text-4xl font-bold">Exhibitions in {country}</h1>
          <p className="text-gray-300 mt-2">{cities.length} cities • {exhibitions.length} upcoming verified exhibitions • Source-verified dates</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {cities.map(city => (
              <Link
                key={city}
                href={`/exhibitions/calendar/${slug}/${city.toLowerCase().replace(/\s+/g, "-")}`}
                className="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-sm hover:bg-white/20"
              >
                {city} {byCity[city] ? `(${byCity[city].length})` : ""}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {exhibitions.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600">No verified exhibitions for {country} yet. Our sub-agent crawls official venue sites weekly.</p>
              <Link href="/exhibitions/calendar" className="inline-block mt-4">
                <Button variant="outline">Browse all countries</Button>
              </Link>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">{exhibitions.length} upcoming exhibitions</h2>
                <Link href={`/exhibitions/calendar?country=${encodeURIComponent(country)}`} className="text-sm text-blue-600 hover:underline">
                  Filter view →
                </Link>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exhibitions.map((ex: any) => (
                  <Card key={ex.slug} className="hover:shadow-lg transition">
                    <CardHeader className="pb-2">
                      <div className="flex gap-2">
                        <Badge className={ex.verified ? "bg-emerald-600" : "bg-amber-100 text-amber-700"}>
                          {ex.verified ? <><FiCheckCircle className="w-3 h-3 mr-1" /> Verified</> : "Pending"}
                        </Badge>
                        {ex.industry && <Badge variant="secondary">{ex.industry}</Badge>}
                      </div>
                      <CardTitle className="text-base mt-2 line-clamp-2">{ex.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2"><FiMapPin className="w-4 h-4 text-blue-600" />{ex.city_name} • {ex.venue || "TBA"}</div>
                        <div className="flex items-center gap-2"><FiCalendar className="w-4 h-4 text-blue-600" />{new Date(ex.start_date).toLocaleDateString()} — {new Date(ex.end_date).toLocaleDateString()}</div>
                        {ex.website && <a href={ex.website} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1"><FiExternalLink className="w-3 h-3" /> Official site</a>}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button asChild size="sm" className="flex-1"><a href={ex.website || ex.source_url} target="_blank">View</a></Button>
                        <Button asChild variant="outline" size="sm" className="flex-1"><Link href={`/exhibitions/calendar/${slug}/${ex.city_name.toLowerCase().replace(/\s+/g, "-")}`}>{ex.city_name}</Link></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* City breakdown */}
              <div className="mt-12">
                <h3 className="text-lg font-semibold mb-4">By City</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cities.map(city => (
                    <Link key={city} href={`/exhibitions/calendar/${slug}/${city.toLowerCase().replace(/\s+/g, "-")}`} className="block">
                      <Card className="hover:shadow-md transition p-4 flex items-center justify-between">
                        <span className="font-medium">{city}</span>
                        <Badge variant={byCity[city]?.length ? "default" : "secondary"}>{byCity[city]?.length || 0} shows</Badge>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
