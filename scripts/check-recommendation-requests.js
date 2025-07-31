const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Define schemas
const recommendationRequestSchema = new mongoose.Schema({
  studentId: mongoose.Schema.Types.ObjectId,
  recipientId: mongoose.Schema.Types.ObjectId,
  title: String,
  description: String,
  deadline: Date,
  status: String,
  priority: String,
  createdAt: Date,
  updatedAt: Date,
}, { strict: false });

const RecommendationRequest = mongoose.model('RecommendationRequest', recommendationRequestSchema);

const recipientSchema = new mongoose.Schema({
  name: String,
  emails: [String],
  primaryEmail: String,
  title: String,
  institution: String,
  createdBy: mongoose.Schema.Types.ObjectId,
}, { strict: false });

const Recipient = mongoose.model('Recipient', recipientSchema);

async function checkRecommendationRequests() {
  try {
    console.log('Checking recommendation requests...');
    
    // Get all recommendation requests
    const requests = await RecommendationRequest.find({});
    console.log(`Found ${requests.length} recommendation requests`);
    
    for (const request of requests) {
      console.log(`\nRequest ID: ${request._id}`);
      console.log(`Title: ${request.title}`);
      console.log(`Recipient ID: ${request.recipientId}`);
      
      if (request.recipientId) {
        // Check if recipient exists
        const recipient = await Recipient.findById(request.recipientId);
        if (recipient) {
          console.log(`Recipient found: ${recipient.name} (${recipient.primaryEmail})`);
        } else {
          console.log(`❌ Recipient not found for ID: ${request.recipientId}`);
        }
      } else {
        console.log(`❌ No recipient ID in request`);
      }
    }
    
    // Check for orphaned requests (requests without valid recipients)
    const orphanedRequests = [];
    for (const request of requests) {
      if (request.recipientId) {
        const recipient = await Recipient.findById(request.recipientId);
        if (!recipient) {
          orphanedRequests.push(request);
        }
      } else {
        orphanedRequests.push(request);
      }
    }
    
    console.log(`\nFound ${orphanedRequests.length} orphaned requests`);
    if (orphanedRequests.length > 0) {
      console.log('Orphaned requests:');
      orphanedRequests.forEach(req => {
        console.log(`- ${req.title} (ID: ${req._id})`);
      });
    }
    
  } catch (error) {
    console.error('Error checking requests:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkRecommendationRequests(); 