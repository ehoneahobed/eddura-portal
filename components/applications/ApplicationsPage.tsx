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
        toast.error('Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to fetch applications');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'draft':
        return { color: 'bg-gray-100 text-gray-800', icon: FileText, label: 'Draft' };
      case 'in_progress':
        return { color: 'bg-eddura-100 text-eddura-700', icon: Play, label: 'In Progress' };
      case 'ready_for_submission':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Ready for Submission' };
      case 'submitted':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Submitted' };
      case 'under_review':
        return { color: 'bg-eddura-50 text-eddura-700', icon: Eye, label: 'Under Review' };
      case 'approved':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' };
      case 'rejected':
        return { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Rejected' };
      case 'waitlisted':
        return { color: 'bg-orange-100 text-orange-800', icon: Pause, label: 'Waitlisted' };
      case 'withdrawn':
        return { color: 'bg-gray-100 text-gray-800', icon: Trash2, label: 'Withdrawn' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: FileText, label: 'Unknown' };
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
          <h2 className="text-2xl font-bold text-eddura-primary dark:text-eddura-100 mb-2">Loading Applications</h2>
          <p className="text-eddura-secondary dark:text-eddura-300">Getting your application data...</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer maxWidth="8xl" padding="md" className="py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-eddura-primary dark:text-eddura-100">My Applications</h1>
          <p className="text-eddura-secondary dark:text-eddura-300 mt-2">
            Track and manage your scholarship applications
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => router.push('/applications/manage')}
          >
            Application Management
          </Button>
          <Button 
            onClick={() => router.push('/scholarships')}
            className="bg-eddura-500 hover:bg-eddura-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Find Scholarships
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-eddura-secondary dark:text-eddura-300">Total Applications</p>
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
                <p className="text-sm font-medium text-eddura-secondary dark:text-eddura-300">In Progress</p>
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
                <p className="text-sm font-medium text-eddura-secondary dark:text-eddura-300">Submitted</p>
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
                <p className="text-sm font-medium text-eddura-secondary dark:text-eddura-300">Approved</p>
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
      <Card className="bg-eddura-gradient border-eddura">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-eddura-100 rounded-lg">
                <Target className="h-8 w-8 text-eddura-700" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Application Management System</h3>
                <p className="text-white/90">
                  Create application packages, track requirements, and manage your entire application journey
                </p>
              </div>
            </div>
            <Button 
              onClick={() => router.push('/applications/manage')}
              className="bg-white text-eddura-700 hover:bg-eddura-50"
            >
              <Target className="w-4 h-4 mr-2" />
              Open Application Management
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="waitlisted">Waitlisted</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-600 mb-4">
                {applications.length === 0 
                  ? "You haven't started any applications yet."
                  : "No applications match your current filters."
                }
              </p>
              {applications.length === 0 && (
                <Button 
                  onClick={() => router.push('/scholarships')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Award className="w-4 h-4 mr-2" />
                  Browse Scholarships
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
                                Deadline: {formatDate(application.scholarshipId.deadline)}
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
                            <span>Progress</span>
                            <span>{application.progress}%</span>
                          </div>
                          <Progress value={application.progress} className="h-2" />
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-eddura-secondary dark:text-eddura-300">
                          <span>Started: {formatDate(application.startedAt)}</span>
                          <span>Last activity: {formatDate(application.lastActivityAt)}</span>
                          {application.estimatedTimeRemaining && (
                            <span>~{application.estimatedTimeRemaining} min remaining</span>
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
                            Continue
                          </Button>
                        ) : application.status === 'ready_for_submission' ? (
                          <Button 
                            onClick={() => handleViewApplication(application._id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Review
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => handleViewApplication(application._id)}
                            variant="outline"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
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