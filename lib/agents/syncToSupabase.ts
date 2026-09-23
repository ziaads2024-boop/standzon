/**
 * Supabase Sync via Service Role Key
 * This module uses the service role key to bypass RLS and upsert exhibitions.
 * NEVER expose service role key to client.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CalendarExhibition } from './exhibitionCalendarAgent';
import { nextEligibleExhibitionStart } from '@/lib/utils/exhibitionDates';

function getAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  // Prefer non-public var if available; fall back to public service role key (as configured in .env)
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
    '';

  if (!url || !serviceKey) {
    console.error('[syncToSupabase] Missing Supabase URL or service role key');
    return null;
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export interface SyncResult {
  success: boolean;
  inserted: number;
  updated: number;
  skipped: number;
  errors: Array<{ slug: string; error: string }>;
  total: number;
}

function validateExhibitionForSync(exhibition: CalendarExhibition): string | null {
  if (!exhibition.name?.trim() || !exhibition.city_name?.trim() || !exhibition.country_name?.trim()) {
    return 'Missing name, city, or country';
  }
  if (!/^[A-Z]{2}$/.test(exhibition.country_code || '')) return 'Invalid country code';

  const start = new Date(exhibition.start_date);
  const end = new Date(exhibition.end_date);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 'Invalid date range';
  if (start < new Date(nextEligibleExhibitionStart())) return 'Start date is today or in the past';

  try {
    const source = new URL(exhibition.source_url);
    if (source.protocol !== 'https:') return 'Source URL must use HTTPS';
  } catch {
    return 'Missing or invalid source URL';
  }
  return null;
}

export async function syncExhibitionsToSupabase(
  exhibitions: CalendarExhibition[],
  opts: { dryRun?: boolean; upsert?: boolean } = {}
): Promise<SyncResult> {
  const dryRun = opts.dryRun ?? false;
  const validationErrors = exhibitions
    .map((exhibition) => ({ exhibition, error: validateExhibitionForSync(exhibition) }))
    .filter((result) => result.error !== null);
  const eligibleExhibitions = exhibitions.filter((exhibition) => !validateExhibitionForSync(exhibition));
  const admin = getAdminClient();

  if (dryRun) {
    console.log(`[dryRun] Would sync ${eligibleExhibitions.length} validated exhibitions to Supabase`);
    return {
      success: validationErrors.length === 0,
      inserted: eligibleExhibitions.length,
      updated: 0,
      skipped: validationErrors.length,
      errors: validationErrors.map(({ exhibition, error }) => ({ slug: exhibition.slug, error: error as string })),
      total: exhibitions.length,
    };
  }

  if (!admin) {
    return {
      success: false,
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: [{ slug: 'init', error: 'Supabase admin client not configured - missing URL/service role key' }],
      total: exhibitions.length,
    };
  }

  let inserted = 0;
  let updated = 0;
  let skipped = validationErrors.length;
  const errors: Array<{ slug: string; error: string }> = validationErrors
    .map(({ exhibition, error }) => ({ slug: exhibition.slug, error: error as string }));

  // Process in batches of 50 to avoid payload limits
  const batches: CalendarExhibition[][] = [];
  for (let i = 0; i < eligibleExhibitions.length; i += 50) batches.push(eligibleExhibitions.slice(i, i + 50));

  for (const batch of batches) {
    // Use upsert on slug unique constraint
    const payload = batch.map(ex => ({
      name: ex.name,
      slug: ex.slug,
      description: ex.description,
      city_name: ex.city_name,
      country_name: ex.country_name,
      country_code: ex.country_code,
      venue: ex.venue,
      venue_address: ex.venue_address,
      start_date: ex.start_date,
      end_date: ex.end_date,
      year: ex.year,
      month: ex.month,
      frequency: ex.frequency,
      industry: ex.industry,
      category: ex.category,
      expected_attendees: ex.expected_attendees,
      expected_exhibitors: ex.expected_exhibitors,
      website: ex.website,
      organizer_name: ex.organizer_name,
      organizer_email: ex.organizer_email,
      organizer_phone: ex.organizer_phone,
      active: ex.active,
      featured: ex.featured,
      verified: ex.verified,
      tags: ex.tags,
      source_url: ex.source_url,
      city_id: ex.city_id || null,
      country_id: ex.country_id || null,
      updated_at: new Date().toISOString(),
    }));

    // First, check which slugs already exist to count inserted vs updated
    const slugs = payload.map(p => p.slug);
    const { data: existing } = await admin.from('exhibitions').select('slug').in('slug', slugs);
    const existingSet = new Set((existing || []).map((r: any) => r.slug));

    const { error } = await admin
      .from('exhibitions')
      .upsert(payload, { onConflict: 'slug', ignoreDuplicates: false });

    if (error) {
      console.error('[sync] Batch upsert error:', error);
      for (const p of payload) {
        errors.push({ slug: p.slug, error: error.message });
      }
      skipped += payload.length;
    } else {
      for (const p of payload) {
        if (existingSet.has(p.slug)) updated++;
        else inserted++;
      }
      console.log(`[sync] Batch ok: ${payload.length} upserted (${[...existingSet].length} updated, ${payload.length - existingSet.size} inserted)`);
    }
  }

  return {
    success: errors.length === 0,
    inserted,
    updated,
    skipped,
    errors,
    total: exhibitions.length,
  };
}

// Also sync countries/cities from lib/data/countriesWithCities if missing
// Batched for performance - inserts in bulk of 100
export async function ensureCountriesAndCities(): Promise<{ countries: number; cities: number; errors: string[] }> {
  const admin = getAdminClient();
  if (!admin) return { countries: 0, cities: 0, errors: ['Admin client not configured'] };

  const { countriesWithCities } = await import('@/lib/data/countriesWithCities');
  const { getCountryCode } = await import('./exhibitionCalendarAgent');
  const errors: string[] = [];

  // Fetch existing
  const { data: existingCountries } = await admin.from('countries').select('country_name, country_code');
  const existingCountrySet = new Set((existingCountries || []).map((c: any) => c.country_name.toLowerCase()));

  let insertedCountries = 0;
  let insertedCities = 0;

  // Collect missing countries for batch insert
  const missingCountries: any[] = [];
  for (const [countryName] of Object.entries(countriesWithCities)) {
    if (!existingCountrySet.has(countryName.toLowerCase())) {
      const realCode = getCountryCode(countryName);
      const slug = countryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      missingCountries.push({
        country_name: countryName,
        country_code: realCode !== 'XX' ? realCode : countryName.slice(0, 2).toUpperCase(),
        country_slug: slug,
        continent: 'Unknown',
        active: true,
      });
    }
  }

  if (missingCountries.length > 0) {
    // Batch insert 50 at a time
    for (let i = 0; i < missingCountries.length; i += 50) {
      const batch = missingCountries.slice(i, i + 50);
      const { error, count } = await admin.from('countries').insert(batch);
      if (error) {
        // Fallback: try one-by-one to identify failing rows
        for (const row of batch) {
          const { error: e2 } = await admin.from('countries').insert(row);
          if (e2) errors.push(`Country ${row.country_name}: ${e2.message}`);
          else insertedCountries++;
        }
      } else {
        insertedCountries += batch.length;
      }
    }
    console.log(`[ensure] Inserted ${insertedCountries} missing countries (batched)`);
  }

  // Refresh country map for city FKs
  const { data: allCountries } = await admin.from('countries').select('id, country_name, country_code');
  const countryMap = new Map<string, string>();
  for (const c of allCountries || []) countryMap.set(c.country_name.toLowerCase(), c.id);

  const { data: existingCities } = await admin.from('cities').select('city_name, country_code');
  const existingCitySet = new Set(
    (existingCities || []).map((c: any) => `${c.city_name.toLowerCase()}|${c.country_code.toLowerCase()}`)
  );

  const missingCities: any[] = [];
  for (const [countryName, cities] of Object.entries(countriesWithCities)) {
    const countryId = countryMap.get(countryName.toLowerCase());
    if (!countryId) continue;
    const countryCode = getCountryCode(countryName);
    for (const city of cities as string[]) {
      const key = `${city.toLowerCase()}|${countryCode.toLowerCase()}`;
      if (!existingCitySet.has(key)) {
        const citySlug = city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        missingCities.push({
          city_name: city,
          city_slug: citySlug,
          country_id: countryId,
          country_name: countryName,
          country_code: countryCode,
          active: true,
        });
      }
    }
  }

  if (missingCities.length > 0) {
    for (let i = 0; i < missingCities.length; i += 100) {
      const batch = missingCities.slice(i, i + 100);
      const { error } = await admin.from('cities').insert(batch);
      if (error) {
        console.warn(`[ensure] Batch cities insert failed, falling back to individual: ${error.message}`);
        for (const row of batch) {
          const { error: e2 } = await admin.from('cities').insert(row);
          if (e2) errors.push(`City ${row.city_name}, ${row.country_name}: ${e2.message}`);
          else insertedCities++;
        }
      } else {
        insertedCities += batch.length;
      }
    }
    console.log(`[ensure] Inserted ${insertedCities} missing cities (batched)`);
  }

  return { countries: insertedCountries, cities: insertedCities, errors };
}
