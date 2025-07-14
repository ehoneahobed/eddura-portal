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
    
    // Handle search across multiple fields
    if (search) {
      query.$or = [
        { 'clonedContent': { $regex: search, $options: 'i' } },
        { 'customizations.title': { $regex: search, $options: 'i' } },
        { 'customizations.description': { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get cloned documents with populated original document info
    let documents = await DocumentClone.find(query)
      .populate('originalDocumentId', 'title type description category tags')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Apply category and type filters after population
    if (category && category !== 'all') {
      documents = documents.filter(doc => 
        (doc.originalDocumentId as any)?.category === category
      );
    }

    if (type && type !== 'all') {
      documents = documents.filter(doc => 
        (doc.originalDocumentId as any)?.type === type
      );
    }

    // Apply search filter on populated data if needed
    if (search) {
      documents = documents.filter(doc => {
        const originalDoc = doc.originalDocumentId as any;
        return (
          originalDoc?.title?.toLowerCase().includes(search.toLowerCase()) ||
          originalDoc?.description?.toLowerCase().includes(search.toLowerCase()) ||
          doc.clonedContent?.toLowerCase().includes(search.toLowerCase()) ||
          doc.customizations?.title?.toLowerCase().includes(search.toLowerCase()) ||
          doc.customizations?.description?.toLowerCase().includes(search.toLowerCase())
        );
      });
    }

    // Apply sorting after filtering
    switch (sortBy) {
      case 'recent':
        documents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        documents.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'accessed':
        documents.sort((a, b) => {
          const aDate = a.lastAccessedAt ? new Date(a.lastAccessedAt).getTime() : 0;
          const bDate = b.lastAccessedAt ? new Date(b.lastAccessedAt).getTime() : 0;
          return bDate - aDate;
        });
        break;
      case 'title':
        documents.sort((a, b) => {
          const aTitle = (a.originalDocumentId as any)?.title || '';
          const bTitle = (b.originalDocumentId as any)?.title || '';
          return aTitle.localeCompare(bTitle);
        });
        break;
      case 'type':
        documents.sort((a, b) => {
          const aType = (a.originalDocumentId as any)?.type || '';
          const bType = (b.originalDocumentId as any)?.type || '';
          return aType.localeCompare(bType);
        });
        break;
    }

    // Get total count for pagination (we need to apply the same filters)
    let totalQuery = { userId: session.user.id };
    let totalDocuments = await DocumentClone.find(totalQuery)
      .populate('originalDocumentId', 'title type description category tags');

    // Apply the same filters to get accurate total count
    if (category && category !== 'all') {
      totalDocuments = totalDocuments.filter(doc => 
        (doc.originalDocumentId as any)?.category === category
      );
    }

    if (type && type !== 'all') {
      totalDocuments = totalDocuments.filter(doc => 
        (doc.originalDocumentId as any)?.type === type
      );
    }

    if (search) {
      totalDocuments = totalDocuments.filter(doc => {
        const originalDoc = doc.originalDocumentId as any;
        return (
          originalDoc?.title?.toLowerCase().includes(search.toLowerCase()) ||
          originalDoc?.description?.toLowerCase().includes(search.toLowerCase()) ||
          doc.clonedContent?.toLowerCase().includes(search.toLowerCase()) ||
          doc.customizations?.title?.toLowerCase().includes(search.toLowerCase()) ||
          doc.customizations?.description?.toLowerCase().includes(search.toLowerCase())
        );
      });
    }

    const total = totalDocuments.length;
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
        accessCount: doc.accessCount || 0
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
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
} 