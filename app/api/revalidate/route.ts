import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// Add GET endpoint for direct access
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path');
    
    if (path) {
      // Revalidate specific path
      revalidatePath(path);
      return NextResponse.json({ 
        success: true, 
        message: `Cache cleared successfully for path: ${path}` 
      });
    }
    
    // Revalidate all country pages without city sections
    // (updated to the canonical full-name slugs — the old 2-letter-code pages
    // these used to point at were retired in favor of 301s, see next.config.js)
    const countriesWithoutCities = ['taiwan', 'hong-kong', 'new-zealand', 'vietnam', 'indonesia', 'philippines', 'india', 'australia', 'spain', 'switzerland', 'austria', 'sweden', 'norway', 'denmark', 'finland'];
    for (const country of countriesWithoutCities) {
      revalidatePath(`/exhibition-stands/${country}`);
    }

    // Revalidate new city pages
    const newCityPages = [
      '/exhibition-stands/japan/chiba',
      '/exhibition-stands/belgium/kortrijk',
      '/exhibition-stands/thailand/khon-kaen',
      '/exhibition-stands/france/strasbourg',
      '/exhibition-stands/netherlands/maastricht',
      '/exhibition-stands/netherlands/rotterdam',
      '/exhibition-stands/netherlands/vijfhuizen'
    ];
    for (const cityPage of newCityPages) {
      revalidatePath(cityPage);
    }
    
    // Also revalidate main pages
    revalidatePath('/exhibition-stands');
    revalidatePath('/');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cache cleared successfully for all country and city pages.' 
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      { success: false, message: `Failed to clear cache: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const paths: string[] = Array.isArray(body?.paths)
      ? body.paths
      : typeof body?.path === 'string'
        ? [body.path]
        : [];

    if (!paths.length) {
      // If no paths specified, revalidate Italy cities data by default
      revalidatePath('/exhibition-stands/italy');
      revalidatePath('/admin');
      revalidatePath('/');
      return NextResponse.json({ 
        success: true, 
        message: 'Italy cities data cache cleared successfully.' 
      });
    }

    for (const p of paths) {
      try {
        revalidatePath(p);
      } catch {}
    }

    return NextResponse.json({ success: true, revalidated: paths });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Revalidation failed' }, { status: 500 });
  }
}


