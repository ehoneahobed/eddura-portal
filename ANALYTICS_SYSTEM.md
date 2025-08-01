# User Analytics & Tracking System

## Overview

This comprehensive analytics system tracks user behavior, engagement, and platform usage for your beta testing. It provides real-time insights into how users interact with your platform, helping you understand user patterns and optimize the user experience.

## Features

### 🎯 User Session Tracking
- **Session Management**: Tracks user sessions from start to finish
- **Page Views**: Records every page visit with detailed metrics
- **User Events**: Captures specific user actions and interactions
- **Device Information**: Tracks browser, OS, device type, and screen resolution
- **Geographic Data**: Records IP-based location information

### 📊 Analytics Dashboard
- **Real-time Metrics**: Active users, session duration, bounce rate
- **Engagement Analytics**: Pages per session, time on site, scroll depth
- **Device Analytics**: Browser usage, operating systems, device types
- **Content Performance**: Top pages, user interactions, conversion tracking
- **Geographic Insights**: User distribution by country/region

### 🔍 Advanced Tracking
- **Scroll Depth**: Tracks how far users scroll on each page
- **Click Tracking**: Monitors user interactions and clicks
- **Form Submissions**: Tracks form completion rates
- **Download Tracking**: Monitors file downloads and document access
- **Performance Metrics**: Page load times and performance data

## Database Models

### UserSession
Tracks individual user sessions with comprehensive metadata:

```typescript
interface IUserSession {
  userId: mongoose.Types.ObjectId;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  isActive: boolean;
  
  // Device and browser information
  userAgent?: string;
  browser?: string;
  browserVersion?: string;
  os?: string;
  device?: string;
  screenResolution?: string;
  
  // Location information
  ipAddress?: string;
  country?: string;
  city?: string;
  timezone?: string;
  
  // Session metadata
  referrer?: string;
  entryPage?: string;
  exitPage?: string;
  totalPages: number;
  
  // Engagement metrics
  totalTimeOnSite: number;
  averageTimePerPage: number;
  bounceRate: boolean;
}
```

### PageView
Tracks individual page visits with detailed interaction data:

```typescript
interface IPageView {
  userId?: mongoose.Types.ObjectId;
  sessionId: string;
  pageUrl: string;
  pageTitle: string;
  pageType: string;
  
  // Timing information
  visitTime: Date;
  timeOnPage: number;
  isBounce: boolean;
  
  // User interaction data
  scrollDepth: number;
  interactions: Array<{
    type: 'click' | 'scroll' | 'form_submit' | 'download' | 'link_click';
    element?: string;
    timestamp: Date;
    data?: any;
  }>;
  
  // Performance metrics
  pageLoadTime?: number;
  domContentLoaded?: number;
}
```

### UserEvent
Tracks specific user actions and events:

```typescript
interface IUserEvent {
  userId?: mongoose.Types.ObjectId;
  sessionId: string;
  eventType: string;
  eventCategory: string;
  eventName: string;
  eventData?: any;
  pageUrl?: string;
  pageTitle?: string;
  
  // User context
  userType?: 'anonymous' | 'registered' | 'admin';
  userRole?: string;
  
  // Timing
  eventTime: Date;
}
```

## API Endpoints

### Session Management
- `POST /api/analytics/session` - Create new user session
- `PUT /api/analytics/session` - Update session data

### Page Tracking
- `POST /api/analytics/pageview` - Track page view
- `PUT /api/analytics/pageview` - Update page view metrics

### Event Tracking
- `POST /api/analytics/event` - Track user event
- `GET /api/analytics/event` - Retrieve events with filtering

### Heartbeat
- `POST /api/analytics/heartbeat` - Update session heartbeat
- `GET /api/analytics/heartbeat` - Get active sessions

### Analytics Dashboard
- `GET /api/admin/analytics` - Get comprehensive analytics data

## Client-Side Implementation

### Analytics Provider
The `AnalyticsProvider` component automatically initializes tracking:

```tsx
import { AnalyticsProvider } from '@/components/AnalyticsProvider';

// In your layout
<AnalyticsProvider>
  {children}
</AnalyticsProvider>
```

### Custom Event Tracking
Use the `useAnalytics` hook to track custom events:

```tsx
import { useAnalytics } from '@/components/AnalyticsProvider';

function MyComponent() {
  const { trackEvent } = useAnalytics();
  
  const handleButtonClick = () => {
    trackEvent({
      eventType: 'click',
      eventCategory: 'engagement',
      eventName: 'button_clicked',
      eventData: {
        buttonId: 'cta-button',
        page: 'homepage'
      }
    });
  };
}
```

## Analytics Dashboard

### Overview Tab
- **Active Users**: Currently online users
- **Total Sessions**: Sessions in selected period
- **Page Views**: Total page views
- **Average Session Duration**: Time spent per session
- **Growth Trends**: Visual charts showing platform growth
- **Top Content**: Most viewed pages and content

### User Analytics Tab
- **Session Trends**: User sessions over time
- **Engagement Metrics**: Key performance indicators
- **Bounce Rate**: Single-page session percentage
- **Pages per Session**: Average pages viewed
- **Device Distribution**: Traffic by device type
- **Browser Usage**: Traffic by browser
- **Operating Systems**: Traffic by OS
- **Top Pages**: Most viewed pages with metrics

