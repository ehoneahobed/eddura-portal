import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import EdduraSquad from '@/models/Squad';
import { Document } from '@/models/Document';
import { Application } from '@/models/Application';

interface ActivityEvent {
  userId: string;
  activityType: 'document_created' | 'application_started' | 'application_completed' | 'peer_review_provided' | 'platform_activity';
  timestamp: Date;
  metadata?: any;
}

export class ProgressTracker {
  /**
   * Track a user activity and update relevant squad progress
   */
  static async trackActivity(event: ActivityEvent): Promise<void> {
    try {
      await connectToDatabase();

      const user = await User.findById(event.userId);
      if (!user) return;

      // Update user's platform stats
      await this.updateUserStats(user, event);

      // Update squad progress for all user's squads
      await this.updateSquadProgress(user, event);

      // Check for help identification
      await this.checkHelpIdentification(user);

    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }

  /**
   * Update user's platform statistics
   */
  private static async updateUserStats(user: any, event: ActivityEvent): Promise<void> {
    const updateData: any = {
      'platformStats.lastActive': new Date()
    };

    switch (event.activityType) {
      case 'document_created':
        updateData['platformStats.documentsCreated'] = (user.platformStats?.documentsCreated || 0) + 1;
        break;
      case 'application_started':
        updateData['platformStats.applicationsStarted'] = (user.platformStats?.applicationsStarted || 0) + 1;
        break;
      case 'peer_review_provided':
        updateData['platformStats.peerReviewsProvided'] = (user.platformStats?.peerReviewsProvided || 0) + 1;
        break;
      case 'platform_activity':
        // Update days active if it's a new day
        const lastActive = user.platformStats?.lastActive;
        if (!lastActive || this.isNewDay(lastActive)) {
          updateData['platformStats.daysActive'] = (user.platformStats?.daysActive || 0) + 1;
        }
        break;
    }

    await User.findByIdAndUpdate(user._id, { $set: updateData });
  }

  /**
   * Update progress for all squads the user belongs to
   */
  private static async updateSquadProgress(user: any, event: ActivityEvent): Promise<void> {
    const userSquads = await EdduraSquad.find({
      memberIds: user._id
    });

    for (const squad of userSquads) {
      await this.updateSquadGoalProgress(squad, user, event);
    }
  }

  /**
   * Update specific squad goal progress
   */
  private static async updateSquadGoalProgress(squad: any, user: any, event: ActivityEvent): Promise<void> {
    let updated = false;

    for (const goal of squad.goals) {
      let shouldUpdate = false;
      let progressIncrement = 0;

      // Determine if this activity affects the goal
      switch (goal.type) {
        case 'documents_created':
          if (event.activityType === 'document_created') {
            shouldUpdate = true;
            progressIncrement = 1;
          }
          break;
        case 'applications_started':
          if (event.activityType === 'application_started') {
            shouldUpdate = true;
            progressIncrement = 1;
          }
          break;
        case 'applications_completed':
          if (event.activityType === 'application_completed') {
            shouldUpdate = true;
            progressIncrement = 1;
          }
          break;
        case 'peer_reviews_provided':
          if (event.activityType === 'peer_review_provided') {
            shouldUpdate = true;
            progressIncrement = 1;
          }
          break;
        case 'days_active':
          if (event.activityType === 'platform_activity' && this.isNewDay(user.platformStats?.lastActive)) {
            shouldUpdate = true;
            progressIncrement = 1;
          }
          break;
        case 'squad_activity':
          // Squad activity is calculated based on overall member activity
          shouldUpdate = true;
          progressIncrement = this.calculateSquadActivityScore(squad);
          break;
      }

      if (shouldUpdate) {
        await this.updateGoalProgress(squad._id, goal, user._id, progressIncrement);
        updated = true;
      }
    }

    if (updated) {
      await this.updateSquadActivityMetrics(squad._id);
    }
  }

  /**
   * Update individual goal progress
   */
  private static async updateGoalProgress(squadId: string, goal: any, userId: string, increment: number): Promise<void> {
    const squad = await EdduraSquad.findById(squadId);
    if (!squad) return;

    const goalIndex = squad.goals.findIndex((g: any) => g.type === goal.type);
    if (goalIndex === -1) return;

    const goalToUpdate = squad.goals[goalIndex];

    // Update member progress
    const memberProgressIndex = goalToUpdate.memberProgress.findIndex(
      (mp: any) => mp.userId.toString() === userId
    );

    if (memberProgressIndex === -1) {
      // Add new member progress
      goalToUpdate.memberProgress.push({
        userId: userId,
        progress: increment,
        target: goalToUpdate.individualTarget || goalToUpdate.target,
        percentage: Math.round((increment / (goalToUpdate.individualTarget || goalToUpdate.target)) * 100),
        lastActivity: new Date(),
        needsHelp: false,
        isOnTrack: true
      });
    } else {
      // Update existing member progress
      const memberProgress = goalToUpdate.memberProgress[memberProgressIndex];
      memberProgress.progress += increment;
      memberProgress.percentage = Math.round((memberProgress.progress / memberProgress.target) * 100);
      memberProgress.lastActivity = new Date();
      memberProgress.isOnTrack = memberProgress.percentage >= 75;
      memberProgress.needsHelp = memberProgress.percentage < 25;
    }

    // Update squad progress
    const totalProgress = goalToUpdate.memberProgress.reduce((sum: number, mp: any) => sum + mp.progress, 0);
    goalToUpdate.currentProgress = totalProgress;
    goalToUpdate.progressPercentage = Math.round((totalProgress / goalToUpdate.target) * 100);
    goalToUpdate.daysRemaining = Math.ceil((new Date(goalToUpdate.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    goalToUpdate.isOnTrack = goalToUpdate.progressPercentage >= 75;

    await squad.save();
  }

  /**
   * Update squad activity metrics
   */
  private static async updateSquadActivityMetrics(squadId: string): Promise<void> {
    const squad = await EdduraSquad.findById(squadId);
    if (!squad) return;

    // Calculate total applications, documents, and reviews
    squad.totalApplications = squad.goals.reduce((sum: number, g: any) => {
      if (g.type === 'applications_started' || g.type === 'applications_completed') {
        return sum + g.currentProgress;
      }
      return sum;
    }, 0);

    squad.totalDocuments = squad.goals.reduce((sum: number, g: any) => {
      if (g.type === 'documents_created') {
        return sum + g.currentProgress;
      }
      return sum;
    }, 0);

    squad.totalReviews = squad.goals.reduce((sum: number, g: any) => {
      if (g.type === 'peer_reviews_provided') {
        return sum + g.currentProgress;
      }
      return sum;
    }, 0);

    // Calculate average activity score
    const totalMembers = squad.memberIds.length;
    const activeMembers = squad.goals.flatMap((goal: any) => 
      goal.memberProgress.filter((mp: any) => {
        const daysSinceLastActivity = Math.ceil((new Date().getTime() - new Date(mp.lastActivity).getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceLastActivity <= 7;
      })
    ).length;

    squad.averageActivityScore = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;

    await squad.save();
  }

  /**
   * Check if user needs help and notify squad
   */
  private static async checkHelpIdentification(user: any): Promise<void> {
    const userSquads = await EdduraSquad.find({
      memberIds: user._id
    });

    for (const squad of userSquads) {
      const needsHelp = squad.goals.some((goal: any) => {
        const memberProgress = goal.memberProgress.find((mp: any) => mp.userId.toString() === user._id.toString());
        return memberProgress && memberProgress.needsHelp;
      });

      if (needsHelp) {
        // TODO: Send notification to squad members
        console.log(`User ${user.firstName} ${user.lastName} needs help in squad ${squad.name}`);
      }
    }
  }

  /**
   * Calculate squad activity score
   */
  private static calculateSquadActivityScore(squad: any): number {
    const totalMembers = squad.memberIds.length;
    const activeMembers = squad.goals.flatMap((goal: any) => 
      goal.memberProgress.filter((mp: any) => {
        const daysSinceLastActivity = Math.ceil((new Date().getTime() - new Date(mp.lastActivity).getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceLastActivity <= 7;
      })
    ).length;

    return totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;
  }

  /**
   * Check if a date is a new day compared to last active
   */
  private static isNewDay(lastActive: Date): boolean {
    if (!lastActive) return true;
    
    const now = new Date();
    const last = new Date(lastActive);
    
    return now.getDate() !== last.getDate() || 
           now.getMonth() !== last.getMonth() || 
           now.getFullYear() !== last.getFullYear();
  }

  /**
   * Sync existing user activities with squad progress
   */
  static async syncExistingActivities(): Promise<void> {
    try {
      await connectToDatabase();

      const users = await User.find({});
      
      for (const user of users) {
        // Sync document count
        const documentCount = await Document.countDocuments({ userId: user._id });
        await User.findByIdAndUpdate(user._id, {
          'platformStats.documentsCreated': documentCount
        });

        // Sync application count
        const applicationCount = await Application.countDocuments({ userId: user._id });
        await User.findByIdAndUpdate(user._id, {
          'platformStats.applicationsStarted': applicationCount
        });

        // Update squad progress for this user
        await this.updateSquadProgress(user, {
          userId: user._id.toString(),
          activityType: 'login',
          timestamp: new Date()
        });
      }

      console.log('Synced existing activities for all users');
    } catch (error) {
      console.error('Error syncing existing activities:', error);
    }
  }
}