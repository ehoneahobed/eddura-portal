import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import User from '@/models/User';
import { UserAchievement } from '@/models/Achievement';
import connectDB from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'tokens';

    // Get current user for ranking
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let leaderboard: any[] = [];
    let userRank: number | null = null;

    switch (category) {
      case 'tokens':
        leaderboard = await User.find({})
          .select('firstName lastName email profilePicture tokens totalTokensEarned')
          .sort({ tokens: -1 })
          .limit(50);
        
        // Filter out users without required fields and add defaults
        leaderboard = leaderboard.map(user => ({
          ...user.toObject(),
          tokens: user.tokens || 0,
          totalTokensEarned: user.totalTokensEarned || 0
        }));
        break;

      case 'activity':
        leaderboard = await User.find({})
          .select('firstName lastName email profilePicture platformStats')
          .limit(50);
        
        // Filter out users without required fields and add defaults
        leaderboard = leaderboard.map(user => ({
          ...user.toObject(),
          platformStats: {
            documentsCreated: user.platformStats?.documentsCreated || 0,
            applicationsStarted: user.platformStats?.applicationsStarted || 0,
            peerReviewsProvided: user.platformStats?.peerReviewsProvided || 0,
            daysActive: user.platformStats?.daysActive || 0,
            lastActive: user.platformStats?.lastActive || new Date()
          }
        })).sort((a, b) => (b.platformStats.daysActive || 0) - (a.platformStats.daysActive || 0));
        break;

      case 'referrals':
        leaderboard = await User.find({})
          .select('firstName lastName email profilePicture referralStats')
          .limit(50);
        
        // Filter out users without required fields and add defaults
        leaderboard = leaderboard.map(user => ({
          ...user.toObject(),
          referralStats: {
            totalReferrals: user.referralStats?.totalReferrals || 0,
            successfulReferrals: user.referralStats?.successfulReferrals || 0,
            totalRewardsEarned: user.referralStats?.totalRewardsEarned || 0
          }
        })).sort((a, b) => (b.referralStats.successfulReferrals || 0) - (a.referralStats.successfulReferrals || 0));
        break;

      case 'achievements':
        // Get users with their achievement points
        const usersWithAchievements = await User.find({})
          .select('firstName lastName email profilePicture')
          .limit(50);

        // For each user, calculate achievement points
        const usersWithAchievementPoints = await Promise.all(
          usersWithAchievements.map(async (user) => {
            const achievements = await UserAchievement.find({ 
              userId: user._id,
              isCompleted: true 
            }).populate('achievementId');

            const totalPoints = achievements.reduce((sum, userAchievement) => {
              return sum + ((userAchievement as any).pointsEarned || 0);
            }, 0);

            return {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              profilePicture: user.profilePicture,
              achievements: achievements.map(ua => ({
                name: (ua.achievementId as any)?.name || 'Unknown',
                category: (ua.achievementId as any)?.category || 'general',
                points: (ua as any).pointsEarned || 0
              })),
              totalAchievementPoints: totalPoints
            };
          })
        );

        leaderboard = usersWithAchievementPoints.sort((a, b) => b.totalAchievementPoints - a.totalAchievementPoints);
        break;

      default:
        return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    // Calculate user's rank
    const userIndex = leaderboard.findIndex(entry => entry._id.toString() === (currentUser._id as any).toString());
    userRank = userIndex !== -1 ? userIndex + 1 : null;

    return NextResponse.json({
      success: true,
      leaderboard,
      userRank,
      category
    });
  } catch (error) {
    console.error('Error getting global leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to get leaderboard data' },
      { status: 500 }
    );
  }
}