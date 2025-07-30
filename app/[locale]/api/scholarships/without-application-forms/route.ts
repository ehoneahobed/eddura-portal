import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Scholarship from '@/models/Scholarship';
import ApplicationTemplate from '@/models/ApplicationTemplate';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const session = await auth();
    if (!session || !isAdmin(session.user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const search = searchParams.get('search') || '';
    const provider = searchParams.get('provider') || '';
    
    const skip = (page - 1) * limit;
    
    // Get all scholarship IDs that have application templates
    const scholarshipsWithTemplates = await ApplicationTemplate.distinct('scholarshipId');
    
    // Build filter object for scholarships without application forms
    const filter: any = {
      _id: { $nin: scholarshipsWithTemplates }
    };
    
    // Add search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { provider: { $regex: search, $options: 'i' } },
        { scholarshipDetails: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add provider filter
    if (provider && provider !== 'all') {
      filter.provider = { $regex: provider, $options: 'i' };
    }
    
    // Get total count for pagination
    const totalCount = await Scholarship.countDocuments(filter);
    
    // Get paginated scholarships
    const scholarships = await Scholarship.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      scholarships,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching scholarships without application forms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scholarships without application forms' },
      { status: 500 }
    );
  }
}