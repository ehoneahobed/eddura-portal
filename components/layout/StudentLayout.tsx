'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LogOut, 
  User, 
  Search,
  Menu,
  X,
  Settings,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from 'next-auth/react';
import StudentSidebar from '@/components/student/StudentSidebar';
import { NotificationBell } from '@/components/ui/notification-bell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface StudentLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export default function StudentLayout({ children, showSidebar = true }: StudentLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user?.id) {
      router.push('/auth/signin');
      return;
    }

    // Only fetch user profile if we have a valid session
    if (session?.user?.id) {
      fetchUserProfile();
    }
  }, [session, status, router, fetchUserProfile]);

  const fetchUserProfile = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch('/api/user/profile');
      
      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }, [session?.user?.id]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-[#007fbd] rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading</h2>
          <p className="text-gray-600">Preparing your experience...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="flex h-screen">
        {/* Sidebar - Only show when user is authenticated */}
        {showSidebar && session?.user && (
          <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
              <StudentSidebar />
            </div>
            
            {/* Mobile Sidebar */}
            {isMobileMenuOpen && (
              <div className="lg:hidden fixed inset-0 z-50">
                <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
                <div className="fixed left-0 top-0 h-full z-50">
                  <StudentSidebar />
                </div>
              </div>
            )}
          </>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between px-4 py-4">
              {/* Left side */}
              <div className="flex items-center space-x-4">
                {showSidebar && session?.user && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="lg:hidden"
                  >
                    {isMobileMenuOpen ? (
                      <X className="h-5 w-5" />
                    ) : (
                      <Menu className="h-5 w-5" />
                    )}
                  </Button>
                )}
                
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-[#007fbd] rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <h1 className="text-xl font-bold text-[#00334e]">Eddura</h1>
                </div>
              </div>

              {/* Center - Search */}
              <div className="hidden md:flex flex-1 max-w-md mx-8">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search scholarships, programs..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fbd] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-4">
                {/* Only show user-specific elements when authenticated */}
                {session?.user && (
                  <>
                    {/* Notifications */}
                    <NotificationBell />

                    {/* User Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center space-x-2 p-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-[#007fbd] text-white text-sm">
                              {userProfile?.firstName?.[0]}{userProfile?.lastName?.[0] || session?.user?.name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="hidden md:block text-left">
                            <p className="text-sm font-medium text-gray-900">
                              {userProfile?.firstName && userProfile?.lastName 
                                ? `${userProfile.firstName} ${userProfile.lastName}`
                                : session?.user?.name || 'User'
                              }
                            </p>
                            <p className="text-xs text-gray-500">{userProfile?.email || session?.user?.email}</p>
                          </div>
                          
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                          <div className="flex items-center space-x-2">
                                                      <Avatar className="w-8 h-8">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-[#007fbd] text-white text-sm">
                              {userProfile?.firstName?.[0]}{userProfile?.lastName?.[0] || session?.user?.name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {userProfile?.firstName && userProfile?.lastName 
                                  ? `${userProfile.firstName} ${userProfile.lastName}`
                                  : session?.user?.name || 'User'
                                }
                              </p>
                              <p className="text-xs text-gray-500">{userProfile?.email || session?.user?.email}</p>
                            </div>
                          </div>
                        </DropdownMenuLabel>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem asChild>
                          <a href="/settings" className="flex items-center space-x-2 w-full">
                            <User className="h-4 w-4" />
                            <span>Profile & Settings</span>
                          </a>
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                          <LogOut className="h-4 w-4 mr-2" />
                          <span>Sign Out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
