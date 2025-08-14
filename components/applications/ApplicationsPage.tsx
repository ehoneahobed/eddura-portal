'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Play,
  Pause,
  Calendar,
  Award,
  Filter,
  Search,
  Plus,
  Loader2,
  Eye,
  Edit,
  Trash2,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { Pagination } from '@/components/ui/pagination';
import { toast } from 'sonner';
import { ResponsiveContainer } from '../ui/responsive-container';
import { usePageTranslation, useCommonTranslation } from '@/hooks/useTranslation';

interface Application {
  _id: string;
  scholarshipId: {
    _id: string;
    title: string;
    value?: number;
    currency?: string;
    deadline: string;
  };
  status: 'draft' | 'in_progress' | 'ready_for_submission' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'waitlisted' | 'withdrawn';
  progress: number;
  currentSectionId?: string;
  startedAt: string;
  lastActivityAt: string;
  submittedAt?: string;
  estimatedTimeRemaining?: number;
  notes?: string;
}

export default function ApplicationsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = usePageTranslation('applications');
  const { t: tCommon } = useCommonTranslation();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, _setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  const filterApplications = useCallback(() => {
    let filtered = applications;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.scholarshipId.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
  }, [applications, searchTerm, statusFilter]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchApplications(1);
    }
  }, [session?.user?.id, pageSize]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    filterApplications();
  }, [filterApplications]);

  const fetchApplications = async (page: number) => {
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      const response = await fetch(`/api/applications?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
        setCurrentPage(data.page || page);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || data.applications.length);
      } else {
        toast.error(t('errors.fetchFailed'));
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error(t('errors.fetchFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'draft':
        return { color: 'bg-gray-100 text-gray-800', icon: FileText, label: t('status.draft') };
      case 'in_progress':
        return { color: 'bg-eddura-100 text-eddura-700', icon: Play, label: t('status.inProgress') };
      case 'ready_for_submission':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: t('status.readyForSubmission') };
      case 'submitted':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: t('status.submitted') };
      case 'under_review':
        return { color: 'bg-eddura-50 text-eddura-700', icon: Eye, label: t('status.underReview') };
      case 'approved':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: t('status.approved') };
      case 'rejected':
        return { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: t('status.rejected') };
      case 'waitlisted':
        return { color: 'bg-orange-100 text-orange-800', icon: Pause, label: t('status.waitlisted') };
      case 'withdrawn':
        return { color: 'bg-gray-100 text-gray-800', icon: Trash2, label: t('status.withdrawn') };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: FileText, label: t('status.unknown') };
    }
  };

  const formatCurrency = (value: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleContinueApplication = (applicationId: string) => {
    router.push(`/applications/${applicationId}`);
  };

  const handleViewApplication = (applicationId: string) => {
    router.push(`/applications/${applicationId}/view`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-eddura-light flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-eddura-500" />
          <h2 className="text-2xl font-bold text-eddura-primary dark:text-eddura-100 mb-2">{t('loading')}</h2>
          <p className="text-eddura-secondary dark:text-eddura-300">{t('loadingSubtitle')}</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer maxWidth="8xl" padding="md" className="py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-eddura-primary dark:text-eddura-100">{t('title')}</h1>
          <p className="text-eddura-secondary dark:text-eddura-300 mt-2">{t('subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => router.push('/applications/manage')}
          >
            {t('actions.management')}
          </Button>
          <Button 
            onClick={() => router.push('/scholarships')}
            className="bg-eddura-500 hover:bg-eddura-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('actions.findScholarships')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-eddura-secondary dark:text-eddura-300">{t('stats.total')}</p>
                <p className="text-2xl font-bold text-eddura-primary dark:text-eddura-100">{total || applications.length}</p>
              </div>
              <FileText className="w-8 h-8 text-eddura-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-eddura-secondary dark:text-eddura-300">{t('status.inProgress')}</p>
                <p className="text-2xl font-bold text-eddura-500">
                  {applications.filter(app => app.status === 'in_progress').length}
                </p>
              </div>
              <Play className="w-8 h-8 text-eddura-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-eddura-secondary dark:text-eddura-300">{t('status.submitted')}</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {applications.filter(app => app.status === 'submitted').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-eddura-secondary dark:text-eddura-300">{t('status.approved')}</p>
                <p className="text-2xl font-bold text-green-600">
                  {applications.filter(app => app.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Management CTA */}
      <Card className="bg-eddura-gradient border-eddura dark:bg-eddura-700 dark:border-eddura-600 mt-4 rounded-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-eddura-100 rounded-lg">
                <Target className="h-8 w-8 text-eddura-700" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{t('cta.title')}</h3>
                <p className="text-white/90">{t('cta.description')}</p>
              </div>
            </div>
            <Button 
              onClick={() => router.push('/applications/manage')}
              className="bg-white text-eddura-700 hover:bg-eddura-50 dark:bg-eddura-700 dark:text-eddura-100 dark:hover:bg-eddura-600"
            >
              <Target className="w-4 h-4 mr-2" />
              {t('cta.openManagement')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="mt-4 rounded-lg">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t('search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('filterByStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allStatus')}</SelectItem>
                  <SelectItem value="draft">{t('status.draft')}</SelectItem>
                  <SelectItem value="in_progress">{t('status.inProgress')}</SelectItem>
                  <SelectItem value="submitted">{t('status.submitted')}</SelectItem>
                  <SelectItem value="under_review">{t('status.underReview')}</SelectItem>
                  <SelectItem value="approved">{t('status.approved')}</SelectItem>
                  <SelectItem value="rejected">{t('status.rejected')}</SelectItem>
                  <SelectItem value="waitlisted">{t('status.waitlisted')}</SelectItem>
                  <SelectItem value="withdrawn">{t('status.withdrawn')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4 mt-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('empty.title')}</h3>
              <p className="text-gray-600 mb-4">
                {applications.length === 0 
                  ? t('empty.noneYet')
                  : t('empty.noMatch')
                }
              </p>
              {applications.length === 0 && (
                <Button 
                  onClick={() => router.push('/scholarships')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Award className="w-4 h-4 mr-2" />
                  {t('actions.browseScholarships')}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((application) => {
            const statusInfo = getStatusInfo(application.status);
            const StatusIcon = statusInfo.icon;
            
            return (
              <motion.div
                key={application._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover:shadow-eddura transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Left side - Application info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-eddura-primary dark:text-eddura-100 mb-1">
                              {application.scholarshipId.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-eddura-secondary dark:text-eddura-300">
                              {application.scholarshipId.value && (
                                <span className="flex items-center gap-1">
                                  <Award className="w-4 h-4" />
                                  {formatCurrency(application.scholarshipId.value, application.scholarshipId.currency)}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {tCommon('labels.deadline')}: {formatDate(application.scholarshipId.deadline)}
                              </span>
                            </div>
                          </div>
                          <Badge className={statusInfo.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                             <span>{tCommon('labels.progress')}</span>
                            <span>{application.progress}%</span>
                          </div>
                          <Progress value={application.progress} className="h-2" />
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-eddura-secondary dark:text-eddura-300">
                          <span>{t('labels.started')}: {formatDate(application.startedAt)}</span>
                          <span>{t('labels.lastActivity')}: {formatDate(application.lastActivityAt)}</span>
                          {application.estimatedTimeRemaining && (
                             <span>~{t('labels.minutesRemaining', { count: application.estimatedTimeRemaining })}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Right side - Actions */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        {application.status === 'draft' || application.status === 'in_progress' ? (
                          <Button 
                            onClick={() => handleContinueApplication(application._id)}
                            className="bg-eddura-500 hover:bg-eddura-600 text-white"
                          >
                            <Play className="w-4 h-4 mr-2" />
                             {t('actions.continue')}
                          </Button>
                        ) : application.status === 'ready_for_submission' ? (
                          <Button 
                            onClick={() => handleViewApplication(application._id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                             {t('actions.review')}
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => handleViewApplication(application._id)}
                            variant="outline"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                             {tCommon('actions.view')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <div className="pt-2">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            setIsLoading(true);
            fetchApplications(page);
          }}
        />
      </div>
    </ResponsiveContainer>
  );
}