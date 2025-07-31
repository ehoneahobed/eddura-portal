import { NextRequest, NextResponse } from 'next/server';
import { auth, hasPermission } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { isAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || !isAdmin(session.user)) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has permission to view admins
    if (!hasPermission(session.user, "admin:read")) {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await connectDB();

    const admins = await Admin.find({})
      .select('-password') // Exclude password from response
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ admins });
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || !isAdmin(session.user)) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has permission to create admins
    if (!hasPermission(session.user, "admin:create")) {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { email, firstName, lastName, role, permissions, password } = body;

    // Validate required fields
    if (!email || !role || !permissions || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return NextResponse.json(
        { message: "Admin with this email already exists" },
        { status: 409 }
      );
    }

    // Create new admin
    const newAdmin = new Admin({
      email,
      firstName,
      lastName,
      role,
      permissions,
      password, // Will be hashed by the model
      isActive: true,
      createdBy: session.user.email
    });

    await newAdmin.save();

    // Return admin without password
    const adminResponse = newAdmin.toObject();
    delete adminResponse.password;

    return NextResponse.json(
      { message: "Admin created successfully", admin: adminResponse },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 