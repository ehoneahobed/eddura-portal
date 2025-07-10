import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Admin from '@/models/Admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    
    if (!session?.user || session.user.role !== "admin" && session.user.role !== "super_admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has permission to view admins
    if (!session.user.permissions?.includes("admin:read")) {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await connectDB();

    const admin = await Admin.findById(resolvedParams.id)
      .select('-password') // Exclude password from response
      .lean();

    if (!admin) {
      return NextResponse.json(
        { message: "Admin not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ admin });
  } catch (error) {
    console.error('Error fetching admin:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    
    if (!session?.user || session.user.role !== "admin" && session.user.role !== "super_admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has permission to update admins
    if (!session.user.permissions?.includes("admin:update")) {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { firstName, lastName, role, permissions, isActive, password } = body;

    // Find the admin
    const admin = await Admin.findById(resolvedParams.id);
    if (!admin) {
      return NextResponse.json(
        { message: "Admin not found" },
        { status: 404 }
      );
    }

    // Prevent users from modifying super admins unless they are also super admins
    if (admin.role === 'super_admin' && session.user.role !== 'super_admin') {
      return NextResponse.json(
        { message: "Only super admins can modify super admin accounts" },
        { status: 403 }
      );
    }

    // Update fields
    if (firstName !== undefined) admin.firstName = firstName;
    if (lastName !== undefined) admin.lastName = lastName;
    if (role !== undefined) admin.role = role;
    if (permissions !== undefined) admin.permissions = permissions;
    if (isActive !== undefined) admin.isActive = isActive;
    if (password !== undefined) admin.password = password;

    await admin.save();

    // Return admin without password
    const adminResponse = admin.toObject();
    delete adminResponse.password;

    return NextResponse.json(
      { message: "Admin updated successfully", admin: adminResponse }
    );
  } catch (error) {
    console.error('Error updating admin:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    
    if (!session?.user || session.user.role !== "admin" && session.user.role !== "super_admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has permission to delete admins
    if (!session.user.permissions?.includes("admin:delete")) {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await connectDB();

    // Find the admin
    const admin = await Admin.findById(resolvedParams.id);
    if (!admin) {
      return NextResponse.json(
        { message: "Admin not found" },
        { status: 404 }
      );
    }

    // Prevent users from deleting super admins unless they are also super admins
    if (admin.role === 'super_admin' && session.user.role !== 'super_admin') {
      return NextResponse.json(
        { message: "Only super admins can delete super admin accounts" },
        { status: 403 }
      );
    }

    // Prevent users from deleting themselves
    if (admin.email === session.user.email) {
      return NextResponse.json(
        { message: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    // Delete the admin
    await Admin.findByIdAndDelete(resolvedParams.id);

    return NextResponse.json(
      { message: "Admin deleted successfully" }
    );
  } catch (error) {
    console.error('Error deleting admin:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 