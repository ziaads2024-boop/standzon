/**
 * POST /api/admin/exhibitions/sync
 * Dedicated sub-agent trigger: crawls genuine exhibition calendars and upserts to DB via service role key.
 * 
 * Auth: Requires Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY> or admin session
 *        For cron, set header x-cron-secret = process.env.CRON_SECRET
 * 
 * Body (JSON, optional):
 *  { dryRun?: boolean, limitCities?: number }
 * 
 * Returns: AgentRunReport + SyncResult + byCountry/city breakdown
 */

import { NextRequest, NextResponse } from 'next/server';
import { runCalendarAgent, prepareExhibitionRows } from '@/lib/agents/exhibitionCalendarAgent';
import { syncExhibitionsToSupabase } from '@/lib/agents/syncToSupabase';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // allow up to 5 min for full crawl

function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization') || '';
  const cronSecret = req.headers.get('x-cron-secret') || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || '';
  const expectedCron = process.env.CRON_SECRET || '';

  if (serviceKey && auth === `Bearer ${serviceKey}`) return true;
  if (expectedCron && (auth === `Bearer ${expectedCron}` || cronSecret === expectedCron)) return true;

  return false;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized - provide service role key or cron secret' }, { status: 401 });
  }

  let body: any = {};
  try {
    body = await req.json().catch(() => ({}));
  } catch {}

  const dryRun = body.dryRun ?? false;
  const limitCities = body.limitCities ? Number(body.limitCities) : undefined;

  const startedAt = new Date().toISOString();

  try {
    const { exhibitions, report } = await runCalendarAgent({
      dryRun,
      limitCities,
      politeDelayMs: 80,
      onProgress: (msg) => console.log(`[sync-agent] ${msg}`),
    });

    // Resolve FKs
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || '';
    const admin = url && key ? createClient(url, key) : null;
    if (admin) {
      await prepareExhibitionRows(exhibitions, admin);
    }

    const syncResult = await syncExhibitionsToSupabase(exhibitions, { dryRun });

    return NextResponse.json({
      success: true,
      dryRun,
      startedAt,
      finishedAt: new Date().toISOString(),
      agentReport: report,
      syncResult,
      // Convenience: country+city wise summary ready for UI
      calendar: exhibitions.map(e => ({
        name: e.name,
        slug: e.slug,
        city_name: e.city_name,
        country_name: e.country_name,
        country_code: e.country_code,
        venue: e.venue,
        start_date: e.start_date,
        end_date: e.end_date,
        industry: e.industry,
        website: e.website,
        source_url: e.source_url,
        verified: e.verified,
        featured: e.featured,
      })),
    });
  } catch (error: any) {
    console.error('[admin/sync] Agent failed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Agent failed', startedAt },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // GET supports:
  // - Vercel Cron: triggers full sync when x-cron-secret matches or vercel cron user-agent
  // - Preview: ?preview=true (dry run)
  const { searchParams } = new URL(req.url);
  const preview = searchParams.get('preview') === 'true';
  const isCron = req.headers.get('x-vercel-cron') === '1' || req.headers.get('user-agent')?.includes('vercel-cron');
  const hasCronCredential = !!req.headers.get('authorization') || !!req.headers.get('x-cron-secret');

  // Vercel sends `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is configured.
  // Origin-looking headers are not sufficient by themselves because clients can spoof them.
  if (isCron || hasCronCredential) {
    if (!isAuthorized(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized cron' }, { status: 401 });
    }
    // Cron-triggered live sync
    try {
      const { exhibitions, report } = await runCalendarAgent({
        dryRun: false,
        politeDelayMs: 80,
        onProgress: (msg) => console.log(`[cron-sync] ${msg}`),
      });
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || '';
      const admin = url && key ? createClient(url, key) : null;
      if (admin) await prepareExhibitionRows(exhibitions, admin);
      const syncResult = await syncExhibitionsToSupabase(exhibitions, { dryRun: false });
      return NextResponse.json({ success: true, cron: true, agentReport: report, syncResult });
    } catch (e: any) {
      console.error('[cron-sync] failed', e);
      return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
  }

  if (!preview) {
    return NextResponse.json({
      success: true,
      message: 'POST to trigger full sync. Use Authorization: Bearer <service_role_key> or x-cron-secret header. GET with Vercel Cron header triggers live sync automatically.',
      usage: {
        POST: '/api/admin/exhibitions/sync',
        headers: ['Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>', 'x-cron-secret: <CRON_SECRET> (if configured)'],
        body: { dryRun: false, limitCities: 10 },
        preview: '/api/admin/exhibitions/sync?preview=true (dry run 5 cities, no auth in dev)',
        cron: 'Vercel Cron calls GET weekly (Sundays 2am UTC) - auto live sync',
      },
      trustworthySources: [
        '10times.com (UFI member)',
        'tradefairdates.com (m+a ExpoDataBase, UFI)',
        'expodatabase.com',
        'eventseye.com',
        'auma.de (German Trade Fair Industry)',
        'Official venue sites: Messe Frankfurt/München/Berlin, DWTC, Fira Barcelona, Javits, etc.',
      ],
    });
  }

  // Preview: dry run 5 cities
  try {
    const { exhibitions, report } = await runCalendarAgent({
      dryRun: true,
      limitCities: 5,
      politeDelayMs: 0,
    });
    return NextResponse.json({
      success: true,
      preview: true,
      exhibitions: exhibitions.slice(0, 10),
      report,
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
