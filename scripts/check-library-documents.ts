import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import connectDB from '../lib/mongodb';
import LibraryDocument from '../models/LibraryDocument';

async function checkLibraryDocuments() {
  try {
    await connectDB();
    
    console.log('Checking library documents...');

    // Check all documents
    const allDocuments = await LibraryDocument.find({});
    console.log(`Total library documents: ${allDocuments.length}`);

    // Check published documents
    const publishedDocuments = await LibraryDocument.find({ 
      status: 'published',
      reviewStatus: 'approved'
    });
    console.log(`Published and approved documents: ${publishedDocuments.length}`);

    // Check by status
    const draftDocuments = await LibraryDocument.find({ status: 'draft' });
    const reviewDocuments = await LibraryDocument.find({ status: 'review' });
    const publishedDocumentsOnly = await LibraryDocument.find({ status: 'published' });
    const archivedDocuments = await LibraryDocument.find({ status: 'archived' });

    console.log(`\nDocuments by status:`);
    console.log(`- Draft: ${draftDocuments.length}`);
    console.log(`- Review: ${reviewDocuments.length}`);
    console.log(`- Published: ${publishedDocumentsOnly.length}`);
    console.log(`- Archived: ${archivedDocuments.length}`);

    // Check by review status
    const pendingDocuments = await LibraryDocument.find({ reviewStatus: 'pending' });
    const approvedDocuments = await LibraryDocument.find({ reviewStatus: 'approved' });
    const rejectedDocuments = await LibraryDocument.find({ reviewStatus: 'rejected' });

    console.log(`\nDocuments by review status:`);
    console.log(`- Pending: ${pendingDocuments.length}`);
    console.log(`- Approved: ${approvedDocuments.length}`);
    console.log(`- Rejected: ${rejectedDocuments.length}`);

    if (publishedDocuments.length > 0) {
      console.log(`\nPublished documents:`);
      publishedDocuments.forEach((doc, index) => {
        console.log(`${index + 1}. ${doc.title} (${doc.category})`);
      });
    } else {
      console.log('\nNo published documents found. This is why the library page shows no documents.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error checking library documents:', error);
    process.exit(1);
  }
}

checkLibraryDocuments();