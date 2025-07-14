import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import LibraryDocument from '@/models/LibraryDocument';

// GET /api/library/documents - Browse published library documents
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const type = searchParams.get('type');
    const targetAudience = searchParams.get('targetAudience');
    const fieldOfStudy = searchParams.get('fieldOfStudy');
    const tags = searchParams.get('tags');
    const minRating = searchParams.get('minRating');
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    // Build query - only published documents
    const query: any = { 
      status: 'published',
      reviewStatus: 'approved'
    };
    
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (type) query.type = type;
    if (targetAudience) query.targetAudience = targetAudience;
    if (fieldOfStudy) query.fieldOfStudy = fieldOfStudy;
    if (tags) query.tags = { $in: tags.split(',') };
    if (minRating) query.averageRating = { $gte: parseFloat(minRating) };
    
    // Text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    // Build sort
    let sort: any = {};
    switch (sortBy) {
      case 'rating':
        sort = { averageRating: -1, ratingCount: -1 };
        break;
      case 'views':
        sort = { viewCount: -1 };
        break;
      case 'clones':
        sort = { cloneCount: -1 };
        break;
      case 'date':
        sort = { publishedAt: -1 };
        break;
      default:
        sort = { averageRating: -1, viewCount: -1 };
    }

    const [documents, total] = await Promise.all([
      LibraryDocument.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-reviewNotes -reviewedBy -reviewedAt') // Exclude admin-only fields
        .lean(),
      LibraryDocument.countDocuments(query)
    ]);

    // Increment view count for each document (async, don't wait)
    documents.forEach(doc => {
      LibraryDocument.findByIdAndUpdate(doc._id, { $inc: { viewCount: 1 } }).catch(console.error);
    });

    return NextResponse.json({
      documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching library documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 