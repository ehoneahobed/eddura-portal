#!/usr/bin/env tsx

import { connectToDatabase } from '@/lib/mongodb';
import { ProgressTracker } from '@/lib/services/progressTracker';
import User from '@/models/User';
import Document from '@/models/Document';
import Application from '@/models/Application';
import DocumentFeedback from '@/models/DocumentFeedback';

async function syncSquadProgress() {
  try {
    console.log('🔄 Starting squad progress sync...');
    
    await connectToDatabase();
    console.log('✅ Connected to database');

    // Sync existing activities
    await ProgressTracker.syncExistingActivities();
    
    console.log('✅ Squad progress sync completed successfully');
  } catch (error) {
    console.error('❌ Error syncing squad progress:', error);
    process.exit(1);
  }
}

// Run the sync if this script is executed directly
if (require.main === module) {
  syncSquadProgress()
    .then(() => {
      console.log('🎉 Sync completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Sync failed:', error);
      process.exit(1);
    });
}

export { syncSquadProgress };