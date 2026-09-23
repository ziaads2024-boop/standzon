/**
 * GET /api/exhibitions/calendar
 * Country + City wise exhibition calendar (public, reads from Supabase `exhibitions`)
 * 
 * Query params:
 *  country: string (e.g. "Germany") - required for filtered view, optional for global
 *  city: string (e.g. "Berlin") - optional, requires country
 *  year: number - optional filter (e.g. 2026)
 *  month: number - optional filter 1-12
 *  industry: string - optional
 *  verified: boolean - optional, defaults true (pass "false" to include pending rows)
 *  featured: boolean - optional
 *  upcoming: boolean - optional, defaults true (only events starting after today)
 *  limit: number - optional defaults 50, max 200
 *  offset: number - optional
 *  groupBy: "country" | "city" | "month" - optional grouping
 * 
 * Examples:
 *  /api/exhibitions/calendar?country=Germany&city=Berlin
 *  /api/exhibitions/calendar?country=United%20Arab%20Emirates
 *  /api/exhibitions/calendar?country=United%20Arab%20Emirates&city=Dubai&upcoming=true
 *  /api/exhibitions/calendar?groupBy=country
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GLOBAL_EXHIBITION_DATA } from '@/lib/data/globalCities';
import { nextEligibleExhibitionStart } from '@/lib/utils/exhibitionDates';

export const dynamic = 'force-dynamic';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  // Use service role on server to bypass RLS (calendar is public via API)
  // Falls back to anon key if service key not configured
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get('country');
  const city = searchParams.get('city');
  const year = searchParams.get('year');
  const month = searchParams.get('month');
  const industry = searchParams.get('industry');
  const verifiedParam = searchParams.get('verified');
  const verifiedOnly = verifiedParam === null ? true : verifiedParam !== 'false';
  const featured = searchParams.get('featured');
  const upcomingParam = searchParams.get('upcoming');
  const upcoming = upcomingParam === null ? true : upcomingParam === 'true';
  const groupBy = searchParams.get('groupBy');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const search = searchParams.get('q') || searchParams.get('search');

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    // Handle groupBy aggregations
    if (groupBy === 'country') {
      let query = supabase
        .from('exhibitions')
        .select('country_name, country_code, city_name')
        .eq('active', true);
      if (verifiedOnly) query = query.eq('verified', true);
      if (upcoming) query = query.gte('start_date', nextEligibleExhibitionStart());
      const { data, error } = await query;

      if (error) throw error;

      const grouped: Record<string, { country: string; code: string; count: number; cities: Record<string, number> }> = {};
      for (const row of data || []) {
        if (!grouped[row.country_name]) grouped[row.country_name] = { country: row.country_name, code: row.country_code, count: 0, cities: {} };
        grouped[row.country_name].count++;
        grouped[row.country_name].cities[row.city_name] = (grouped[row.country_name].cities[row.city_name] || 0) + 1;
      }

      const result = Object.values(grouped)
        .sort((a, b) => b.count - a.count)
        .map(g => ({
          country: g.country,
          country_code: g.code,
          totalExhibitions: g.count,
          cities: Object.entries(g.cities)
            .sort((a, b) => b[1] - a[1])
            .map(([city, count]) => ({ city, count })),
        }));

      return NextResponse.json({
        success: true,
        groupBy: 'country',
        totalCountries: result.length,
        totalExhibitions: data?.length || 0,
        data: result,
      });
    }

    if (groupBy === 'city' && country) {
      let query = supabase
        .from('exhibitions')
        .select('city_name, country_name')
        .eq('active', true)
        .ilike('country_name', country);
      if (verifiedOnly) query = query.eq('verified', true);
      if (upcoming) query = query.gte('start_date', nextEligibleExhibitionStart());
      const { data, error } = await query;

      if (error) throw error;
      const cityCounts: Record<string, number> = {};
      for (const row of data || []) cityCounts[row.city_name] = (cityCounts[row.city_name] || 0) + 1;

      // Also return all cities for this country (even those with 0 exhibitions) from countriesWithCities
      const allCitiesForCountry = country === 'United Arab Emirates'
        ? ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain', 'Al Ain']
        : GLOBAL_EXHIBITION_DATA.countries.find((candidate) => candidate.name === country)?.majorCities || [];
      const result = allCitiesForCountry.map((cityName: string) => ({
        city: cityName,
        count: cityCounts[cityName] || 0,
        hasExhibitions: (cityCounts[cityName] || 0) > 0,
      }));

      return NextResponse.json({
        success: true,
        groupBy: 'city',
        country,
        totalCities: result.length,
        citiesWithExhibitions: Object.keys(cityCounts).length,
        data: result.sort((a: any, b: any) => b.count - a.count),
      });
    }

    if (groupBy === 'month') {
      let query = supabase.from('exhibitions').select('start_date, month, year').eq('active', true);
      if (verifiedOnly) query = query.eq('verified', true);
      if (country) query = query.ilike('country_name', country);
      if (city) query = query.ilike('city_name', city);
      if (upcoming) {
        query = query.gte('start_date', nextEligibleExhibitionStart());
      }
      const { data, error } = await query;
      if (error) throw error;

      const monthCounts: Record<string, number> = {};
      for (const row of data || []) {
        const key = `${row.year}-${String(row.month).padStart(2, '0')}`;
        monthCounts[key] = (monthCounts[key] || 0) + 1;
      }

      return NextResponse.json({
        success: true,
        groupBy: 'month',
        data: Object.entries(monthCounts)
          .sort()
          .map(([ym, count]) => ({ yearMonth: ym, count })),
      });
    }

    // Default: list exhibitions
    let query = supabase.from('exhibitions').select('*', { count: 'exact' }).eq('active', true);

    if (country) query = query.ilike('country_name', country);
    if (city) query = query.ilike('city_name', city);
    if (year) query = query.eq('year', parseInt(year, 10));
    if (month) query = query.eq('month', parseInt(month, 10));
    if (industry) query = query.ilike('industry', `%${industry}%`);
    if (verifiedOnly) query = query.eq('verified', true);
    if (featured === 'true') query = query.eq('featured', true);
    if (search) query = query.or(`name.ilike.%${search}%,venue.ilike.%${search}%,industry.ilike.%${search}%`);
    if (upcoming) {
      query = query.gte('start_date', nextEligibleExhibitionStart());
    }

    query = query.order('start_date', { ascending: true }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    // Enrich with country/city metadata for UI
    const total = count || 0;

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      filters: {
        country: country || null,
        city: city || null,
        year: year ? parseInt(year, 10) : null,
        month: month ? parseInt(month, 10) : null,
        industry: industry || null,
        verified: verifiedOnly,
        upcoming,
      },
      // For calendar UI: also return available filters
      meta: {
        totalCountries: GLOBAL_EXHIBITION_DATA.countries.length,
        totalCities: GLOBAL_EXHIBITION_DATA.cities.length,
      },
    });
  } catch (error: any) {
    console.error('[calendar] error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
