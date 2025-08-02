import { connectToDatabase } from '@/lib/mongodb';
import Notification from '@/models/Notification';
import User from '@/models/User';
import EdduraSquad from '@/models/Squad';

interface NotificationData {
  userId: string;
  type: 'squad_activity' | 'goal_progress' | 'help_request' | 'achievement' | 'invitation' | 'reminder';
  title: string;
  message: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  content?: {
    squadId?: string;
    goalId?: string;
    achievementId?: string;
    memberId?: string;
    actionUrl?: string;
  };
  metadata?: {
    squadName?: string;
    goalName?: string;
    achievementName?: string;
    memberName?: string;
    progressPercentage?: number;
    daysRemaining?: number;
  };
}

export class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification(data: NotificationData): Promise<void> {
    try {
      await connectToDatabase();

      const notification = new Notification({
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        priority: data.priority || 'medium',
        content: data.content,
        metadata: data.metadata,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });

      await notification.save();
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  /**
   * Notify squad members about goal progress
   */
  static async notifyGoalProgress(squadId: string, goalType: string, progress: number, memberName: string): Promise<void> {
    try {
      await connectToDatabase();

      const squad = await EdduraSquad.findById(squadId).populate('memberIds');
      if (!squad) return;

      const message = `${memberName} made progress on the ${goalType.replace('_', ' ')} goal! Squad is now ${progress}% complete.`;

      // Notify all squad members except the one who made progress
      for (const member of squad.memberIds) {
        await this.createNotification({
          userId: member._id.toString(),
          type: 'goal_progress',
          title: 'Squad Goal Progress',
          message,
          priority: 'medium',
          content: {
            squadId: squadId,
            actionUrl: `/squads/${squadId}`
          },
          metadata: {
            squadName: squad.name,
            goalName: goalType.replace('_', ' '),
            progressPercentage: progress
          }
        });
      }
    } catch (error) {
      console.error('Error notifying goal progress:', error);
    }
  }

  /**
   * Notify squad about member needing help
   */
  static async notifyHelpRequest(squadId: string, memberId: string, memberName: string, goalType: string): Promise<void> {
    try {
      await connectToDatabase();

      const squad = await EdduraSquad.findById(squadId).populate('memberIds');
      if (!squad) return;

      const message = `${memberName} needs help with the ${goalType.replace('_', ' ')} goal. Consider reaching out to support them!`;

      // Notify all squad members except the one needing help
      for (const member of squad.memberIds) {
        if (member._id.toString() !== memberId) {
          await this.createNotification({
            userId: member._id.toString(),
            type: 'help_request',
            title: 'Squad Member Needs Help',
            message,
            priority: 'high',
            content: {
              squadId: squadId,
              memberId: memberId,
              actionUrl: `/squads/${squadId}`
            },
            metadata: {
              squadName: squad.name,
              memberName,
              goalName: goalType.replace('_', ' ')
            }
          });
        }
      }
    } catch (error) {
      console.error('Error notifying help request:', error);
    }
  }

  /**
   * Notify achievement unlocked
   */
  static async notifyAchievement(userId: string, achievementName: string, points: number): Promise<void> {
    try {
      await this.createNotification({
        userId,
        type: 'achievement',
        title: 'Achievement Unlocked! 🎉',
        message: `Congratulations! You've earned the "${achievementName}" achievement and ${points} points!`,
        priority: 'high',
        content: {
          achievementId: achievementName,
          actionUrl: '/achievements'
        },
        metadata: {
          achievementName,
          progressPercentage: 100
        }
      });
    } catch (error) {
      console.error('Error notifying achievement:', error);
    }
  }

  /**
   * Notify squad invitation
   */
  static async notifySquadInvitation(userId: string, squadName: string, inviterName: string, squadId: string): Promise<void> {
    try {
      await this.createNotification({
        userId,
        type: 'invitation',
        title: 'Squad Invitation',
        message: `${inviterName} invited you to join "${squadName}" squad!`,
        priority: 'medium',
        content: {
          squadId: squadId,
          actionUrl: `/squads/${squadId}`
        },
        metadata: {
          squadName,
          memberName: inviterName
        }
      });
    } catch (error) {
      console.error('Error notifying squad invitation:', error);
    }
  }

  /**
   * Notify goal deadline approaching
   */
  static async notifyGoalDeadline(squadId: string, goalName: string, daysRemaining: number): Promise<void> {
    try {
      await connectToDatabase();

      const squad = await EdduraSquad.findById(squadId).populate('memberIds');
      if (!squad) return;

      const message = `The "${goalName}" goal deadline is approaching! Only ${daysRemaining} days remaining.`;

      for (const member of squad.memberIds) {
        await this.createNotification({
          userId: member._id.toString(),
          type: 'reminder',
          title: 'Goal Deadline Approaching',
          message,
          priority: daysRemaining <= 3 ? 'urgent' : 'high',
          content: {
            squadId: squadId,
            actionUrl: `/squads/${squadId}`
          },
          metadata: {
            squadName: squad.name,
            goalName,
            daysRemaining
          }
        });
      }
    } catch (error) {
      console.error('Error notifying goal deadline:', error);
    }
  }

  /**
   * Notify squad milestone reached
   */
  static async notifySquadMilestone(squadId: string, milestone: string, progress: number): Promise<void> {
    try {
      await connectToDatabase();

      const squad = await EdduraSquad.findById(squadId).populate('memberIds');
      if (!squad) return;

      const message = `🎉 Squad milestone reached! ${milestone} - ${progress}% complete!`;

      for (const member of squad.memberIds) {
        await this.createNotification({
          userId: member._id.toString(),
          type: 'squad_activity',
          title: 'Squad Milestone Reached!',
          message,
          priority: 'medium',
          content: {
            squadId: squadId,
            actionUrl: `/squads/${squadId}`
          },
          metadata: {
            squadName: squad.name,
            progressPercentage: progress
          }
        });
      }
    } catch (error) {
      console.error('Error notifying squad milestone:', error);
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      await connectToDatabase();

      await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { 
          isRead: true, 
          readAt: new Date() 
        }
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<void> {
    try {
      await connectToDatabase();

      await Notification.updateMany(
        { userId, isRead: false },
        { 
          isRead: true, 
          readAt: new Date() 
        }
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  /**
   * Get unread notification count for a user
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      await connectToDatabase();

      const count = await Notification.countDocuments({
        userId,
        isRead: false
      });

      return count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
}