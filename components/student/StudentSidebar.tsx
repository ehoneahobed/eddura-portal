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
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  { 
    name: 'Overview', 
    href: '/dashboard', 
    icon: Home,
    description: 'Your personalized dashboard'
  },
  { 
    name: 'Task Management', 
    href: '/task-management', 
    icon: Target,
    description: 'Manage applications and tasks'
  },
  { 
    name: 'Scholarships', 
    href: '/scholarships', 
    icon: Award,
    description: 'Find and apply for scholarships'
  },
  { 
    name: 'Saved Scholarships', 
    href: '/saved-scholarships', 
    icon: Bookmark,
    description: 'Your saved scholarships'
  },
  { 
    name: 'Schools & Programs', 
    href: '/programs', 
    icon: GraduationCap,
    description: 'Explore universities and programs'
  },
  { 
    name: 'Applications', 
    href: '/applications', 
    icon: FileText,
    description: 'Track your applications'
  },
  { 
    name: 'Application Management', 
    href: '/applications/manage', 
    icon: Target,
    description: 'Manage application packages'
  },
  { 
    name: 'Recommendations', 
    href: '/recommendations', 
    icon: MessageSquare,
    description: 'Manage recommendation letters'
  },
  { 
    name: 'Recipients', 
    href: '/recommendations/recipients', 
    icon: Users,
    description: 'Manage your recipients'
  },
  { 
    name: 'Documents', 
    href: '/documents', 
    icon: Folder,
    description: 'Manage your documents'
  },
  { 
    name: 'Document Library', 
    href: '/library', 
    icon: Library,
    description: 'Browse and clone documents'
  },
  { 
    name: 'Eddura Squads', 
    href: '/squads', 
    icon: Trophy,
    description: 'Join collaborative squads for support'
  },
  { 
    name: 'Referral Program', 
    href: '/referrals', 
    icon: Gift,
    description: 'Invite friends & earn tokens'
  },
  { 
    name: 'Leaderboard', 
    href: '/leaderboard', 
    icon: BarChart3,
    description: 'Compete with other users'
  },
  { 
    name: 'My Cloned Documents', 
    href: '/documents/cloned', 
    icon: Copy,
    description: 'Your cloned documents'
  },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: Settings,
    description: 'Account and preferences'
  }
];

interface StudentSidebarProps {
  className?: string;
}

export default function StudentSidebar({ className }: StudentSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <motion.div
      initial={{ width: isCollapsed ? 80 : 280 }}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        'h-screen bg-white border-r border-gray-200 shadow-sm flex flex-col',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-[#007fbd] rounded-lg flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-[#00334e]">Eddura</h2>
          </motion.div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer',
                  isActive
                    ? 'bg-[#007fbd] text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Icon className={cn(
                  'h-5 w-5 flex-shrink-0',
                  isActive ? 'text-white' : 'text-gray-500'
                )} />
                
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 min-w-0"
                  >
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className={cn(
                      'text-xs truncate',
                      isActive ? 'text-blue-100' : 'text-gray-500'
                    )}>
                      {item.description}
                    </p>
                  </motion.div>
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
          className="p-4 border-t border-gray-200"
        >
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <Link href="/quiz">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Target className="h-4 w-4 mr-2" />
                Take Quiz
              </Button>
            </Link>
            <Link href="/quiz/results">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                View Results
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}