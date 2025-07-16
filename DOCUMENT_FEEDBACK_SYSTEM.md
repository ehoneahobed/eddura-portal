# Document Feedback & Review System

## Overview

The Document Feedback & Review System is a comprehensive solution that allows users to share their documents with others for feedback and reviews. This system addresses the pain point of managing feedback from multiple sources (WhatsApp, email, LinkedIn, etc.) by centralizing all feedback in one place.

## Features

### 🔗 Document Sharing
- **Email-based sharing**: Share documents with specific email addresses
- **Link-based sharing**: Create shareable links for anyone to access
- **Permission control**: Set granular permissions (comment, edit, download)
- **Expiration dates**: Set automatic expiration for shared documents
- **Personal messages**: Include custom messages for reviewers

### 💬 Feedback Management
- **Structured comments**: Categorized feedback (general, suggestion, correction, question)
- **Overall ratings**: 1-5 star rating system
- **General feedback**: Long-form feedback sections
- **Comment status tracking**: Mark comments as pending, addressed, or ignored
- **Feedback resolution**: Mark entire feedback sessions as resolved

### 📊 Analytics & Insights
- **Feedback statistics**: Total, pending, and resolved feedback counts
- **Average ratings**: Track document quality over time
- **Feedback by type**: Analyze comment categories
- **Recent activity**: View latest feedback submissions

### 📧 Email Notifications
- **Share notifications**: Automatic emails when documents are shared
- **Feedback alerts**: Notifications when new feedback is received
- **Professional templates**: Beautiful HTML email templates

## Architecture

### Database Models

#### DocumentShare
```typescript
interface IDocumentShare {
  documentId: ObjectId;        // Reference to document
  userId: ObjectId;            // Document owner
  shareType: 'email' | 'link'; // Sharing method
  email?: string;              // For email shares
  shareToken: string;          // Unique access token
  isActive: boolean;           // Share status
  expiresAt?: Date;            // Optional expiration
  canComment: boolean;         // Permission flags
  canEdit: boolean;
  canDownload: boolean;
  message?: string;            // Custom message
  reviewerName?: string;       // Reviewer info
}
```

#### DocumentFeedback
```typescript
interface IDocumentFeedback {
  documentId: ObjectId;        // Reference to document
  documentShareId: ObjectId;   // Reference to share
  reviewerName: string;        // Reviewer information
  reviewerEmail?: string;
  comments: IFeedbackComment[]; // Individual comments
  overallRating?: number;      // 1-5 rating
  generalFeedback?: string;    // Long-form feedback
  isResolved: boolean;         // Resolution status
  resolvedAt?: Date;
}

interface IFeedbackComment {
  id: string;                  // Unique comment ID
  content: string;             // Comment text
  position?: {                 // Text highlighting
    start: number;
    end: number;
    text: string;
  };
  type: 'general' | 'suggestion' | 'correction' | 'question';
  status: 'pending' | 'addressed' | 'ignored';
}
```

### API Endpoints

#### Document Sharing
- `POST /api/documents/[id]/share` - Create new share
- `GET /api/documents/[id]/share` - Get all shares for document

#### Document Review
- `GET /api/review/[token]` - Access shared document for review

#### Feedback Management
- `POST /api/documents/[id]/feedback` - Submit feedback
- `GET /api/documents/[id]/feedback` - Get all feedback (owner only)
- `PUT /api/documents/[id]/feedback` - Update feedback (owner only)

## User Workflows

### Document Owner Workflow

1. **Create Document**: Write and save document in the system
2. **Share for Feedback**: 
   - Choose sharing method (email or link)
   - Set permissions and expiration
   - Add personal message (optional)
3. **Receive Feedback**: Get notified when feedback is submitted
4. **Review Feedback**: View all feedback in centralized dashboard
5. **Manage Comments**: Mark comments as addressed/ignored
6. **Resolve Feedback**: Mark feedback sessions as complete

### Reviewer Workflow

1. **Receive Invitation**: Get email or link to review document
2. **Access Document**: View document content with permissions
3. **Provide Feedback**:
   - Add overall rating (optional)
   - Write general feedback (optional)
   - Add specific comments with categories
