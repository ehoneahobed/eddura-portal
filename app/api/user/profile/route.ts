import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import UserActivity from '@/models/UserActivity';
import Application from '@/models/Application';
import Document from '@/models/Document';
import RecommendationRequest from '@/models/RecommendationRequest';
import SavedScholarship from '@/models/SavedScholarship';


export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
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

    // Calculate user stats
    const [
      applicationPackagesCreated,
      documentsCreated,
      recommendationLettersRequested,
      recommendationLettersReceived,
      scholarshipsSaved
    ] = await Promise.all([
      // Count application packages created by user
      Application.countDocuments({ userId: user._id }),
      
      // Count documents created by user
      Document.countDocuments({ userId: user._id, isActive: true }),
      
      // Count recommendation letters requested
      RecommendationRequest.countDocuments({ studentId: user._id }),
      
      // Count recommendation letters received (status = 'received')
      RecommendationRequest.countDocuments({ 
        studentId: user._id, 
        status: 'received' 
      }),
      
      // Count scholarships saved by user
      SavedScholarship.countDocuments({ userId: user._id })
    ]);

    const stats = {
      applicationPackagesCreated,
      documentsCreated,
      recommendationLettersRequested,
      recommendationLettersReceived,
      scholarshipsSaved
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

    // Log login activity if this is a fresh login
    if (user.lastLoginAt) {
      const lastLogin = new Date(user.lastLoginAt);
      const now = new Date();
      const hoursSinceLastLogin = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);
      
      // Log activity if more than 1 hour has passed since last login
      if (hoursSinceLastLogin > 1) {
        try {
          const activity = new UserActivity({
            userId: user._id as any,
            type: 'login',
            title: 'User Login',
            description: 'User logged into the platform',
            metadata: {},
            timestamp: new Date()
          });
          await activity.save();
        } catch (error) {
          console.error('Error logging login activity:', error);
        }
      }
    }

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
    const session = await auth();
    
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
          id: user._id?.toString() || '',
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