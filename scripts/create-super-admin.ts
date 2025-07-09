import connectDB from "../lib/mongodb";
import Admin, { AdminRole } from "../models/Admin";
import bcrypt from "bcryptjs";

async function createSuperAdmin() {
  try {
    await connectDB();
    
    // Check if super admin already exists
    const existingSuperAdmin = await Admin.findOne({ role: AdminRole.SUPER_ADMIN });
    
    if (existingSuperAdmin) {
      console.log("Super admin already exists!");
      process.exit(0);
    }

    // Super admin details
    const superAdminData = {
      firstName: "Super",
      lastName: "Admin",
      email: "superadmin@yourdomain.com", // Change this to your email
      password: "SuperAdmin123!", // Change this to a secure password
      role: AdminRole.SUPER_ADMIN,
      isEmailVerified: true,
      isActive: true,
      isInviteAccepted: true,
    };

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(superAdminData.password, salt);

    // Create super admin
    const superAdmin = new Admin({
      ...superAdminData,
      password: hashedPassword,
    });

    await superAdmin.save();

    console.log("✅ Super admin created successfully!");
    console.log(`Email: ${superAdminData.email}`);
    console.log(`Password: ${superAdminData.password}`);
    console.log("\n⚠️  IMPORTANT: Change the password after first login!");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating super admin:", error);
    process.exit(1);
  }
}

createSuperAdmin();