import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import LibraryDocument from '@/models/LibraryDocument';
import DocumentClone from '@/models/DocumentClone';
import DocumentRating from '@/models/DocumentRating';
import DocumentView from '@/models/DocumentView';

// GET /api/library/documents - Browse published library documents
export async function GET(request: NextRequest) {
  console.log('🔍 Library API - Request started');
  console.log('🔍 Library API - Request URL:', request.url);
  console.log('🔍 Library API - Request headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    console.log('🔍 Library API - Attempting to get session...');
    const session = await auth();
    console.log('🔍 Library API - Session result:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userType: session?.user?.type
    });
    
    if (!session?.user?.id) {
      console.log('❌ Library API - Authentication failed: No session or user ID');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    console.log('✅ Library API - Authentication successful');

    console.log('🔍 Library API - Connecting to database...');
    try {
      await connectDB();
      console.log('🔍 Library API - Database connected successfully');
    } catch (error) {
      console.error('🔍 Library API - Database connection failed:', error);
      // Return mock data for development/testing
      return NextResponse.json({
        documents: [
          {
            _id: 'mock-1',
            title: 'Computer Science Graduate School Personal Statement',
            type: 'Personal Statement',
            description: 'A comprehensive personal statement template for computer science graduate school applications.',
            category: 'academic',
            content: 'This is a sample personal statement for computer science graduate school applications...',
            wordCount: 500,
            characterCount: 2500,
            viewCount: 150,
            cloneCount: 25,
            averageRating: 4.5,
            ratingCount: 12,
            tags: ['computer science', 'graduate school', 'personal statement'],
            targetAudience: 'graduate',
            isCloned: false
          },
          {
            _id: 'mock-2',
            title: 'Statement of Purpose for Engineering Programs',
            type: 'Statement of Purpose',
            description: 'A well-structured statement of purpose template for engineering graduate programs.',
            category: 'academic',
            content: 'This is a sample statement of purpose for engineering graduate programs...',
            wordCount: 600,
            characterCount: 3000,
            viewCount: 120,
            cloneCount: 18,
            averageRating: 4.2,
            ratingCount: 8,
            tags: ['engineering', 'graduate school', 'statement of purpose'],
            targetAudience: 'graduate',
            isCloned: false
          },
          {
            _id: 'mock-3',
            title: 'Academic CV Template for Graduate Students',
            type: 'Academic CV',
            description: 'A professional academic CV template suitable for graduate school applications.',
            category: 'academic',
            content: 'This is a sample academic CV template for graduate students...',
            wordCount: 400,
            characterCount: 2000,
            viewCount: 200,
            cloneCount: 35,
            averageRating: 4.8,
            ratingCount: 15,
            tags: ['academic cv', 'graduate school', 'resume'],
            targetAudience: 'graduate',
            isCloned: false
          }
        ],
        pagination: {
          page: 1,
          limit: 12,
          total: 3,
          pages: 1
        },
        userStats: {
          totalCloned: 0,
          recentlyCloned: 0,
          favoriteCategory: '',
          totalRated: 0
        }
      });
    }

    console.log('🔍 Library API - Parsing search parameters...');
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
    
    console.log('🔍 Library API - Parsed search parameters:', {
      category,
      subcategory,
      type,
      targetAudience,
      fieldOfStudy,
      tags,
      minRating,
      sortBy,
      page,
      limit,
      search
    });

    // Build query - only published documents
    console.log('🔍 Library API - Building initial query...');
    const query: any = { 
      status: 'published',
      reviewStatus: 'approved'
    };
    console.log('🔍 Library API - Initial query:', JSON.stringify(query, null, 2));
    
    // Debug: Let's also try without the status filter to see if documents exist
    const allDocsQuery = {};
    const allDocs = await LibraryDocument.find(allDocsQuery).limit(3);
    console.log('🔍 Library API - All documents (first 3):', allDocs.map(doc => ({
      id: doc._id,
      title: doc.title,
      type: doc.type,
      documentType: (doc as any).documentType, // Check if this field exists
      status: doc.status,
      reviewStatus: doc.reviewStatus,
      category: doc.category
    })));
    
    // Test the exact same query that will be used in the main query
    const testQuery = { status: 'published', reviewStatus: 'approved' };
    const testDocs = await LibraryDocument.find(testQuery).limit(3);
    console.log('🔍 Library API - Test query result:', testDocs.length, 'documents');
    if (testDocs.length > 0) {
      console.log('🔍 Library API - First test document:', {
        id: testDocs[0]._id,
        title: testDocs[0].title,
        status: testDocs[0].status,
        reviewStatus: testDocs[0].reviewStatus
      });
    }
    
    console.log('🔍 Library API - Query:', JSON.stringify(query, null, 2));
    console.log('🔍 Library API - Search params:', {
      page,
      limit,
      search,
      category,
      type,
      targetAudience,
      sortBy
    });
    
    console.log('🔍 Library API - Applying filters to query...');
    if (category && category !== 'all') {
      query.category = category;
      console.log('🔍 Library API - Added category filter:', category);
    }
    if (subcategory && subcategory !== 'all') {
      query.subcategory = subcategory;
      console.log('🔍 Library API - Added subcategory filter:', subcategory);
    }
    if (type && type !== 'all') {
      query.type = type;
      console.log('🔍 Library API - Added type filter:', type);
    }
    if (targetAudience && targetAudience !== 'all') {
      query.targetAudience = targetAudience;
      console.log('🔍 Library API - Added targetAudience filter:', targetAudience);
    }
    if (fieldOfStudy && fieldOfStudy !== 'all') {
      query.fieldOfStudy = fieldOfStudy;
      console.log('🔍 Library API - Added fieldOfStudy filter:', fieldOfStudy);
    }
    if (tags) {
      query.tags = { $in: tags.split(',') };
      console.log('🔍 Library API - Added tags filter:', tags.split(','));
    }
    if (minRating) {
      query.averageRating = { $gte: parseFloat(minRating) };
      console.log('🔍 Library API - Added minRating filter:', minRating);
    }
    
    console.log('🔍 Library API - Final query after filters:', JSON.stringify(query, null, 2));
    
    // Text search
    if (search) {
      console.log('🔍 Library API - Adding text search filter:', search);
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
      console.log('🔍 Library API - Query after text search:', JSON.stringify(query, null, 2));
    }

    const skip = (page - 1) * limit;
    console.log('🔍 Library API - Pagination settings:', { page, limit, skip });

    // Build sort
    console.log('🔍 Library API - Building sort configuration...');
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
    console.log('🔍 Library API - Sort configuration:', JSON.stringify(sort, null, 2));

    console.log('🔍 Library API - About to execute main query with:', {
      query: JSON.stringify(query),
      sort: JSON.stringify(sort),
      skip,
      limit
    });
    
    console.log('🔍 Library API - Executing database queries...');
    const [documents, total] = await Promise.all([
      LibraryDocument.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-reviewNotes -reviewedBy -reviewedAt') // Exclude admin-only fields
        .lean(),
      LibraryDocument.countDocuments(query)
    ]);
    console.log('🔍 Library API - Database queries completed');
    
    console.log('🔍 Library API - Main query executed. Documents found:', documents.length);
    
    console.log('🔍 Library API - Found documents:', documents.length);
    console.log('🔍 Library API - Total count:', total);
    console.log('🔍 Library API - First document (if any):', documents[0] || 'No documents found');
    
    // Test: Find ALL documents without any filters
    const allDocuments = await LibraryDocument.find({}).limit(5);
    console.log('🔍 Library API - All documents in collection (first 5):', allDocuments.length);
    if (allDocuments.length > 0) {
      console.log('🔍 Library API - Sample document:', {
        id: allDocuments[0]._id,
        title: allDocuments[0].title,
        status: allDocuments[0].status,
        reviewStatus: allDocuments[0].reviewStatus
      });
      
      // Test individual queries
      const publishedDocs = await LibraryDocument.find({ status: 'published' });
      const approvedDocs = await LibraryDocument.find({ reviewStatus: 'approved' });
      const bothDocs = await LibraryDocument.find({ 
        status: 'published', 
        reviewStatus: 'approved' 
      });
      
      console.log('🔍 Library API - Documents with status "published":', publishedDocs.length);
      console.log('🔍 Library API - Documents with reviewStatus "approved":', approvedDocs.length);
      console.log('🔍 Library API - Documents with both conditions:', bothDocs.length);
      
      // Check exact values
      console.log('🔍 Library API - Sample document status type:', typeof allDocuments[0].status);
      console.log('🔍 Library API - Sample document status value:', JSON.stringify(allDocuments[0].status));
      console.log('🔍 Library API - Sample document reviewStatus type:', typeof allDocuments[0].reviewStatus);
      console.log('🔍 Library API - Sample document reviewStatus value:', JSON.stringify(allDocuments[0].reviewStatus));
    }

    console.log('🔍 Library API - Fetching user cloned documents...');
    // Get user's cloned documents to check clone status
    const userClonedDocuments = await DocumentClone.find(
      { userId: session.user.id },
      { originalDocumentId: 1, createdAt: 1 }
    ).lean();
    console.log('🔍 Library API - User cloned documents found:', userClonedDocuments.length);

    const clonedDocumentIds = new Set(
      userClonedDocuments.map(doc => doc.originalDocumentId.toString())
    );
    console.log('🔍 Library API - Cloned document IDs:', Array.from(clonedDocumentIds));

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

    console.log('🔍 Library API - Adding clone status to documents...');
    // Add clone status to each document
    const documentsWithCloneStatus = documents.map(doc => ({
      ...doc,
      isCloned: clonedDocumentIds.has(doc._id.toString())
    }));
    console.log('🔍 Library API - Documents with clone status:', documentsWithCloneStatus.map(doc => ({
      id: doc._id,
      title: doc.title,
      isCloned: doc.isCloned
    })));

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

    const response = {
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
    };
    
    console.log('🔍 Library API - Final response structure:', {
      documentsCount: response.documents.length,
      pagination: response.pagination,
      userStats: response.userStats
    });
    
    console.log('✅ Library API - Request completed successfully');
    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Library API - Error occurred:', error);
    console.error('❌ Library API - Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 