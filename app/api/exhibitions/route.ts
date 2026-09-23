import { NextRequest, NextResponse } from 'next/server';
import * as exhibitionService from '@/lib/supabase/exhibitions';

function canMutate(request: NextRequest): boolean {
  const authorization = request.headers.get('authorization') || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || '';
  return !!serviceKey && authorization === `Bearer ${serviceKey}`;
}

function unauthorizedMutation() {
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');
    const country = searchParams.get('country');
    const city = searchParams.get('cityName') || searchParams.get('city');
    const upcoming = searchParams.get('upcoming');
    const featured = searchParams.get('featured');

    if (slug) {
      const exhibition = await exhibitionService.getExhibitionBySlug(slug);
      return NextResponse.json({ success: true, data: exhibition });
    } else if (id) {
      const exhibition = await exhibitionService.getExhibitionById(id);
      return NextResponse.json({ success: true, data: exhibition });
    } else if (country && city) {
      // Always future-only and, when a city is given, scoped to that city — a buyer
      // picking an exhibition should never be offered one that's already started, or
      // one happening in a different city than the one they're actually asking about.
      const exhibitions = await exhibitionService.getUpcomingExhibitionsByLocation(country, city);
      return NextResponse.json({ success: true, data: exhibitions });
    } else if (country) {
      return NextResponse.json(
        { success: false, error: 'City is required when requesting location-specific exhibitions.' },
        { status: 400 }
      );
    } else if (upcoming === 'true') {
      const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
      const exhibitions = await exhibitionService.getUpcomingExhibitions(limit);
      return NextResponse.json({ success: true, data: exhibitions });
    } else if (featured === 'true') {
      const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 6;
      const exhibitions = await exhibitionService.getFeaturedExhibitions(limit);
      return NextResponse.json({ success: true, data: exhibitions });
    } else {
      const exhibitions = await exhibitionService.getAllExhibitions();
      return NextResponse.json({ success: true, data: exhibitions });
    }
  } catch (error: any) {
    console.error('Error fetching exhibitions:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch exhibitions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!canMutate(request)) return unauthorizedMutation();
  try {
    const body = await request.json();
    const exhibition = await exhibitionService.createExhibition(body);
    
    return NextResponse.json({ success: true, data: exhibition }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating exhibition:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create exhibition' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!canMutate(request)) return unauthorizedMutation();
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Exhibition ID is required' },
        { status: 400 }
      );
    }
    
    const exhibition = await exhibitionService.updateExhibition(id, updates);
    return NextResponse.json({ success: true, data: exhibition });
  } catch (error: any) {
    console.error('Error updating exhibition:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update exhibition' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!canMutate(request)) return unauthorizedMutation();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Exhibition ID is required' },
        { status: 400 }
      );
    }
    
    await exhibitionService.deleteExhibition(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting exhibition:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete exhibition' },
      { status: 500 }
    );
  }
}
