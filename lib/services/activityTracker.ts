import connectDB from '@/lib/mongodb';
import { ProgressTracker } from './progressTracker';

interface UserActivity {
  userId: string;
  action: string;
  timestamp: Date;
  metadata?: any;
}

export class ActivityTracker {
  /**
   * Track meaningful user activities that indicate actual platform usage
   */
  static async trackMeaningfulActivity(userId: string, action: string, metadata?: any): Promise<void> {
    try {
      await connectDB();

      const activity: UserActivity = {
        userId,
        action,
        timestamp: new Date(),
        metadata
      };

      // Determine if this is a meaningful activity that should count for daily tracking
      const meaningfulActions = [
        'document_created',
        'document_edited',
        'application_started',
        'application_updated',
        'peer_review_provided',
        'document_viewed',
        'quiz_completed',
        'profile_updated',
        'search_performed',
        'content_shared'
      ];

      if (meaningfulActions.includes(action)) {
        await ProgressTracker.trackActivity({
          userId,
          activityType: 'platform_activity',
          timestamp: new Date(),
          metadata
        });
      }

      // Log the activity for analytics
      await this.logActivity(activity);

    } catch (error) {
      console.error('Error tracking meaningful activity:', error);
    }
  }

  /**
   * Track document-related activities
   */
  static async trackDocumentActivity(userId: string, action: 'created' | 'edited' | 'viewed' | 'shared', documentId?: string): Promise<void> {
    const actionMap = {
      created: 'document_created',
      edited: 'document_edited',
      viewed: 'document_viewed',
      shared: 'document_shared'
    };

    await this.trackMeaningfulActivity(userId, actionMap[action], { documentId });
  }

  /**
   * Track application-related activities
   */
  static async trackApplicationActivity(userId: string, action: 'started' | 'updated' | 'submitted', applicationId?: string): Promise<void> {
    const actionMap = {
      started: 'application_started',
      updated: 'application_updated',
      submitted: 'application_submitted'
    };

    await this.trackMeaningfulActivity(userId, actionMap[action], { applicationId });
  }

  /**
   * Track peer review activities
   */
  static async trackPeerReviewActivity(userId: string, reviewId: string, documentId: string): Promise<void> {
    await this.trackMeaningfulActivity(userId, 'peer_review_provided', { reviewId, documentId });
  }

  /**
   * Track quiz completion
   */
  static async trackQuizActivity(userId: string, quizType: string, score?: number): Promise<void> {
    await this.trackMeaningfulActivity(userId, 'quiz_completed', { quizType, score });
  }

  /**
   * Track profile updates
   */
  static async trackProfileActivity(userId: string, fieldsUpdated: string[]): Promise<void> {
    await this.trackMeaningfulActivity(userId, 'profile_updated', { fieldsUpdated });
  }

  /**
   * Track search activities
   */
  static async trackSearchActivity(userId: string, searchType: string, query: string): Promise<void> {
    await this.trackMeaningfulActivity(userId, 'search_performed', { searchType, query });
  }

  /**
   * Track content sharing
   */
  static async trackSharingActivity(userId: string, contentType: string, contentId: string): Promise<void> {
    await this.trackMeaningfulActivity(userId, 'content_shared', { contentType, contentId });
  }

  /**
   * Log activity for analytics (separate from progress tracking)
   */
  private static async logActivity(activity: UserActivity): Promise<void> {
    try {
      // You could store this in a separate ActivityLog collection for analytics
      // For now, we'll just log it
      console.log('Activity logged:', {
        userId: activity.userId,
        action: activity.action,
        timestamp: activity.timestamp,
        metadata: activity.metadata
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  /**
   * Get user's activity streak (consecutive days with meaningful activity)
   */
  static async getUserStreak(userId: string): Promise<number> {
    try {
      await connectDB();
      
      // This would query the activity log to calculate streak
      // For now, we'll use the platformStats.daysActive as a proxy
      const { User } = await import('@/models/User');
      const user = await User.findById(userId);
      
      return user?.platformStats?.daysActive || 0;
    } catch (error) {
      console.error('Error getting user streak:', error);
      return 0;
    }
  }

  /**
   * Check if user has been active today
   */
  static async isUserActiveToday(userId: string): Promise<boolean> {
    try {
      await connectDB();
      
      const { User } = await import('@/models/User');
      const user = await User.findById(userId);
      
      if (!user?.platformStats?.lastActive) return false;
      
      const lastActive = new Date(user.platformStats.lastActive);
      const today = new Date();
      
      return lastActive.getDate() === today.getDate() &&
             lastActive.getMonth() === today.getMonth() &&
             lastActive.getFullYear() === today.getFullYear();
    } catch (error) {
      console.error('Error checking user activity:', error);
      return false;
    }
  }
}