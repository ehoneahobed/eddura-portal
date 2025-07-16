import NextAuth, { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./mongodb-client";
import User from "@/models/User";
import Admin from "@/models/Admin";
import { AdminRole } from "@/types/admin";
import connectDB from "@/lib/mongodb";

// Create NextAuth configuration
export const authConfig: NextAuthConfig = {
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
        if (!credentials?.email || !credentials?.password || !credentials?.portal) {
          return null;
        }

        try {
          await connectDB();
          
          const { email, password, portal } = credentials;
          
          if (portal === "admin") {
            // Admin authentication
            const admin = await Admin.findOne({ email, isActive: true }).select("+password");
            
            if (!admin) {
              return null;
            }
            
            const isPasswordValid = await admin.comparePassword(password as string);
            
            if (!isPasswordValid) {
              return null;
            }
            
            // Update last login
            admin.lastLoginAt = new Date();
            admin.loginCount += 1;
            await admin.save();
            
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
      if (user) {
        token.type = user.type;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.isEmailVerified = user.isEmailVerified;
        
        if (user.type === "admin") {
          token.role = user.role;
          // Ensure permissions is a string for JWT serialization
          token.permissions = Array.isArray(user.permissions) ? user.permissions.join(',') : (user.permissions as string || '');
        } else {
          token.quizCompleted = user.quizCompleted;
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token && token.sub) {
        session.user.id = token.sub;
        session.user.type = (token.type as "admin" | "user") || "user";
        session.user.firstName = (token.firstName as string) || "";
        session.user.lastName = (token.lastName as string) || "";
        session.user.isEmailVerified = (token.isEmailVerified as boolean) || false;
        
        if (token.type === "admin") {
          session.user.role = token.role as AdminRole;
          // Convert permissions string back to array
          session.user.permissions = typeof token.permissions === 'string' ? token.permissions.split(',') : [];
        } else {
          session.user.quizCompleted = (token.quizCompleted as boolean) || false;
        }
      }
      
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
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// Helper function to check if user has permission
export function hasPermission(user: any, permission: string): boolean {
  if (!user || user.type !== "admin") return false;
  return user.permissions?.includes(permission) || false;
}

// Helper function to check if user is admin
export function isAdmin(user: any): boolean {
  return user?.type === "admin";
}

// Helper function to check if user is super admin
export function isSuperAdmin(user: any): boolean {
  return user?.type === "admin" && user?.role === AdminRole.SUPER_ADMIN;
}