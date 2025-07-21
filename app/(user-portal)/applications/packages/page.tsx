'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Target,
  FileText,
  School,
  Star,
  ExternalLink,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Play,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ApplicationPackageBuilder } from '@/components/applications/ApplicationPackageBuilder';
import { toast } from 'sonner';
import Link from 'next/link';

interface ApplicationPackage {
  _id: string;
  name: string;
  description?: string;
  applicationType: 'scholarship' | 'school' | 'program' | 'external';
  status: 'draft' | 'in_progress' | 'submitted' | 'accepted' | 'rejected' | 'waitlisted';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  applicationDeadline?: string;
  progress: number;
  requirementsProgress: {
    total: number;
    completed: number;
    required: number;
    requiredCompleted: number;
  };
  // New fields
  targetId?: string;
  targetName?: string;
  isExternal?: boolean;
  externalSchoolName?: string;
  externalProgramName?: string;
  externalApplicationUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Application form tracking
  applicationFormStatus?: 'not_started' | 'draft' | 'in_progress' | 'submitted' | 'completed';
  applicationFormProgress?: number;
  applicationFormId?: string;
}

export default function ApplicationPackagesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<ApplicationPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<ApplicationPackage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Fetch application packages
  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/applications');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch application packages');
      }


      
      setPackages(data.applications || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch application packages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // Filter packages
  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = (pkg.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                         (pkg.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                         (pkg.externalSchoolName?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pkg.status === statusFilter;
    const matchesType = typeFilter === 'all' || pkg.applicationType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'waitlisted':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'school':
        return <School className="h-4 w-4" />;
      case 'program':
        return <FileText className="h-4 w-4" />;
      case 'scholarship':
        return <Star className="h-4 w-4" />;
      case 'external':
        return <ExternalLink className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getDaysUntilDeadline = (deadline?: string) => {
    if (!deadline) return null;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleCreatePackage = async (packageData: any) => {
    try {
      console.log('Creating application package:', packageData);
      
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(packageData),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Application package created successfully:', result);
        setShowCreateModal(false);
        fetchPackages(); // Refresh the list
      } else {
        console.error('Failed to create application package:', result.error);
        // You could add toast notification here
      }
    } catch (error) {
      console.error('Error creating application package:', error);
    }
  };

  const handlePackageUpdate = () => {
    fetchPackages(); // Refresh the list
  };

  const handleDeletePackage = async () => {
    if (!packageToDelete) return;

    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/applications/${packageToDelete._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Application package deleted successfully');
        setShowDeleteDialog(false);
        setPackageToDelete(null);
        fetchPackages(); // Refresh the list
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete application package');
      }
    } catch (error) {
      console.error('Error deleting application package:', error);
      toast.error('Failed to delete application package');
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDelete = (pkg: ApplicationPackage) => {
    setPackageToDelete(pkg);
    setShowDeleteDialog(true);
  };



  const getApplicationFormStatusColor = (status?: string) => {
    switch (status) {
      case 'not_started':
        return 'bg-gray-100 text-gray-800';
      case 'draft':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getApplicationFormStatusText = (status?: string) => {
    switch (status) {
      case 'not_started':
        return 'Not Started';
      case 'draft':
        return 'Draft';
      case 'in_progress':
        return 'In Progress';
      case 'submitted':
        return 'Submitted';
      case 'completed':
        return 'Completed';
      default:
        return 'Not Started';
    }
  };

  const getApplicationFormStatusIcon = (status?: string) => {
    switch (status) {
      case 'not_started':
        return <Plus className="h-4 w-4" />;
      case 'draft':
        return <FileText className="h-4 w-4" />;
      case 'in_progress':
        return <Play className="h-4 w-4" />;
      case 'submitted':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Plus className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <Target className="h-12 w-12 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Error Loading Packages</h2>
              <p className="mb-4">{error}</p>
              <Button onClick={fetchPackages}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Application Packages</h1>
          <p className="text-gray-600 mt-2">
            Manage your application packages and track requirements progress
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Package
          </Button>

        </div>
      </div>



      {/* Scholarship Application Forms Summary */}
      {filteredPackages.some(pkg => pkg.applicationType === 'scholarship' && !pkg.isExternal) ? (
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Scholarship Application Forms</h3>
                  <p className="text-gray-600">
                    Track your scholarship application forms and progress
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredPackages.filter(pkg => pkg.applicationType === 'scholarship' && !pkg.isExternal).length}
                </div>
                <div className="text-sm text-gray-600">Scholarship Packages</div>
                <div className="text-sm text-gray-600">
                  {filteredPackages.filter(pkg => 
                    pkg.applicationType === 'scholarship' && !pkg.isExternal && pkg.applicationFormId
                  ).length} with forms
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {filteredPackages.filter(pkg => 
                    pkg.applicationType === 'scholarship' && !pkg.isExternal && !pkg.applicationFormId
                  ).length} packages need application forms
                </div>

              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6 bg-gray-50 border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <FileText className="h-8 w-8 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Scholarship Application Forms</h3>
                  <p className="text-gray-600">
                    Create a scholarship application package to see the application form functionality
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Scholarship Package
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Search:</span>
            </div>
            
            <div className="flex-1 min-w-64">
              <Input
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="waitlisted">Waitlisted</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="school">School</SelectItem>
                <SelectItem value="program">Program</SelectItem>
                <SelectItem value="scholarship">Scholarship</SelectItem>
                <SelectItem value="external">External</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Packages Grid */}
      {filteredPackages.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {packages.length === 0 ? 'No Application Packages' : 'No packages found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {packages.length === 0 
                ? 'Create your first application package to get started.'
                : 'Try adjusting your search or filters.'
              }
            </p>
            {packages.length === 0 && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Package
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => {
            const daysUntilDeadline = getDaysUntilDeadline(pkg.applicationDeadline);
            
            return (
              <Card key={pkg._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(pkg.applicationType)}
                      <Badge className={getStatusColor(pkg.status)}>
                        {pkg.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => confirmDelete(pkg)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Package
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <h3 
                      className="font-semibold text-gray-900 mb-1 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => router.push(`/applications/${pkg._id}`)}
                    >
                      {pkg.name}
                    </h3>
                    {pkg.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{pkg.description}</p>
                    )}
                    {/* Show target information */}
                    {pkg.targetName && (
                      <p className="text-sm text-blue-600 font-medium">{pkg.targetName}</p>
                    )}
                    {pkg.isExternal && pkg.externalSchoolName && (
                      <p className="text-sm text-gray-600">{pkg.externalSchoolName}</p>
                    )}
                    {pkg.notes && (
                      <p className="text-sm text-gray-500 italic">&ldquo;{pkg.notes}&rdquo;</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(pkg.priority)}>
                      {pkg.priority} Priority
                    </Badge>
                    {pkg.isExternal && (
                      <Badge variant="outline">
                        External
                      </Badge>
                    )}
                    {!pkg.targetId && !pkg.isExternal && (
                      <Badge variant="outline" className="text-orange-600">
                        Unassociated
                      </Badge>
                    )}
                    {pkg.applicationType === 'scholarship' && !pkg.isExternal && pkg.applicationFormId && (
                      <Badge className="bg-green-100 text-green-800">
                        <FileText className="h-3 w-3 mr-1" />
                        Form Ready
                      </Badge>
                    )}
                    {pkg.applicationType === 'scholarship' && !pkg.isExternal && !pkg.applicationFormId && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Plus className="h-3 w-3 mr-1" />
                        Needs Form
                      </Badge>
                    )}
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Requirements Progress</span>
                      <span className="text-sm text-gray-600">
                        {pkg.requirementsProgress.completed}/{pkg.requirementsProgress.total}
                      </span>
                    </div>
                    <Progress value={pkg.progress} className="h-2" />
                    <div className="text-xs text-gray-500 mt-1">
                      {pkg.requirementsProgress.requiredCompleted} of {pkg.requirementsProgress.required} required completed
                    </div>
                  </div>

                  {/* Deadline */}
                  {pkg.applicationDeadline && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {daysUntilDeadline !== null && (
                          daysUntilDeadline > 0 
                            ? `${daysUntilDeadline} days until deadline`
                            : daysUntilDeadline === 0
                            ? 'Deadline is today'
                            : `${Math.abs(daysUntilDeadline)} days past deadline`
                        )}
                      </span>
                    </div>
                  )}

                  {/* Application Form Status - Only for scholarship packages */}
                  {pkg.applicationType === 'scholarship' && !pkg.isExternal && (
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <h4 className="text-sm font-medium text-gray-900 cursor-help">
                                Application Form
                                <span className="ml-1 text-gray-400">ⓘ</span>
                              </h4>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Fill out the official application form for this scholarship</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Badge className={getApplicationFormStatusColor(pkg.applicationFormStatus)}>
                          {getApplicationFormStatusIcon(pkg.applicationFormStatus)}
                          <span className="ml-1">{getApplicationFormStatusText(pkg.applicationFormStatus)}</span>
                        </Badge>
                      </div>
                      
                      {pkg.applicationFormProgress !== undefined && pkg.applicationFormProgress > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Form Progress</span>
                            <span>{pkg.applicationFormProgress}%</span>
                          </div>
                          <Progress value={pkg.applicationFormProgress} className="h-2" />
                        </div>
                      )}
                      

                    </div>
                  )}

                  {/* External Scholarship Note */}
                  {pkg.applicationType === 'scholarship' && pkg.isExternal && (
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-900">External Application</h4>
                        <Badge className="bg-gray-100 text-gray-800">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          External
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        This scholarship uses an external application system.
                      </p>
                      
                      {pkg.externalApplicationUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => window.open(pkg.externalApplicationUrl, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Apply Externally
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Primary Action Button */}
                  <div className="pt-2">
                    <Button
                      size="sm"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => router.push(`/applications/${pkg._id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Manage Application
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Package Modal */}
      {showCreateModal && (
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Application Package</DialogTitle>
            </DialogHeader>
            <ApplicationPackageBuilder
              onComplete={handleCreatePackage}
              onCancel={() => setShowCreateModal(false)}
            />
          </DialogContent>
        </Dialog>
      )}



      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Application Package</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{packageToDelete?.name}&rdquo;? This action cannot be undone.
              <br /><br />
              <strong>This will also delete:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All associated interviews</li>
                <li>All requirement links</li>
                <li>All submission tracking data</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePackage}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete Package'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 