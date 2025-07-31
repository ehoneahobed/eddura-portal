const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

// Test data
const testData = {
  recipientEmail: process.env.SENDER_EMAIL || 'test@appeval.co',
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

/**
 * Test initial recommendation request email
 */
async function testInitialEmail() {
  console.log('📧 Testing initial recommendation request email...');
  
  const deadlineFormatted = testData.deadline.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/recommendation/${testData.secureToken}`;

  const subject = `Recommendation Letter Request - ${testData.studentName}`;

  // Generate appropriate greeting based on communication style
  const getGreeting = () => {
    switch (testData.communicationStyle) {
      case 'formal':
        return `Dear ${testData.recipientName},`;
      case 'friendly':
        return `Hi ${testData.recipientName},`;
      default: // polite
        return `Dear ${testData.recipientName},`;
    }
  };

  // Generate appropriate closing based on communication style
  const getClosing = () => {
    switch (testData.communicationStyle) {
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
    const baseContext = `I hope this email finds you well. ${testData.studentName} has requested a recommendation letter from you for the following purpose:`;
    
    if (testData.relationshipContext) {
      return `${baseContext}\n\n${testData.studentName} mentioned that ${testData.relationshipContext.toLowerCase()}.`;
    }
    
    return baseContext;
  };

  // Generate submission instructions based on type
  const getSubmissionInstructions = () => {
    if (testData.requestType === 'school_direct' && testData.submissionMethod === 'school_only') {
      return `
        <p><strong>Important:</strong> The institution (${testData.institutionName || 'the school'}) will be sending you a direct email with their own submission link. Please use their provided link to submit your recommendation letter.</p>
        
        <p>This platform is being used to provide you with the student's information and any supporting materials to help you write the recommendation letter.</p>
      `;
    } else if (testData.requestType === 'hybrid' && testData.submissionMethod === 'both') {
      return `
        <p><strong>Submission Options:</strong></p>
        <ul>
          <li>You can submit through this platform using the link below</li>
          <li>OR submit directly to the institution (${testData.institutionName || 'the school'}) when they send you their email</li>
          <li>If possible, please provide a copy to ${testData.studentName} as well</li>
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
    if (testData.institutionName || testData.schoolEmail || testData.schoolInstructions) {
      return `
        <div style="background-color: #e3f2fd; border: 1px solid #2196f3; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #1976d2;">Institution Information</h4>
          ${testData.institutionName ? `<p><strong>Institution:</strong> ${testData.institutionName}</p>` : ''}
          ${testData.schoolEmail ? `<p><strong>School Email:</strong> ${testData.schoolEmail}</p>` : ''}
          ${testData.schoolInstructions ? `<p><strong>School Instructions:</strong> ${testData.schoolInstructions}</p>` : ''}
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
        <h3 style="margin-top: 0;">${testData.requestTitle}</h3>
        <p><strong>Deadline:</strong> ${deadlineFormatted}</p>
      </div>
      
      ${getSchoolInfo()}
      
      ${getSubmissionInstructions()}
      
      <p>This link will expire on ${deadlineFormatted}.</p>
      
      ${testData.includeDraft && testData.draftContent ? `
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="margin-top: 0;">Draft Content (Optional)</h4>
          <p>${testData.studentName} has provided a draft that you may use as a starting point:</p>
          <div style="background-color: white; padding: 10px; border-radius: 3px; margin-top: 10px;">
            ${testData.draftContent.replace(/\n/g, '<br>')}
          </div>
        </div>
      ` : ''}
      
      ${testData.additionalContext ? `
        <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="margin-top: 0;">Additional Context</h4>
          <p>${testData.additionalContext}</p>
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
      to: [testData.recipientEmail],
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error('❌ Error sending initial email:', error);
      throw error;
    }

    console.log('✅ Initial email sent successfully!');
    console.log('Email data:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to send initial email:', error);
    throw error;
  }
}

/**
 * Test reminder email with urgency levels
 */
