import { createClient } from '@supabase/supabase-js';
import { nextEligibleExhibitionStart } from '@/lib/utils/exhibitionDates';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Server-side fetch of the calendar view (optionally filtered), for SSR/first paint. */
export async function getDefaultExhibitionCalendar(filters?: { country?: string; city?: string; year?: string }) {
  const supabase = getSupabase();
  if (!supabase) return { exhibitions: [] as any[], total: 0, groupedCountries: [] as any[] };

  const since = nextEligibleExhibitionStart();

  let listQuery = supabase
    .from('exhibitions')
    .select('*', { count: 'exact' })
    .eq('active', true)
    .eq('verified', true)
    .gte('start_date', since);
  if (filters?.country) listQuery = listQuery.ilike('country_name', filters.country);
  if (filters?.city) listQuery = listQuery.ilike('city_name', filters.city);
  if (filters?.year) listQuery = listQuery.eq('year', parseInt(filters.year, 10));

  const [listRes, groupRes] = await Promise.all([
    listQuery
      .order('start_date', { ascending: true })
      .range(0, 99),
    supabase
      .from('exhibitions')
      .select('country_name, country_code, city_name')
      .eq('active', true)
      .eq('verified', true)
      .gte('start_date', since),
  ]);

  const exhibitions = listRes.data || [];
  const total = listRes.count || exhibitions.length;

  const grouped: Record<string, { country: string; code: string; count: number; cities: Record<string, number> }> = {};
  for (const row of groupRes.data || []) {
    if (!grouped[row.country_name]) grouped[row.country_name] = { country: row.country_name, code: row.country_code, count: 0, cities: {} };
    grouped[row.country_name].count++;
    grouped[row.country_name].cities[row.city_name] = (grouped[row.country_name].cities[row.city_name] || 0) + 1;
  }
  const groupedCountries = Object.values(grouped)
    .sort((a, b) => b.count - a.count)
    .map(g => ({
      country: g.country,
      country_code: g.code,
      totalExhibitions: g.count,
      cities: Object.entries(g.cities).sort((a, b) => b[1] - a[1]).map(([city, count]) => ({ city, count })),
    }));

  return { exhibitions, total, groupedCountries };
}
