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

async function fixOrphanedRequests() {
  try {
    console.log('Fixing orphaned recommendation requests...');
    
    // Get all recommendation requests
    const requests = await RecommendationRequest.find({});
    console.log(`Found ${requests.length} recommendation requests`);
    
    // Get all recipients
    const recipients = await Recipient.find({});
    console.log(`Found ${recipients.length} recipients`);
    
    if (recipients.length === 0) {
      console.log('No recipients found. Cannot fix orphaned requests.');
      return;
    }
    
    // Find orphaned requests
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
    
    console.log(`Found ${orphanedRequests.length} orphaned requests`);
    
    if (orphanedRequests.length > 0) {
      // Use the first available recipient as a fallback
      const fallbackRecipient = recipients[0];
      console.log(`Using fallback recipient: ${fallbackRecipient.name} (${fallbackRecipient.primaryEmail})`);
      
      for (const request of orphanedRequests) {
        console.log(`Fixing request: ${request.title}`);
        
        // Update the request to use the fallback recipient
        await RecommendationRequest.findByIdAndUpdate(request._id, {
          recipientId: fallbackRecipient._id
        });
        
        console.log(`✅ Fixed request: ${request.title}`);
      }
    }
    
    console.log('All orphaned requests have been fixed!');
    
  } catch (error) {
    console.error('Error fixing requests:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixOrphanedRequests(); 