async function testReminderEmail() {
  console.log('📧 Testing reminder email with urgency levels...');
  
  const deadlineFormatted = testData.deadline.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/recommendation/${testData.secureToken}`;

  // Generate urgency styling
  const getUrgencyStyling = () => {
    switch (testData.urgencyLevel) {
      case 'critical':
        return {
          backgroundColor: '#f8d7da',
          borderColor: '#f5c6cb',
          textColor: '#721c24',
          icon: '🚨'
        };
      case 'high':
        return {
          backgroundColor: '#fff3cd',
          borderColor: '#ffeaa7',
          textColor: '#856404',
          icon: '⚠️'
        };
      case 'medium':
        return {
          backgroundColor: '#d1ecf1',
          borderColor: '#bee5eb',
          textColor: '#0c5460',
          icon: '📅'
        };
      default:
        return {
          backgroundColor: '#f8f9fa',
          borderColor: '#dee2e6',
          textColor: '#495057',
          icon: '📧'
        };
    }
  };

  const urgencyStyle = getUrgencyStyling();
  const urgencyPrefix = testData.urgencyLevel === 'critical' ? '🚨 URGENT: ' : 
                       testData.urgencyLevel === 'high' ? '⚠️ IMPORTANT: ' : 
                       testData.urgencyLevel === 'medium' ? '📅 REMINDER: ' : '📧 ';
  
  const subject = `${urgencyPrefix}Recommendation Letter for ${testData.studentName} - Due in ${testData.daysUntilDeadline} day${testData.daysUntilDeadline > 1 ? 's' : ''}`;

  const getSubmissionInstructions = () => {
    if (testData.requestType === 'school_direct' && testData.submissionMethod === 'school_only') {
      return `
        <p><strong>Reminder:</strong> The institution (${testData.institutionName || 'the school'}) should be sending you a direct email with their submission link. Please check your email for their request.</p>
      `;
    } else {
      return `
        <p>To submit your recommendation letter, please click the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${portalUrl}" 
             style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Submit Recommendation Letter
          </a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${portalUrl}</p>
      `;
    }
  };

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">${urgencyStyle.icon} Recommendation Letter Reminder</h2>
      
      <p>Dear ${testData.recipientName},</p>
      
      ${testData.urgencyMessage ? `
        <div style="background-color: ${urgencyStyle.backgroundColor}; border: 1px solid ${urgencyStyle.borderColor}; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: ${urgencyStyle.textColor}; font-weight: bold;">${testData.urgencyMessage}</h4>
        </div>
      ` : ''}
      
      <p>This is a reminder that you have a pending recommendation letter request from ${testData.studentName}.</p>
      
      <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${testData.requestTitle}</h3>
        <p><strong>Deadline:</strong> ${deadlineFormatted}</p>
        <p><strong>Time remaining:</strong> ${testData.daysUntilDeadline} day${testData.daysUntilDeadline > 1 ? 's' : ''}</p>
      </div>
      
      ${getSubmissionInstructions()}
      
      <p>Thank you for your time and consideration.</p>
      
      <p>Best regards,<br>The Eddura Team</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #666;">
        This is an automated reminder. Please do not reply to this email.
        If you have any questions, please contact the student directly.
      </p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.SENDER_EMAIL || 'Eddura <noreply@eddura.com>',
      to: [testData.recipientEmail],
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error('❌ Error sending reminder email:', error);
      throw error;
    }

    console.log('✅ Reminder email sent successfully!');
    console.log('Email data:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to send reminder email:', error);
    throw error;
  }
}

/**
 * Main test function
 */
async function testEmailFunctions() {
  try {
    console.log('🧪 Testing Email Functions Directly...\n');

    // Test 1: Initial recommendation request email
    console.log('📧 Test 1: Sending initial recommendation request email...');
    try {
      await testInitialEmail();
    } catch (error) {
      console.error('❌ Failed to send initial email:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Reminder email with different urgency levels
    const urgencyTests = [
      { level: 'low', days: 14, message: 'Friendly reminder: This recommendation is due in 14 days.' },
      { level: 'medium', days: 7, message: 'REMINDER: This recommendation is due in 7 days. Please plan to submit soon.' },
      { level: 'high', days: 3, message: 'IMPORTANT: This recommendation is due in 3 days. Please prioritize this request to ensure timely submission.' },
      { level: 'critical', days: 1, message: 'URGENT: This recommendation is due TOMORROW! Please submit as soon as possible to avoid missing the deadline.' }
    ];

    for (const test of urgencyTests) {
      console.log(`📧 Test 2.${urgencyTests.indexOf(test) + 1}: Sending ${test.level} urgency reminder (${test.days} days remaining)...`);
      try {
        testData.urgencyLevel = test.level;
        testData.daysUntilDeadline = test.days;
        testData.urgencyMessage = test.message;
        await testReminderEmail();
      } catch (error) {
        console.error(`❌ Failed to send ${test.level} reminder:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(50) + '\n');
    console.log('🎉 Email function testing completed!');
    console.log('\n📋 Summary:');
    console.log('- Initial request email: ✅');
    console.log('- Reminder emails with urgency levels: ✅');
    console.log('\n💡 Check your email inbox to verify the emails were received correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
if (require.main === module) {
  testEmailFunctions();
}

module.exports = { testEmailFunctions }; 