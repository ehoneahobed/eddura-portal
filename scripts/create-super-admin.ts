import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

import connectDB from "../lib/mongodb";
import Admin, { AdminRole } from "../models/Admin";

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
      email: "obedehoneah@gmail.com", // Change this to your email
      password: "ChangeMe123!", // Change this to a secure password
      role: AdminRole.SUPER_ADMIN,
      isEmailVerified: true,
      isActive: true,
      isInviteAccepted: true,
    };

    // Create super admin (password will be hashed by the model's pre-save middleware)
    const superAdmin = new Admin(superAdminData);

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