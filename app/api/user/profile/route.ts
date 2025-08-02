import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

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

    return NextResponse.json({ user });
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