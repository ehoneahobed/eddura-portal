'use client';

import { useState, useEffect } from 'react';
import type { ElementType } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  GraduationCap, 
  TrendingUp, 
  Settings, 
  Sparkles,
  Calendar,
  Target,
  Award,
  BookOpen,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  LogOut,
  Gift,
  Trophy,
  Users,
  Star,
  Zap,
  Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import ProfileEditModal, { EditableUserProfile } from './ProfileEditModal';
import SquadWidget from './SquadWidget';
import TokenDisplay from './TokenDisplay';
import { ResponsiveContainer } from '../ui/responsive-container';
import { usePageTranslation } from '@/hooks/useTranslation';

// Consistent stat card for equal sizing across the grid
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ElementType;
  colorTheme: 'primary' | 'success' | 'accent' | 'warning' | 'info';
  caption?: string;
  delta?: string;
  deltaDirection?: 'up' | 'down';
}

function StatsCard({ title, value, icon: Icon, colorTheme, caption }: StatsCardProps) {
  const themeMap: Record<StatsCardProps['colorTheme'], { container: string; iconWrap: string; valueColor: string; titleColor: string; iconColor: string; stripe: string; blob: string; badge: string; } > = {
    primary: {
      container: 'from-white to-[var(--eddura-primary-50)] dark:from-[var(--eddura-primary-900)] dark:to-[var(--eddura-primary-800)]',
      iconWrap: 'from-[var(--eddura-primary-100)] to-[var(--eddura-primary-200)] dark:from-[var(--eddura-primary-800)] dark:to-[var(--eddura-primary-700)]',
      valueColor: 'text-[var(--eddura-primary-900)] dark:text-white',
      titleColor: 'text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)]',
      iconColor: 'text-[var(--eddura-primary)]',
      stripe: 'bg-[var(--eddura-primary-600)] dark:bg-[var(--eddura-primary-600)]',
      blob: 'bg-[var(--eddura-primary-200)] dark:bg-[var(--eddura-primary-700)]',
      badge: 'bg-[var(--eddura-primary-100)] text-[var(--eddura-primary-700)]',
    },
    success: {
      container: 'from-white to-[var(--eddura-success-50)] dark:from-[var(--eddura-success-900)] dark:to-[var(--eddura-success-800)]',
      iconWrap: 'from-[var(--eddura-success-100)] to-[var(--eddura-success-200)] dark:from-[var(--eddura-success-800)] dark:to-[var(--eddura-success-700)]',
      valueColor: 'text-[var(--eddura-success-900)] dark:text-white',
      titleColor: 'text-[var(--eddura-success-600)] dark:text-[var(--eddura-success-300)]',
      iconColor: 'text-[var(--eddura-success)]',
      stripe: 'bg-[var(--eddura-success-600)] dark:bg-[var(--eddura-success-600)]',
      blob: 'bg-[var(--eddura-success-200)] dark:bg-[var(--eddura-success-700)]',
      badge: 'bg-[var(--eddura-success-100)] text-[var(--eddura-success-700)]',
    },
    accent: {
      container: 'from-white to-[var(--eddura-accent-50)] dark:from-[var(--eddura-accent-900)] dark:to-[var(--eddura-accent-800)]',
      iconWrap: 'from-[var(--eddura-accent-100)] to-[var(--eddura-accent-200)] dark:from-[var(--eddura-accent-800)] dark:to-[var(--eddura-accent-700)]',
      valueColor: 'text-[var(--eddura-accent-900)] dark:text-white',
      titleColor: 'text-[var(--eddura-accent-600)] dark:text-[var(--eddura-accent-300)]',
      iconColor: 'text-[var(--eddura-accent)]',
      stripe: 'bg-[var(--eddura-accent-600)] dark:bg-[var(--eddura-accent-600)]',
      blob: 'bg-[var(--eddura-accent-200)] dark:bg-[var(--eddura-accent-700)]',
      badge: 'bg-[var(--eddura-accent-100)] text-[var(--eddura-accent-700)]',
    },
    warning: {
      container: 'from-white to-[var(--eddura-warning-50)] dark:from-[var(--eddura-warning-900)] dark:to-[var(--eddura-warning-800)]',
      iconWrap: 'from-[var(--eddura-warning-100)] to-[var(--eddura-warning-200)] dark:from-[var(--eddura-warning-800)] dark:to-[var(--eddura-warning-700)]',
      valueColor: 'text-[var(--eddura-warning-900)] dark:text-white',
      titleColor: 'text-[var(--eddura-warning-600)] dark:text-[var(--eddura-warning-300)]',
      iconColor: 'text-[var(--eddura-warning)]',
      stripe: 'bg-[var(--eddura-warning-600)] dark:bg-[var(--eddura-warning-600)]',
      blob: 'bg-[var(--eddura-warning-200)] dark:bg-[var(--eddura-warning-700)]',
      badge: 'bg-[var(--eddura-warning-100)] text-[var(--eddura-warning-700)]',
    },
    info: {
      container: 'from-white to-[var(--eddura-info-50)] dark:from-[var(--eddura-info-900)] dark:to-[var(--eddura-info-800)]',
      iconWrap: 'from-[var(--eddura-info-100)] to-[var(--eddura-info-200)] dark:from-[var(--eddura-info-800)] dark:to-[var(--eddura-info-700)]',
      valueColor: 'text-[var(--eddura-info-900)] dark:text-white',
      titleColor: 'text-[var(--eddura-info-600)] dark:text-[var(--eddura-info-300)]',
      iconColor: 'text-[var(--eddura-info)]',
      stripe: 'bg-[var(--eddura-info-600)] dark:bg-[var(--eddura-info-600)]',
      blob: 'bg-[var(--eddura-info-200)] dark:bg-[var(--eddura-info-700)]',
      badge: 'bg-[var(--eddura-info-100)] text-[var(--eddura-info-700)]',
    },
  };

  const t = themeMap[colorTheme];

  return (
    <Card className={`relative overflow-hidden rounded-xl border border-[var(--eddura-primary-100)] dark:border-[var(--eddura-primary-800)] shadow-[0_4px_16px_rgba(2,6,23,0.06)] hover:shadow-[0_8px_22px_rgba(2,6,23,0.10)] transition-all ${colorTheme === 'primary' ? 'bg-[var(--eddura-primary-50)]' : ''} ${colorTheme === 'success' ? 'bg-[var(--eddura-success-50)]' : ''} ${colorTheme === 'info' ? 'bg-[var(--eddura-info-50)]' : ''} ${colorTheme === 'warning' ? 'bg-[var(--eddura-warning-50)]' : ''} ${colorTheme === 'accent' ? 'bg-[var(--eddura-accent-50)]' : ''} dark:bg-gradient-to-br dark:${t.container}`}> 
      <div className={`absolute inset-x-0 top-0 h-1 ${t.stripe}`} />
      <CardContent className="px-4 py-3 relative">
        <div className="relative h-[120px] flex flex-col justify-between">
          {/* Top: title */}
          <div>
            <span className={`text-[11px] font-semibold tracking-wide ${t.titleColor}`}>{title}</span>
          </div>

          {/* Bottom-left: value and optional caption */}
          <div>
            <p className={`text-2xl leading-none font-extrabold ${t.valueColor}`}>{value}</p>
            {caption ? (
              <p className="mt-1 text-[11px] text-[var(--eddura-primary-700)] dark:text-[var(--eddura-primary-400)]">{caption}</p>
            ) : null}
          </div>

          {/* Right-centered icon */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className={`w-9 h-9 ${colorTheme === 'primary' ? 'bg-[var(--eddura-primary-100)]' : ''} ${colorTheme === 'success' ? 'bg-[var(--eddura-success-100)]' : ''} ${colorTheme === 'info' ? 'bg-[var(--eddura-info-100)]' : ''} ${colorTheme === 'warning' ? 'bg-[var(--eddura-warning-100)]' : ''} ${colorTheme === 'accent' ? 'bg-[var(--eddura-accent-100)]' : ''} dark:bg-gradient-to-br dark:${t.iconWrap} rounded-lg flex items-center justify-center shadow-sm`}>
              <Icon className={`w-5 h-5 ${t.iconColor}`} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface UserActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  country?: string;
  city?: string;
  quizCompleted: boolean;
  quizCompletedAt?: string;
  lastLoginAt?: string;
  createdAt: string;
  tokens: number;
  totalTokensEarned: number;
  totalTokensSpent: number;
  referralCode?: string;
  stats: DashboardStats;
  careerPreferences?: any;
}

interface DashboardStats {
  applicationPackagesCreated: number;
  documentsCreated: number;
  recommendationLettersRequested: number;
  recommendationLettersReceived: number;
  scholarshipsSaved: number;
}

export default function DashboardContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = usePageTranslation('dashboard');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const ACTIVITY_PAGE_SIZE = 5;
  const [activityPage, setActivityPage] = useState(1);
  const [hasMoreActivities, setHasMoreActivities] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user?.id) {
      router.push('/auth/signin');
      return;
    }

    fetchUserProfile();
    fetchUserActivities();
  }, [session, status, router]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      const profile = await response.json();
      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchUserActivities = async (page: number = 1) => {
    try {
      const limit = page * ACTIVITY_PAGE_SIZE;
      const response = await fetch(`/api/user/activities?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user activities');
      }
      
      const data = await response.json();
      const activities: UserActivity[] = data.activities || [];
      setUserActivities(activities);
      setHasMoreActivities(activities.length >= limit);
    } catch (error) {
      console.error('Error fetching user activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreActivities = async () => {
    const nextPage = activityPage + 1;
    await fetchUserActivities(nextPage);
    setActivityPage(nextPage);
  };

  const showLessActivities = () => {
    const prevPage = Math.max(1, activityPage - 1);
    setActivityPage(prevPage);
  };

  const handleRetakeQuiz = () => {
    router.push('/quiz');
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'quiz_completed':
      case 'quiz_retaken':
        return { icon: Brain, bgColor: 'bg-gradient-to-br from-[var(--eddura-success-50)] to-[var(--eddura-success-100)] dark:from-[var(--eddura-success-900)] dark:to-[var(--eddura-success-800)]', iconColor: 'text-[var(--eddura-success)]' };
      case 'program_viewed':
        return { icon: BookOpen, bgColor: 'bg-gradient-to-br from-[var(--eddura-info-50)] to-[var(--eddura-info-100)] dark:from-[var(--eddura-info-900)] dark:to-[var(--eddura-info-800)]', iconColor: 'text-[var(--eddura-info)]' };
      case 'scholarship_viewed':
        return { icon: Award, bgColor: 'bg-gradient-to-br from-[var(--eddura-primary-50)] to-[var(--eddura-primary-100)] dark:from-[var(--eddura-primary-900)] dark:to-[var(--eddura-primary-800)]', iconColor: 'text-[var(--eddura-primary)]' };
      case 'application_started':
      case 'application_submitted':
        return { icon: Target, bgColor: 'bg-gradient-to-br from-[var(--eddura-accent-50)] to-[var(--eddura-accent-100)] dark:from-[var(--eddura-accent-900)] dark:to-[var(--eddura-accent-800)]', iconColor: 'text-[var(--eddura-accent)]' };
      case 'document_uploaded':
        return { icon: CheckCircle, bgColor: 'bg-gradient-to-br from-[var(--eddura-success-50)] to-[var(--eddura-success-100)] dark:from-[var(--eddura-success-900)] dark:to-[var(--eddura-success-800)]', iconColor: 'text-[var(--eddura-success)]' };
      case 'profile_updated':
        return { icon: Settings, bgColor: 'bg-gradient-to-br from-[var(--eddura-primary-100)] to-[var(--eddura-primary-200)] dark:from-[var(--eddura-primary-800)] dark:to-[var(--eddura-primary-700)]', iconColor: 'text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)]' };
      case 'recommendation_viewed':
        return { icon: Sparkles, bgColor: 'bg-gradient-to-br from-[var(--eddura-primary-100)] to-[var(--eddura-primary-200)] dark:from-[var(--eddura-primary-800)] dark:to-[var(--eddura-primary-700)]', iconColor: 'text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)]' };
      case 'login':
        return { icon: Clock, bgColor: 'bg-gradient-to-br from-[var(--eddura-primary-100)] to-[var(--eddura-primary-200)] dark:from-[var(--eddura-primary-800)] dark:to-[var(--eddura-primary-700)]', iconColor: 'text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)]' };
      default:
        return { icon: Clock, bgColor: 'bg-gradient-to-br from-[var(--eddura-primary-100)] to-[var(--eddura-primary-200)] dark:from-[var(--eddura-primary-800)] dark:to-[var(--eddura-primary-700)]', iconColor: 'text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)]' };
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMs = now.getTime() - activityTime.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return t('recentActivity.justNow');
    if (diffInMinutes < 60) return t('recentActivity.minutesAgo', { 
      count: diffInMinutes, 
      plural: diffInMinutes > 1 ? 's' : '' 
    });
    if (diffInHours < 24) return t('recentActivity.hoursAgo', { 
      count: diffInHours, 
      plural: diffInHours > 1 ? 's' : '' 
    });
    if (diffInDays < 7) return t('recentActivity.daysAgo', { 
      count: diffInDays, 
      plural: diffInDays > 1 ? 's' : '' 
    });
    return activityTime.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-[var(--eddura-primary)] to-[var(--eddura-primary-600)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Sparkles className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold text-[var(--eddura-primary-900)] dark:text-white mb-3">{t('loadingDashboard')}</h2>
          <p className="text-lg text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)]">{t('preparingExperience')}</p>
        </motion.div>
      </div>
    );
  }

  const editableProfile: EditableUserProfile | null = userProfile
    ? {
        id: userProfile.id,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        dateOfBirth: userProfile.dateOfBirth,
        phoneNumber: userProfile.phoneNumber,
        country: userProfile.country,
        city: userProfile.city,
      }
    : null;

  return (
    <ResponsiveContainer maxWidth="8xl" padding="md" className="py-4 sm:py-8">
      {/* Welcome Section with enhanced visual appeal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative text-left space-y-4 py-6"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--eddura-primary-50)] via-transparent to-[var(--eddura-primary-50)] dark:from-[var(--eddura-primary-900)] dark:via-transparent dark:to-[var(--eddura-primary-900)] rounded-3xl -z-10" />
        
        <div className="relative">
          {/* <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-16 h-16 bg-gradient-to-br from-[var(--eddura-primary)] to-[var(--eddura-primary-600)] rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl"
          >
            <Star className="w-8 h-8 text-white" />
          </motion.div> */}
          
          <h1 className="text-5xl font-bold mb-2">
            <span className="bg-gradient-to-r from-[var(--eddura-primary-900)] via-[var(--eddura-primary-700)] to-[var(--eddura-primary-900)] dark:from-white dark:via-[var(--eddura-primary-200)] dark:to-white bg-clip-text text-transparent">
              {t('welcome', { name: userProfile?.firstName || session?.user?.name || 'User' })}
            </span>
            <span className="ml-2 align-middle">👋</span>
          </h1>
          <p className="text-lg text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)] max-w-3xl leading-relaxed">
            {t('personalizedExperience')}
          </p>
        </div>
      </motion.div>

      {/* Consistent Stats Grid with stronger visual rhythm */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        <StatsCard
          title={t('stats.applicationPackages')}
          value={userProfile?.stats?.applicationPackagesCreated || 0}
          icon={Target}
          colorTheme="primary"
          caption={t('stats.created')}
        />
        <StatsCard
          title={t('stats.documentsCreated')}
          value={userProfile?.stats?.documentsCreated || 0}
          icon={BookOpen}
          colorTheme="success"
          caption={t('stats.created')}
        />
        <StatsCard
          title={t('stats.recommendationLetters')}
          value={`${userProfile?.stats?.recommendationLettersRequested || 0} / ${userProfile?.stats?.recommendationLettersReceived || 0}`}
          icon={Award}
          colorTheme="accent"
          caption={t('stats.requestedReceived')}
        />
        <StatsCard
          title={t('stats.scholarshipsSaved')}
          value={userProfile?.stats?.scholarshipsSaved || 0}
          icon={TrendingUp}
          colorTheme="info"
          caption={t('stats.shownInterest')}
        />
        <StatsCard
          title={t('stats.tokensEarned')}
          value={userProfile?.tokens || 0}
          icon={Gift}
          colorTheme="warning"
          caption={t('stats.total', { count: userProfile?.totalTokensEarned || 0 })}
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-10">
        {/* Left Column - Quick Actions & Recent Activity */}
        <div className="lg:col-span-2 space-y-10">
          {/* Enhanced Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="border-0 shadow-md bg-white dark:bg-[var(--eddura-primary-900)]">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl text-[var(--eddura-primary-900)] dark:text-white">{t('quickActions.title')}</CardTitle>
                <CardDescription className="text-base text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)]">
                  {t('quickActions.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/quiz" className="group block rounded-xl p-5 bg-[var(--eddura-success)] text-white shadow hover:shadow-lg transition ring-1 ring-white/20 dark:ring-white/10">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-white/20 dark:bg-white/10 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg text-white">{userProfile?.quizCompleted ? t('quickActions.retakeQuiz') : t('quickActions.takeQuiz')}</p>
                        <p className="text-sm text-white/90 dark:text-white/80">{userProfile?.quizCompleted ? t('quickActions.updatePreferences') : t('quickActions.discoverStrengths')}</p>
                      </div>
                    </div>
                  </Link>

                  <Link href="/quiz/results" className="group block rounded-xl p-5 bg-[var(--eddura-info)] text-white shadow hover:shadow-lg transition ring-1 ring-white/20 dark:ring-white/10">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-white/20 dark:bg-white/10 flex items-center justify-center">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg text-white">{t('quickActions.viewResults')}</p>
                        <p className="text-sm text-white/90 dark:text-white/80">{t('quickActions.seeRecommendations')}</p>
                      </div>
                    </div>
                  </Link>

                  <Link href="/applications" className="group block rounded-xl p-5 bg-violet-600 text-white shadow hover:shadow-lg transition ring-1 ring-white/20 dark:ring-white/10">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-white/20 dark:bg-white/10 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg text-white">{t('quickActions.applyNow')}</p>
                        <p className="text-sm text-white/90 dark:text-white/80">{t('quickActions.startApplications')}</p>
                      </div>
                    </div>
                  </Link>

                  <Link href="/scholarships" className="group block rounded-xl p-5 bg-[var(--eddura-accent)] text-white shadow hover:shadow-lg transition ring-1 ring-white/20 dark:ring-white/10">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-white/20 dark:bg-white/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg text-white">{t('quickActions.browseScholarships')}</p>
                        <p className="text-sm text-white/90 dark:text-white/80">{t('quickActions.findFunding')}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-[var(--eddura-primary-50)] dark:from-[var(--eddura-primary-900)] dark:to-[var(--eddura-primary-800)] backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-8">
                {/* <div className="w-16 h-16 bg-gradient-to-br from-[var(--eddura-accent)] to-[var(--eddura-accent-600)] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div> */}
                <CardTitle className="text-3xl text-[var(--eddura-primary-900)] dark:text-white">{t('recentActivity.title')}</CardTitle>
                <CardDescription className="text-xl text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)]">
                  {t('recentActivity.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userActivities.length > 0 ? (
                    userActivities
                      .slice(0, activityPage * ACTIVITY_PAGE_SIZE)
                      .map((activity, index) => {
                      const { icon: Icon, bgColor, iconColor } = getActivityIcon(activity.type);
                      return (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          whileHover={{ x: 8, scale: 1.02 }}
                          className={`flex items-center space-x-4 p-5 ${bgColor} rounded-2xl border border-[var(--eddura-primary-100)] dark:border-[var(--eddura-primary-800)] shadow-lg hover:shadow-xl transition-all duration-300`}
                        >
                          <div className={`w-12 h-12 ${bgColor.replace('50', '100').replace('900', '800')} rounded-xl flex items-center justify-center shadow-md`}>
                            <Icon className={`w-6 h-6 ${iconColor}`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-[var(--eddura-primary-900)] dark:text-white">{activity.title}</p>
                            <p className="text-xs text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)]">{activity.description}</p>
                          </div>
                          <span className="text-xs font-medium text-[var(--eddura-primary-500)] dark:text-[var(--eddura-primary-400)] bg-white/50 dark:bg-black/20 px-3 py-1 rounded-full">
                            {formatTimeAgo(activity.timestamp)}
                          </span>
                        </motion.div>
                      );
                      })
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gradient-to-br from-[var(--eddura-primary-100)] to-[var(--eddura-primary-200)] dark:from-[var(--eddura-primary-800)] dark:to-[var(--eddura-primary-700)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Clock className="w-10 h-10 text-[var(--eddura-primary-400)] dark:text-[var(--eddura-primary-500)]" />
                      </div>
                      <p className="text-xl text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)] mb-2">{t('recentActivity.noActivity')}</p>
                      <p className="text-sm text-[var(--eddura-primary-500)] dark:text-[var(--eddura-primary-400)]">{t('recentActivity.activitiesWillAppear')}</p>
                    </div>
                  )}
                </div>
                {/* Pagination controls */}
                {userActivities.length > 0 && (
                  <div className="mt-6 flex items-center justify-end gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={showLessActivities}
                      disabled={activityPage === 1}
                    >
                      {t('recentActivity.showLess')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadMoreActivities}
                      disabled={!hasMoreActivities}
                    >
                      {t('recentActivity.loadMore')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Profile & Settings */}
        <div className="space-y-8">
          {/* Enhanced Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-[var(--eddura-primary-50)] dark:from-[var(--eddura-primary-900)] dark:to-[var(--eddura-primary-800)] backdrop-blur-sm overflow-hidden">
              <CardHeader className="text-center pb-8">
                <Avatar className="w-28 h-28 mx-auto mb-6 shadow-xl">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-br from-[var(--eddura-primary)] to-[var(--eddura-primary-600)] text-white text-4xl font-bold">
                    {userProfile?.firstName?.[0]}{userProfile?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl text-[var(--eddura-primary-900)] dark:text-white mb-2">{userProfile?.firstName} {userProfile?.lastName}</CardTitle>
                <CardDescription className="text-lg text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)]">{userProfile?.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-3 bg-[var(--eddura-primary-100)] dark:bg-[var(--eddura-primary-800)] rounded-xl">
                  <span className="text-sm font-medium text-[var(--eddura-primary-700)] dark:text-[var(--eddura-primary-300)]">Quiz Status</span>
                  <Badge className={userProfile?.quizCompleted ? "bg-gradient-to-r from-[var(--eddura-success)] to-[var(--eddura-success-600)] text-white" : "bg-gradient-to-r from-[var(--eddura-warning)] to-[var(--eddura-warning-600)] text-white"}>
                    {userProfile?.quizCompleted ? "Completed" : "Incomplete"}
                  </Badge>
                </div>
                
                {userProfile?.quizCompletedAt && (
                  <div className="flex items-center justify-between p-3 bg-[var(--eddura-primary-100)] dark:bg-[var(--eddura-primary-800)] rounded-xl">
                    <span className="text-sm font-medium text-[var(--eddura-primary-700)] dark:text-[var(--eddura-primary-300)]">Completed</span>
                    <span className="text-sm text-[var(--eddura-primary-900)] dark:text-white font-medium">
                      {new Date(userProfile.quizCompletedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full border-2 border-[var(--eddura-primary-200)] dark:border-[var(--eddura-primary-700)] text-[var(--eddura-primary-700)] dark:text-[var(--eddura-primary-300)] hover:bg-[var(--eddura-primary-50)] dark:hover:bg-[var(--eddura-primary-800)] hover:border-[var(--eddura-primary-300)] dark:hover:border-[var(--eddura-primary-600)] transition-all duration-200 rounded-xl h-12 font-semibold"
                  onClick={() => setShowProfileModal(true)}
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Quiz Progress */}
          {userProfile?.quizCompleted && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-[var(--eddura-success-50)] dark:from-[var(--eddura-success-900)] dark:to-[var(--eddura-success-800)] backdrop-blur-sm overflow-hidden">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--eddura-success)] to-[var(--eddura-success-600)] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl text-[var(--eddura-success-900)] dark:text-white">Quiz Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-3">
                        <span className="text-[var(--eddura-success-600)] dark:text-[var(--eddura-success-300)] font-medium">Completion</span>
                        <span className="text-[var(--eddura-success-900)] dark:text-white font-bold">100%</span>
                      </div>
                      <div className="w-full bg-[var(--eddura-success-200)] dark:bg-[var(--eddura-success-700)] rounded-full h-3 shadow-inner">
                        <div className="bg-gradient-to-r from-[var(--eddura-success)] to-[var(--eddura-success-600)] h-3 rounded-full shadow-lg" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 bg-[var(--eddura-success-100)] dark:bg-[var(--eddura-success-800)] rounded-xl">
                        <p className="text-2xl font-bold text-[var(--eddura-success-900)] dark:text-white">{userProfile?.stats?.applicationPackagesCreated || 0}</p>
                        <p className="text-xs text-[var(--eddura-success-600)] dark:text-[var(--eddura-success-300)] font-medium">Applications</p>
                      </div>
                      <div className="p-3 bg-[var(--eddura-success-100)] dark:bg-[var(--eddura-success-800)] rounded-xl">
                        <p className="text-2xl font-bold text-[var(--eddura-success-900)] dark:text-white">{userProfile?.stats?.documentsCreated || 0}</p>
                        <p className="text-xs text-[var(--eddura-success-600)] dark:text-[var(--eddura-success-300)] font-medium">Documents</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Token Display */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <TokenDisplay 
              tokens={userProfile?.tokens || 0}
              totalTokensEarned={userProfile?.totalTokensEarned || 0}
              totalTokensSpent={userProfile?.totalTokensSpent || 0}
            />
          </motion.div>

          {/* Eddura Squads Widget */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <SquadWidget />
          </motion.div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {editableProfile && (
        <ProfileEditModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          profile={editableProfile}
          onUpdate={(updated) => {
            setUserProfile((prev: UserProfile | null) => prev ? { ...prev, ...updated } : prev);
          }}
        />
      )}
    </ResponsiveContainer>
  );
} 