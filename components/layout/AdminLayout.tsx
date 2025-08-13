'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ThemeAwareLogo } from '@/components/ui/logo';
import {
  Home,
  School,
  BookOpen,
  GraduationCap,
  FileText,
  Menu,
  X,
  ChevronRight,
  Settings,
  LogOut
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Schools', href: '/admin/schools', icon: School },
  { name: 'Programs', href: '/admin/programs', icon: BookOpen },
  { name: 'Scholarships', href: '/admin/scholarships', icon: GraduationCap },
  { name: 'Application Templates', href: '/admin/application-templates', icon: FileText }
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-eddura-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-eddura-800 shadow-xl border-r border-gray-200 dark:border-eddura-700 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-eddura-700">
          <div className="flex items-center space-x-3">
            <ThemeAwareLogo size="lg" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Eddura</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out transform hover:scale-[1.02]',
                    isActive
                      ? 'bg-eddura-500 text-white shadow-eddura'
                      : 'text-gray-600 dark:text-gray-300 hover:text-eddura-700 dark:hover:text-white hover:bg-eddura-50 dark:hover:bg-eddura-700/50'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 transition-colors',
                      isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-eddura-500 dark:group-hover:text-white'
                    )}
                  />
                  {item.name}
                  {isActive && (
                    <ChevronRight className="ml-auto h-4 w-4 text-white" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-eddura-700">
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 dark:text-gray-300 hover:text-eddura-700 dark:hover:text-white hover:bg-eddura-50 dark:hover:bg-eddura-700/50"
            >
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 dark:text-gray-300 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="bg-white/95 dark:bg-eddura-800/95 backdrop-blur-xl shadow-sm border-b border-gray-200 dark:border-eddura-700 px-4 py-4 sm:px-6 lg:px-8 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-gray-600 dark:text-gray-300"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                Welcome to Eddura Admin Portal
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="hidden sm:flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>System Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-eddura-900">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <Toaster />
    </div>
  );
}