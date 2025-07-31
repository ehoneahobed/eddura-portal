# Recommendation Letter System Enhancement

## Overview

The recommendation letter system has been enhanced with comprehensive email notifications and automated reminder functionality using Vercel cron jobs. This system ensures that recommendation requests are properly communicated to recipients and includes urgency-driven reminders to maximize response rates.

## Key Features

### 1. Email Notifications

#### Initial Request Email
- **Trigger**: When a recommendation request is created
- **Recipient**: The professor/supervisor being requested
- **Content**: 
  - Professional request with context about the relationship
  - Clear deadline and submission instructions
  - Optional draft content if provided by student
  - Secure portal link for submission
  - Communication style adaptation (formal/polite/friendly)

#### Reminder Emails
- **Trigger**: Automated reminders based on configured intervals
- **Frequency**: Configurable (minimal, standard, aggressive)
- **Urgency Levels**:
  - **14-10 days**: Gentle reminder
  - **7-5 days**: Important reminder
  - **3 days**: Urgent reminder
  - **1 day**: Critical reminder (URGENT - Due Tomorrow!)

#### Confirmation Email
- **Trigger**: When a recommendation letter is received
- **Recipient**: The student who made the request
- **Content**: Confirmation that the letter has been received

### 2. Reminder Frequency Options

#### Minimal (2 reminders)
- 7 days before deadline
- 1 day before deadline
- Best for: Established relationships, high-priority professors

#### Standard (3 reminders) - Default
- 7 days before deadline
- 3 days before deadline
- 1 day before deadline
- Best for: Most situations

#### Aggressive (6 reminders)
- 14 days before deadline
- 10 days before deadline
- 7 days before deadline
- 5 days before deadline
- 3 days before deadline
- 1 day before deadline
- Best for: Busy professors, tight deadlines, important applications

### 3. Urgency-Driven Email Design

#### Visual Urgency Indicators
- **Color-coded urgency levels**:
  - 🟡 Yellow: 7+ days (gentle)
  - 🟠 Orange: 3-7 days (important)
  - 🔴 Red: 1-3 days (urgent)
  - 🔴 Red: 1 day (CRITICAL)

#### Subject Line Urgency
- Standard: "Reminder: Recommendation Letter for [Student] - Due in X Days"
- Important: "IMPORTANT: Recommendation Letter Due in X Days - [Student]"
- Critical: "URGENT: Recommendation Letter Due TOMORROW - [Student]"

#### Call-to-Action Buttons
- Standard: "Submit Recommendation Letter"
- Urgent: "Submit Recommendation Letter NOW" (bold, red)

### 4. Vercel Cron Job Integration

#### Automated Reminder System
- **Schedule**: Runs every hour (`0 * * * *`)
- **Endpoint**: `/api/cron/recommendation-reminders`
- **Security**: Protected with `CRON_SECRET` environment variable
- **Functionality**:
  - Checks for requests needing reminders
  - Sends appropriate reminder emails
  - Updates reminder tracking
  - Marks overdue requests

#### Cron Job Features
- **Smart Reminder Logic**: Only sends reminders when appropriate
- **Error Handling**: Logs errors without failing the entire job
- **Status Updates**: Automatically marks requests as overdue
- **Detailed Logging**: Tracks all reminder activities

## Technical Implementation

### 1. Email Functions (`lib/email.ts`)

#### `sendRecommendationRequestEmail()`
```typescript
export const sendRecommendationRequestEmail = async (
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
): Promise<boolean>
```

#### `sendRecommendationReminderEmail()`
```typescript
export const sendRecommendationReminderEmail = async (
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
  reminderNumber: number = 1
): Promise<boolean>
```

#### `sendRecommendationReceivedEmail()`
```typescript
export const sendRecommendationReceivedEmail = async (
  studentEmail: string,
  studentName: string,
  recipientName: string,
  requestTitle: string
): Promise<boolean>
```

### 2. Database Schema Updates

#### RecommendationRequest Model
```typescript
// New fields added
reminderFrequency: {
  type: String,
  enum: ['minimal', 'standard', 'aggressive', 'custom'],
  default: 'standard',
},
```

