import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import LibraryDocument from '@/models/LibraryDocument';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const isTemplate = searchParams.get('isTemplate');
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    if (isTemplate !== null) {
      query.isTemplate = isTemplate === 'true';
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get documents with populated creator info
    const documents = await LibraryDocument.find(query)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await LibraryDocument.countDocuments(query);
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      documents: documents.map(doc => ({
        _id: (doc._id as any).toString(),
        title: doc.title,
        type: doc.type,
        description: doc.description,
        category: doc.category,
        subcategory: doc.subcategory,
        status: doc.status,
        isTemplate: doc.isTemplate || false,
        allowCloning: doc.allowCloning !== false,
        viewCount: doc.viewCount,
        cloneCount: doc.cloneCount,
        averageRating: doc.averageRating,
        ratingCount: doc.ratingCount,
        tags: doc.tags,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        createdBy: doc.createdBy
      })),
      pagination: {
        page,
        limit,
        total,
        pages
      }
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
} 