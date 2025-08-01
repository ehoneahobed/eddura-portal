import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import connectDB from '../lib/mongodb';
import LibraryDocument from '../models/LibraryDocument';

async function updateLibraryDocumentsStatus() {
  try {
    await connectDB();
    
    console.log('Updating library documents status...');

    // Find all library documents
    const allDocuments = await LibraryDocument.find({});
    console.log(`Total library documents found: ${allDocuments.length}`);

    if (allDocuments.length === 0) {
      console.log('No library documents found in the database.');
      return;
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

    console.log(`Updated ${updateResult.modifiedCount} documents to published status`);

    // Verify the update
    const publishedDocuments = await LibraryDocument.find({ 
      status: 'published',
      reviewStatus: 'approved'
    });
    console.log(`Now have ${publishedDocuments.length} published and approved documents`);

    if (publishedDocuments.length > 0) {
      console.log('\nPublished documents:');
      publishedDocuments.forEach((doc, index) => {
        console.log(`${index + 1}. ${doc.title} (${doc.category})`);
      });
    }

    console.log('\n✅ Library documents updated successfully!');
    console.log('The library page should now show documents.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating library documents:', error);
    process.exit(1);
  }
}

updateLibraryDocumentsStatus();