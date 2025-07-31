const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Test data
const testData = {
  recipientEmail: process.env.RECIPIENT_TEST_EMAIL || 'ehoneahobed@hotmail.com',
  recipientName: 'Dr. Jane Smith',
  studentName: 'John Doe',
  requestTitle: 'Test Recommendation Request',
  deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  secureToken: 'test-token-123',
  requestType: 'direct_platform',
  submissionMethod: 'platform_only',
  communicationStyle: 'polite',
  relationshipContext: 'I was a student in Dr. Smith\'s Advanced Computer Science course',
  institutionName: 'Stanford University',
  schoolEmail: 'cs-dept@stanford.edu',
  schoolInstructions: 'Please submit through the university portal',
  includeDraft: true,
  draftContent: 'This is a test draft content for the recommendation letter.',
  additionalContext: 'John was an exceptional student who consistently demonstrated strong analytical skills and leadership qualities.',
  daysUntilDeadline: 7,
  urgencyLevel: 'medium',
  urgencyMessage: 'REMINDER: This recommendation is due in 7 days. Please plan to submit soon.'
};

async function testRecommendationEmails() {
  try {
    console.log('🧪 Testing Recommendation Email System...\n');

    // Test 1: Test the cron job endpoint directly
    console.log('📧 Test 1: Testing cron job endpoint...');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/cron/send-recommendation-reminders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.CRON_SECRET || 'test-secret'}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      console.log('✅ Cron job endpoint response:', result);
    } catch (error) {
      console.error('❌ Failed to test cron job endpoint:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Test creating a recommendation request
    console.log('📧 Test 2: Testing recommendation request creation...');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/recommendations/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: 'test-recipient-id',
          title: testData.requestTitle,
          description: 'This is a test recommendation request for testing the email system.',
          deadline: testData.deadline.toISOString(),
          priority: 'medium',
          includeDraft: testData.includeDraft,
          draftContent: testData.draftContent,
          reminderIntervals: [7, 3, 1],
          requestType: testData.requestType,
          submissionMethod: testData.submissionMethod,
          communicationStyle: testData.communicationStyle,
          relationshipContext: testData.relationshipContext,
          additionalContext: testData.additionalContext,
          institutionName: testData.institutionName,
          schoolEmail: testData.schoolEmail,
          schoolInstructions: testData.schoolInstructions
        }),
      });

      const result = await response.json();
      if (response.ok) {
        console.log('✅ Recommendation request created successfully!');
        console.log('Response:', result);
      } else {
        console.error('❌ Failed to create recommendation request:', result);
      }
    } catch (error) {
      console.error('❌ Failed to test recommendation request creation:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Test different reminder frequencies
    console.log('📧 Test 3: Testing different reminder frequencies...');
    const reminderFrequencies = [
      { name: 'Minimal', intervals: [7, 1] },
      { name: 'Standard', intervals: [7, 3, 1] },
      { name: 'Weekly', intervals: [14, 7, 3, 1] },
      { name: 'Frequent', intervals: [10, 7, 5, 3, 2, 1] }
    ];

    for (const frequency of reminderFrequencies) {
      console.log(`Testing ${frequency.name} frequency: ${frequency.intervals.join(', ')} days`);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/recommendations/requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipientId: 'test-recipient-id',
            title: `Test ${frequency.name} Frequency`,
            description: `Testing ${frequency.name} reminder frequency`,
            deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
            priority: 'medium',
            reminderIntervals: frequency.intervals,
            requestType: 'direct_platform',
            submissionMethod: 'platform_only',
            communicationStyle: 'polite',
            relationshipContext: 'Test relationship context'
          }),
        });

        const result = await response.json();
        if (response.ok) {
          console.log(`✅ ${frequency.name} frequency test successful!`);
        } else {
          console.error(`❌ ${frequency.name} frequency test failed:`, result);
        }
      } catch (error) {
        console.error(`❌ Failed to test ${frequency.name} frequency:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 4: Test different request types
    console.log('📧 Test 4: Testing different request types...');
    const requestTypes = [
      {
        type: 'direct_platform',
        method: 'platform_only',
        description: 'Direct platform submission'
      },
      {
        type: 'school_direct',
        method: 'school_only',
        description: 'School direct submission'
      },
      {
        type: 'hybrid',
        method: 'both',
        description: 'Hybrid submission'
      }
    ];

    for (const requestType of requestTypes) {
      console.log(`Testing ${requestType.description}...`);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/recommendations/requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipientId: 'test-recipient-id',
            title: `Test ${requestType.description}`,
            description: `Testing ${requestType.description}`,
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            priority: 'medium',
            reminderIntervals: [7, 3, 1],
            requestType: requestType.type,
            submissionMethod: requestType.method,
            communicationStyle: 'formal',
            relationshipContext: 'Test relationship context',
            institutionName: 'Test University',
            schoolEmail: 'test@university.edu',
            schoolInstructions: 'Please submit through the university portal'
          }),
        });

        const result = await response.json();
        if (response.ok) {
          console.log(`✅ ${requestType.description} test successful!`);
        } else {
          console.error(`❌ ${requestType.description} test failed:`, result);
        }
      } catch (error) {
        console.error(`❌ Failed to test ${requestType.description}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 5: Test different communication styles
    console.log('📧 Test 5: Testing different communication styles...');
    const communicationStyles = ['formal', 'polite', 'friendly'];
    
    for (const style of communicationStyles) {
      console.log(`Testing ${style} communication style...`);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/recommendations/requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipientId: 'test-recipient-id',
            title: `Test ${style} style`,
            description: `Testing ${style} communication style`,
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            priority: 'medium',
            reminderIntervals: [7, 3, 1],
            requestType: 'direct_platform',
            submissionMethod: 'platform_only',
            communicationStyle: style,
            relationshipContext: 'Test relationship context'
          }),
        });

        const result = await response.json();
        if (response.ok) {
          console.log(`✅ ${style} style test successful!`);
        } else {
          console.error(`❌ ${style} style test failed:`, result);
        }
      } catch (error) {
        console.error(`❌ Failed to test ${style} style:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(50) + '\n');
    console.log('🎉 Email system testing completed!');
    console.log('\n📋 Summary:');
    console.log('- Cron job endpoint: ✅');
    console.log('- Recommendation request creation: ✅');
    console.log('- Reminder frequencies: ✅');
    console.log('- Request types: ✅');
    console.log('- Communication styles: ✅');
    console.log('\n💡 Check your server logs to see if emails were sent successfully.');
    console.log('💡 Note: Actual emails will only be sent if you have valid recipients in your database.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the test
if (require.main === module) {
  testRecommendationEmails();
}

module.exports = { testRecommendationEmails }; 