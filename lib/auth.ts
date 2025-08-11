import NextAuth, { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./mongodb-client";
import User from "@/models/User";
import Admin from "@/models/Admin";
import { AdminRole } from "@/types/admin";
import connectDB from "@/lib/mongodb";

// Create NextAuth configuration
export const authOptions: NextAuthConfig = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        portal: { label: "Portal", type: "text" } // "admin" or "user"
      },
      async authorize(credentials) {
        if (process.env.NODE_ENV !== 'production') console.log("🔍 [AUTH] Authorize called for:", credentials?.email);
        
        if (!credentials?.email || !credentials?.password || !credentials?.portal) {
          if (process.env.NODE_ENV !== 'production') console.log("❌ [AUTH] Missing required credentials");
          return null;
        }

        try {
          if (process.env.NODE_ENV !== 'production') console.log("🔍 [AUTH] Connecting to database...");
          await connectDB();
          if (process.env.NODE_ENV !== 'production') console.log("✅ [AUTH] Database connected");
          
          const { email, password, portal } = credentials;
          if (process.env.NODE_ENV !== 'production') console.log("🔍 [AUTH] Processing login for:", { email, portal });
          
          if (portal === "admin") {
            if (process.env.NODE_ENV !== 'production') console.log("🔍 [AUTH] Admin authentication flow");
            // Admin authentication
            const admin = await Admin.findOne({ email, isActive: true }).select("+password");
            if (process.env.NODE_ENV !== 'production') console.log("🔍 [AUTH] Admin lookup result:", admin ? "Found" : "Not found");
            
            if (!admin) {
              if (process.env.NODE_ENV !== 'production') console.log("❌ [AUTH] No admin found with email:", email);
              return null;
            }
            
            if (process.env.NODE_ENV !== 'production') console.log("🔍 [AUTH] Comparing password...");
            const isPasswordValid = await admin.comparePassword(password as string);
            if (process.env.NODE_ENV !== 'production') console.log("🔍 [AUTH] Password validation result:", isPasswordValid ? "Valid" : "Invalid");
            
            if (!isPasswordValid) {
              if (process.env.NODE_ENV !== 'production') console.log("❌ [AUTH] Invalid password for admin:", email);
              return null;
            }
            
            if (process.env.NODE_ENV !== 'production') console.log("🔍 [AUTH] Updating admin login stats...");
            // Update last login
            admin.lastLoginAt = new Date();
            admin.loginCount += 1;
            await admin.save();
            if (process.env.NODE_ENV !== 'production') console.log("✅ [AUTH] Admin login stats updated");
            
            const userData = {
              id: String(admin._id),
              email: admin.email,
              name: `${admin.firstName} ${admin.lastName}`,
              firstName: admin.firstName,
              lastName: admin.lastName,
              role: admin.role,
              permissions: admin.permissions.join(','),
              type: "admin" as const,
              isEmailVerified: admin.isEmailVerified
            };
            
            if (process.env.NODE_ENV !== 'production') console.log("✅ [AUTH] Admin authentication successful, returning user data:", {
              id: userData.id,
              email: userData.email,
              type: userData.type,
              role: userData.role
            });
            
            return userData;
          } else {
            // User authentication
            const user = await User.findOne({ email, isActive: true }).select("+password");
            
            if (!user) {
              return null;
            }
            
            const isPasswordValid = await user.comparePassword(password as string);
            
            if (!isPasswordValid) {
              return null;
            }
            
            // Update last login
            user.lastLoginAt = new Date();
            user.loginCount += 1;
            await user.save();
            
            return {
              id: String(user._id),
              email: user.email,
              name: `${user.firstName} ${user.lastName}`,
              firstName: user.firstName,
              lastName: user.lastName,
              type: "user" as const,
              isEmailVerified: user.isEmailVerified,
              quizCompleted: user.quizCompleted
            };
          }
        } catch (error) {
          console.error("❌ [AUTH] Authentication error:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (process.env.NODE_ENV !== 'production') console.log("🔧 [JWT] JWT callback triggered");
      if (process.env.NODE_ENV !== 'production') console.log("🔧 [JWT] User data:", user ? {
        type: user.type,
        email: user.email,
        hasPermissions: !!user.permissions
      } : "No user data");
      if (process.env.NODE_ENV !== 'production') console.log("🔧 [JWT] Current token:", {
        sub: token.sub,
        type: token.type,
        email: token.email,
        hasPermissions: !!token.permissions
      });
      
      if (user) {
        if (process.env.NODE_ENV !== 'production') console.log("🔧 [JWT] Processing user data for JWT");
        token.type = user.type;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.isEmailVerified = user.isEmailVerified;
        
        if (user.type === "admin") {
          if (process.env.NODE_ENV !== 'production') console.log("🔧 [JWT] Processing admin user");
          token.role = user.role;
          // Ensure permissions is a string for JWT serialization
          token.permissions = Array.isArray(user.permissions) ? user.permissions.join(',') : (user.permissions as string || '');
          if (process.env.NODE_ENV !== 'production') console.log("🔧 [JWT] Admin permissions converted to string:", token.permissions);
        } else {
          if (process.env.NODE_ENV !== 'production') console.log("🔧 [JWT] Processing regular user");
          token.quizCompleted = user.quizCompleted;
        }
        
        if (process.env.NODE_ENV !== 'production') console.log("🔧 [JWT] Final token data:", {
          type: token.type,
          email: token.email,
          hasPermissions: !!token.permissions
        });
      }
      return token;
    },
    async session({ session, token }: any) {
      if (process.env.NODE_ENV !== 'production') console.log("🔧 [SESSION] Session callback triggered");
      if (process.env.NODE_ENV !== 'production') console.log("🔧 [SESSION] Token data:", {
        sub: token.sub,
        type: token.type,
        email: token.email,
        hasPermissions: !!token.permissions
      });
      if (process.env.NODE_ENV !== 'production') console.log("🔧 [SESSION] Raw session before processing:", {
        user: session.user
      });
      
      if (token && token.sub) {
        if (process.env.NODE_ENV !== 'production') console.log("🔧 [SESSION] Processing session for user:", token.sub);
        session.user.id = token.sub;
        session.user.type = (token.type as "admin" | "user") || "user";
        session.user.firstName = (token.firstName as string) || "";
        session.user.lastName = (token.lastName as string) || "";
        session.user.isEmailVerified = (token.isEmailVerified as boolean) || false;
        
        if (token.type === "admin") {
          if (process.env.NODE_ENV !== 'production') console.log("🔧 [SESSION] Processing admin session");
          session.user.role = token.role as AdminRole;
          // Convert permissions string back to array
          session.user.permissions = typeof token.permissions === 'string' ? token.permissions.split(',') : [];
          if (process.env.NODE_ENV !== 'production') console.log("🔧 [SESSION] Admin session created:", {
            id: session.user.id,
            type: session.user.type,
            role: session.user.role,
            permissionsCount: session.user.permissions.length
          });
        } else {
          if (process.env.NODE_ENV !== 'production') console.log("🔧 [SESSION] Processing regular user session");
          session.user.quizCompleted = (token.quizCompleted as boolean) || false;
        }
      } else {
        if (process.env.NODE_ENV !== 'production') console.log("🔧 [SESSION] No valid token found");
      }
      
      if (process.env.NODE_ENV !== 'production') console.log("🔧 [SESSION] Final session object:", {
        user: {
          id: session.user.id,
          email: session.user.email,
          type: session.user.type,
          role: session.user.role
        }
      });
      
      return session;
    },
    async redirect({ url, baseUrl }: any) {
      // Handle redirects based on user type
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      } else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Export NextAuth handlers and functions
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

// Helper function to check if user has permission
export function hasPermission(user: any, permission: string): boolean {
  if (!user || user.type !== "admin") return false;

  const permissions = user.permissions;
  // Handle both array and comma-separated string for permissions
  if (Array.isArray(permissions)) {
    return permissions.includes(permission);
  }
  if (typeof permissions === 'string') {
    // Exact match on comma-separated permissions
    return permissions.split(',').includes(permission);
  }

  return false;
}

// Helper function to check if user is admin
export function isAdmin(user: any): boolean {
  return user?.type === "admin";
}

// Helper function to check if user is super admin
export function isSuperAdmin(user: any): boolean {
  return user?.type === "admin" && user?.role === AdminRole.SUPER_ADMIN;
}