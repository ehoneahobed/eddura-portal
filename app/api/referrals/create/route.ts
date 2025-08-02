import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import User from '@/models/User';
import Referral from '@/models/Referral';
import connectDB from '@/lib/mongodb';

export async function POST(request: NextRequest) {
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

    // Generate unique referral code
    const generateReferralCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    let referralCode = generateReferralCode();
    
    // Ensure code is unique
    while (await Referral.findOne({ referralCode })) {
      referralCode = generateReferralCode();
    }

    // Create referral link
    const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}/join/${referralCode}`;

    // Create referral record
    const referral = new Referral({
      referrerId: currentUser._id,
      referralCode,
      referralLink,
      referrerReward: 50, // 50 tokens for successful referral
      referredReward: 25  // 25 tokens for new user
    });

    await referral.save();

    // Update user's referral code if not set
    if (!currentUser.referralCode) {
      currentUser.referralCode = referralCode;
      await currentUser.save();
    }

    return NextResponse.json({
      success: true,
      referral: {
        code: referralCode,
        link: referralLink,
        referrerReward: referral.referrerReward,
        referredReward: referral.referredReward
      }
    });
  } catch (error) {
    console.error('Error creating referral:', error);
    return NextResponse.json(
      { error: 'Failed to create referral' },
      { status: 500 }
    );
  }
}