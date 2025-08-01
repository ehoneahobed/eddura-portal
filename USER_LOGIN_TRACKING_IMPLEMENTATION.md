# User Login Tracking System Implementation

## Overview

This implementation adds comprehensive user login tracking functionality to the Eddura platform, allowing administrators to monitor active users, their session durations, and detailed user information in real-time.

## Features Implemented

### 🔐 User Session Tracking
- **Real-time Session Monitoring**: Track both regular users and admin users
- **Session Duration Calculation**: Calculate and display how long users have been logged in
- **User Information Display**: Show names, emails, and user types (user/admin)
- **Device Information**: Track browser, OS, device type, and location
- **Login History**: Track login count and last login times

### 📊 Admin Dashboard Integration
- **Active Users Card**: New component showing active users on the main dashboard
- **Detailed User Information**: Names, emails, session duration, device info
- **User Type Filtering**: Distinguish between regular users and admin users
- **Real-time Updates**: Auto-refresh every 30 seconds

### 🎯 Dedicated Active Users Page
- **Comprehensive User List**: Full page dedicated to active user monitoring
- **Advanced Filtering**: Search by name/email, filter by user type
- **Sorting Options**: Sort by session duration, name, email, or last login
- **Time Window Selection**: Choose monitoring period (1, 5, 15, 30 minutes)
- **Detailed User Cards**: Show comprehensive user information

### 🔧 API Endpoints
- **GET /api/admin/active-users**: Retrieve active logged-in users
- **Enhanced Session Tracking**: Support for both user and admin sessions
- **Real-time Data**: Live session duration calculations

## Technical Implementation

### Database Schema Updates

#### UserSession Model Enhancements
```typescript
interface IUserSession extends Document {
  userId?: mongoose.Types.ObjectId;    // Regular user sessions
  adminId?: mongoose.Types.ObjectId;   // Admin user sessions
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  isActive: boolean;
  
  // Device and location information
  userAgent?: string;
  browser?: string;
  browserVersion?: string;
  os?: string;
  device?: string;
  screenResolution?: string;
  ipAddress?: string;
  country?: string;
  city?: string;
  timezone?: string;
  
  // Session metrics
  totalPages: number;
  totalTimeOnSite: number;
  averageTimePerPage: number;
  bounceRate: boolean;
}
```

### API Endpoints

#### Active Users API (`/api/admin/active-users`)
```typescript
// GET /api/admin/active-users?minutes=5
{
  success: true,
  data: {
    activeUsers: [
      {
        id: string;
        name: string;
        email: string;
        type: 'user' | 'admin';
        role?: string;
        sessionId: string;
        sessionStartTime: string;
        sessionDuration: number;
        sessionDurationFormatted: string;
        lastLoginAt?: string;
        loginCount: number;
        isEmailVerified: boolean;
        device?: string;
        browser?: string;
        os?: string;
        ipAddress?: string;
        country?: string;
        city?: string;
        totalPages: number;
        totalTimeOnSite: number;
      }
    ],
    summary: {
      totalActiveUsers: number;
      totalUsers: number;
      totalAdmins: number;
      averageSessionDuration: number;
      averageSessionDurationFormatted: string;
      cutoffTime: string;
      minutes: number;
    }
  }
}
```

### React Components

#### ActiveUsersCard Component
- **Dashboard Integration**: Shows active users on main admin dashboard
- **Summary Statistics**: Total users, regular users, admin users, average session
- **User List**: Collapsible list of active users with basic info
- **Real-time Updates**: Auto-refresh functionality

#### ActiveUsersPage Component
- **Full-page Interface**: Dedicated page for detailed user monitoring
- **Advanced Filtering**: Search, user type filter, time window selection
- **Sorting Options**: Multiple sort criteria with ascending/descending
- **Detailed User Cards**: Comprehensive user information display

#### useActiveUsers Hook
```typescript
interface UseActiveUsersReturn {
  data: ActiveUsersData | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => void;
}
```

### Analytics Provider Updates
- **Admin Session Support**: Track admin sessions separately from user sessions
- **Session Type Detection**: Automatically detect user vs admin sessions
- **Enhanced Session Data**: Include admin information in session tracking

## User Interface Features

