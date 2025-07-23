import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import connectDB from '../lib/mongodb';
import LibraryDocument from '../models/LibraryDocument';
import DocumentView from '../models/DocumentView';
import DocumentClone from '../models/DocumentClone';
import DocumentRating from '../models/DocumentRating';
import User from '../models/User';
import Admin from '../models/Admin';

async function seedAnalyticsData() {
  try {
    console.log('🔍 [SEED] Connecting to database...');
    await connectDB();
    console.log('✅ [SEED] Database connected');

    // Get existing documents
    const documents = await LibraryDocument.find({ status: 'published' }).limit(10);
    if (documents.length === 0) {
      console.log('❌ [SEED] No published documents found. Please run seed-library-documents.ts first.');
      return;
    }

    // Get existing users and admins for realistic data
    const users = await User.find().limit(5);
    const admins = await Admin.find().limit(2);

    console.log(`📊 [SEED] Found ${documents.length} documents, ${users.length} users, ${admins.length} admins`);

    // Generate sample view data for the last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    console.log('📊 [SEED] Generating sample view data...');
    const viewPromises = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const viewsPerDay = Math.floor(Math.random() * 20) + 5; // 5-25 views per day
      
      for (let j = 0; j < viewsPerDay; j++) {
        const document = documents[Math.floor(Math.random() * documents.length)];
        const user = users.length > 0 ? users[Math.floor(Math.random() * users.length)] : null;
        const admin = admins.length > 0 ? admins[Math.floor(Math.random() * admins.length)] : null;
        
        const viewTime = new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000);
        
        viewPromises.push(
          DocumentView.create({
            documentId: document._id,
            userId: user ? user._id : undefined,
            userType: admin ? 'admin' : user ? 'user' : 'anonymous',
            ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            referrer: Math.random() > 0.5 ? 'https://google.com' : undefined,
            createdAt: viewTime
          })
        );
      }
    }

    await Promise.all(viewPromises);
    console.log('✅ [SEED] View data generated');

    // Generate sample clone data
    console.log('📊 [SEED] Generating sample clone data...');
    const clonePromises = [];
    
    for (let i = 0; i < 15; i++) {
      const date = new Date(thirtyDaysAgo.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
      const document = documents[Math.floor(Math.random() * documents.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      
      clonePromises.push(
        DocumentClone.create({
          originalDocumentId: document._id,
          clonedBy: user._id,
          userId: user._id,
          clonedContent: document.content,
          createdAt: date
        })
      );
    }

    await Promise.all(clonePromises);
    console.log('✅ [SEED] Clone data generated');

    // Generate sample rating data
    console.log('📊 [SEED] Generating sample rating data...');
    const ratingPromises = [];
    
    for (let i = 0; i < 25; i++) {
      const date = new Date(thirtyDaysAgo.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
      const document = documents[Math.floor(Math.random() * documents.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const rating = Math.floor(Math.random() * 5) + 1; // 1-5 stars
      
      ratingPromises.push(
        DocumentRating.create({
          documentId: document._id,
          userId: user._id,
          rating,
          review: Math.random() > 0.7 ? `Great document! Rating: ${rating}/5` : undefined,
          createdAt: date
        })
      );
    }

    await Promise.all(ratingPromises);
    console.log('✅ [SEED] Rating data generated');

    // Update document statistics
    console.log('📊 [SEED] Updating document statistics...');
    for (const document of documents) {
      const [viewCount, cloneCount, ratingCount, avgRating] = await Promise.all([
        DocumentView.countDocuments({ documentId: document._id }),
        DocumentClone.countDocuments({ originalDocumentId: document._id }),
        DocumentRating.countDocuments({ documentId: document._id }),
        DocumentRating.aggregate([
          { $match: { documentId: document._id } },
          { $group: { _id: null, avg: { $avg: '$rating' } } }
        ])
      ]);

      await LibraryDocument.findByIdAndUpdate(document._id, {
        viewCount,
        cloneCount,
        ratingCount,
        averageRating: avgRating[0]?.avg || 0
      });
    }

    console.log('✅ [SEED] Document statistics updated');

    // Log summary
    const totalViews = await DocumentView.countDocuments();
    const totalClones = await DocumentClone.countDocuments();
    const totalRatings = await DocumentRating.countDocuments();

    console.log('📊 [SEED] Analytics data seeding completed!');
    console.log(`📊 [SEED] Summary:`);
    console.log(`   - Total views: ${totalViews}`);
    console.log(`   - Total clones: ${totalClones}`);
    console.log(`   - Total ratings: ${totalRatings}`);

  } catch (error) {
    console.error('❌ [SEED] Error seeding analytics data:', error);
  } finally {
    process.exit(0);
  }
}

seedAnalyticsData();