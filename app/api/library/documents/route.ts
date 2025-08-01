import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import LibraryDocument from '@/models/LibraryDocument';
import DocumentClone from '@/models/DocumentClone';
import DocumentRating from '@/models/DocumentRating';
import DocumentView from '@/models/DocumentView';

// GET /api/library/documents - Browse published library documents
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    // Temporarily allow access without authentication for debugging
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    // }

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

    // Build query - temporarily show all documents to debug the issue
    const query: any = { 
      // status: 'published',
      // reviewStatus: 'approved'
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

    // Get user's cloned documents to check clone status
    const userClonedDocuments = await DocumentClone.find(
      { userId: session.user.id },
      { originalDocumentId: 1, createdAt: 1 }
    ).lean();

    const clonedDocumentIds = new Set(
      userClonedDocuments.map(doc => doc.originalDocumentId.toString())
    );

    // Calculate user statistics
    const totalCloned = userClonedDocuments.length;
    const recentlyCloned = userClonedDocuments.filter(doc => {
      const clonedDate = new Date(doc.createdAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return clonedDate > weekAgo;
    }).length;

    // Get user's favorite category
    const clonedDocumentsWithDetails = await DocumentClone.find(
      { userId: session.user.id }
    ).populate('originalDocumentId', 'category').lean();

    const categoryCounts = clonedDocumentsWithDetails.reduce((acc, doc) => {
      const category = (doc.originalDocumentId as any)?.category;
      if (category) {
        acc[category] = (acc[category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const favoriteCategory = Object.keys(categoryCounts).length > 0 
      ? Object.entries(categoryCounts).sort(([,a], [,b]) => b - a)[0][0]
      : '';

    // Get user's rated documents count
    const totalRated = await DocumentRating.countDocuments({ userId: session.user.id });

    // Add clone status to each document
    const documentsWithCloneStatus = documents.map(doc => ({
      ...doc,
      isCloned: clonedDocumentIds.has(doc._id.toString())
    }));

    // Track views and increment view count for each document (async, don't wait)
    documents.forEach(doc => {
      Promise.all([
        LibraryDocument.findByIdAndUpdate(doc._id, { $inc: { viewCount: 1 } }),
        DocumentView.create({
          documentId: doc._id,
          userId: session.user.type === 'user' ? session.user.id : undefined,
          userType: session.user.type === 'admin' ? 'admin' : session.user.type === 'user' ? 'user' : 'anonymous',
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
          userAgent: request.headers.get('user-agent') || undefined,
          referrer: request.headers.get('referer') || undefined,
        })
      ]).catch(console.error);
    });

    return NextResponse.json({
      documents: documentsWithCloneStatus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      userStats: {
        totalCloned,
        recentlyCloned,
        favoriteCategory,
        totalRated
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