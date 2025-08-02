import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import User from '@/models/User';
import Referral from '@/models/Referral';
import connectDB from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get current user
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's referrals
    const referrals = await Referral.find({ referrerId: currentUser._id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate statistics
    const totalReferrals = referrals.length;
    const successfulReferrals = referrals.filter(r => r.isUsed).length;
    const totalRewardsEarned = referrals
      .filter(r => r.isUsed && !r.referrerRewardClaimed)
      .reduce((sum, r) => sum + r.referrerReward, 0);
    const totalClicks = referrals.reduce((sum, r) => sum + r.clicks, 0);

    // Get recent successful referrals
    const recentReferrals = referrals
      .filter(r => r.isUsed)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      stats: {
        totalReferrals,
        successfulReferrals,
        totalRewardsEarned,
        totalClicks,
        conversionRate: totalReferrals > 0 ? (successfulReferrals / totalReferrals * 100).toFixed(1) : 0
      },
      recentReferrals,
      userReferralCode: currentUser.referralCode,
      userReferralStats: currentUser.referralStats
    });
  } catch (error) {
    console.error('Error getting referral stats:', error);
    return NextResponse.json(
      { error: 'Failed to get referral statistics' },
      { status: 500 }
    );
  }
}