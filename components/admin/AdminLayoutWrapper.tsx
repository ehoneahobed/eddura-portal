"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
}

export default function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    console.log("🔍 [ADMIN_WRAPPER] Session status:", status);
    console.log("🔍 [ADMIN_WRAPPER] Session data:", session);
    
    if (status === "loading") {
      return;
    }
    
    setIsChecking(false);
    
    if (!session?.user || session.user.type !== "admin") {
      console.log("❌ [ADMIN_WRAPPER] Not authenticated or not admin, redirecting...");
      router.push("/admin-auth/login");
    } else {
      console.log("✅ [ADMIN_WRAPPER] Admin authenticated:", session.user.email);
    }
  }, [session, status, router]);

  // Show loading while checking session
  if (status === "loading" || isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!session?.user || session.user.type !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={session.user} />
      <div className="flex">
        <AdminSidebar user={session.user} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
} 