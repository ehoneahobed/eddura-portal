import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';
import UserActivity from '@/models/UserActivity';
import Application from '@/models/Application';
import Document from '@/models/Document';
import RecommendationRequest from '@/models/RecommendationRequest';
import SavedScholarship from '@/models/SavedScholarship';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email })
      .select('-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const {
      firstName,
      lastName,
      dateOfBirth,
      phoneNumber,
      country,
      city,
      profilePicture,
      educationLevel,
      currentInstitution,
      fieldOfStudy,
      graduationYear,
      gpa,
      languages,
      certifications,
      skills,
      sharingPreferences,
      autoShareProgress,
      autoShareAchievements
    } = body;

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update basic profile fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (country) user.country = country;
    if (city) user.city = city;
    if (profilePicture) user.profilePicture = profilePicture;

    // Update academic background
    if (educationLevel) user.educationLevel = educationLevel;
    if (currentInstitution) user.currentInstitution = currentInstitution;
    if (fieldOfStudy) user.fieldOfStudy = fieldOfStudy;
    if (graduationYear) user.graduationYear = graduationYear;
    if (gpa) user.gpa = gpa;

    // Update languages and skills
    if (languages) user.languages = languages;
    if (certifications) user.certifications = certifications;
    if (skills) user.skills = skills;

    // Update sharing preferences
    if (sharingPreferences) {
      user.sharingPreferences = {
        ...user.sharingPreferences,
        ...sharingPreferences
      };
    }

    // Update auto-share settings
    if (autoShareProgress !== undefined) user.autoShareProgress = autoShareProgress;
    if (autoShareAchievements !== undefined) user.autoShareAchievements = autoShareAchievements;

    await user.save();

    // Return updated user without sensitive fields
    const updatedUser = await User.findById(user._id)
      .select('-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires');

    return NextResponse.json({ 
      user: updatedUser,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}