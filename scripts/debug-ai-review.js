const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eddura-portal');

// Import models
const AIReview = require('../models/AIReview');
const Application = require('../models/Application');
const ApplicationRequirement = require('../models/ApplicationRequirement');
const Document = require('../models/Document');

async function debugAIReview() {
  try {
    console.log('🔍 Debugging AI Review System...\n');

    // 1. Check AIReview model structure
    console.log('1. Checking AIReview model structure...');
    const sampleReview = new AIReview({
      applicationId: new mongoose.Types.ObjectId(),
      requirementId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      reviewType: 'document_review',
      status: 'completed',
      scores: {
        overall: 50,
        contentQuality: 50,
        completeness: 50,
        relevance: 50,
        formatting: 50,
        clarity: 50,
        strength: 50
      },
      feedback: [],
      summary: {
        strengths: ['Test'],
        weaknesses: ['Test'],
        recommendations: ['Test'],
        overallAssessment: 'Test'
      },
      aiModel: 'test-model',
      aiProvider: 'test-provider'
    });

    console.log('✅ Sample review structure is valid');
    console.log('Sample scores:', sampleReview.scores);
    console.log('Sample status:', sampleReview.status);
    console.log('');

    // 2. Check existing reviews in database
    console.log('2. Checking existing reviews in database...');
    const existingReviews = await AIReview.find().limit(5).sort({ createdAt: -1 });
    
    if (existingReviews.length === 0) {
      console.log('❌ No existing reviews found in database');
    } else {
      console.log(`✅ Found ${existingReviews.length} existing reviews:`);
      existingReviews.forEach((review, index) => {
        console.log(`Review ${index + 1}:`);
        console.log(`  - ID: ${review._id}`);
        console.log(`  - Status: ${review.status}`);
        console.log(`  - Scores:`, review.scores);
        console.log(`  - Created: ${review.createdAt}`);
        console.log(`  - Updated: ${review.updatedAt}`);
        console.log('');
      });
    }

    // 3. Test fallback scores configuration
    console.log('3. Testing fallback scores configuration...');
    const aiConfig = require('../lib/ai-config');
    console.log('Fallback scores:', aiConfig.aiConfig.retrySettings.fallbackScores);
    console.log('Enable fallback:', aiConfig.aiConfig.retrySettings.enableFallback);
    console.log('');

    // 4. Test createFallbackReview function
    console.log('4. Testing createFallbackReview function...');
    const aiUtils = require('../lib/ai-utils');
    const fallbackReview = aiUtils.createFallbackReview('Test Document');
    console.log('Fallback review scores:', fallbackReview.scores);
    console.log('Fallback review status structure:', {
      hasScores: !!fallbackReview.scores,
      hasFeedback: Array.isArray(fallbackReview.feedback),
      hasSummary: !!fallbackReview.summary
    });
    console.log('');

    // 5. Check for any reviews with 0 scores
    console.log('5. Checking for reviews with 0 scores...');
    const zeroScoreReviews = await AIReview.find({
      'scores.overall': 0,
      'scores.contentQuality': 0,
      'scores.completeness': 0,
      'scores.relevance': 0,
      'scores.formatting': 0,
      'scores.clarity': 0,
      'scores.strength': 0
    });

    if (zeroScoreReviews.length > 0) {
      console.log(`⚠️  Found ${zeroScoreReviews.length} reviews with all 0 scores:`);
      zeroScoreReviews.forEach((review, index) => {
        console.log(`  Review ${index + 1}:`);
        console.log(`    - ID: ${review._id}`);
        console.log(`    - Status: ${review.status}`);
        console.log(`    - Created: ${review.createdAt}`);
        console.log(`    - Updated: ${review.updatedAt}`);
      });
    } else {
      console.log('✅ No reviews found with all 0 scores');
    }
    console.log('');

    // 6. Check for failed reviews
    console.log('6. Checking for failed reviews...');
    const failedReviews = await AIReview.find({ status: 'failed' });
    
    if (failedReviews.length > 0) {
      console.log(`⚠️  Found ${failedReviews.length} failed reviews:`);
      failedReviews.forEach((review, index) => {
        console.log(`  Failed Review ${index + 1}:`);
        console.log(`    - ID: ${review._id}`);
        console.log(`    - Scores:`, review.scores);
        console.log(`    - Created: ${review.createdAt}`);
        console.log(`    - Updated: ${review.updatedAt}`);
      });
    } else {
      console.log('✅ No failed reviews found');
    }

  } catch (error) {
    console.error('❌ Error during debugging:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔍 Debug complete!');
  }
}

// Run the debug function
debugAIReview(); 