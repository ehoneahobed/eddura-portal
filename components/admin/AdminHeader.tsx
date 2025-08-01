"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Settings, LogOut, User, Building2, Menu, X } from "lucide-react";
import MessagingIcon from "./MessagingIcon";

interface AdminHeaderProps {
  user: any;
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

export default function AdminHeader({ user, onMenuClick, sidebarOpen }: AdminHeaderProps) {
  const router = useRouter();
  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`;

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 h-16 flex items-center sticky top-0 z-30">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-4">
          {/* Hamburger menu for mobile */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden p-2"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          
          <Building2 className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
          <div className="hidden sm:block">
            <h1 className="text-lg lg:text-xl font-semibold text-gray-900">Admin Portal</h1>
            <p className="text-xs lg:text-sm text-gray-500">
              Welcome back, {user.firstName} {user.lastName}
            </p>
          </div>
          <div className="sm:hidden">
            <h1 className="text-lg font-semibold text-gray-900">Admin</h1>
          </div>
        </div>

        <div className="flex items-center space-x-2 lg:space-x-4">
          <MessagingIcon onOpenMessaging={() => router.push("/admin/messages")}/>
          
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground capitalize">
                    {user.role?.replace("_", " ")}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/admin/profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/admin/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}