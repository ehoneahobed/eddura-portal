import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import LibraryDocument from '@/models/LibraryDocument';
import DocumentClone from '@/models/DocumentClone';
import DocumentRating from '@/models/DocumentRating';
import Document from '@/models/Document';
import { z } from 'zod';
import mongoose from 'mongoose';

// Validation schema for rating documents
const RateDocumentSchema = z.object({
  rating: z.number().min(1).max(5),
  review: z.string().max(1000).optional(),
});

// GET /api/library/documents/[id] - View a specific library document
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();

    const document = await LibraryDocument.findOne({
      _id: resolvedParams.id,
      status: 'published',
      reviewStatus: 'approved'
    }).select('-reviewNotes -reviewedBy -reviewedAt').lean();

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Increment view count (async)
    LibraryDocument.findByIdAndUpdate(resolvedParams.id, { $inc: { viewCount: 1 } }).catch(console.error);

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Error fetching library document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/library/documents/[id]/clone - Clone a library document
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();

    // Find the library document
    const libraryDoc = await LibraryDocument.findOne({
      _id: resolvedParams.id,
      status: 'published',
      reviewStatus: 'approved'
    });

    if (!libraryDoc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Create user document
    const userDoc = new Document({
      userId: session.user.id,
      title: `${libraryDoc.title} (Copy)`,
      type: libraryDoc.type,
      content: libraryDoc.content,
      description: `Cloned from library: ${libraryDoc.title}`,
      tags: [...(libraryDoc.tags || []), 'cloned'],
      version: 1,
      wordCount: libraryDoc.wordCount,
      characterCount: libraryDoc.characterCount,
    });

    await userDoc.save();

    // Track clone
    await DocumentClone.create({
      originalDocumentId: libraryDoc._id,
      clonedBy: session.user.id,
      userDocumentId: userDoc._id,
    });

    // Update library document stats
    libraryDoc.cloneCount += 1;
    await libraryDoc.save();

    return NextResponse.json({ 
      message: 'Document cloned successfully',
      userDocument: userDoc 
    });
  } catch (error) {
    console.error('Error cloning library document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 