4. **Submit Feedback**: Send feedback to document owner

## UI Components

### ShareDocumentDialog
- Email and link sharing tabs
- Permission controls
- Expiration settings
- Existing shares management
- Copy share links functionality

### DocumentFeedbackViewer
- Feedback statistics dashboard
- Filter by status (all/pending/resolved)
- Detailed feedback view
- Comment status management
- Resolution tracking

### DocumentReviewPage
- Document content display
- Feedback form with validation
- Comment categorization
- Star rating system
- Previous feedback display

## Email System

### Configuration
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Email Templates
- **Document Share Email**: Professional invitation with document details
- **Feedback Received Email**: Notification with feedback summary

## Security Features

### Access Control
- Unique share tokens for each share
- Token-based authentication for external access
- Permission-based document access
- Automatic token expiration

### Data Protection
- Share expiration dates
- Granular permission controls
- Secure token generation
- Email validation

## Usage Examples

### Sharing a Document via Email
```typescript
const shareData = {
  shareType: 'email',
  email: 'reviewer@example.com',
  reviewerName: 'John Doe',
  message: 'Please review this personal statement for my graduate school application.',
  canComment: true,
  canEdit: false,
  canDownload: true,
  expiresAt: '2024-12-31T23:59:59Z'
};

const response = await fetch(`/api/documents/${documentId}/share`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(shareData)
});
```

### Creating a Share Link
```typescript
const shareData = {
  shareType: 'link',
  canComment: true,
  canEdit: false,
  canDownload: true,
  expiresAt: '2024-12-31T23:59:59Z'
};

const response = await fetch(`/api/documents/${documentId}/share`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(shareData)
});
```

### Submitting Feedback
```typescript
const feedbackData = {
  documentShareId: 'share-id',
  reviewerName: 'Jane Smith',
  reviewerEmail: 'jane@example.com',
  overallRating: 4,
  generalFeedback: 'Overall, this is a strong personal statement...',
  comments: [
    {
      content: 'Consider adding more specific examples here.',
      type: 'suggestion',
      position: { start: 150, end: 200, text: 'specific examples' }
    }
  ]
};

const response = await fetch(`/api/documents/${documentId}/feedback`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(feedbackData)
});
```

## Benefits

### For Document Owners
- **Centralized feedback**: All feedback in one place
- **Structured reviews**: Categorized and organized feedback
- **Progress tracking**: Monitor feedback resolution
- **Quality improvement**: Track ratings over time
- **Professional workflow**: Streamlined review process

### For Reviewers
- **Easy access**: Simple link or email access
- **Clear instructions**: Guided feedback process
- **Flexible commenting**: Multiple comment types
- **No registration**: No account required for review
- **Professional interface**: Clean, intuitive design

## Future Enhancements

### Planned Features
- **Real-time notifications**: WebSocket-based live updates
- **Feedback templates**: Predefined feedback categories
- **Collaborative editing**: Real-time document collaboration
- **Version comparison**: Track changes between versions
- **Advanced analytics**: Detailed feedback insights
- **Mobile app**: Native mobile experience
- **Integration APIs**: Connect with external tools

### Technical Improvements
- **Performance optimization**: Caching and indexing
- **Scalability**: Handle large document volumes
- **Offline support**: Work without internet connection
- **Advanced security**: Enhanced encryption and access controls
- **API rate limiting**: Prevent abuse and ensure stability

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- MongoDB database
- SMTP email service
- Next.js application

### Environment Variables
```env
# Database
MONGODB_URI=your-mongodb-connection-string

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Application
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

### Installation Steps
1. Install dependencies: `npm install`
2. Set up environment variables
3. Run database migrations
4. Start the application: `npm run dev`

## Support & Documentation

For additional support or questions about the Document Feedback & Review System, please refer to:
- API Documentation: `/api/docs`
- User Guide: Available in the application
- Technical Support: Contact the development team

---

This system transforms the chaotic process of managing document feedback into a streamlined, professional workflow that benefits both document owners and reviewers.