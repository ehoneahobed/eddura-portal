import { NextRequest, NextResponse } from 'next/server';
import Referral from '@/models/Referral';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { referralCode, userId } = await request.json();

    if (!referralCode || !userId) {
      return NextResponse.json({ error: 'Referral code and user ID are required' }, { status: 400 });
    }

    // Find the referral
    const referral = await Referral.findOne({ 
      referralCode: referralCode.toUpperCase(),
      isUsed: false
    });

    if (!referral) {
      return NextResponse.json({ error: 'Invalid or already used referral code' }, { status: 400 });
    }

    // Check if user is trying to use their own referral code
    if (referral.referrerId.toString() === userId) {
      return NextResponse.json({ error: 'Cannot use your own referral code' }, { status: 400 });
    }

    // Get the referrer user
    const referrer = await User.findById(referral.referrerId);
    if (!referrer) {
      return NextResponse.json({ error: 'Referrer not found' }, { status: 404 });
    }

    // Get the referred user
    const referredUser = await User.findById(userId);
    if (!referredUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Mark referral as used
    referral.isUsed = true;
    referral.usedAt = new Date();
    referral.referredId = userId;
    await referral.save();

    // Award tokens to both users
    referrer.tokens += referral.referrerReward;
    referrer.totalTokensEarned += referral.referrerReward;
    referrer.referralStats.successfulReferrals += 1;
    referrer.referralStats.totalRewardsEarned += referral.referrerReward;
    referrer.referralStats.lastReferralAt = new Date();
    await referrer.save();

    referredUser.tokens += referral.referredReward;
    referredUser.totalTokensEarned += referral.referredReward;
    referredUser.referredBy = referralCode.toUpperCase();
    await referredUser.save();

    return NextResponse.json({
      success: true,
      message: 'Referral code applied successfully',
      rewards: {
        referrerReward: referral.referrerReward,
        referredReward: referral.referredReward
      }
    });
  } catch (error) {
    console.error('Error using referral code:', error);
    return NextResponse.json(
      { error: 'Failed to use referral code' },
      { status: 500 }
    );
  }
}