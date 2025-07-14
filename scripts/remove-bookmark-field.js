const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Database migration script to remove the isBookmarked field from DocumentClone collection
 * This script should be run after deploying the code changes to remove bookmark functionality
 */

async function removeBookmarkField() {
  try {
    console.log('🔧 Starting bookmark field removal migration...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is required');
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Get the DocumentClone collection
    const db = mongoose.connection.db;
    const collection = db.collection('documentclones');
    
    // Update all documents to remove the isBookmarked field
    const result = await collection.updateMany(
      {}, // Update all documents
      { $unset: { isBookmarked: "" } } // Remove the isBookmarked field
    );
    
    console.log(`✅ Successfully removed isBookmarked field from ${result.modifiedCount} documents`);
    
    // Verify the field has been removed
    const documentsWithBookmark = await collection.countDocuments({
      isBookmarked: { $exists: true }
    });
    
    if (documentsWithBookmark === 0) {
      console.log('✅ Verification successful: No documents contain the isBookmarked field');
    } else {
      console.log(`⚠️  Warning: ${documentsWithBookmark} documents still contain the isBookmarked field`);
    }
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the migration
if (require.main === module) {
  removeBookmarkField();
}

module.exports = removeBookmarkField; 