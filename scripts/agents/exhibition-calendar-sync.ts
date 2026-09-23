#!/usr/bin/env ts-node
/**
 * Exhibition Calendar Sub-Agent - Standalone Runner
 * 
 * Usage:
 *   npx ts-node scripts/agents/exhibition-calendar-sync.ts [--dry-run] [--limit=10] [--verbose]
 *   node --loader ts-node/esm scripts/agents/exhibition-calendar-sync.ts
 * 
 * Env required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY)
 * 
 * What it does:
 * 1. Loads the website's canonical 58 countries and 204 exhibition cities
 * 2. For each city, fetches famous exhibitions from genuine sources:
 *    - Official venue sites (Messe Frankfurt, DWTC, Fira Barcelona, etc.)
 *    - Professional aggregators for dated discovery rows
 *    - Official organizer pages for verified rows
 * 3. Normalizes to CalendarExhibition rows
 * 4. Upserts into Supabase `exhibitions` via service role key
 * 5. Emits report: country+city wise counts
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { runCalendarAgent, prepareExhibitionRows } from '../../lib/agents/exhibitionCalendarAgent';
import { syncExhibitionsToSupabase, ensureCountriesAndCities } from '../../lib/agents/syncToSupabase';
import { createClient } from '@supabase/supabase-js';

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose');
  const limitArg = args.find(a => a.startsWith('--limit='));
  const limitCities = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined;

  console.log('=== Standzon Exhibition Calendar Sub-Agent ===');
  console.log(`Mode: ${dryRun ? 'DRY RUN (no DB writes)' : 'LIVE SYNC (service role)'}`);
  if (limitCities) console.log(`Limit: ${limitCities} cities`);
  console.log(`Started: ${new Date().toISOString()}`);
  console.log('');

  // Step 0: Ensure countries/cities tables are populated
  if (!dryRun) {
    console.log('Step 0: Ensuring countries/cities in DB...');
    try {
      const res = await ensureCountriesAndCities();
      console.log(`  Countries inserted: ${res.countries}, Cities inserted: ${res.cities}`);
      if (res.errors.length) console.warn('  Errors:', res.errors.slice(0, 5));
    } catch (e: any) {
      console.warn('  ensureCountriesAndCities failed (non-fatal):', e.message);
    }
    console.log('');
  }

  // Step 1: Run agent to build calendar
  console.log('Step 1: Crawling trustworthy exhibition calendars...');
  const { exhibitions, report } = await runCalendarAgent({
    dryRun,
    limitCities,
    politeDelayMs: 120,
    onProgress: (msg) => console.log(`  [agent] ${msg}`),
  });

  console.log('');
  console.log('=== AGENT REPORT ===');
  console.log(`Countries: ${report.totalCountries}, Cities: ${report.totalCities}`);
  console.log(`Exhibitions found: ${report.totalExhibitionsFound}`);
  console.log(`Duration: ${report.durationMs}ms`);
  console.log(`Errors: ${report.errors.length}`);
  if (verbose) {
    console.log('By Country:', JSON.stringify(report.byCountry, null, 2));
    console.log('Source Stats:', report.sourceStats);
  } else {
    // Summary by top countries
    const top = Object.entries(report.byCountry)
      .sort((a, b) => b[1].exhibitions - a[1].exhibitions)
      .slice(0, 15);
    console.log('Top countries by exhibitions:');
    for (const [country, stats] of top) {
      console.log(`  ${country}: ${stats.exhibitions} exhibitions (${stats.cities} cities)`);
    }
  }
  console.log('');

  // Step 2: Prepare FKs
  if (!dryRun) {
    console.log('Step 2: Resolving city_id/country_id FKs...');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || '';
    const admin = url && key ? createClient(url, key) : null;
    await prepareExhibitionRows(exhibitions, admin);
    console.log(`  Prepared ${exhibitions.length} rows with FKs`);
    console.log('');
  }

  // Step 3: Sync to Supabase
  console.log(`Step 3: Syncing to Supabase via service role key ${dryRun ? '(dry-run)' : '(live)'}...`);
  const syncResult = await syncExhibitionsToSupabase(exhibitions, { dryRun });
  console.log(`  Total: ${syncResult.total}, Inserted: ${syncResult.inserted}, Updated: ${syncResult.updated}, Skipped: ${syncResult.skipped}`);
  if (syncResult.errors.length) {
    console.error(`  Sync errors: ${syncResult.errors.length}`);
    console.error(syncResult.errors.slice(0, 10));
  }
  console.log('');

  // Step 4: Verification query (country+city wise)
  if (!dryRun) {
    console.log('Step 4: Verification - country+city wise counts from DB...');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || '';
    if (url && key) {
      const admin = createClient(url, key);
      const { data, error } = await admin
        .from('exhibitions')
        .select('country_name, city_name')
        .eq('active', true);
      if (!error && data) {
        const counts: Record<string, Record<string, number>> = {};
        for (const row of data) {
          if (!counts[row.country_name]) counts[row.country_name] = {};
          counts[row.country_name][row.city_name] = (counts[row.country_name][row.city_name] || 0) + 1;
        }
        console.log('  DB verification (sample):');
        for (const [country, cities] of Object.entries(counts).slice(0, 10)) {
          console.log(`    ${country}:`);
          for (const [city, count] of Object.entries(cities).slice(0, 5)) {
            console.log(`      - ${city}: ${count} exhibitions`);
          }
        }
        console.log(`  Total in DB: ${data.length} active exhibitions`);
      } else {
        console.warn('  Verification query failed:', error?.message);
      }
    }
  }

  console.log('');
  console.log('=== DONE ===');
  console.log(`Finished: ${new Date().toISOString()}`);
  console.log(`Calendar is now queryable via /api/exhibitions/calendar?country=Germany&city=Berlin`);
  console.log(`And UI at /exhibitions/calendar`);
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
