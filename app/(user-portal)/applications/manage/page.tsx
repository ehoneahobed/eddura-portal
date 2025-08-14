'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { 
  Package, 
  FileText, 
  Target, 
  Plus, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  School,
  Award,
  BookOpen,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { usePageTranslation, useCommonTranslation } from '@/hooks/useTranslation';

interface ApplicationStats {
  total: number;
  draft: number;
  inProgress: number;
  readyForSubmission: number;
  submitted: number;
  accepted: number;
  rejected: number;
  upcomingDeadlines: number;
}

interface Application {
  _id: string;
  name: string;
  applicationType: 'scholarship' | 'school' | 'program' | 'external';
  status: 'draft' | 'in_progress' | 'ready_for_submission' | 'submitted' | 'accepted' | 'rejected' | 'waitlisted' | 'withdrawn';
  progress: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  applicationDeadline?: string;
  targetName?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ApplicationManagePage() {
  const { data: session } = useSession();
  const { t } = usePageTranslation('applicationsManage');
  const { t: tCommon } = useCommonTranslation();
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    draft: 0,
    inProgress: 0,
    readyForSubmission: 0,
    submitted: 0,
    accepted: 0,
    rejected: 0,
    upcomingDeadlines: 0
  });
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchApplicationData();
    }
  }, [session?.user?.id]);

  const fetchApplicationData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/applications');
      
      if (response.ok) {
        const data = await response.json();
        const apps = data.applications || [];
        setApplications(apps);
        
        // Calculate stats from real data
        const now = new Date();
        const upcomingDeadlines = apps.filter((app: Application) => {
          if (!app.applicationDeadline) return false;
          const deadline = new Date(app.applicationDeadline);
          const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays > 0 && diffDays <= 30;
        }).length;

        const newStats: ApplicationStats = {
          total: apps.length,
          draft: apps.filter((app: Application) => app.status === 'draft').length,
          inProgress: apps.filter((app: Application) => app.status === 'in_progress').length,
          readyForSubmission: apps.filter((app: Application) => app.status === 'ready_for_submission').length,
          submitted: apps.filter((app: Application) => app.status === 'submitted').length,
          accepted: apps.filter((app: Application) => app.status === 'accepted').length,
          rejected: apps.filter((app: Application) => app.status === 'rejected').length,
          upcomingDeadlines
        };
        
        setStats(newStats);
      } else {
        toast.error(t('errors.fetchFailed'));
      }
    } catch (error) {
      console.error('Error fetching application data:', error);
      toast.error(t('errors.fetchFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Create Application Package',
      description: 'Start a new application for a school or program',
      icon: Package,
      href: '/applications/packages',
      color: 'bg-blue-500 hover:bg-blue-600',
      badge: 'New'
    },
    {
      title: 'Browse Scholarships',
      description: 'Find and apply for scholarships',
      icon: Award,
      href: '/scholarships',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Explore Programs',
      description: 'Discover schools and programs',
      icon: School,
      href: '/programs',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Manage Documents',
      description: 'Upload and organize your documents',
      icon: FileText,
      href: '/documents',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  // Get recent applications (last 5)
  const recentApplications = applications
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-[var(--eddura-primary-50)] text-[var(--eddura-primary-800)] dark:bg-[var(--eddura-primary-800)] dark:text-[var(--eddura-primary-100)]';
      case 'in_progress':
        return 'bg-[var(--eddura-warning-50)] text-[var(--eddura-warning-800)] dark:bg-[var(--eddura-warning-800)] dark:text-[var(--eddura-warning-50)]';
      case 'ready_for_submission':
        return 'bg-[var(--eddura-success-100)] text-[var(--eddura-success-800)] dark:bg-[var(--eddura-success-800)] dark:text-[var(--eddura-success-100)]';
      case 'submitted':
        return 'bg-[var(--eddura-info-100)] text-[var(--eddura-info-800)] dark:bg-[var(--eddura-info-800)] dark:text-[var(--eddura-info-100)]';
      case 'accepted':
        return 'bg-[var(--eddura-success-100)] text-[var(--eddura-success-800)] dark:bg-[var(--eddura-success-800)] dark:text-[var(--eddura-success-100)]';
      case 'rejected':
        return 'bg-[var(--eddura-error-100)] text-[var(--eddura-error-dark)] dark:bg-[var(--eddura-error-dark)] dark:text-[var(--eddura-error-50)]';
      case 'waitlisted':
        return 'bg-[var(--eddura-accent-100)] text-[var(--eddura-accent-800)] dark:bg-[var(--eddura-accent-800)] dark:text-[var(--eddura-accent-100)]';
      case 'withdrawn':
        return 'bg-[var(--eddura-primary-50)] text-[var(--eddura-primary-800)] dark:bg-[var(--eddura-primary-800)] dark:text-[var(--eddura-primary-100)]';
      default:
        return 'bg-[var(--eddura-primary-50)] text-[var(--eddura-primary-800)] dark:bg-[var(--eddura-primary-800)] dark:text-[var(--eddura-primary-100)]';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-[var(--eddura-success-100)] text-[var(--eddura-success-800)] dark:bg-[var(--eddura-success-800)] dark:text-[var(--eddura-success-100)]';
      case 'medium':
        return 'bg-[var(--eddura-warning-100)] text-[var(--eddura-warning-800)] dark:bg-[var(--eddura-warning-800)] dark:text-[var(--eddura-warning-100)]';
      case 'high':
        return 'bg-[var(--eddura-accent-100)] text-[var(--eddura-accent-800)] dark:bg-[var(--eddura-accent-800)] dark:text-[var(--eddura-accent-100)]';
      case 'urgent':
        return 'bg-[var(--eddura-error-100)] text-[var(--eddura-error-dark)] dark:bg-[var(--eddura-error-dark)] dark:text-[var(--eddura-error-50)]';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <ResponsiveContainer maxWidth="8xl" padding="md" className="py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-eddura-primary dark:text-white">{t('title')}</h1>
          <p className="text-eddura-secondary dark:text-eddura-600 mt-2">{t('subtitle')}</p>
        </div>
        <Link href="/applications/packages">
          <Button className="bg-eddura-500 hover:bg-eddura-600 text-white shadow-eddura hover:shadow-eddura-lg">
            <Plus className="w-4 h-4 mr-2" />
            {t('actions.createPackage')}
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="dark:bg-[var(--eddura-primary-900)] dark:border-[var(--eddura-primary-800)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)]">{t('stats.total')}</p>
                <p className="text-2xl font-bold text-[var(--eddura-primary-900)] dark:text-white">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-eddura-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-[var(--eddura-primary-900)] dark:border-[var(--eddura-primary-800)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)]">{t('stats.ready')}</p>
                <p className="text-2xl font-bold text-[var(--eddura-success)]">{stats.readyForSubmission}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-[var(--eddura-success)]" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-[var(--eddura-primary-900)] dark:border-[var(--eddura-primary-800)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)]">{t('status.inProgress')}</p>
                <p className="text-2xl font-bold text-[var(--eddura-warning-dark)]">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-[var(--eddura-warning-dark)]" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-[var(--eddura-primary-900)] dark:border-[var(--eddura-primary-800)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)]">{t('stats.upcomingDeadlines')}</p>
                <p className="text-2xl font-bold text-[var(--eddura-accent-dark)]">{stats.upcomingDeadlines}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-[var(--eddura-accent-dark)]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-4 rounded-lg dark:bg-[var(--eddura-primary-900)] dark:border-[var(--eddura-primary-800)]">
        <CardHeader>
          <CardTitle className="text-eddura-primary dark:text-white">{t('quick.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer dark:bg-[var(--eddura-primary-900)] dark:border-[var(--eddura-primary-800)]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${action.color} text-white shadow-eddura`}>
                        <action.icon className="h-6 w-6" />
                      </div>
                      {action.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {t('quick.new')}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-[var(--eddura-primary-900)] dark:text-white mb-2">{t(`quick.${action.title}`)}</h3>
                    <p className="text-sm text-[var(--eddura-primary-700)] dark:text-[var(--eddura-primary-300)]">{t(`quick.${action.description}`)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Applications */}
      <Card className="mt-4 rounded-lg dark:bg-[var(--eddura-primary-900)]">
        <CardHeader>
          <div className="flex items-center justify-between">
          <CardTitle className="text-eddura-primary dark:text-white">{t('recent.title')}</CardTitle>
            <Link href="/applications/packages">
              <Button variant="outline" size="sm" className="border-eddura-500 text-eddura-600 hover:bg-eddura-500 hover:text-white dark:text-white dark:border-white/20 dark:hover:border-transparent">
                {t('recent.viewAll')}
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>{t('recent.loading')}</span>
              </div>
            ) : recentApplications.length === 0 ? (
              <div className="text-center py-8 text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)]">
                <Package className="h-12 w-12 mx-auto mb-4 text-[var(--eddura-primary-300)]" />
                <p>{t('recent.none')}</p>
                <p className="text-sm">{t('recent.createFirst')}</p>
              </div>
            ) : (
              recentApplications.map((app) => (
                <div key={app._id} className="flex items-center justify-between p-4 border rounded-xl bg-white/60 dark:bg-[var(--eddura-primary-900)] dark:border-[var(--eddura-primary-800)]">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg bg-eddura-50 text-eddura-600 dark:bg-white/10 dark:text-white">
                      {app.applicationType === 'program' || app.applicationType === 'school' ? (
                        <School className="h-5 w-5" />
                      ) : (
                        <Award className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-normal text-gray-900 dark:text-white text-sm md:text-base">{app.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getStatusColor(app.status)}>
                          {t(`statusMap.${app.status}`)}
                        </Badge>
                        <Badge className={getPriorityColor(app.priority)}>
                          {t(`priority.${app.priority}`)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="hidden sm:block text-right">
                      <div className="text-[11px] text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)]">{t('labels.progress')}</div>
                      <div className="text-xs md:text-sm font-medium text-[var(--eddura-primary-900)] dark:text-white">{app.progress}%</div>
                    </div>
                    <div className="w-28">
                      <Progress value={app.progress} className="h-2 bg-eddura-100 dark:bg-white/10" indicatorClassName="bg-eddura-500 dark:bg-eddura-500" />
                    </div>
                    <div className="text-right min-w-[88px]">
                      <div className="text-[11px] text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)]">{t('labels.deadline')}</div>
                      <div className="text-xs md:text-sm font-medium text-[var(--eddura-primary-900)] dark:text-white">
                        {app.applicationDeadline ? t('labels.days', { count: getDaysUntilDeadline(app.applicationDeadline) }) : t('labels.noDeadline')}
                      </div>
                    </div>
                    <Link href={`/applications/${app._id}`}>
                      <Button variant="outline" size="sm" className="border-eddura-500 text-eddura-600 hover:bg-eddura-500 hover:text-white dark:text-white dark:border-white/20 dark:hover:border-transparent">
                        {t('actions.view')}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Application Types Overview */}
      <div className="grid gap-6 md:grid-cols-2 mt-4">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <School className="h-5 w-5 mr-2" />
              {t('types.programsAndSchools')}
            </CardTitle>
          </CardHeader>
          <CardContent>
                    <div className="space-y-3">
              {(() => {
                const programApps = applications.filter(app => 
                  app.applicationType === 'program' || app.applicationType === 'school'
                );
                return (
                  <>
                    <div className="flex justify-between items-center">
                              <span className="text-sm text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-200)]">{t('stats.total')}</span>
                      <span className="font-medium">{programApps.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                              <span className="text-sm text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-200)]">{t('status.readyForSubmission')}</span>
                      <span className="font-medium text-green-600">
                        {programApps.filter(app => app.status === 'ready_for_submission').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                              <span className="text-sm text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-200)]">{t('status.inProgress')}</span>
                      <span className="font-medium text-yellow-600">
                        {programApps.filter(app => app.status === 'in_progress').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                              <span className="text-sm text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-200)]">{t('status.accepted')}</span>
                      <span className="font-medium text-green-600">
                        {programApps.filter(app => app.status === 'accepted').length}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
            <Link href="/applications/packages">
              <Button variant="outline" className="w-full mt-4 border-eddura-500 text-eddura-600 hover:bg-eddura-500 hover:text-white dark:text-white dark:border-white/20 dark:hover:border-transparent">
                Manage Programs
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              {t('types.scholarships')}
            </CardTitle>
          </CardHeader>
          <CardContent>
                    <div className="space-y-3">
              {(() => {
                const scholarshipApps = applications.filter(app => 
                  app.applicationType === 'scholarship'
                );
                return (
                  <>
                    <div className="flex justify-between items-center">
                              <span className="text-sm text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-200)]">{t('stats.total')}</span>
                      <span className="font-medium">{scholarshipApps.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                              <span className="text-sm text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-200)]">{t('status.readyForSubmission')}</span>
                      <span className="font-medium text-green-600">
                        {scholarshipApps.filter(app => app.status === 'ready_for_submission').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                              <span className="text-sm text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-200)]">{t('status.inProgress')}</span>
                      <span className="font-medium text-yellow-600">
                        {scholarshipApps.filter(app => app.status === 'in_progress').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                              <span className="text-sm text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-200)]">{t('status.accepted')}</span>
                      <span className="font-medium text-green-600">
                        {scholarshipApps.filter(app => app.status === 'accepted').length}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
            <Link href="/scholarships">
              <Button variant="outline" className="w-full mt-4 border-eddura-500 text-eddura-600 hover:bg-eddura-500 hover:text-white dark:text-white dark:border-white/20 dark:hover:border-transparent">
                {t('actions.browseScholarships')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </ResponsiveContainer>
  );
} 