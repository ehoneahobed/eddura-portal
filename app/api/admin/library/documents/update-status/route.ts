import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import LibraryDocument from '@/models/LibraryDocument';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();

    // Find all library documents
    const allDocuments = await LibraryDocument.find({});
    console.log(`Total library documents found: ${allDocuments.length}`);

    if (allDocuments.length === 0) {
      return NextResponse.json({ 
        message: 'No library documents found in the database.',
        totalDocuments: 0,
        updatedDocuments: 0
      });
    }

    // Update all documents to published and approved status
    const updateResult = await LibraryDocument.updateMany(
      {}, // Update all documents
      {
        $set: {
          status: 'published',
          reviewStatus: 'approved',
          publishedAt: new Date()
        }
      }
    );

    // Verify the update
    const publishedDocuments = await LibraryDocument.find({ 
      status: 'published',
      reviewStatus: 'approved'
    });

    return NextResponse.json({
      message: 'Library documents updated successfully!',
      totalDocuments: allDocuments.length,
      updatedDocuments: updateResult.modifiedCount,
      publishedDocuments: publishedDocuments.length,
      documents: publishedDocuments.map(doc => ({
        id: doc._id,
        title: doc.title,
        category: doc.category,
        type: doc.type
      }))
    });

  } catch (error) {
    console.error('Error updating library documents:', error);
    return NextResponse.json(
      { error: 'Failed to update library documents' },
      { status: 500 }
    );
  }
}