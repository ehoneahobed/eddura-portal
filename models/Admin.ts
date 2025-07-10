import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { AdminRole } from '@/types/admin';

/**
 * Admin interface representing an admin user in the platform
 */
export interface IAdmin extends Document {
  // Authentication & Basic Info
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  
  // Profile Information
  phoneNumber?: string;
  profilePicture?: string;
  department?: string;
  position?: string;
  
  // Invite System
  invitedBy?: mongoose.Types.ObjectId;
  inviteToken?: string;
  inviteExpires?: Date;
  isInviteAccepted: boolean;
  
  // Creation tracking
  createdBy?: mongoose.Types.ObjectId;
  
  // Permissions (calculated from role)
  permissions: string[];
  
  // Account Status
  isActive: boolean;
  lastLoginAt?: Date;
  loginCount: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  hasPermission(permission: string): boolean;
}

const AdminSchema: Schema = new Schema<IAdmin>({
  // Authentication & Basic Info
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: false, 
    minlength: 8 
  },
  firstName: { 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 50 
  },
  lastName: { 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 50 
  },
  role: { 
    type: String, 
    enum: Object.values(AdminRole),
    default: AdminRole.SUPPORT,
    required: true 
  },
  isEmailVerified: { 
    type: Boolean, 
    default: false 
  },
  emailVerificationToken: { 
    type: String 
  },
  emailVerificationExpires: { 
    type: Date 
  },
  passwordResetToken: { 
    type: String 
  },
  passwordResetExpires: { 
    type: Date 
  },
  
  // Profile Information
  phoneNumber: { 
    type: String, 
    trim: true 
  },
  profilePicture: { 
    type: String, 
    trim: true 
  },
  department: { 
    type: String, 
    trim: true 
  },
  position: { 
    type: String, 
    trim: true 
  },
  
  // Invite System
  invitedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'Admin' 
  },
  inviteToken: { 
    type: String 
  },
  inviteExpires: { 
    type: Date 
  },
  isInviteAccepted: { 
    type: Boolean, 
    default: false 
  },
  
  // Creation tracking
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'Admin' 
  },
  
  // Permissions (will be calculated based on role)
  permissions: [{ 
    type: String, 
    trim: true 
  }],
  
  // Account Status
  isActive: { 
    type: Boolean, 
    default: true 
  },
  lastLoginAt: { 
    type: Date 
  },
  loginCount: { 
    type: Number, 
    default: 0 
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
AdminSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password and set permissions
AdminSchema.pre('save', async function(this: any, next) {
  if (this.isModified('password') && this.password) {
    // Check if password is already hashed (bcrypt hashes start with $2b$)
    if (!this.password.startsWith('$2b$')) {
      try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password as string, salt);
      } catch (error) {
        return next(error as Error);
      }
    }
  }
  
  // Set permissions based on role
  if (this.isModified('role')) {
    this.permissions = (this.constructor as any).getPermissionsForRole(this.role);
  }
  
  next();
});

// Method to compare password
AdminSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if admin has specific permission
AdminSchema.methods.hasPermission = function(permission: string): boolean {
  return this.permissions.includes(permission);
};

// Permissions map for each role
const ADMIN_PERMISSIONS_MAP: Record<AdminRole, string[]> = {
  [AdminRole.SUPER_ADMIN]: [
    'admin:create',
    'admin:read',
    'admin:update',
    'admin:delete',
    'admin:invite',
    'user:read',
    'user:update',
    'user:delete',
    'content:create',
    'content:read',
    'content:update',
    'content:delete',
    'analytics:read',
    'settings:read',
    'settings:update',
    'system:manage'
  ],
  [AdminRole.ADMIN]: [
    'admin:read',
    'admin:update',
    'admin:invite',
    'user:read',
    'user:update',
    'content:create',
    'content:read',
    'content:update',
    'content:delete',
    'analytics:read',
    'settings:read'
  ],
  [AdminRole.MODERATOR]: [
    'user:read',
    'user:update',
    'content:read',
    'content:update',
    'analytics:read'
  ],
  [AdminRole.SUPPORT]: [
    'user:read',
    'content:read',
    'analytics:read'
  ]
};

// Static method to get permissions for a role
(AdminSchema.statics as any).getPermissionsForRole = function(role: AdminRole): string[] {
  return ADMIN_PERMISSIONS_MAP[role] || [];
};

// Indexes for better query performance
// Note: email index is automatically created by unique: true constraint
AdminSchema.index({ role: 1 });
AdminSchema.index({ isActive: 1 });
AdminSchema.index({ inviteToken: 1 });

const Admin: Model<IAdmin> = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);

export default Admin;