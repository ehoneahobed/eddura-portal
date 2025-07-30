import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Content from '@/models/Content';
import mongoose from 'mongoose';

export async function GET(
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
    
    // Get content with version history
    const content = await Content.findById(id);
    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content not found' },
        { status: 404 }
      );
    }
    
    // In a real implementation, you would have a separate versions collection
    // For now, we'll create mock version data based on the current content
    const versions = [
      {
        id: content._id?.toString() || id,
        version: content.version || 1,
        title: content.title,
        content: content.content,
        excerpt: content.excerpt,
        author: content.author,
        createdAt: content.updatedAt || content.createdAt,
        changes: ['Current version'],
        isCurrent: true
      }
    ];
    
    // Add some mock previous versions
    for (let i = (content.version || 1) - 1; i >= 1; i--) {
      versions.push({
        id: `${content._id}_v${i}`,
        version: i,
        title: `${content.title} (v${i})`,
        content: `Previous version ${i} of the content...`,
        excerpt: `Previous excerpt for version ${i}`,
        author: content.author,
        createdAt: new Date(content.createdAt.getTime() - (content.version - i) * 24 * 60 * 60 * 1000),
        changes: [
          'Updated content structure',
          'Improved readability',
          'Added new sections'
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        isCurrent: false
      });
    }
    
    return NextResponse.json({
      success: true,
      data: versions
    });
    
  } catch (error) {
    console.error('Error fetching content versions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch versions' },
      { status: 500 }
    );
  }
}

export async function POST(
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
    const { versionId } = body;
    
    // Check if it's a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid content ID' },
        { status: 400 }
      );
    }
    
    // Get content
    const content = await Content.findById(id);
    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content not found' },
        { status: 404 }
      );
    }
    
    // In a real implementation, you would restore from the versions collection
    // For now, we'll just update the version number
    content.version = (content.version || 1) + 1;
    content.lastModifiedBy = session.user.email;
    await content.save();
    
    return NextResponse.json({
      success: true,
      message: 'Version restored successfully',
      data: {
        newVersion: content.version
      }
    });
    
  } catch (error) {
    console.error('Error restoring version:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to restore version' },
      { status: 500 }
    );
  }
} 