### Trends Tab
- **Monthly Growth**: Detailed growth trends
- **Recent Activity**: Latest platform updates
- **Geographic Distribution**: Schools and programs by country

### Financial Tab
- **Scholarship Values**: Total scholarship amounts
- **Program Costs**: Average program tuition
- **Cost Distribution**: Program cost ranges

## Key Metrics Tracked

### User Engagement
- **Session Duration**: How long users stay on the platform
- **Pages per Session**: How many pages users view
- **Bounce Rate**: Percentage of single-page sessions
- **Scroll Depth**: How far users scroll on pages
- **Time on Site**: Total time spent on the platform

### User Behavior
- **Page Views**: Which pages are most popular
- **Click Patterns**: What users click on
- **Form Submissions**: Conversion rates for forms
- **Download Tracking**: Document and file downloads
- **Navigation Patterns**: How users move through the site

### Technical Metrics
- **Page Load Times**: Performance monitoring
- **Device Types**: Desktop vs mobile usage
- **Browser Usage**: Browser market share
- **Operating Systems**: OS distribution
- **Screen Resolutions**: Device capabilities

## Privacy & Compliance

### Data Collection
- **Anonymous Tracking**: Tracks anonymous users without personal data
- **Consent-Based**: Respects user privacy preferences
- **GDPR Compliant**: Follows data protection regulations
- **Data Retention**: Configurable data retention policies

### Data Security
- **Encrypted Storage**: All data is encrypted at rest
- **Access Control**: Admin-only access to analytics
- **Data Anonymization**: Personal data is anonymized where possible
- **Audit Logs**: Track access to analytics data

## Configuration

### Environment Variables
```env
# Analytics Configuration
ANALYTICS_ENABLED=true
ANALYTICS_RETENTION_DAYS=90
ANALYTICS_HEARTBEAT_INTERVAL=30000
ANALYTICS_SCROLL_TRACKING=true
ANALYTICS_CLICK_TRACKING=true
```

### Database Indexes
The system includes optimized database indexes for efficient querying:
- Session tracking indexes
- Page view performance indexes
- Event filtering indexes
- Geographic data indexes

## Usage Examples

### Tracking Custom Events
```tsx
// Track a scholarship application
trackEvent({
  eventType: 'application',
  eventCategory: 'engagement',
  eventName: 'scholarship_applied',
  eventData: {
    scholarshipId: 'sch_123',
    scholarshipName: 'Merit Scholarship',
    applicationType: 'online'
  }
});

// Track a search
trackEvent({
  eventType: 'search',
  eventCategory: 'navigation',
  eventName: 'program_search',
  eventData: {
    searchTerm: 'computer science',
    resultsCount: 25,
    filters: ['undergraduate', 'full-time']
  }
});
```

### Real-time Monitoring
```tsx
// Get active users
const response = await fetch('/api/analytics/heartbeat?minutes=5');
const { activeUsers, anonymousUsers } = await response.json();

// Get recent events
const events = await fetch('/api/analytics/event?startDate=2024-01-01&endDate=2024-01-31');
const eventData = await events.json();
```

## Benefits for Beta Testing

### User Understanding
- **User Journey Mapping**: Understand how users navigate your platform
- **Pain Point Identification**: Find where users struggle or leave
- **Feature Adoption**: Track which features are most used
- **User Segmentation**: Analyze different user types and behaviors

### Platform Optimization
- **Performance Monitoring**: Identify slow pages and bottlenecks
- **Content Optimization**: Understand which content resonates
- **Conversion Tracking**: Monitor key user actions and conversions
- **A/B Testing Support**: Track different user experiences

### Business Intelligence
- **Growth Metrics**: Track platform adoption and growth
- **Geographic Insights**: Understand your user base distribution
- **Device Optimization**: Ensure mobile and desktop experiences
- **ROI Measurement**: Track the impact of platform improvements

## Future Enhancements

### Advanced Analytics
- **Heatmaps**: Visual user interaction patterns
- **Funnel Analysis**: Track user conversion paths
- **Cohort Analysis**: User retention over time
- **Predictive Analytics**: User behavior predictions

### Integration Features
- **Google Analytics**: Integration with GA4
- **Export Capabilities**: CSV/Excel data export
- **API Access**: RESTful API for external tools
- **Webhook Support**: Real-time data streaming

### Privacy Features
- **User Consent Management**: Granular privacy controls
- **Data Deletion**: User data removal tools
- **Privacy Dashboard**: User privacy settings
- **Compliance Reporting**: GDPR/CCPA compliance tools

## Support & Maintenance

### Monitoring
- **Health Checks**: Regular system health monitoring
- **Performance Alerts**: Automated performance notifications
- **Error Tracking**: Analytics system error monitoring
- **Data Quality**: Automated data validation

### Maintenance
- **Data Cleanup**: Automated old data removal
- **Index Optimization**: Database performance tuning
- **Backup Procedures**: Regular data backups
- **Update Procedures**: System update protocols

This analytics system provides comprehensive insights into user behavior, helping you make data-driven decisions to improve your platform during beta testing and beyond.