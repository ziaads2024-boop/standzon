#!/usr/bin/env tsx

import * as dotenv from 'dotenv';
dotenv.config();

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import type { CalendarExhibition } from '../../lib/agents/exhibitionCalendarAgent';
import { prepareExhibitionRows } from '../../lib/agents/exhibitionCalendarAgent';
import { syncExhibitionsToSupabase } from '../../lib/agents/syncToSupabase';

async function ensureBatchCities(exhibitions: CalendarExhibition[], admin: any) {
  const countryCodes = [...new Set(exhibitions.map((exhibition) => exhibition.country_code))];
  const { data: countries, error: countryError } = await admin
    .from('countries')
    .select('id,country_name,country_code')
    .in('country_code', countryCodes);
  if (countryError) throw countryError;

  const countryByCode = new Map<string, { id: string; country_name: string; country_code: string }>(
    (countries || []).map((country: any) => [country.country_code, country]),
  );
  const { data: cities, error: cityError } = await admin
    .from('cities')
    .select('city_name,country_code')
    .in('country_code', countryCodes);
  if (cityError) throw cityError;

  const existing = new Set((cities || []).map((city: any) => `${city.country_code}|${city.city_name.toLowerCase()}`));
  const required = new Map<string, CalendarExhibition>();
  for (const exhibition of exhibitions) {
    const key = `${exhibition.country_code}|${exhibition.city_name.toLowerCase()}`;
    if (!existing.has(key)) required.set(key, exhibition);
  }
  if (!required.size) return 0;

  const rows = [...required.values()].map((exhibition) => {
    const country = countryByCode.get(exhibition.country_code);
    if (!country) throw new Error(`Country ${exhibition.country_code} is missing from Supabase.`);
    return {
      city_name: exhibition.city_name,
      city_slug: exhibition.city_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      country_id: country.id,
      country_name: country.country_name,
      country_code: country.country_code,
      active: true,
    };
  });
  const { error } = await admin.from('cities').insert(rows);
  if (error) throw error;
  return rows.length;
}

async function main() {
  const args = process.argv.slice(2);
  const fileArg = args.find((arg) => arg.startsWith('--file='));
  const apply = args.includes('--apply');
  if (!fileArg) throw new Error('Pass a staged JSON batch with --file=<path>.');

  const filePath = resolve(process.cwd(), fileArg.slice('--file='.length));
  const parsed = JSON.parse(await readFile(filePath, 'utf8'));
  if (!Array.isArray(parsed)) throw new Error('The import file must contain a JSON array.');
  const exhibitions = parsed as CalendarExhibition[];

  const validation = await syncExhibitionsToSupabase(exhibitions, { dryRun: true });
  console.log(`Validated: ${validation.inserted}/${validation.total}; rejected: ${validation.skipped}`);
  if (!validation.success) {
    console.error(validation.errors);
    process.exitCode = 1;
    return;
  }
  if (!apply) {
    console.log('Validation-only mode. Re-run with --apply to upsert through the service role.');
    return;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) throw new Error('Missing Supabase URL or service-role key.');

  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const insertedCities = await ensureBatchCities(exhibitions, admin);
  console.log(`Inserted missing canonical cities: ${insertedCities}`);
  await prepareExhibitionRows(exhibitions, admin);
  const result = await syncExhibitionsToSupabase(exhibitions);
  console.log(JSON.stringify(result, null, 2));
  if (!result.success) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
