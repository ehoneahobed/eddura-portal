import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import LibraryDocument from '@/models/LibraryDocument';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    console.log('Starting library document status update...');

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

    // Show current status of documents
    const draftCount = allDocuments.filter(doc => doc.status === 'draft').length;
    const reviewCount = allDocuments.filter(doc => doc.status === 'review').length;
    const publishedCount = allDocuments.filter(doc => doc.status === 'published').length;
    const archivedCount = allDocuments.filter(doc => doc.status === 'archived').length;

    console.log(`Current document status:`);
    console.log(`- Draft: ${draftCount}`);
    console.log(`- Review: ${reviewCount}`);
    console.log(`- Published: ${publishedCount}`);
    console.log(`- Archived: ${archivedCount}`);

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

    console.log(`Updated ${updateResult.modifiedCount} documents`);

    // Verify the update
    const publishedDocuments = await LibraryDocument.find({ 
      status: 'published',
      reviewStatus: 'approved'
    });

    console.log(`Now have ${publishedDocuments.length} published and approved documents`);

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
      { error: 'Failed to update library documents', details: error.message },
      { status: 500 }
    );
  }
}