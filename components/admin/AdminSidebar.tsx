"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Building2,
  GraduationCap,
  Award,
  FileText,
  Settings,
  UserPlus,
  BarChart3,
  Shield,
} from "lucide-react";

interface AdminSidebarProps {
  user: any;
}

const navigationItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    permission: null, // Always visible
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
    permission: "user:read",
  },
  {
    name: "Schools",
    href: "/admin/schools",
    icon: Building2,
    permission: "content:read",
  },
  {
    name: "Programs",
    href: "/admin/programs",
    icon: GraduationCap,
    permission: "content:read",
  },
  {
    name: "Scholarships",
    href: "/admin/scholarships",
    icon: Award,
    permission: "content:read",
  },
  {
    name: "Applications",
    href: "/admin/application-templates",
    icon: FileText,
    permission: "content:read",
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    permission: "analytics:read",
  },
  {
    name: "Admin Management",
    href: "/admin/admins",
    icon: Shield,
    permission: "admin:read",
  },
  {
    name: "Invite Admin",
    href: "/admin/invite",
    icon: UserPlus,
    permission: "admin:invite",
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    permission: "settings:read",
  },
];

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();

  const hasPermission = (permission: string | null) => {
    if (!permission) return true;
    return user.permissions?.includes(permission) || false;
  };

  const filteredNavigation = navigationItems.filter((item) =>
    hasPermission(item.permission)
  );

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Fixed header area */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
        <p className="text-sm text-gray-500 mt-1">
          {user?.firstName || user?.email}
        </p>
      </div>
      
      {/* Scrollable navigation area */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-blue-50 text-blue-700"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}