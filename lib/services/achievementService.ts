import connectDB from '@/lib/mongodb';
import { Achievement, UserAchievement } from '@/models/Achievement';
import User from '@/models/User';
import { predefinedAchievements } from '@/lib/data/achievements';
import { NotificationService } from './notificationService';

export class AchievementService {
  /**
   * Check and award achievements for a user based on their activities
   */
  static async checkAchievements(userId: string, activityType: string, metadata?: any): Promise<void> {
    try {
      await connectDB();

      const user = await User.findById(userId);
      if (!user) return;

      // Get user's current achievements
      const userAchievements = await UserAchievement.find({ userId });
      const completedAchievementIds = userAchievements
        .filter(ua => ua.isCompleted)
        .map(ua => ua.achievementId.toString());

      // Check each predefined achievement
      for (const achievement of predefinedAchievements) {
        if (completedAchievementIds.includes((achievement as any)._id?.toString() || '')) {
          continue; // Already completed
        }

        const shouldCheck = this.shouldCheckAchievement(achievement, activityType);
        if (!shouldCheck) continue;

        const isCompleted = await this.checkAchievementCompletion(user, achievement, metadata);
        
        if (isCompleted) {
          await this.awardAchievement(userId, achievement);
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }

  /**
   * Determine if an achievement should be checked based on the current activity
   */
  private static shouldCheckAchievement(achievement: any, activityType: string): boolean {
    const metric = achievement.requirements.metric;
    
    // Map activity types to achievement metrics
    const activityMetricMap: { [key: string]: string[] } = {
      'document_created': ['documents_created', 'document_expert_combo', 'document_master_combo', 'first_steps_combo', 'platform_explorer_combo'],
      'application_started': ['applications_started', 'application_pro_combo', 'application_master_combo', 'platform_explorer_combo'],
      'peer_review_provided': ['peer_reviews_provided', 'review_expert_combo', 'review_master_combo', 'document_expert_combo', 'document_master_combo'],
      'platform_activity': ['days_active', 'week_warrior', 'month_master', 'streak_legend'],
      'squad_created': ['squads_created', 'squad_pioneer'],
      'squad_goal_completed': ['squad_goals_completed', 'squad_leader', 'squad_master']
    };

    const relevantMetrics = activityMetricMap[activityType] || [];
    return relevantMetrics.includes(metric);
  }

  /**
   * Check if a user has completed a specific achievement
   */
  private static async checkAchievementCompletion(user: any, achievement: any, metadata?: any): Promise<boolean> {
    const { requirements } = achievement;
    const metric = requirements.metric;

    switch (metric) {
      case 'documents_created':
        return (user.platformStats?.documentsCreated || 0) >= requirements.target;

      case 'applications_started':
        return (user.platformStats?.applicationsStarted || 0) >= requirements.target;

      case 'peer_reviews_provided':
        return (user.platformStats?.peerReviewsProvided || 0) >= requirements.target;

      case 'days_active':
        return (user.platformStats?.daysActive || 0) >= requirements.target;

      case 'squads_created':
        // This would need to be tracked separately
        return false;

      case 'squad_goals_completed':
        // This would need to be tracked separately
        return false;

      case 'document_expert_combo':
        return (user.platformStats?.documentsCreated || 0) >= 10 && 
               (user.platformStats?.peerReviewsProvided || 0) >= 5;

      case 'document_master_combo':
        return (user.platformStats?.documentsCreated || 0) >= 50 && 
               (user.platformStats?.peerReviewsProvided || 0) >= 25;

      case 'application_pro_combo':
        return (user.platformStats?.applicationsStarted || 0) >= 10;
        // Note: Application completion would need separate tracking

      case 'application_master_combo':
        return (user.platformStats?.applicationsStarted || 0) >= 25;
        // Note: Application completion would need separate tracking

      case 'review_expert_combo':
        return (user.platformStats?.peerReviewsProvided || 0) >= 10;
        // Note: Rating would need separate tracking

      case 'review_master_combo':
        return (user.platformStats?.peerReviewsProvided || 0) >= 50;
        // Note: Rating would need separate tracking

      case 'first_steps_combo':
        return user.quizCompleted && (user.platformStats?.documentsCreated || 0) >= 1;

      case 'platform_explorer_combo':
        return user.quizCompleted && 
               (user.platformStats?.documentsCreated || 0) >= 1 &&
               (user.platformStats?.applicationsStarted || 0) >= 1 &&
               (user.platformStats?.peerReviewsProvided || 0) >= 1 &&
               user.primarySquadId; // Has joined a squad

      case 'eddura_master_combo':
        // Complex achievement requiring excellence in all areas
        return (user.platformStats?.documentsCreated || 0) >= 100 &&
               (user.platformStats?.applicationsStarted || 0) >= 50 &&
               (user.platformStats?.peerReviewsProvided || 0) >= 100 &&
               (user.platformStats?.daysActive || 0) >= 180;

      default:
        return false;
    }
  }

  /**
   * Award an achievement to a user
   */
  private static async awardAchievement(userId: string, achievement: any): Promise<void> {
    try {
      await connectDB();

      // Create or update user achievement
      const userAchievement = await UserAchievement.findOneAndUpdate(
        { userId, achievementId: (achievement as any)._id },
        {
          userId,
          achievementId: (achievement as any)._id,
          currentProgress: achievement.requirements.target,
          targetProgress: achievement.requirements.target,
          isCompleted: true,
          completedAt: new Date(),
          pointsEarned: achievement.rewards.points,
          tokensEarned: achievement.rewards.tokens,
          badgesEarned: achievement.rewards.badges || []
        },
        { upsert: true, new: true }
      );

      // Update user's points and tokens
      await User.findByIdAndUpdate(userId, {
        $inc: {
          'platformStats.points': achievement.rewards.points,
          'platformStats.tokens': achievement.rewards.tokens
        }
      });

      // Send notification
      await NotificationService.notifyAchievement(
        userId,
        achievement.name,
        achievement.rewards.points
      );

      console.log(`Achievement awarded: ${achievement.name} to user ${userId}`);
    } catch (error) {
      console.error('Error awarding achievement:', error);
    }
  }

  /**
   * Get user's achievements
   */
  static async getUserAchievements(userId: string): Promise<any[]> {
    try {
      await connectDB();

      const userAchievements = await UserAchievement.find({ userId })
        .populate('achievementId')
        .sort({ completedAt: -1 });

      return userAchievements;
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return [];
    }
  }

  /**
   * Get user's achievement progress
   */
  static async getUserAchievementProgress(userId: string): Promise<any[]> {
    try {
      await connectDB();

      const user = await User.findById(userId);
      if (!user) return [];

      const progress = [];

      for (const achievement of predefinedAchievements) {
        const userAchievement = await UserAchievement.findOne({
          userId,
          achievementId: (achievement as any)._id
        });

        const isCompleted = userAchievement?.isCompleted || false;
        const currentProgress = await this.calculateProgress(user, achievement);

        progress.push({
          achievement,
          isCompleted,
          currentProgress,
          targetProgress: achievement.requirements.target,
          progressPercentage: Math.round((currentProgress / achievement.requirements.target) * 100)
        });
      }

      return progress;
    } catch (error) {
      console.error('Error getting achievement progress:', error);
      return [];
    }
  }

  /**
   * Calculate current progress for an achievement
   */
  private static async calculateProgress(user: any, achievement: any): Promise<number> {
    const metric = achievement.requirements.metric;

    switch (metric) {
      case 'documents_created':
        return user.platformStats?.documentsCreated || 0;

      case 'applications_started':
        return user.platformStats?.applicationsStarted || 0;

      case 'peer_reviews_provided':
        return user.platformStats?.peerReviewsProvided || 0;

      case 'days_active':
        return user.platformStats?.daysActive || 0;

      default:
        return 0;
    }
  }
}