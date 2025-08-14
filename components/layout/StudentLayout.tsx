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
  ChevronDown,
  Sun,
  Moon
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
import { useTheme } from '@/components/providers/ThemeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeAwareLogo } from '@/components/ui/logo';
import { LanguageSelector } from '@/components/ui/language-selector';

interface StudentLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export default function StudentLayout({ children, showSidebar = true }: StudentLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { theme, toggleTheme } = useTheme();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-eddura-900">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <ThemeAwareLogo size="7xl" className="animate-pulse" />
        </motion.div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-white dark:bg-eddura-900">
        <div className="flex h-screen">
          {/* Fixed Sidebar - Only show when user is authenticated */}
          {showSidebar && session?.user && (
            <>
              {/* Desktop Sidebar - Fixed position */}
              <div className="hidden lg:block fixed left-0 top-0 h-screen z-30">
                <StudentSidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={handleToggleSidebar} />
              </div>
              
              {/* Mobile Sidebar - Overlay */}
              {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                  <div className="fixed left-0 top-0 h-full z-50">
                    <StudentSidebar isCollapsed={false} onToggleCollapse={handleToggleSidebar} />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Main Content - Adjusted for fixed sidebar */}
          <div className={`flex-1 flex flex-col overflow-hidden ${showSidebar && session?.user ? (isSidebarCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[280px]') : ''}`}>
            {/* Header */}
            <header className="bg-white/90 dark:bg-eddura-800/90 backdrop-blur-xl border-b border-eddura-200 dark:border-eddura-700 shadow-sm sticky top-0 z-20">
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
                        <X className="h-5 w-5 text-eddura-600 dark:text-white" />
                      ) : (
                        <Menu className="h-5 w-5 text-eddura-600 dark:text-white" />
                      )}
                    </Button>
                  )}
                  
                  <div className="flex items-center space-x-3">
                    <ThemeAwareLogo size="3xl" />
                    {/* <h1 className="text-2xl font-bold text-[var(--eddura-primary-900)] dark:text-white">Eddura</h1> */}
                  </div>
                </div>

                {/* Center - Search */}
                <div className="hidden md:flex flex-1 max-w-md mx-8">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-eddura-400 dark:text-eddura-300" />
                    <input
                      type="text"
                      placeholder="Search scholarships, programs..."
                      className="w-full pl-10 pr-4 py-2 border border-eddura-200 dark:border-eddura-700 rounded-lg focus:ring-2 focus:ring-eddura-500 focus:border-transparent bg-white/90 dark:bg-eddura-800 text-eddura-900 dark:text-white placeholder-eddura-400 dark:placeholder-eddura-400"
                    />
                  </div>
                </div>

                {/* Right side */}
                <div className="flex items-center space-x-4">
                  {/* Language Selector */}
                  <LanguageSelector variant="compact" showLabel={false} />
                  
                  {/* Theme Toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTheme}
                    className="text-eddura-600 dark:text-eddura-300 hover:bg-eddura-50 dark:hover:bg-eddura-700 transition-all duration-200"
                  >
                    {theme === 'dark' ? (
                      <Sun className="h-5 w-5" />
                    ) : (
                      <Moon className="h-5 w-5" />
                    )}
                  </Button>

                  {/* Only show user-specific elements when authenticated */}
                  {session?.user && (
                    <>
                      {/* Notifications */}
                      <NotificationBell />

                      {/* User Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="flex items-center gap-2 rounded-full border border-eddura-200 dark:border-eddura-700 px-2 py-1 pr-3 bg-white/90 dark:bg-eddura-800 hover:ring-1 hover:ring-eddura-300 dark:hover:ring-eddura-600 transition-all"
                          >
                            <Avatar className="w-8 h-8">
                              <AvatarImage src="" />
                              <AvatarFallback className="bg-eddura-500 text-white text-sm">
                                {userProfile?.firstName?.[0]}{userProfile?.lastName?.[0] || session?.user?.name?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="hidden md:block text-left">
                              <p className="text-sm font-semibold leading-5 text-eddura-900 dark:text-white">
                                {userProfile?.firstName && userProfile?.lastName ? `${userProfile.firstName} ${userProfile.lastName}` : session?.user?.name || 'User'}
                              </p>
                            </div>
                            <ChevronDown className="h-4 w-4 text-eddura-500 dark:text-white/80" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                          align="end"
                          className="w-72 p-0 overflow-hidden rounded-xl border border-eddura-200 dark:border-eddura-700 bg-white dark:bg-eddura-800 shadow-2xl"
                        >
                          <DropdownMenuLabel className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10 shadow-sm">
                                <AvatarImage src="" />
                                <AvatarFallback className="bg-[var(--eddura-primary)] text-white text-sm">
                                  {userProfile?.firstName?.[0]}{userProfile?.lastName?.[0] || session?.user?.name?.[0] || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-[var(--eddura-primary-900)] dark:text-white truncate">
                                  {userProfile?.firstName && userProfile?.lastName ? `${userProfile.firstName} ${userProfile.lastName}` : session?.user?.name || 'User'}
                                </p>
                                <p className="text-xs text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)] truncate">{userProfile?.email || session?.user?.email}</p>
                              </div>
                            </div>
                          </DropdownMenuLabel>

                          <DropdownMenuItem asChild className="px-4 py-3 focus:bg-[var(--eddura-primary-50)] dark:focus:bg-[var(--eddura-primary-800)]">
                            <a
                              href="/settings"
                              className="flex items-center gap-2 w-full text-[var(--eddura-primary-800)] dark:text-white"
                            >
                              <User className="h-4 w-4" />
                              <span className="font-medium">Profile & Settings</span>
                            </a>
                          </DropdownMenuItem>

                          <div className="p-3">
                            <button
                              onClick={handleLogout}
                              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--eddura-accent)] hover:bg-[var(--eddura-accent-dark)] text-white font-semibold py-2.5 transition-colors shadow-md"
                            >
                              <LogOut className="h-4 w-4" />
                              Sign Out
                            </button>
                          </div>
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
    </TooltipProvider>
  );
}
