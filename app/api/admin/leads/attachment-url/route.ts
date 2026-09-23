import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';

// Mints a short-lived signed URL for a lead attachment stored in the private
// `lead-attachments` bucket. `path` is what's stored in leads.attachments, in the
// form "lead-attachments/<file path>" (see /api/leads/upload-attachment).
export async function GET(request: NextRequest) {
  try {
    const stored = request.nextUrl.searchParams.get('path') || '';
    if (!stored) {
      return NextResponse.json({ success: false, error: 'path is required' }, { status: 400 });
    }

    const supabase = getServerSupabase();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Storage not configured' }, { status: 500 });
    }

    const [bucket, ...rest] = stored.split('/');
    const filePath = rest.join('/');
    if (bucket !== 'lead-attachments' || !filePath) {
      return NextResponse.json({ success: false, error: 'Invalid attachment path' }, { status: 400 });
    }

    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(filePath, 300);
    if (error || !data?.signedUrl) {
      return NextResponse.json({ success: false, error: error?.message || 'Could not sign URL' }, { status: 500 });
    }

    return NextResponse.json({ success: true, url: data.signedUrl });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed to sign URL' }, { status: 500 });
  }
}
