import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send recommendation request email to recipient
 */
export async function sendRecommendationRequest(
  recipientEmail: string,
  recipientName: string,
  studentName: string,
  requestTitle: string,
  deadline: Date,
  secureToken: string,
  requestType: string,
  submissionMethod: string,
  communicationStyle: string,
  relationshipContext: string,
  institutionName?: string,
  schoolEmail?: string,
  schoolInstructions?: string,
  includeDraft: boolean = false,
  draftContent?: string,
  additionalContext?: string
) {
  const deadlineFormatted = deadline.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/recommendation/${secureToken}`;

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

  let htmlContent = `
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
      from: 'Eddura <noreply@eddura.com>',
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

/**
 * Send reminder email to recipient
 */
export async function sendRecommendationReminder(
  recipientEmail: string,
  recipientName: string,
  studentName: string,
  requestTitle: string,
  deadline: Date,
  secureToken: string,
  daysUntilDeadline: number,
  requestType: string,
  submissionMethod: string,
  institutionName?: string,
  urgencyLevel?: 'low' | 'medium' | 'high' | 'critical',
  urgencyMessage?: string
) {
  const deadlineFormatted = deadline.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/recommendation/${secureToken}`;

  // Generate subject with urgency indicator
  const urgencyPrefix = urgencyLevel === 'critical' ? '🚨 URGENT: ' : 
                       urgencyLevel === 'high' ? '⚠️ IMPORTANT: ' : 
                       urgencyLevel === 'medium' ? '📅 REMINDER: ' : '📧 ';
  
  const subject = `${urgencyPrefix}Recommendation Letter for ${studentName} - Due in ${daysUntilDeadline} day${daysUntilDeadline > 1 ? 's' : ''}`;

  const getSubmissionInstructions = () => {
    if (requestType === 'school_direct' && submissionMethod === 'school_only') {
      return `
        <p><strong>Reminder:</strong> The institution (${institutionName || 'the school'}) should be sending you a direct email with their submission link. Please check your email for their request.</p>
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

  // Generate urgency styling
  const getUrgencyStyling = () => {
    switch (urgencyLevel) {
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

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">${urgencyStyle.icon} Recommendation Letter Reminder</h2>
      
      <p>Dear ${recipientName},</p>
      
      ${urgencyMessage ? `
        <div style="background-color: ${urgencyStyle.backgroundColor}; border: 1px solid ${urgencyStyle.borderColor}; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: ${urgencyStyle.textColor}; font-weight: bold;">${urgencyMessage}</h4>
        </div>
      ` : ''}
      
      <p>This is a reminder that you have a pending recommendation letter request from ${studentName}.</p>
      
      <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${requestTitle}</h3>
        <p><strong>Deadline:</strong> ${deadlineFormatted}</p>
        <p><strong>Time remaining:</strong> ${daysUntilDeadline} day${daysUntilDeadline > 1 ? 's' : ''}</p>
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
      from: 'Eddura <noreply@eddura.com>',
      to: [recipientEmail],
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Error sending recommendation reminder email:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to send recommendation reminder email:', error);
    throw error;
  }
}

/**
 * Send confirmation email to student when letter is received
 */
export async function sendRecommendationReceived(
  studentEmail: string,
  studentName: string,
  recipientName: string,
  requestTitle: string
) {
  const subject = `Recommendation Letter Received - ${requestTitle}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #28a745;">Recommendation Letter Received!</h2>
      
      <p>Dear ${studentName},</p>
      
      <p>Great news! Your recommendation letter has been submitted by ${recipientName}.</p>
      
      <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #155724;">${requestTitle}</h3>
        <p><strong>Submitted by:</strong> ${recipientName}</p>
        <p><strong>Status:</strong> <span style="color: #28a745;">✓ Received</span></p>
      </div>
      
      <p>You can view the details of this recommendation request in your dashboard.</p>
      
      <p>Thank you for using Eddura!</p>
      
      <p>Best regards,<br>The Eddura Team</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #666;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Eddura <noreply@eddura.com>',
      to: [studentEmail],
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Error sending recommendation received email:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to send recommendation received email:', error);
    throw error;
  }
}