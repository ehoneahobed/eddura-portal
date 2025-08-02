import connectDB from '../lib/mongodb';
import UserActivity from '../models/UserActivity';
import User from '../models/User';

async function seedUserActivities() {
  try {
    await connectDB();
    
    // Get all users
    const users = await User.find({}).limit(5); // Limit to first 5 users for demo
    
    if (users.length === 0) {
      console.log('No users found. Please create users first.');
      return;
    }

    console.log(`Found ${users.length} users. Seeding activities...`);

    for (const user of users) {
      // Clear existing activities for this user
      await UserActivity.deleteMany({ userId: user._id });
      
      // Create sample activities
      const activities = [
        {
          userId: user._id,
          type: 'quiz_completed',
          title: 'Quiz Completed',
          description: 'Career discovery quiz finished',
          metadata: { quizScore: 85 },
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        },
        {
          userId: user._id,
          type: 'program_viewed',
          title: 'Program Viewed',
          description: 'Viewed program: Stanford Data Science Program',
          metadata: { programName: 'Stanford Data Science Program' },
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
        },
        {
          userId: user._id,
          type: 'scholarship_viewed',
          title: 'Scholarship Viewed',
          description: 'Viewed scholarship: Google Generation Scholarship',
          metadata: { scholarshipName: 'Google Generation Scholarship' },
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
        },
        {
          userId: user._id,
          type: 'application_started',
          title: 'Application Started',
          description: 'Started application: MIT Computer Science Application',
          metadata: { applicationName: 'MIT Computer Science Application' },
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
        },
        {
          userId: user._id,
          type: 'document_uploaded',
          title: 'Document Uploaded',
          description: 'Uploaded document: Resume.pdf',
          metadata: { documentName: 'Resume.pdf', documentType: 'resume' },
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
        },
        {
          userId: user._id,
          type: 'recommendation_viewed',
          title: 'Recommendation Viewed',
          description: 'Viewed career recommendations',
          metadata: { recommendationType: 'career' },
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
        },
        {
          userId: user._id,
          type: 'login',
          title: 'User Login',
          description: 'User logged into the platform',
          metadata: {},
          timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
        }
      ];

      // Insert activities
      await UserActivity.insertMany(activities);
      console.log(`Seeded ${activities.length} activities for user: ${user.firstName} ${user.lastName}`);
    }

    console.log('User activities seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding user activities:', error);
    process.exit(1);
  }
}

// Run the script
seedUserActivities();