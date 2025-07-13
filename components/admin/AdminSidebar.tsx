"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  Award,
  FileText,
  Settings,
  UserPlus,
  BarChart3,
  Shield,
  MessageCircle,
  X,
  ClipboardList,
  AlertCircle,
} from "lucide-react";

interface AdminSidebarProps {
  user: any;
  onClose?: () => void;
}

const navigationItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    permission: null, // Always visible
  },
  {
    name: "Application Templates",
    href: "/admin/application-templates",
    icon: FileText,
    permission: "content:read",
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
    name: "Application Form Requests",
    href: "/admin/application-form-requests",
    icon: ClipboardList,
    permission: "content:read",
  },
  {
    name: "Scholarships Without Forms",
    href: "/admin/scholarships/without-application-forms",
    icon: AlertCircle,
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
    name: "Messages",
    href: "/admin/messages",
    icon: MessageCircle,
    permission: null, // All admins can access messaging
  },
  {
    name: "Add Admin User",
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

export default function AdminSidebar({ user, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const hasPermission = (permission: string | null) => {
    if (!permission) return true;
    return user.permissions?.includes(permission) || false;
  };

  const filteredNavigation = navigationItems.filter((item) =>
    hasPermission(item.permission)
  );

  const handleNavigation = (href: string) => {
    // Close sidebar on mobile when navigating
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Fixed header area */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
          <p className="text-sm text-gray-500 mt-1">
            {user?.firstName || user?.email}
          </p>
        </div>
        {/* Close button for mobile */}
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden p-2"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Scrollable navigation area */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} onClick={() => handleNavigation(item.href)}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-12 text-base",
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