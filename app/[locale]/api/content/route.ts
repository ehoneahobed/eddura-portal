import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Content, { IContent } from '@/models/Content';
import { auth } from '@/lib/auth';

// GET /api/content - List all content with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const author = searchParams.get('author');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'publishDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Build query
    const query: any = {};
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (category) query.categories = { $in: [category] };
    if (tag) query.tags = { $in: [tag] };
    if (author) query.author = author;
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query with pagination
    const [content, total] = await Promise.all([
      Content.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Content.countDocuments(query)
    ]);
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return NextResponse.json({
      success: true,
      data: content,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });
    
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

// POST /api/content - Create new content
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'content', 'excerpt', 'type', 'author'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    // Generate slug from title if not provided
    if (!body.slug && body.title) {
      body.slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }
    
    // Check if slug already exists
    if (body.slug) {
      const existingContent = await Content.findOne({ slug: body.slug });
      if (existingContent) {
        return NextResponse.json(
          { success: false, error: 'Slug already exists' },
          { status: 400 }
        );
      }
    }
    
    // Create content with user info
    const contentData = {
      ...body,
      createdBy: session.user.email,
      lastModifiedBy: session.user.email
    };
    
    const content = new Content(contentData);
    await content.save();
    
    return NextResponse.json({
      success: true,
      data: content,
      message: 'Content created successfully'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating content:', error);
    
    // Check if it's a Mongoose validation error
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }
    
    // Check if it's a duplicate key error (e.g., slug already exists)
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Content with this slug already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create content', details: error.message },
      { status: 500 }
    );
  }
}