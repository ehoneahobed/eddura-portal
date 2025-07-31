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
  reminderIntervals: [Number],
  reminderFrequency: String,
  nextReminderDate: Date,
  lastReminderSent: Date,
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

async function testRecommendationReminders() {
  try {
    console.log('Testing recommendation reminder system...');
    
    const now = new Date();
    
    // Find requests that need reminders
    const requestsNeedingReminders = await RecommendationRequest.find({
      status: { $in: ['pending', 'sent'] },
      nextReminderDate: { $lte: now },
      deadline: { $gt: now } // Only for requests that haven't passed deadline
    }).populate('recipientId', 'name emails primaryEmail title institution department')
      .populate('studentId', 'name email');

    console.log(`Found ${requestsNeedingReminders.length} requests needing reminders`);
    
    for (const request of requestsNeedingReminders) {
      console.log(`\nRequest ID: ${request._id}`);
      console.log(`Title: ${request.title}`);
      console.log(`Deadline: ${request.deadline}`);
      console.log(`Status: ${request.status}`);
      console.log(`Reminder Intervals: ${request.reminderIntervals}`);
      console.log(`Reminder Frequency: ${request.reminderFrequency}`);
      console.log(`Next Reminder Date: ${request.nextReminderDate}`);
      
      if (request.recipientId) {
        const recipient = request.recipientId;
        console.log(`Recipient: ${recipient.name} (${recipient.primaryEmail})`);
      }
      
      if (request.studentId) {
        const student = request.studentId;
        console.log(`Student: ${student.name || student.email}`);
      }
      
      // Calculate days until deadline
      const deadline = new Date(request.deadline);
      const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`Days until deadline: ${daysUntilDeadline}`);
      
      // Determine which reminder this is
      const reminderIndex = request.reminderIntervals.findIndex(interval => 
        daysUntilDeadline <= interval
      );
      
      console.log(`Reminder index: ${reminderIndex}`);
      
      if (reminderIndex !== -1) {
        console.log(`✅ Would send reminder #${reminderIndex + 1}`);
      } else {
        console.log(`❌ No reminder needed`);
      }
    }
    
    // Check for overdue requests
    const overdueRequests = await RecommendationRequest.find({
      status: { $in: ['pending', 'sent'] },
      deadline: { $lt: now }
    });
    
    console.log(`\nFound ${overdueRequests.length} overdue requests`);
    if (overdueRequests.length > 0) {
      overdueRequests.forEach(req => {
        console.log(`- ${req.title} (Deadline: ${req.deadline})`);
      });
    }
    
  } catch (error) {
    console.error('Error testing reminders:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testRecommendationReminders(); 