### Dashboard Integration
1. **Active Users Card**: Added to main admin dashboard
2. **Summary Stats**: Quick overview of active users
3. **Collapsible Details**: Show/hide detailed user information
4. **Auto-refresh**: Updates every 30 seconds

### Dedicated Active Users Page
1. **Navigation**: Added to admin sidebar under "Active Users"
2. **Advanced Filters**: Search, user type, time window, sorting
3. **Comprehensive Display**: Detailed user cards with all information
4. **Real-time Monitoring**: Live updates and refresh functionality

### User Information Display
- **Basic Info**: Name, email, user type, role
- **Session Data**: Duration, start time, pages viewed
- **Device Info**: Browser, OS, device type, location
- **Login History**: Login count, last login time
- **Network Info**: IP address, country, city

## Security Features

### Authentication & Authorization
- **Admin-only Access**: All endpoints require admin authentication
- **Permission-based**: Uses existing admin permission system
- **Session Validation**: Validates user sessions and permissions

### Data Privacy
- **User Consent**: Respects user privacy preferences
- **Data Anonymization**: Personal data handled securely
- **Access Logging**: Track access to sensitive user data

## Configuration

### Environment Variables
```env
# Required for session tracking
MONGODB_URI=mongodb://localhost:27017/eddura-platform
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

### Database Indexes
```javascript
// Optimized indexes for efficient querying
UserSessionSchema.index({ userId: 1, startTime: -1 });
UserSessionSchema.index({ adminId: 1, startTime: -1 });
UserSessionSchema.index({ sessionId: 1 });
UserSessionSchema.index({ isActive: 1 });
UserSessionSchema.index({ startTime: -1 });
```

## Usage Examples

### Viewing Active Users
1. **Dashboard**: Check the "Active Users" card on the main admin dashboard
2. **Detailed View**: Navigate to "Active Users" in the sidebar for comprehensive monitoring
3. **Filtering**: Use search and filters to find specific users
4. **Sorting**: Sort by session duration, name, email, or last login

### API Usage
```javascript
// Fetch active users
const response = await fetch('/api/admin/active-users?minutes=5');
const data = await response.json();

// Get user information
const activeUsers = data.data.activeUsers;
const summary = data.data.summary;
```

## Benefits for Platform Management

### Real-time Monitoring
- **Live User Tracking**: See who's currently using the platform
- **Session Analytics**: Understand user engagement patterns
- **Performance Monitoring**: Track session durations and user behavior

### User Management
- **User Activity**: Monitor user engagement and activity levels
- **Support Assistance**: Help users with session-related issues
- **Security Monitoring**: Detect unusual login patterns

### Business Intelligence
- **User Engagement**: Understand how long users stay on the platform
- **Peak Usage Times**: Identify when users are most active
- **Geographic Distribution**: See where users are accessing from

## Future Enhancements

### Planned Features
- **Session Analytics**: Detailed session behavior analysis
- **User Activity Heatmaps**: Visual representation of user activity
- **Export Functionality**: Export active user data to CSV/Excel
- **Real-time Notifications**: Alert admins of unusual activity
- **Session Recording**: Record user interactions (with consent)

### Advanced Analytics
- **User Journey Mapping**: Track user navigation patterns
- **Conversion Tracking**: Monitor user progression through platform
- **Performance Metrics**: Track page load times and user experience
- **A/B Testing Support**: Compare different user experiences

## Troubleshooting

### Common Issues
1. **No Active Users**: Check if users are actually logged in
2. **Session Not Updating**: Verify heartbeat functionality
3. **Permission Errors**: Ensure admin authentication is working
4. **Database Connection**: Check MongoDB connection and indexes

### Debug Steps
1. Check browser console for JavaScript errors
2. Verify API endpoint responses
3. Confirm database connectivity
4. Validate environment variables

## Performance Considerations

### Optimization
- **Database Indexes**: Optimized for efficient querying
- **Caching**: Consider Redis for session data caching
- **Pagination**: Implement for large user lists
- **Background Jobs**: Use queues for heavy analytics processing

### Scalability
- **Horizontal Scaling**: Support for multiple server instances
- **Database Sharding**: Distribute session data across clusters
- **CDN Integration**: Cache static assets globally
- **Load Balancing**: Distribute user traffic efficiently

This implementation provides a comprehensive user login tracking system that gives administrators real-time visibility into platform usage, user engagement, and session management capabilities.