import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Admin from "@/models/Admin";
import { AdminRole } from "@/types/admin";
import connectDB from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "admin" && session.user.role !== "super_admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has permission to create admins
    if (!session.user.permissions?.includes("admin:create")) {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await connectDB();

    const { email, firstName, lastName, password, role } = await request.json();

    // Validate input
    if (!email || !firstName || !lastName || !password || !role) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Validate role
    if (!Object.values(AdminRole).includes(role)) {
      return NextResponse.json(
        { message: "Invalid role" },
        { status: 400 }
      );
    }

    // Only super admins can create other super admins
    if (role === AdminRole.SUPER_ADMIN && session.user.role !== 'super_admin') {
      return NextResponse.json(
        { message: "Only super admins can create super admin accounts" },
        { status: 403 }
      );
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return NextResponse.json(
        { message: "Admin with this email already exists" },
        { status: 400 }
      );
    }

    // Create admin account directly
    const admin = new Admin({
      email,
      firstName,
      lastName,
      password, // Will be hashed by the pre-save middleware
      role,
      createdBy: session.user.id,
      isEmailVerified: true, // Since we're creating the account directly
      isActive: true, // Account is immediately active
      isInviteAccepted: true, // No invite needed
    });

    await admin.save();

    return NextResponse.json(
      { 
        message: "Admin account created successfully",
        adminId: admin._id,
        email: admin.email,
        role: admin.role
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin creation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 