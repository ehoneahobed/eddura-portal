'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Home, 
  Award, 
  GraduationCap, 
  FileText, 
  Folder, 
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  Target,
  BookOpen,
  School,
  Bookmark,
  Library,
  Copy,
  MessageSquare,
  Users,
  Users2,
  Trophy,
  Gift,
  BarChart3,
  Briefcase,
  FileCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { SimpleLogo } from '@/components/ui/logo';

// Simple, flat navigation list to match the minimal style
const navigationItems = [
  { name: 'Overview', href: '/dashboard', icon: Home },
  { name: 'Task Management', href: '/task-management', icon: Target },
  { name: 'Scholarships', href: '/scholarships', icon: Award },
  { name: 'Saved Scholarships', href: '/saved-scholarships', icon: Bookmark },
  { name: 'Schools & Programs', href: '/programs', icon: GraduationCap },
  { name: 'Applications', href: '/applications', icon: FileText },
  { name: 'Application Management', href: '/applications/manage', icon: FileCheck },
  { name: 'Recommendations', href: '/recommendations', icon: MessageSquare },
  { name: 'Recipients', href: '/recommendations/recipients', icon: Users },
  { name: 'Documents', href: '/documents', icon: Folder },
  { name: 'Document Library', href: '/library', icon: Library },
  { name: 'Eddura Squads', href: '/squads', icon: Trophy },
];

interface StudentSidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function StudentSidebar({ className, isCollapsed: controlledCollapsed, onToggleCollapse }: StudentSidebarProps) {
  const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(false);
  const pathname = usePathname();
  const isCollapsed = controlledCollapsed ?? uncontrolledCollapsed;
  const toggleCollapsed = () => {
    if (onToggleCollapse) onToggleCollapse();
    else setUncontrolledCollapsed((prev) => !prev);
  };

  return (
    <motion.div
      initial={{ width: isCollapsed ? 80 : 280 }}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        'h-screen bg-[var(--eddura-primary)] dark:bg-[var(--eddura-primary-900)] border-r border-white/10 text-white shadow-lg flex flex-col',
        className
      )}
    >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-transparent">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-3"
            >
              <SimpleLogo variant="white" size="3xl" />
              {/* <h2 className="text-xl font-bold text-[var(--eddura-primary-900)] dark:text-white">Eddura</h2> */}
            </motion.div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapsed}
            className="ml-auto hover:bg-white/10 transition-all duration-200 rounded-lg"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-white" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-white" />
            )}
          </Button>
        </div>

        {/* Navigation - simple list, no group headers */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'group relative flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-200',
                    isActive
                      ? 'bg-[var(--eddura-accent-50)] dark:bg-[var(--eddura-accent-900)]/25 border-[var(--eddura-accent-200)] dark:border-[var(--eddura-accent-700)] text-[var(--eddura-accent-800)] dark:text-[var(--eddura-accent-200)]'
                      : 'bg-transparent border-transparent text-white/80 hover:bg-white/10 hover:border-white/20'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5',
                      isActive
                        ? 'text-[var(--eddura-accent-700)] dark:text-[var(--eddura-accent-300)]'
                        : 'text-white/80'
                    )}
                  />
                  {!isCollapsed && (
                    <span className="text-sm font-medium leading-none truncate">
                      {item.name}
                    </span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Quick Actions */}
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 border-t border-white/10 bg-transparent"
          >
            <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link href="/quiz">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start bg-transparent border border-white/20 text-white hover:bg-white/10 hover:border-white/30 focus-visible:ring-white/30 transition-all duration-200 rounded-lg h-10"
                >
                  <Target className="w-4 h-4 mr-3" />
                  Take Quiz
                </Button>
              </Link>
              <Link href="/quiz/results">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start bg-transparent border border-white/20 text-white hover:bg-white/10 hover:border-white/30 focus-visible:ring-white/30 transition-all duration-200 rounded-lg h-10"
                >
                  <BookOpen className="w-4 h-4 mr-3" />
                  View Results
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>
  );
}