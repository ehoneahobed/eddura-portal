import { AdminRole } from "@/models/Admin";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      type: "admin" | "user";
      firstName: string;
      lastName: string;
      isEmailVerified: boolean;
      role?: AdminRole;
      permissions?: string[];
      quizCompleted?: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    type: "admin" | "user";
    firstName: string;
    lastName: string;
    isEmailVerified: boolean;
    role?: AdminRole;
    permissions?: string[] | string; // Can be array or string for JWT serialization
    quizCompleted?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    type?: "admin" | "user";
    firstName?: string;
    lastName?: string;
    isEmailVerified?: boolean;
    role?: AdminRole;
    permissions?: string; // Stored as comma-separated string in JWT
    quizCompleted?: boolean;
  }
} 