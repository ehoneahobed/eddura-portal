import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import LibraryDocument from '@/models/LibraryDocument';
import DocumentClone from '@/models/DocumentClone';
import DocumentRating from '@/models/DocumentRating';
import Document from '@/models/Document';
import { DocumentType } from '@/types/documents';
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

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json({ error: 'Invalid document ID format' }, { status: 400 });
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
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Cast to ObjectId failed')) {
        return NextResponse.json({ error: 'Invalid document ID format' }, { status: 400 });
      }
      if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        return NextResponse.json({ error: 'Database connection failed' }, { status: 503 });
      }
    }
    
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
    console.log('🔍 [CLONE] Starting document clone process...');
    const resolvedParams = await params;
    console.log('🔍 [CLONE] Document ID:', resolvedParams.id);
    
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    console.log('🔍 [CLONE] User ID:', session.user.id);

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json({ error: 'Invalid document ID format' }, { status: 400 });
    }

    await connectDB();
    console.log('🔍 [CLONE] Database connected');

    // Find the library document
    const libraryDoc = await LibraryDocument.findOne({
      _id: resolvedParams.id,
      status: 'published',
      reviewStatus: 'approved'
    });

    if (!libraryDoc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    console.log('🔍 [CLONE] Library document found:', {
      id: libraryDoc._id,
      title: libraryDoc.title,
      type: libraryDoc.type,
      allowCloning: libraryDoc.allowCloning
    });

    // Check if cloning is allowed
    if (!libraryDoc.allowCloning) {
      return NextResponse.json({ error: 'This document cannot be cloned' }, { status: 403 });
    }

    // Map library document type to DocumentType enum
    const typeMapping: Record<string, DocumentType> = {
      'Personal Statement': DocumentType.PERSONAL_STATEMENT,
      'Statement of Purpose': DocumentType.STATEMENT_OF_PURPOSE,
      'Research Proposal': DocumentType.RESEARCH_PROPOSAL,
      'Motivation Letter': DocumentType.MOTIVATION_LETTER,
      'CV': DocumentType.CV,
      'Resume': DocumentType.RESUME,
      'Cover Letter': DocumentType.COVER_LETTER,
      'Portfolio': DocumentType.PORTFOLIO,
      'Academic Essay': DocumentType.ACADEMIC_ESSAY,
      'Research Paper': DocumentType.RESEARCH_PAPER,
      'Thesis Proposal': DocumentType.THESIS_PROPOSAL,
      'Dissertation Proposal': DocumentType.DISSERTATION_PROPOSAL,
      'Work Experience': DocumentType.WORK_EXPERIENCE,
      'Volunteering Experience': DocumentType.VOLUNTEERING_EXPERIENCE,
      'Internship Experience': DocumentType.INTERNSHIP_EXPERIENCE,
      'Research Experience': DocumentType.RESEARCH_EXPERIENCE,
      'Reference Letter': DocumentType.REFERENCE_LETTER,
      'Recommendation Letter': DocumentType.RECOMMENDATION_LETTER,
      'Scholarship Essay': DocumentType.PERSONAL_STATEMENT, // Map to personal statement as closest match
      'Academic CV': DocumentType.CV, // Map to CV as closest match
    };

    const mappedType = typeMapping[libraryDoc.type];
    if (!mappedType) {
      console.log('❌ [CLONE] Unsupported document type:', libraryDoc.type);
      return NextResponse.json({ 
        error: 'Document type not supported for cloning',
        supportedTypes: Object.keys(typeMapping)
      }, { status: 400 });
    }

    console.log('🔍 [CLONE] Document type mapped:', libraryDoc.type, '->', mappedType);

    // Create user document
    const userDocData = {
      userId: session.user.id,
      title: `${libraryDoc.title} (Copy)`,
      type: mappedType,
      content: libraryDoc.content,
      description: `Cloned from library: ${libraryDoc.title}`,
      tags: [...(libraryDoc.tags || []), 'cloned'],
      version: 1,
      wordCount: libraryDoc.wordCount,
      characterCount: libraryDoc.characterCount,
    };

    console.log('🔍 [CLONE] Creating user document with data:', {
      userId: userDocData.userId,
      title: userDocData.title,
      type: userDocData.type,
      originalType: libraryDoc.type,
      wordCount: userDocData.wordCount,
      characterCount: userDocData.characterCount
    });

    const userDoc = new Document(userDocData);

    console.log('🔍 [CLONE] User document created, saving...');
    await userDoc.save();
    console.log('🔍 [CLONE] User document saved successfully:', userDoc._id);

    // Track clone
    console.log('🔍 [CLONE] Creating clone tracking record...');
    const cloneRecord = await DocumentClone.create({
      originalDocumentId: libraryDoc._id,
      clonedBy: session.user.id,
      userDocumentId: userDoc._id,
      clonedContent: libraryDoc.content,
      userId: session.user.id, // Both userId and clonedBy should be the same for user-initiated clones
    });
    console.log('🔍 [CLONE] Clone tracking record created:', cloneRecord._id);

    // Update library document stats
    console.log('🔍 [CLONE] Updating library document clone count...');
    libraryDoc.cloneCount += 1;
    await libraryDoc.save();
    console.log('🔍 [CLONE] Library document updated successfully');

    console.log('✅ [CLONE] Document cloning completed successfully');
    return NextResponse.json({ 
      message: 'Document cloned successfully',
      userDocument: userDoc 
    });
  } catch (error) {
    console.error('❌ [CLONE] Error cloning library document:', error);
    console.error('❌ [CLONE] Error type:', typeof error);
    console.error('❌ [CLONE] Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('❌ [CLONE] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Cast to ObjectId failed')) {
        return NextResponse.json({ error: 'Invalid document ID format' }, { status: 400 });
      }
      if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        return NextResponse.json({ error: 'Database connection failed' }, { status: 503 });
      }
      if (error.message.includes('duplicate key')) {
        return NextResponse.json({ error: 'Document already cloned' }, { status: 409 });
      }
      if (error.message.includes('validation failed')) {
        return NextResponse.json({ error: 'Document validation failed', details: error.message }, { status: 400 });
      }
      if (error.message.includes('DocumentType')) {
        return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 