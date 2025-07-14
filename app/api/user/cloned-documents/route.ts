import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import DocumentClone from '@/models/DocumentClone';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.type !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const sortBy = searchParams.get('sortBy') || 'recent';

    // Build query
    const query: any = { userId: session.user.id };
    
    if (search) {
      query.$or = [
        { 'originalDocument.title': { $regex: search, $options: 'i' } },
        { 'originalDocument.description': { $regex: search, $options: 'i' } },
        { 'clonedContent': { $regex: search, $options: 'i' } },
        { 'customizations.title': { $regex: search, $options: 'i' } },
        { 'customizations.description': { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'all') {
      query['originalDocument.category'] = category;
    }

    if (type && type !== 'all') {
      query['originalDocument.type'] = type;
    }

    // Build sort
    let sort: any = {};
    switch (sortBy) {
      case 'recent':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'accessed':
        sort = { lastAccessedAt: -1 };
        break;
      case 'title':
        sort = { 'originalDocument.title': 1 };
        break;
      case 'type':
        sort = { 'originalDocument.type': 1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get cloned documents with populated original document info
    const documents = await DocumentClone.find(query)
      .populate('originalDocumentId', 'title type description category tags')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await DocumentClone.countDocuments(query);
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      documents: documents.map(doc => ({
        _id: (doc._id as any).toString(),
        originalDocument: {
          _id: (doc.originalDocumentId as any)._id.toString(),
          title: (doc.originalDocumentId as any).title,
          type: (doc.originalDocumentId as any).type,
          description: (doc.originalDocumentId as any).description,
          category: (doc.originalDocumentId as any).category,
          tags: (doc.originalDocumentId as any).tags
        },
        clonedContent: doc.clonedContent,
        customizations: doc.customizations || {},
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        lastAccessedAt: doc.lastAccessedAt,
        accessCount: doc.accessCount || 0,
        isBookmarked: doc.isBookmarked || false
      })),
      pagination: {
        page,
        limit,
        total,
        pages
      }
    });
  } catch (error) {
    console.error('Error fetching cloned documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cloned documents' },
      { status: 500 }
    );
  }
} 