### 3. API Endpoints

#### Create Recommendation Request (`POST /api/recommendations/requests`)
- Sends initial email to recipient
- Updates request status to 'sent'
- Sets up reminder tracking

#### Cron Job (`GET /api/cron/recommendation-reminders`)
- Protected with authentication
- Processes pending reminders
- Updates request statuses

### 4. Frontend Enhancements

#### Reminder Frequency Selection
- Radio button options for reminder frequency
- Real-time preview of reminder schedule
- Automatic interval calculation

#### Form Validation
- Ensures all required fields are completed
- Validates deadline is in the future
- Checks recipient information

## Configuration

### Environment Variables

```env
# Email Configuration
RESEND_API_KEY=your_resend_api_key
SENDER_EMAIL=noreply@eddura.com

# Cron Job Security
CRON_SECRET=your_secure_cron_secret

# Application URL
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Vercel Configuration (`vercel.json`)

```json
{
  "crons": [
    {
      "path": "/api/cron/recommendation-reminders",
      "schedule": "0 * * * *"
    }
  ]
}
```

## Usage Guide

### For Students

1. **Create Recommendation Request**
   - Fill in recipient information
   - Set appropriate deadline
   - Choose reminder frequency based on relationship and urgency
   - Add optional draft content
   - Submit request

2. **Monitor Status**
   - Track request status in dashboard
   - Receive confirmation when letter is received
   - View reminder history

### For Recipients

1. **Receive Initial Request**
   - Professional email with clear instructions
   - Secure portal link for submission
   - Optional draft content for reference

2. **Receive Reminders**
   - Escalating urgency as deadline approaches
   - Clear call-to-action buttons
   - Easy access to submission portal

## Testing

### Manual Testing
```bash
# Test reminder logic
node scripts/test-recommendation-reminders.js

# Test email sending
curl -X GET "https://your-domain.com/api/cron/recommendation-reminders" \
  -H "Authorization: Bearer your_cron_secret"
```

### Test Scenarios
1. **Create request with minimal reminders**
2. **Create request with aggressive reminders**
3. **Test overdue request handling**
4. **Verify email delivery**
5. **Check reminder scheduling**

## Monitoring and Analytics

### Logs to Monitor
- Email delivery success/failure
- Cron job execution results
- Reminder scheduling accuracy
- Overdue request detection

### Key Metrics
- Email delivery rate
- Reminder response rate
- Average time to submission
- Overdue request percentage

## Security Considerations

1. **Cron Job Protection**
   - Authentication required for cron endpoint
   - Environment variable for secret

2. **Email Security**
   - No sensitive data in email content
   - Secure token-based access
   - Expiring links

3. **Data Privacy**
   - Recipient information protected
   - Student data anonymized in logs
   - GDPR compliance considerations

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check RESEND_API_KEY configuration
   - Verify sender email domain
   - Check email delivery logs

2. **Reminders not triggering**
   - Verify cron job is running
   - Check CRON_SECRET configuration
   - Review reminder interval calculations

3. **Portal links not working**
   - Verify NEXT_PUBLIC_APP_URL
   - Check token expiration
   - Validate secure token generation

### Debug Commands
```bash
# Check cron job status
curl -X GET "https://your-domain.com/api/cron/recommendation-reminders" \
  -H "Authorization: Bearer your_cron_secret"

# Test email configuration
node scripts/test-email-config.js

# Verify database connections
node scripts/test-db-connection.js
```

## Future Enhancements

1. **Advanced Reminder Scheduling**
   - Custom reminder intervals
   - Timezone-aware scheduling
   - Holiday-aware reminders

2. **Enhanced Email Templates**
   - A/B testing for email effectiveness
   - Personalized content based on relationship
   - Multi-language support

3. **Analytics Dashboard**
   - Reminder effectiveness metrics
   - Response rate tracking
   - Professor engagement analytics

4. **Integration Features**
   - Calendar integration
   - Slack/Teams notifications
   - SMS reminders (optional)

## Support

For technical support or questions about the recommendation system:
- Check the logs for error details
- Verify environment variable configuration
- Test with the provided scripts
- Review the troubleshooting section above 