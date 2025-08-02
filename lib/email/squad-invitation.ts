import { sendEmail } from '@/lib/email';

export interface SquadInvitationData {
  invitedUserEmail: string;
  invitedUserName?: string;
  squadName: string;
  squadDescription: string;
  inviterName: string;
  inviterEmail: string;
  message?: string;
  joinUrl: string;
  shortCode?: string;
}

export const sendSquadInvitationEmail = async (data: SquadInvitationData): Promise<boolean> => {
  const subject = `You've been invited to join "${data.squadName}" on Eddura`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Squad Invitation</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .content {
          padding: 30px 20px;
        }
        .squad-info {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .button { 
          display: inline-block; 
          padding: 15px 30px; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white; 
          text-decoration: none; 
          border-radius: 8px; 
          margin: 20px 0;
          font-weight: bold;
          text-align: center;
          transition: transform 0.2s;
        }
        .button:hover {
          transform: translateY(-2px);
        }
        .shortcode-section {
          background: #e3f2fd;
          border: 1px solid #2196f3;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
        }
        .shortcode {
          font-size: 24px;
          font-weight: bold;
          color: #1976d2;
          letter-spacing: 2px;
          padding: 10px;
          background: white;
          border-radius: 4px;
          display: inline-block;
          margin: 10px 0;
        }
        .footer { 
          margin-top: 30px; 
          padding-top: 20px; 
          border-top: 1px solid #eee; 
          font-size: 14px; 
          color: #666;
          text-align: center;
        }
        .message-box {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">🎯 Squad Invitation</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">You've been invited to join a collaborative squad!</p>
        </div>
        
        <div class="content">
          <p>Hello ${data.invitedUserName || 'there'},</p>
          
          <p><strong>${data.inviterName}</strong> has invited you to join their squad on Eddura!</p>
          
          <div class="squad-info">
            <h3 style="margin-top: 0; color: #333;">${data.squadName}</h3>
            <p style="margin-bottom: 0; color: #666;">${data.squadDescription}</p>
          </div>
          
          ${data.message ? `
            <div class="message-box">
              <p><strong>Personal message from ${data.inviterName}:</strong></p>
              <p style="margin-bottom: 0; font-style: italic;">"${data.message}"</p>
            </div>
          ` : ''}
          
          <p>Join this squad to collaborate on applications, share documents, and support each other's academic journey!</p>
          
          <div style="text-align: center;">
            <a href="${data.joinUrl}" class="button">
              🚀 Join Squad Now
            </a>
          </div>
          
          ${data.shortCode ? `
            <div class="shortcode-section">
              <h4 style="margin-top: 0; color: #1976d2;">Or use this shortcode to join:</h4>
              <div class="shortcode">${data.shortCode}</div>
              <p style="margin-bottom: 0; font-size: 14px;">
                Enter this code on the Eddura platform to join the squad
              </p>
            </div>
          ` : ''}
          
          <p style="font-size: 14px; color: #666;">
            If the button doesn't work, you can copy and paste this link into your browser:<br>
            <span style="word-break: break-all; color: #007bff;">${data.joinUrl}</span>
          </p>
          
          <div class="footer">
            <p>This invitation was sent from the Eddura platform.</p>
            <p>If you have any questions, please contact ${data.inviterName} at ${data.inviterEmail}</p>
            <p>Happy collaborating! 🎓</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: data.invitedUserEmail,
    subject,
    html,
  });
};

export const sendSquadInvitationReminderEmail = async (data: SquadInvitationData): Promise<boolean> => {
  const subject = `Reminder: Join "${data.squadName}" on Eddura`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Squad Invitation Reminder</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header { 
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .content {
          padding: 30px 20px;
        }
        .reminder-box {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
        }
        .button { 
          display: inline-block; 
          padding: 15px 30px; 
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
          color: white; 
          text-decoration: none; 
          border-radius: 8px; 
          margin: 20px 0;
          font-weight: bold;
          text-align: center;
        }
        .footer { 
          margin-top: 30px; 
          padding-top: 20px; 
          border-top: 1px solid #eee; 
          font-size: 14px; 
          color: #666;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">⏰ Invitation Reminder</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Don't miss out on this opportunity!</p>
        </div>
        
        <div class="content">
          <p>Hello ${data.invitedUserName || 'there'},</p>
          
          <div class="reminder-box">
            <h3 style="margin-top: 0; color: #856404;">Friendly Reminder</h3>
            <p style="margin-bottom: 0; color: #856404;">
              <strong>${data.inviterName}</strong> invited you to join their squad, but you haven't accepted yet.
            </p>
          </div>
          
          <p>Join <strong>${data.squadName}</strong> to start collaborating with your peers!</p>
          
          <div style="text-align: center;">
            <a href="${data.joinUrl}" class="button">
              🚀 Join Squad Now
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666;">
            If the button doesn't work, you can copy and paste this link into your browser:<br>
            <span style="word-break: break-all; color: #007bff;">${data.joinUrl}</span>
          </p>
          
          <div class="footer">
            <p>This reminder was sent from the Eddura platform.</p>
            <p>If you have any questions, please contact ${data.inviterName} at ${data.inviterEmail}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: data.invitedUserEmail,
    subject,
    html,
  });
};