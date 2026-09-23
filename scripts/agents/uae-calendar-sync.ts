#!/usr/bin/env tsx
/**
 * UAE Deep Calendar Sync — All Emirates, This Year + Next
 * Focuses ONLY on United Arab Emirates (7 emirates + Al Ain)
 * Scrapes genuine sources: DWTC, ADNEC, Expo Centre Sharjah, tradefairdates UAE, EventsEye
 * Filters to 2026 and 2027 (this year + next)
 */

import * as dotenv from 'dotenv';
dotenv.config();
import { runCalendarAgent, prepareExhibitionRows } from '../../lib/agents/exhibitionCalendarAgent';
import { syncExhibitionsToSupabase } from '../../lib/agents/syncToSupabase';
import { createClient } from '@supabase/supabase-js';

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  console.log('=== UAE Deep Calendar — All Emirates (2026-2027) ===');
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE SYNC via service role'}`);
  console.log('Emirates: Dubai, Abu Dhabi, Sharjah, Ajman, Fujairah, Ras Al Khaimah, Umm Al Quwain, Al Ain');
  console.log('Years: 2026 (this year) + 2027 (next)');
  console.log('');

  const { exhibitions, report } = await runCalendarAgent({
    dryRun,
    deep: true,
    countries: ['United Arab Emirates'],
    yearFilter: [2026, 2027],
    politeDelayMs: 80,
    onProgress: (msg) => console.log(`  [uae] ${msg}`),
  });

  console.log('');
  console.log('=== UAE REPORT ===');
  console.log(`Exhibitions found: ${report.totalExhibitionsFound} (2026-2027 only)`);
  console.log(`By emirate:`);
  const byCity: Record<string, number> = {};
  for (const ex of exhibitions) byCity[ex.city_name] = (byCity[ex.city_name] || 0) + 1;
  for (const [city, count] of Object.entries(byCity).sort((a,b)=> b[1]-a[1])) {
    console.log(`  ${city}: ${count}`);
  }
  console.log(`Errors: ${report.errors.length}`);
  console.log(`Source stats:`, report.sourceStats);
  console.log('');

  if (!dryRun) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || '';
    const admin = url && key ? createClient(url, key) : null;
    if (admin) await prepareExhibitionRows(exhibitions, admin);

    const syncResult = await syncExhibitionsToSupabase(exhibitions, { dryRun: false });
    console.log(`Sync: ${syncResult.inserted} inserted, ${syncResult.updated} updated, ${syncResult.errors.length} errors`);
    if (syncResult.errors.length) console.log(syncResult.errors.slice(0,5));

    // Verification: query UAE exhibitions for 2026-2027 per emirate
    if (admin) {
      const { data } = await admin.from('exhibitions')
        .select('city_name, name, start_date')
        .eq('country_name', 'United Arab Emirates')
        .eq('active', true)
        .gte('start_date', '2026-01-01')
        .lte('start_date', '2027-12-31')
        .order('start_date', { ascending: true });
      console.log('');
      console.log(`DB verification: ${data?.length || 0} UAE exhibitions 2026-2027 in DB`);
      const perCity: Record<string, any[]> = {};
      for (const r of data || []) {
        if (!perCity[r.city_name]) perCity[r.city_name] = [];
        perCity[r.city_name].push(r);
      }
      for (const [city, list] of Object.entries(perCity)) {
        console.log(`  ${city} (${list.length}):`);
        for (const ex of list.slice(0,3)) console.log(`    - ${ex.name} | ${new Date(ex.start_date).toLocaleDateString()}`);
        if (list.length > 3) console.log(`    ... +${list.length-3} more`);
      }
    }
  }

  console.log('');
  console.log('Calendar: /exhibitions/calendar?country=United%20Arab%20Emirates');
  console.log('Per emirate: /exhibitions/calendar/united-arab-emirates/dubai etc.');
  console.log('API: /api/exhibitions/calendar?country=United%20Arab%20Emirates&year=2026');
  console.log('API: /api/exhibitions/calendar?country=United%20Arab%20Emirates&city=Dubai&year=2027');
}

main().catch(e=> { console.error(e); process.exit(1); });
