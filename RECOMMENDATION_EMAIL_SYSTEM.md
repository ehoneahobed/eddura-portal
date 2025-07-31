# Recommendation Email Notification System

## Overview

The recommendation email notification system provides automated email communication between students and their recommenders, with configurable reminder frequencies and urgency drivers to ensure timely submission of recommendation letters.

## Features

### 1. Initial Email Notification
- **Trigger**: When a recommendation request is created
- **Recipients**: The selected recommender (professor, supervisor, etc.)
- **Content**: 
  - Request details and deadline
  - Submission instructions based on request type
  - Draft content (if provided)
  - Secure submission link
  - Institution-specific information

### 2. Automated Reminder System
- **Frequency**: Configurable reminder intervals
- **Urgency Levels**: Dynamic urgency based on deadline proximity
- **Cron Job**: Runs every hour via Vercel cron jobs

### 3. Configurable Reminder Frequencies

#### Default (7, 3, 1 days)
- Most common setting
- Balanced approach for most scenarios
- 3 reminders total

#### Weekly (14, 7, 3, 1 days)
- For longer deadlines
- More frequent early reminders
- 4 reminders total

#### Frequent (10, 7, 5, 3, 2, 1 days)
- For high-priority requests
- Maximum reminder frequency
- 6 reminders total

#### Minimal (3, 1 days)
- For trusted recommenders
- Minimal interruption
- 2 reminders total

### 4. Urgency Drivers

The system automatically adjusts email urgency based on deadline proximity:

#### Critical (1 day remaining)
- 🚨 URGENT prefix in subject
- Red background styling
- "Due TOMORROW!" messaging
- Highest priority indicators

#### High (2-3 days remaining)
- ⚠️ IMPORTANT prefix in subject
- Yellow background styling
- "Please prioritize" messaging
- Clear deadline emphasis

#### Medium (4-7 days remaining)
- 📅 REMINDER prefix in subject
- Blue background styling
- "Please plan to submit soon" messaging
- Standard reminder tone

#### Low (8+ days remaining)
- 📧 Standard prefix in subject
- Gray background styling
- "Friendly reminder" messaging
- Polite tone

## Technical Implementation

### 1. Email Templates

#### Initial Request Email (`sendRecommendationRequest`)
- **File**: `lib/email/recommendation-email.ts`
- **Features**:
  - Dynamic greeting based on communication style
  - Context-aware submission instructions
  - Draft content integration
  - Institution-specific information
  - Secure token-based submission link

#### Reminder Email (`sendRecommendationReminder`)
- **File**: `lib/email/recommendation-email.ts`
- **Features**:
  - Dynamic urgency styling
  - Deadline countdown
  - Urgency-based messaging
  - Visual urgency indicators

### 2. Cron Job System

#### Vercel Cron Configuration
- **File**: `vercel.json`
- **Schedule**: `0 * * * *` (every hour)
- **Endpoint**: `/api/cron/send-recommendation-reminders`

#### Cron Job Implementation
- **File**: `app/api/cron/send-recommendation-reminders/route.ts`
- **Features**:
  - Authentication via `CRON_SECRET`
  - Database query for pending reminders
  - Urgency calculation
  - Email sending with error handling
  - Reminder tracking updates

### 3. Database Schema

#### RecommendationRequest Model
```typescript
interface IRecommendationRequest {
  // ... other fields
  
  // Reminder Settings
  reminderIntervals: number[]; // Days before deadline
  lastReminderSent?: Date;
  nextReminderDate?: Date;
  
  // Status Tracking
  status: 'pending' | 'sent' | 'received' | 'overdue' | 'cancelled';
  sentAt?: Date;
  receivedAt?: Date;
}
```

### 4. Frontend Integration

#### Reminder Settings UI
- **File**: `app/(user-portal)/recommendations/new/page.tsx`
- **Features**:
  - Radio button selection for frequency
  - Visual explanation of each option
  - Real-time form updates
  - User-friendly descriptions

## Environment Variables

### Required Variables
```bash
# Email Service
RESEND_API_KEY=your_resend_api_key
SENDER_EMAIL=noreply@eddura.com

# Cron Job Security
CRON_SECRET=your_cron_secret_key

# Application URL
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## API Endpoints

### 1. Create Recommendation Request
- **Endpoint**: `POST /api/recommendations/requests`
- **Features**:
  - Validates reminder intervals
  - Sends initial email
  - Updates request status to 'sent'
  - Calculates next reminder date

### 2. Send Reminders (Cron)
- **Endpoint**: `GET /api/cron/send-recommendation-reminders`
- **Features**:
  - Processes pending reminders
  - Calculates urgency levels
  - Sends reminder emails
  - Updates reminder tracking

## Email Templates

### Initial Request Template
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">Recommendation Letter Request</h2>
  
  <p>Dear [Recipient Name],</p>
  
  <p>[Context paragraph based on relationship]</p>
  
  <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <h3 style="margin-top: 0;">[Request Title]</h3>
    <p><strong>Deadline:</strong> [Formatted Deadline]</p>
  </div>
  
  [Institution Information]
  [Submission Instructions]
  [Draft Content]
  [Additional Context]
  
  <p>[Closing based on communication style]</p>
</div>
```

