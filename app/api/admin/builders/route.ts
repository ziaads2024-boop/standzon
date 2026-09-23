export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getAllBuilders, getBuilderById, createBuilder, updateBuilder, deleteBuilder } from '@/lib/supabase/builders';

// GET /api/admin/builders - Get all builders
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset') || '0';

    console.log('API: Fetching all builders');
    const builders = await getAllBuilders();

    if (action === 'countries') {
      const byCountry = new Map<string, { count: number; ratingSum: number; ratingCount: number }>();
      for (const b of builders as any[]) {
        const country = b.headquarters_country;
        if (!country) continue;
        const entry = byCountry.get(country) || { count: 0, ratingSum: 0, ratingCount: 0 };
        entry.count += 1;
        if (typeof b.rating === 'number') {
          entry.ratingSum += b.rating;
          entry.ratingCount += 1;
        }
        byCountry.set(country, entry);
      }
      const data = Array.from(byCountry.entries()).map(([name, v]) => ({
        name,
        builderCount: v.count,
        averageRating: v.ratingCount > 0 ? v.ratingSum / v.ratingCount : 0,
      }));
      return NextResponse.json({ success: true, data });
    }

    // Apply pagination if requested
    let result = builders;
    if (limit) {
      const limitNum = parseInt(limit);
      const offsetNum = parseInt(offset);
      result = builders.slice(offsetNum, offsetNum + limitNum);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        builders: result,
        total: builders.length
      }
    });
  } catch (error) {
    console.error('API Error fetching builders:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch builders' 
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/builders - Create a new builder
export async function POST(request: Request) {
  try {
    const builderData = await request.json();
    console.log('API: Creating new builder', builderData);
    
    // Validate required fields
    if (!builderData.company_name || !builderData.primary_email) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Company name and primary email are required' 
        },
        { status: 400 }
      );
    }
    
    const newBuilder = await createBuilder(builderData);
    
    return NextResponse.json({
      success: true,
      data: newBuilder
    });
  } catch (error) {
    console.error('API Error creating builder:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create builder' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/builders/[id] - Update a builder
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Builder ID is required' 
        },
        { status: 400 }
      );
    }
    
    const updates = await request.json();
    console.log('API: Updating builder', id, updates);
    
    // Remove protected fields
    const { id: _, created_at, ...updateData } = updates;
    
    const updatedBuilder = await updateBuilder(id, updateData);
    
    return NextResponse.json({
      success: true,
      data: updatedBuilder
    });
  } catch (error) {
    console.error('API Error updating builder:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update builder' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/builders/[id] - Delete a builder
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Builder ID is required' 
        },
        { status: 400 }
      );
    }
    
    console.log('API: Deleting builder', id);
    await deleteBuilder(id);
    
    return NextResponse.json({
      success: true,
      message: 'Builder deleted successfully'
    });
  } catch (error) {
    console.error('API Error deleting builder:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete builder' 
      },
      { status: 500 }
    );
  }
}
