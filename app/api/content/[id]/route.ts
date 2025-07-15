import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Content, { IContent } from '@/models/Content';
import { auth } from '@/lib/auth';
import mongoose from 'mongoose';

// GET /api/content/[id] - Get specific content by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    // Check if it's a valid ObjectId or slug
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    
    let content;
    if (isObjectId) {
      content = await Content.findById(id).lean();
    } else {
      content = await Content.findOne({ slug: id }).lean();
    }
    
    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content not found' },
        { status: 404 }
      );
    }
    
    // Increment view count for published content
    if (content.status === 'published') {
      await Content.findByIdAndUpdate(content._id, {
        $inc: { viewCount: 1 }
      });
    }
    
    return NextResponse.json({
      success: true,
      data: content
    });
    
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

// PUT /api/content/[id] - Update content
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const { id } = await params;
    const body = await request.json();
    
    // Check if it's a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid content ID' },
        { status: 400 }
      );
    }
    
    // Check if content exists
    const existingContent = await Content.findById(id);
    if (!existingContent) {
      return NextResponse.json(
        { success: false, error: 'Content not found' },
        { status: 404 }
      );
    }
    
    // Check if slug already exists (if being updated)
    if (body.slug && body.slug !== existingContent.slug) {
      const slugExists = await Content.findOne({ slug: body.slug });
      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'Slug already exists' },
          { status: 400 }
        );
      }
    }
    
    // Update content
    const updatedContent = await Content.findByIdAndUpdate(
      id,
      {
        ...body,
        lastModifiedBy: session.user.email,
        version: existingContent.version + 1
      },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({
      success: true,
      data: updatedContent,
      message: 'Content updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update content' },
      { status: 500 }
    );
  }
}

// DELETE /api/content/[id] - Delete content
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const { id } = await params;
    
    // Check if it's a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid content ID' },
        { status: 400 }
      );
    }
    
    // Check if content exists
    const content = await Content.findById(id);
    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content not found' },
        { status: 404 }
      );
    }
    
    // Delete content
    await Content.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Content deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete content' },
      { status: 500 }
    );
  }
}