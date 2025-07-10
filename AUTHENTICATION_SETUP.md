# Authentication System Setup Guide

This guide covers the complete authentication system setup with NextAuth v5, including admin and user portals with role-based access control.

## 🏗️ System Architecture

### Portal Structure
- **User Portal**: Regular users can register, sign in, and access user-specific features
- **Admin Portal**: Staff members with different roles and permissions
- **Super Admin**: Highest level admin with full system access

### Admin Roles & Permissions

#### 1. Super Admin
- Full system access
- Can create and manage all admin users
- Can invite new admins
- All permissions

#### 2. Admin
- Content management
- User management
- Can invite other admins
- Analytics access

#### 3. Moderator
- Content moderation
- User management
- Analytics read access

#### 4. Support
- Read-only access to content
- Basic support functions
- Analytics read access

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install next-auth@beta @auth/mongodb-adapter resend
```

### 2. Environment Variables
Create a `.env.local` file based on `.env.example`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/your-database-name

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Email Service (Resend)
RESEND_API_KEY=your-resend-api-key-here

# App Configuration
NEXT_PUBLIC_APP_NAME=Your App Name
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Create Super Admin
```bash
npx ts-node scripts/create-super-admin.ts
```

### 4. Start Development Server
```bash
npm run dev
```

## 📁 File Structure

```
├── app/
│   ├── auth/
│   │   ├── signin/page.tsx          # Combined sign-in page
│   │   ├── signup/page.tsx          # User registration
│   │   └── verify/page.tsx          # Email verification
│   ├── admin/
│   │   ├── layout.tsx               # Admin layout with auth
│   │   ├── dashboard/page.tsx       # Admin dashboard
│   │   ├── invite/page.tsx          # Admin invitation
│   │   └── accept-invite/page.tsx   # Accept admin invite
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/route.ts  # NextAuth API
│       │   ├── register/route.ts       # User registration
│       │   └── verify/route.ts         # Email verification
│       └── admin/
│           └── invite/route.ts         # Admin invitation
├── components/
│   └── admin/
│       ├── AdminHeader.tsx          # Admin header
│       └── AdminSidebar.tsx         # Admin navigation
├── lib/
│   ├── auth.ts                      # NextAuth configuration
│   ├── mongodb.ts                   # Database connection
│   └── mongodb-client.ts            # MongoDB client for adapter
├── models/
│   ├── User.ts                      # User model
│   └── Admin.ts                     # Admin model
└── scripts/
    └── create-super-admin.ts        # Super admin creation
```

## 🔐 Authentication Flow

### User Registration
1. User fills registration form
2. Account created with email verification token
3. Verification email sent via Resend
4. User clicks link to verify email
5. Account activated

### User Login
1. User selects "User Portal" tab
2. Enters credentials
3. Redirected to user dashboard

### Admin Login
1. User selects "Admin Portal" tab
2. Enters admin credentials
3. Redirected to admin dashboard

### Admin Invitation
1. Super Admin/Admin invites new admin
2. Invitation email sent with token
3. Invited admin clicks link
4. Sets up password and activates account

## 🎨 UI Components

### Authentication Pages
- **Sign In**: Beautiful dual-portal interface with tabs
- **Sign Up**: User registration with validation
- **Email Verification**: Clean verification flow

### Admin Interface
- **Dashboard**: Overview with stats and quick actions
- **Header**: User menu and notifications
- **Sidebar**: Role-based navigation
- **Invite Page**: Admin invitation form

## 🔧 Configuration

### NextAuth Setup
The authentication is configured in `lib/auth.ts` with:
- Credentials provider for both portals
- JWT session strategy
- Role-based session data
- Permission checking helpers

### Database Models
- **User Model**: Regular user accounts with quiz data
- **Admin Model**: Admin accounts with roles and permissions

### Email Service
Uses Resend for:
- User email verification
- Admin invitation emails
- Password reset (future)

## 🛡️ Security Features

### Password Security
- Bcrypt hashing with salt rounds
- Minimum 8 character requirement
- Password confirmation validation

### Session Security
- JWT tokens with 30-day expiry
- Secure session handling
- Role-based access control

### Email Verification
- Secure token generation
- 24-hour expiry for verification
- One-time use tokens

### Admin Invitations
- Secure invitation tokens
- 7-day expiry
- Role-based permissions

## 🚀 Usage Examples

### Check User Permissions
```typescript
import { hasPermission, isAdmin, isSuperAdmin } from "@/lib/auth";

// Check specific permission
if (hasPermission(user, "admin:invite")) {
  // Can invite admins
}

// Check if user is admin
if (isAdmin(user)) {
  // Show admin features
}

// Check if user is super admin
if (isSuperAdmin(user)) {
  // Show super admin features
}
```

### Protected Routes
```typescript
// In layout or page
const session = await auth();

if (!session?.user || session.user.type !== "admin") {
  redirect("/auth/signin");
}
```

### Role-Based Navigation
```typescript
// In sidebar component
const hasPermission = (permission: string | null) => {
  if (!permission) return true;
  return user.permissions?.includes(permission) || false;
};
```

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify` - Email verification
- `GET/POST /api/auth/[...nextauth]` - NextAuth routes

### Admin Management
- `POST /api/admin/invite` - Send admin invitation
- `POST /api/admin/validate-invite` - Validate invitation token
- `POST /api/admin/accept-invite` - Accept invitation

## 🎯 Best Practices

### Security
1. Always validate user permissions before actions
2. Use HTTPS in production
3. Regularly rotate secrets
4. Implement rate limiting
5. Log authentication events

### User Experience
1. Clear error messages
2. Loading states
3. Form validation
4. Responsive design
5. Accessible components

### Development
1. Use TypeScript for type safety
2. Implement proper error handling
3. Add comprehensive logging
4. Write tests for critical paths
5. Document API endpoints

## 🐛 Troubleshooting

### Common Issues

1. **NextAuth Secret Missing**
   - Ensure `NEXTAUTH_SECRET` is set
   - Generate a secure random string

2. **Email Not Sending**
   - Check Resend API key
   - Verify email configuration
   - Check network connectivity

3. **Database Connection**
   - Verify MongoDB URI
   - Check database permissions
   - Ensure MongoDB is running

4. **Permission Issues**
   - Check user role assignment
   - Verify permission arrays
   - Clear browser cache

### Debug Mode
Enable NextAuth debug mode in development:
```env
NEXTAUTH_DEBUG=true
```

## 📈 Future Enhancements

### Planned Features
- Password reset functionality
- Two-factor authentication
- Social login providers
- Advanced role management
- Audit logging
- Session management
- API rate limiting

### Scalability
- Redis session store
- Database connection pooling
- CDN for static assets
- Load balancing
- Microservices architecture

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review NextAuth documentation
3. Check MongoDB connection
4. Verify environment variables
5. Test with minimal configuration

---

**Note**: This authentication system is designed for production use but should be thoroughly tested and customized for your specific requirements.