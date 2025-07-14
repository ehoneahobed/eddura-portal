import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import LibraryDocument from '@/models/LibraryDocument';
import { z } from 'zod';

// Validation schema for creating/updating library documents
const LibraryDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  type: z.string().min(1, 'Document type is required'),
  content: z.string().min(1, 'Content is required'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  tags: z.array(z.string().max(50)).optional(),
  targetAudience: z.enum(['undergraduate', 'graduate', 'professional', 'all']).default('all'),
  fieldOfStudy: z.array(z.string()).optional(),
  country: z.array(z.string()).optional(),
  author: z.string().max(100).optional(),
  source: z.string().max(200).optional(),
  language: z.string().default('en'),
  status: z.enum(['draft', 'review', 'published', 'archived']).default('draft'),
  reviewStatus: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  qualityScore: z.number().min(1).max(10).default(5),
});

// GET /api/admin/library/documents - Get all library documents with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "admin" && session.user.role !== "super_admin") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to view library content
    if (!session.user.permissions?.includes("content:read")) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const reviewStatus = searchParams.get('reviewStatus');
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const targetAudience = searchParams.get('targetAudience');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    // Build query
    const query: any = {};
    
    if (status) query.status = status;
    if (reviewStatus) query.reviewStatus = reviewStatus;
    if (category) query.category = category;
    if (type) query.type = type;
    if (targetAudience) query.targetAudience = targetAudience;
    
    // Text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [documents, total] = await Promise.all([
      LibraryDocument.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email')
        .populate('reviewedBy', 'firstName lastName email')
        .lean(),
      LibraryDocument.countDocuments(query)
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
    console.error('Error fetching library documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/library/documents - Create a new library document
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "admin" && session.user.role !== "super_admin") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to create content
    if (!session.user.permissions?.includes("content:create")) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    await connectDB();

    const body = await request.json();
    
    // Validate input
    const validatedData = LibraryDocumentSchema.parse(body);

    // Calculate word and character counts
    const wordCount = validatedData.content.trim().split(/\s+/).filter(word => word.length > 0).length;
    const characterCount = validatedData.content.length;

    // Create new library document
    const document = new LibraryDocument({
      ...validatedData,
      createdBy: session.user.id,
      updatedBy: session.user.id,
      wordCount,
      characterCount,
    });

    await document.save();

    // Populate creator info
    await document.populate('createdBy', 'firstName lastName email');

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error creating library document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 