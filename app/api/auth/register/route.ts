import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';
import { z } from 'zod';

// Validation schema for registration
const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    
    // Validate input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName } = validationResult.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      emailVerificationToken,
      emailVerificationExpires,
      isEmailVerified: false,
      isActive: true,
      loginCount: 0,
    });

    await user.save();

    // TODO: Send email verification email
    // For now, we'll just return success
    // In production, you would integrate with an email service like SendGrid, AWS SES, etc.

    return NextResponse.json(
      { 
        message: 'User registered successfully. Please check your email to verify your account.',
        userId: user._id,
        email: user.email
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 