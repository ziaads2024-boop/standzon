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
  const found = Object.keys(countriesWithCities).find(c => c.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase());
  return found || null;
}

function slugToCity(country: string, citySlug: string): string | null {
  const cities: string[] = (countriesWithCities as any)[country] || [];
  for (const city of cities) {
    if (city.toLowerCase().replace(/\s+/g, "-") === citySlug.toLowerCase()) return city;
    if (city.toLowerCase() === citySlug.replace(/-/g, " ").toLowerCase()) return city;
  }
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ country: string; city: string }> }): Promise<Metadata> {
  const { country: cSlug, city: ciSlug } = await params;
  const country = slugToCountry(cSlug);
  const city = country ? slugToCity(country, ciSlug) : null;
  if (!country || !city) return { title: "Exhibition Calendar" };
  return {
    title: `Exhibitions in ${city}, ${country} • 2026 Calendar | StandZone`,
    description: `Verified exhibitions in ${city}, ${country}. Dates sourced from official venues (e.g., ${city} Exhibition Center) and UFI-certified calendars.`,
  };
}

async function getExhibitions(country: string, city: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/exhibitions/calendar?country=${encodeURIComponent(country)}&city=${encodeURIComponent(city)}&limit=100&upcoming=true`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export default async function CityCalendarPage({ params }: { params: Promise<{ country: string; city: string }> }) {
  const { country: cSlug, city: ciSlug } = await params;
  const country = slugToCountry(cSlug);
  if (!country) notFound();
  const city = slugToCity(country, ciSlug);
  if (!city) notFound();

  const exhibitions: any[] = await getExhibitions(country, city);

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="pt-20 pb-10 bg-gradient-to-br from-slate-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-sm text-gray-300 mb-2">
            <Link href="/exhibitions/calendar" className="hover:underline">Calendar</Link> /{" "}
            <Link href={`/exhibitions/calendar/${cSlug}`} className="hover:underline">{country}</Link> / {city}
          </div>
          <h1 className="text-4xl font-bold">Exhibitions in {city}, {country}</h1>
          <p className="text-gray-300 mt-2">{exhibitions.length} upcoming verified exhibitions • All dates from genuine sources</p>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {exhibitions.length === 0 ? (
            <Card className="p-8 text-center">
              <FiCalendar className="w-10 h-10 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">No verified exhibitions for {city} yet</h3>
              <p className="text-gray-500 mt-2">Our sub-agent checks official {city} venues and UFI calendars weekly. Try a nearby city or check back soon.</p>
              <div className="mt-6 flex justify-center gap-2">
                <Link href={`/exhibitions/calendar/${cSlug}`}><Button variant="outline">All {country} cities</Button></Link>
                <Link href="/exhibitions/calendar"><Button>Global calendar</Button></Link>
              </div>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">{exhibitions.length} upcoming in {city}</h2>
                <span className="text-sm text-gray-500">Verified • Official sources only</span>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exhibitions.map((ex: any) => (
                  <Card key={ex.slug} className="hover:shadow-lg transition flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="flex gap-2 flex-wrap">
                        <Badge className={ex.verified ? "bg-emerald-600" : "bg-amber-100 text-amber-700"}>{ex.verified ? <><FiCheckCircle className="w-3 h-3 mr-1" /> Verified</> : "Pending"}</Badge>
                        {ex.featured && <Badge variant="outline" className="bg-amber-50 text-amber-700">Featured</Badge>}
                        {ex.industry && <Badge variant="secondary">{ex.industry}</Badge>}
                      </div>
                      <CardTitle className="text-base mt-2 line-clamp-2">{ex.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <div className="text-sm text-gray-600 space-y-1 flex-1">
                        <div className="flex items-center gap-2"><FiMapPin className="w-4 h-4 text-blue-600" />{ex.venue || `${city} Exhibition Center`}</div>
                        <div className="flex items-center gap-2"><FiCalendar className="w-4 h-4 text-blue-600" />{new Date(ex.start_date).toLocaleDateString()} — {new Date(ex.end_date).toLocaleDateString()}</div>
                        {ex.website && <a href={ex.website} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1 text-sm"><FiExternalLink className="w-3 h-3" /> Official site • {new URL(ex.source_url || ex.website).hostname}</a>}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button asChild size="sm" className="flex-1"><a href={ex.website || ex.source_url} target="_blank">View Dates</a></Button>
                        <Button asChild variant="outline" size="sm" className="flex-1"><Link href={`/quote?exhibition=${encodeURIComponent(ex.slug)}&city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`}>Get Quote</Link></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Cross-link to builders in this city */}
          <div className="mt-12 p-6 bg-white border rounded-xl">
            <h3 className="font-semibold">Need a stand builder in {city}?</h3>
            <p className="text-sm text-gray-600 mt-1">Connect with verified builders who have built stands for these exhibitions.</p>
            <div className="mt-4 flex gap-2">
              <Button asChild><Link href={`/builders?country=${encodeURIComponent(country)}&city=${encodeURIComponent(city)}`}>Find builders in {city}</Link></Button>
              <Button asChild variant="outline"><Link href={`/quote?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`}>Request quote</Link></Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
