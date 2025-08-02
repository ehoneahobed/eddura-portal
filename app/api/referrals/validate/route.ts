import { NextRequest, NextResponse } from 'next/server';
import Referral from '@/models/Referral';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 });
    }

    // Find the referral
    const referral = await Referral.findOne({ 
      referralCode: code.toUpperCase(),
      isUsed: false
    });

    if (!referral) {
      return NextResponse.json({ error: 'Invalid or already used referral code' }, { status: 404 });
    }

    // Get the referrer user
    const referrer = await User.findById(referral.referrerId)
      .select('firstName lastName email profilePicture');

    if (!referrer) {
      return NextResponse.json({ error: 'Referrer not found' }, { status: 404 });
    }

    const referralInfo = {
      code: referral.referralCode,
      referrerName: `${referrer.firstName} ${referrer.lastName}`,
      referrerEmail: referrer.email,
      referrerProfilePicture: referrer.profilePicture,
      referrerReward: referral.referrerReward,
      referredReward: referral.referredReward,
      isValid: true
    };

    return NextResponse.json({
      success: true,
      referral: referralInfo
    });
  } catch (error) {
    console.error('Error validating referral code:', error);
    return NextResponse.json(
      { error: 'Failed to validate referral code' },
      { status: 500 }
    );
  }
}