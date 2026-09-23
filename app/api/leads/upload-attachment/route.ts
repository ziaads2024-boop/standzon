import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';

// Design files attached to a quote request. Stored in the private `lead-attachments`
// Supabase Storage bucket (not local disk — the previous /api/upload wrote to
// public/uploads/*, which doesn't persist on Vercel's serverless filesystem, so every
// "attached" file was silently lost before it ever reached an admin). Returns the
// storage PATH, not a public URL — the bucket is private, so admin/builder views must
// fetch a short-lived signed URL (see /api/admin/leads/attachment-url) to view it.

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/zip', 'application/x-zip-compressed'];
const MAX_SIZE = 10 * 1024 * 1024;
const BUCKET = 'lead-attachments';

export async function POST(request: NextRequest) {
  try {
    const supabase = getServerSupabase();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Storage not configured' }, { status: 500 });
    }

    const formData = await request.formData().catch(() => null);
    const file = formData?.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: `Unsupported file type: ${file.type}` }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: 'File too large (10MB max)' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split('.').pop() || 'bin';
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
    const path = `${new Date().toISOString().slice(0, 10)}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName || `file.${ext}`}`;

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

    if (uploadError) {
      return NextResponse.json({ success: false, error: `Upload failed: ${uploadError.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: { path: `${BUCKET}/${path}`, originalName: file.name, size: file.size, type: file.type },
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Upload failed' }, { status: 500 });
  }
}
