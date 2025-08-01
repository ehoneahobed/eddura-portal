import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import LibraryDocument from '@/models/LibraryDocument';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...');
    await connectDB();
    console.log('Database connected successfully');

    console.log('Finding all library documents...');
    const allDocuments = await LibraryDocument.find({});
    console.log(`Found ${allDocuments.length} total documents`);

    console.log('Finding published documents...');
    const publishedDocuments = await LibraryDocument.find({ 
      status: 'published',
      reviewStatus: 'approved'
    });
    console.log(`Found ${publishedDocuments.length} published documents`);

    return NextResponse.json({
      success: true,
      totalDocuments: allDocuments.length,
      publishedDocuments: publishedDocuments.length,
      documents: publishedDocuments.map(doc => ({
        id: doc._id,
        title: doc.title,
        status: doc.status,
        reviewStatus: doc.reviewStatus,
        category: doc.category,
        type: doc.type
      }))
    });

  } catch (error) {
    console.error('Error in test-db:', error);
    return NextResponse.json(
      { 
        error: 'Database test failed', 
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}