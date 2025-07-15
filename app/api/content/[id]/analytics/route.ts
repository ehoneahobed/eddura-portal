import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Content from '@/models/Content';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';
    
    // Check if it's a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid content ID' },
        { status: 400 }
      );
    }
    
    // Get content
    const content = await Content.findById(id);
    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content not found' },
        { status: 404 }
      );
    }
    
    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    // Calculate previous period for comparison
    const periodDuration = now.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodDuration);
    
    // Mock analytics data (in a real implementation, you'd query analytics events)
    const currentViews = content.viewCount || Math.floor(Math.random() * 1000) + 100;
    const previousViews = Math.floor(currentViews * (0.8 + Math.random() * 0.4)); // 80-120% of current
    
    const currentEngagement = content.engagementRate || Math.random() * 0.3 + 0.1;
    const previousEngagement = currentEngagement * (0.8 + Math.random() * 0.4);
    
    const currentConversion = content.conversionRate || Math.random() * 0.05 + 0.01;
    const previousConversion = currentConversion * (0.8 + Math.random() * 0.4);
    
    const analyticsData = {
      views: currentViews,
      uniqueViews: Math.floor(currentViews * 0.8),
      engagementRate: currentEngagement,
      conversionRate: currentConversion,
      avgTimeOnPage: Math.floor(Math.random() * 300) + 60,
      bounceRate: Math.random() * 0.4 + 0.2,
      socialShares: Math.floor(Math.random() * 50) + 5,
      downloads: Math.floor(Math.random() * 20) + 2,
      period,
      change: {
        views: Math.round(((currentViews - previousViews) / previousViews) * 100),
        engagement: currentEngagement - previousEngagement,
        conversion: currentConversion - previousConversion
      }
    };
    
    return NextResponse.json({
      success: true,
      data: analyticsData
    });
    
  } catch (error) {
    console.error('Error fetching content analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
} 