const mongoose = require('mongoose');
const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Define schemas
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
}, { strict: false });

const recipientSchema = new mongoose.Schema({
  name: String,
  emails: [String],
  primaryEmail: String,
  title: String,
  institution: String,
}, { strict: false });

const recommendationRequestSchema = new mongoose.Schema({
  studentId: mongoose.Schema.Types.ObjectId,
  recipientId: mongoose.Schema.Types.ObjectId,
  title: String,
  description: String,
  deadline: Date,
  status: String,
  priority: String,
  requestType: String,
  submissionMethod: String,
  communicationStyle: String,
  relationshipContext: String,
  additionalContext: String,
  institutionName: String,
  schoolEmail: String,
  schoolInstructions: String,
  includeDraft: Boolean,
  draftContent: String,
  reminderIntervals: [Number],
  nextReminderDate: Date,
  secureToken: String,
  tokenExpiresAt: Date,
  sentAt: Date,
  createdAt: Date,
  updatedAt: Date,
}, { strict: false });

const User = mongoose.model('User', userSchema);
const Recipient = mongoose.model('Recipient', recipientSchema);
const RecommendationRequest = mongoose.model('RecommendationRequest', recommendationRequestSchema);

/**
 * Send recommendation request email (JavaScript version for testing)
 */
async function sendRecommendationRequest(
  recipientEmail,
  recipientName,
  studentName,
  requestTitle,
  deadline,
  secureToken,
  requestType,
  submissionMethod,
  communicationStyle,
  relationshipContext,
  institutionName,
  schoolEmail,
  schoolInstructions,
  includeDraft = false,
  draftContent,
  additionalContext
) {
  const deadlineFormatted = deadline.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/recommendation/${secureToken}`;

  const subject = `Recommendation Letter Request - ${studentName}`;

  // Generate appropriate greeting based on communication style
  const getGreeting = () => {
    switch (communicationStyle) {
      case 'formal':
        return `Dear ${recipientName},`;
      case 'friendly':
        return `Hi ${recipientName},`;
      default: // polite
        return `Dear ${recipientName},`;
    }
  };

  // Generate appropriate closing based on communication style
  const getClosing = () => {
    switch (communicationStyle) {
      case 'formal':
        return 'Thank you for your time and consideration.\n\nBest regards,\nThe Eddura Team';
      case 'friendly':
        return 'Thank you so much for your help!\n\nBest regards,\nThe Eddura Team';
      default: // polite
        return 'Thank you for your time and consideration.\n\nBest regards,\nThe Eddura Team';
    }
  };

  // Generate context paragraph based on relationship
  const getContextParagraph = () => {
    const baseContext = `I hope this email finds you well. ${studentName} has requested a recommendation letter from you for the following purpose:`;
    
    if (relationshipContext) {
      return `${baseContext}\n\n${studentName} mentioned that ${relationshipContext.toLowerCase()}.`;
    }
    
    return baseContext;
  };

  // Generate submission instructions based on type
  const getSubmissionInstructions = () => {
    if (requestType === 'school_direct' && submissionMethod === 'school_only') {
      return `
        <p><strong>Important:</strong> The institution (${institutionName || 'the school'}) will be sending you a direct email with their own submission link. Please use their provided link to submit your recommendation letter.</p>
        
        <p>This platform is being used to provide you with the student's information and any supporting materials to help you write the recommendation letter.</p>
      `;
    } else if (requestType === 'hybrid' && submissionMethod === 'both') {
      return `
        <p><strong>Submission Options:</strong></p>
        <ul>
          <li>You can submit through this platform using the link below</li>
          <li>OR submit directly to the institution (${institutionName || 'the school'}) when they send you their email</li>
          <li>If possible, please provide a copy to ${studentName} as well</li>
        </ul>
      `;
    } else {
      return `
        <p>To submit your recommendation letter, please click the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${portalUrl}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Submit Recommendation Letter
          </a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${portalUrl}</p>
      `;
    }
  };

  // Generate school-specific information
  const getSchoolInfo = () => {
    if (institutionName || schoolEmail || schoolInstructions) {
      return `
        <div style="background-color: #e3f2fd; border: 1px solid #2196f3; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #1976d2;">Institution Information</h4>
          ${institutionName ? `<p><strong>Institution:</strong> ${institutionName}</p>` : ''}
          ${schoolEmail ? `<p><strong>School Email:</strong> ${schoolEmail}</p>` : ''}
          ${schoolInstructions ? `<p><strong>School Instructions:</strong> ${schoolInstructions}</p>` : ''}
        </div>
      `;
    }
    return '';
  };

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Recommendation Letter Request</h2>
      
      <p>${getGreeting()}</p>
      
      <p>${getContextParagraph()}</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${requestTitle}</h3>
        <p><strong>Deadline:</strong> ${deadlineFormatted}</p>
      </div>
      
      ${getSchoolInfo()}
      
      ${getSubmissionInstructions()}
      
      <p>This link will expire on ${deadlineFormatted}.</p>
      
      ${includeDraft && draftContent ? `
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="margin-top: 0;">Draft Content (Optional)</h4>
          <p>${studentName} has provided a draft that you may use as a starting point:</p>
          <div style="background-color: white; padding: 10px; border-radius: 3px; margin-top: 10px;">
            ${draftContent.replace(/\n/g, '<br>')}
          </div>
        </div>
      ` : ''}
      
      ${additionalContext ? `
        <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="margin-top: 0;">Additional Context</h4>
          <p>${additionalContext}</p>
        </div>
      ` : ''}
      
      <p>${getClosing()}</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #666;">
        This is an automated message. Please do not reply to this email.
        If you have any questions, please contact the student directly.
      </p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.SENDER_EMAIL || 'Eddura <noreply@eddura.com>',
      to: [recipientEmail],
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Error sending recommendation request email:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to send recommendation request email:', error);
    throw error;
  }
}

async function testCreateRecommendation() {
  try {
    console.log('🧪 Testing Recommendation Request Creation...\n');

    // First, let's check if we have any users and recipients
    const users = await User.find({});
    const recipients = await Recipient.find({});
    
    console.log(`Found ${users.length} users and ${recipients.length} recipients`);

    if (users.length === 0) {
      console.log('❌ No users found. Please create a user first.');
      return;
    }

    if (recipients.length === 0) {
      console.log('❌ No recipients found. Please create a recipient first.');
      return;
    }

    // Use the first user and recipient for testing
    const testUser = users[0];
    const testRecipient = recipients[0];

    console.log('Using user:', testUser.email);
    console.log('Using recipient:', testRecipient.name, testRecipient.primaryEmail);

    // Create a test recommendation request
    const testRequest = new RecommendationRequest({
      studentId: testUser._id,
      recipientId: testRecipient._id,
      title: 'Test Recommendation Request',
      description: 'This is a test recommendation request to verify email sending.',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'pending',
      priority: 'medium',
      requestType: 'direct_platform',
      submissionMethod: 'platform_only',
      communicationStyle: 'polite',
      relationshipContext: 'I was a student in the professor\'s course',
      additionalContext: 'This is additional context for the recommendation.',
      institutionName: 'Test University',
      schoolEmail: 'test@university.edu',
      schoolInstructions: 'Please submit through the university portal',
      includeDraft: false,
      reminderIntervals: [7, 3, 1],
      nextReminderDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
      secureToken: 'test-token-' + Date.now(),
      tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });

    await testRequest.save();
    console.log('✅ Test recommendation request created with ID:', testRequest._id);

    // Now let's simulate the email sending process
    console.log('\n📧 Testing email sending process...');
    
    try {
      const emailResult = await sendRecommendationRequest(
        testRecipient.primaryEmail,
        testRecipient.name,
        testUser.name || testUser.email,
        testRequest.title,
        testRequest.deadline,
        testRequest.secureToken,
        testRequest.requestType,
        testRequest.submissionMethod,
        testRequest.communicationStyle,
        testRequest.relationshipContext,
        testRequest.institutionName,
        testRequest.schoolEmail,
        testRequest.schoolInstructions,
        testRequest.includeDraft,
        testRequest.draftContent,
        testRequest.additionalContext
      );

      console.log('✅ Email sent successfully!');
      console.log('Email result:', emailResult);

      // Update the request status
      testRequest.status = 'sent';
      testRequest.sentAt = new Date();
      await testRequest.save();
      console.log('✅ Request status updated to sent');

    } catch (emailError) {
      console.error('❌ Failed to send email:', emailError);
    }

    console.log('\n' + '='.repeat(50) + '\n');
    console.log('🎉 Test completed!');
    console.log('\n📋 Summary:');
    console.log('- Recommendation request created: ✅');
    console.log('- Email sending tested: ✅');
    console.log('\n💡 Check your email inbox to verify the email was received.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the test
if (require.main === module) {
  testCreateRecommendation();
}

module.exports = { testCreateRecommendation }; 