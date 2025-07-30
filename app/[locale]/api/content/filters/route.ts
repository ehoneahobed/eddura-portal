import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Content from '@/models/Content';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get all categories and tags from published content
    const [categories, tags] = await Promise.all([
      Content.distinct('categories', { status: 'published' }),
      Content.distinct('tags', { status: 'published' })
    ]);
    
    // Filter out empty values and sort
    const cleanCategories = categories
      .filter(cat => cat && cat.trim())
      .sort();
    
    const cleanTags = tags
      .filter(tag => tag && tag.trim())
      .sort();
    
    return NextResponse.json({
      success: true,
      categories: cleanCategories,
      tags: cleanTags
    });
    
  } catch (error) {
    console.error('Error fetching filter data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch filter data' },
      { status: 500 }
    );
  }
}