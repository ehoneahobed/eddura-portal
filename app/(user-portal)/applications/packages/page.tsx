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
} from '@/components/ui/dialog';
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
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ApplicationPackageBuilder } from '@/components/applications/ApplicationPackageBuilder';
import { RequirementsChecklist } from '@/components/applications/RequirementsChecklist';
import { ProgressTracker } from '@/components/applications/ProgressTracker';
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
}

export default function ApplicationPackagesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<ApplicationPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<ApplicationPackage | null>(null);
  const [showRequirementsModal, setShowRequirementsModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
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
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Package
        </Button>
        <Button 
          variant="outline" 
          onClick={() => {
            // Test the new flow
            console.log('Testing application package creation...');
            setShowCreateModal(true);
          }}
        >
          Test New Flow
        </Button>
      </div>

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
                        <DropdownMenuItem onClick={() => {
                          setSelectedPackage(pkg);
                          setShowRequirementsModal(true);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Requirements
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedPackage(pkg);
                          setShowProgressModal(true);
                        }}>
                          <Target className="h-4 w-4 mr-2" />
                          View Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Package
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
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
                      <p className="text-sm text-gray-500 italic">"{pkg.notes}"</p>
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

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPackage(pkg);
                        setShowRequirementsModal(true);
                      }}
                      className="flex-1"
                    >
                      Requirements
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedPackage(pkg);
                        setShowProgressModal(true);
                      }}
                      className="flex-1"
                    >
                      Progress
                    </Button>
                  </div>
                  
                  {/* Full Management Link */}
                  <div className="pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => router.push(`/applications/${pkg._id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Manage Full Application
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

      {/* Requirements Modal */}
      {showRequirementsModal && selectedPackage && (
        <Dialog open={showRequirementsModal} onOpenChange={setShowRequirementsModal}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Requirements: {selectedPackage.name}</DialogTitle>
            </DialogHeader>
            <RequirementsChecklist
              applicationId={selectedPackage._id}
              applicationName={selectedPackage.name}
              onRequirementUpdate={handlePackageUpdate}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Progress Modal */}
      {showProgressModal && selectedPackage && (
        <Dialog open={showProgressModal} onOpenChange={setShowProgressModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Progress: {selectedPackage.name}</DialogTitle>
            </DialogHeader>
            <ProgressTracker
              applicationId={selectedPackage._id}
              applicationDeadline={selectedPackage.applicationDeadline ? new Date(selectedPackage.applicationDeadline) : undefined}
              onRefresh={handlePackageUpdate}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 