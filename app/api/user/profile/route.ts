import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { authConfig } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id)
      .select('-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires')
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate quiz score based on career preferences
    let quizScore = 0;
    if (user.careerPreferences?.recommendedFields?.length) {
      quizScore = Math.min(95, 70 + (user.careerPreferences.recommendedFields.length * 5));
    }

    // Get user activity stats
    const stats = {
      quizScore,
      recommendationsCount: user.careerPreferences?.recommendedFields?.length || 0,
      programsViewed: 0, // This would need to be tracked separately
      applicationsStarted: 0 // This would need to be tracked separately
    };

    const userProfile = {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      dateOfBirth: user.dateOfBirth,
      phoneNumber: user.phoneNumber,
      country: user.country,
      city: user.city,
      profilePicture: user.profilePicture,
      quizCompleted: user.quizCompleted,
      quizCompletedAt: user.quizCompletedAt,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      stats,
      careerPreferences: user.careerPreferences
    };

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { firstName, lastName, dateOfBirth, phoneNumber, country, city } = body;

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update profile fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (country) user.country = country;
    if (city) user.city = city;

    await user.save();

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        phoneNumber: user.phoneNumber,
        country: user.country,
        city: user.city,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}