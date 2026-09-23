import { supabase, getSupabaseAdminClient } from '@/lib/supabase/client';
import { nextEligibleExhibitionStart } from '@/lib/utils/exhibitionDates';

function getClient() {
  // Prefer admin (service role) on server to bypass RLS; fallback to anon on client
  try {
    const admin = getSupabaseAdminClient();
    if (admin) return admin;
  } catch {}
  return supabase;
}

export async function getAllExhibitions() {
  const client = getClient();
  const { data, error } = await client
    .from('exhibitions')
    .select('*');
  
  if (error) throw error;
  return data;
}

export async function getExhibitionBySlug(slug: string) {
  const client = getClient();
  const { data, error } = await client
    .from('exhibitions')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getExhibitionById(id: string) {
  const client = getClient();
  const { data, error } = await client
    .from('exhibitions')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

// The `exhibitions` table's real columns are `country_name`/`city_name`/`start_date`
export async function getExhibitionsByCountry(country: string) {
  const client = getClient();
  const { data, error } = await client
    .from('exhibitions')
    .select('*')
    .ilike('country_name', country)
    .eq('active', true);

  if (error) throw error;
  return data;
}

// Only exhibitions that haven't started yet as of "now" — explicitly excludes ones that
// started today or earlier, not just ones that have fully ended, per how this is used
// in the quote form (a buyer picking from a list should never see a show that's already
// underway or over). Both country and city are required so quote dropdowns can never
// silently broaden a city request into country-wide results.
export async function getUpcomingExhibitionsByLocation(country: string, city: string, limit: number = 30) {
  const client = getClient();
  const query = client
    .from('exhibitions')
    .select('*')
    .ilike('country_name', country)
    .ilike('city_name', city)
    .eq('active', true)
    .eq('verified', true)
    .gte('start_date', nextEligibleExhibitionStart())
    .order('start_date', { ascending: true })
    .limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getUpcomingExhibitions(limit: number = 10) {
  const client = getClient();
  const { data, error } = await client
    .from('exhibitions')
    .select('*')
    .eq('active', true)
    .gte('start_date', nextEligibleExhibitionStart())
    .order('start_date', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getFeaturedExhibitions(limit: number = 6) {
  const client = getClient();
  const { data, error } = await client
    .from('exhibitions')
    .select('*')
    .eq('featured', true)
    .limit(limit);
  
  if (error) throw error;
  return data;
}

export async function createExhibition(exhibitionData: any) {
  const client = getClient();
  const { data, error } = await client
    .from('exhibitions')
    .insert([exhibitionData])
    .select();
  
  if (error) throw error;
  return data[0];
}

export async function updateExhibition(id: string, updates: any) {
  const client = getClient();
  const { data, error } = await client
    .from('exhibitions')
    .update(updates)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data[0];
}

export async function deleteExhibition(id: string) {
  const client = getClient();
  const { error } = await client
    .from('exhibitions')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
}