### Reminder Template
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">[Urgency Icon] Recommendation Letter Reminder</h2>
  
  <p>Dear [Recipient Name],</p>
  
  [Urgency Message Box]
  
  <p>This is a reminder that you have a pending recommendation letter request from [Student Name].</p>
  
  <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <h3 style="margin-top: 0;">[Request Title]</h3>
    <p><strong>Deadline:</strong> [Formatted Deadline]</p>
    <p><strong>Time remaining:</strong> [Days] day(s)</p>
  </div>
  
  [Submission Instructions]
  
  <p>Thank you for your time and consideration.</p>
</div>
```

## Monitoring and Analytics

### 1. Cron Job Monitoring
- **Logs**: Detailed processing logs
- **Metrics**: 
  - Requests processed
  - Emails sent
  - Errors encountered
  - Processing time

### 2. Email Tracking
- **Delivery Status**: Via Resend API
- **Open Rates**: Email engagement metrics
- **Click Rates**: Submission link clicks

### 3. Performance Metrics
- **Response Time**: Time to submit after reminder
- **Completion Rate**: Percentage of requests completed
- **Urgency Effectiveness**: Impact of urgency levels

## Best Practices

### 1. Email Frequency
- **Default**: 3 reminders (7, 3, 1 days)
- **High Priority**: 6 reminders (10, 7, 5, 3, 2, 1 days)
- **Minimal**: 2 reminders (3, 1 days)

### 2. Urgency Messaging
- **Critical**: Use "URGENT" and "TOMORROW" sparingly
- **High**: Emphasize importance without panic
- **Medium**: Standard professional tone
- **Low**: Friendly, non-intrusive reminders

### 3. Personalization
- **Communication Style**: Formal, polite, or friendly
- **Relationship Context**: Personalized based on relationship
- **Institution Info**: School-specific instructions

## Troubleshooting

### Common Issues

#### 1. Emails Not Sending
- Check `RESEND_API_KEY` configuration
- Verify sender email domain
- Check email service quotas

#### 2. Cron Job Not Running
- Verify `CRON_SECRET` environment variable
- Check Vercel cron job configuration
- Monitor Vercel function logs

#### 3. Reminder Timing Issues
- Verify timezone settings
- Check reminder interval calculations
- Validate deadline dates

### Debug Commands

#### Test Email Sending
```bash
# Test initial email
curl -X POST /api/recommendations/requests \
  -H "Content-Type: application/json" \
  -d '{"recipientId": "...", "title": "Test", ...}'

# Test reminder endpoint
curl -X GET /api/cron/send-recommendation-reminders \
  -H "Authorization: Bearer $CRON_SECRET"
```

#### Check Reminder Status
```javascript
// In MongoDB shell
db.recommendationrequests.find({
  status: { $in: ['pending', 'sent'] },
  deadline: { $gt: new Date() }
}).sort({ nextReminderDate: 1 })
```

## Future Enhancements

### 1. Advanced Reminder Logic
- **Smart Timing**: Based on recipient response patterns
- **Escalation**: CC student on critical reminders
- **Alternative Channels**: SMS reminders for urgent requests

### 2. Analytics Dashboard
- **Email Performance**: Open rates, click rates
- **Response Times**: Time from reminder to submission
- **Urgency Effectiveness**: Impact analysis

### 3. Personalization Engine
- **AI-Powered**: Dynamic content based on recipient history
- **Behavioral**: Adapt to recipient preferences
- **Contextual**: School-specific templates

### 4. Integration Features
- **Calendar Integration**: Add to recipient's calendar
- **Slack/Teams**: Alternative notification channels
- **Mobile App**: Push notifications

## Security Considerations

### 1. Email Security
- **Authentication**: Secure token-based submission links
- **Expiration**: Automatic token expiration
- **Rate Limiting**: Prevent email abuse

### 2. Data Privacy
- **GDPR Compliance**: Right to be forgotten
- **Data Retention**: Automatic cleanup of old requests
- **Encryption**: Secure transmission of sensitive data

### 3. Access Control
- **Cron Security**: Secret-based authentication
- **API Protection**: Rate limiting and validation
- **Audit Logging**: Track all email activities 