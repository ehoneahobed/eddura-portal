import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Document, { IDocument } from '@/models/Document';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build query
    const query: any = { 
      userId: session.user.id, 
      isActive: true 
    };

    if (type) query.type = type;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Get documents with pagination
    const [documents, total] = await Promise.all([
      Document.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Document.countDocuments(query)
    ]);

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
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, content, type, category, tags, language, isPublic } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    await connectDB();

    // Check if document with same title exists and get next version
    const nextVersion = await Document.getNextVersion(session.user.id, title);

    // Create new document
    const document = new Document({
      userId: session.user.id,
      title,
      description,
      content,
      type: type || 'other',
      category: category || 'other',
      tags: tags || [],
      version: nextVersion,
      language: language || 'en',
      isPublic: isPublic || false,
      metadata: {
        wordCount: 0, // Will be calculated by pre-save middleware
        characterCount: 0, // Will be calculated by pre-save middleware
        lastEdited: new Date()
      }
    });

    await document.save();

    return NextResponse.json({ 
      message: 'Document created successfully',
      document 
    });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}