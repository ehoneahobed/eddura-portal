import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Admin from "@/models/Admin";
import { AdminRole } from "@/types/admin";
import connectDB from "@/lib/mongodb";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "admin" && session.user.role !== "super_admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has permission to invite admins
    if (!session.user.permissions?.includes("admin:invite")) {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await connectDB();

    const { email, firstName, lastName, role } = await request.json();

    // Validate input
    if (!email || !firstName || !lastName || !role) {
      return NextResponse.json(
        { message: "All fields are required" },
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

    // Generate invite token
    const inviteToken = crypto.randomBytes(32).toString("hex");
    const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create admin invite
    const admin = new Admin({
      email,
      firstName,
      lastName,
      role,
      invitedBy: session.user.id,
      inviteToken,
      inviteExpires,
      isInviteAccepted: false,
      isEmailVerified: false,
      isActive: false, // Will be activated when invite is accepted
    });

    await admin.save();

    // Send invite email
    try {
      await resend.emails.send({
        from: "noreply@yourdomain.com",
        to: email,
        subject: "You've been invited to join the admin team",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Admin Invitation</h2>
            <p>Hi ${firstName},</p>
            <p>You have been invited to join our admin team with the role of <strong>${role}</strong>.</p>
            <p>Click the button below to accept the invitation and set up your account:</p>
            <a href="${process.env.NEXTAUTH_URL}/admin/accept-invite?token=${inviteToken}" 
               style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
              Accept Invitation
            </a>
            <p>This invitation will expire in 7 days.</p>
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
            <p>Best regards,<br>The Admin Team</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Delete the admin record if email fails
      await Admin.findByIdAndDelete(admin._id);
      return NextResponse.json(
        { message: "Failed to send invitation email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: "Admin invitation sent successfully",
        adminId: admin._id 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin invite error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}