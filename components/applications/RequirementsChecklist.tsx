'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  DollarSign, 
  Users, 
  Plus,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RequirementStatus, RequirementCategory, RequirementType } from '@/types/requirements';
import { RequirementCard } from '@/components/applications/RequirementCard';
import { AddRequirementModal } from '@/components/applications/AddRequirementModal';

// Plain object interface for frontend use (without Mongoose Document methods)
interface RequirementData {
  _id: string;
  applicationId: string;
  requirementType: RequirementType;
  category: RequirementCategory;
  name: string;
  description?: string;
  isRequired: boolean;
  isOptional: boolean;
  documentType?: string;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  wordLimit?: number;
  characterLimit?: number;
  testType?: string;
  minScore?: number;
  maxScore?: number;
  scoreFormat?: string;
  applicationFeeAmount?: number;
  applicationFeeCurrency?: string;
  applicationFeeDescription?: string;
  applicationFeePaid?: boolean;
  applicationFeePaidAt?: Date;
  interviewType?: string;
  interviewDuration?: number;
  interviewNotes?: string;
  status: RequirementStatus;
  submittedAt?: Date;
  verifiedAt?: Date;
  notes?: string;
  linkedDocumentId?: string;
  externalUrl?: string;
  taskId?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

interface RequirementsChecklistProps {
  applicationId: string;
  applicationName: string;
  onRequirementUpdate?: () => void;
  onRequirementEdit?: (requirementId: string, updates: Partial<RequirementData>) => Promise<void>;
}

interface FilterState {
  status: RequirementStatus[];
  category: RequirementCategory[];
  requirementType: RequirementType[];
  isRequired: boolean | null;
}

export const RequirementsChecklist: React.FC<RequirementsChecklistProps> = ({
  applicationId,
  applicationName,
  onRequirementUpdate,
  onRequirementEdit
}) => {
  const [requirements, setRequirements] = useState<RequirementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    category: [],
    requirementType: [],
    isRequired: null
  });
  const [sortBy, setSortBy] = useState<'order' | 'name' | 'status' | 'category'>('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Progress calculation
  const progress = React.useMemo(() => {
    if (!requirements.length) return { percentage: 0, completed: 0, total: 0 };
    
    const total = requirements.length;
    const completed = requirements.filter(req => 
      req.status === 'completed' || req.status === 'waived' || req.status === 'not_applicable'
    ).length;
    
    return {
      percentage: Math.round((completed / total) * 100),
      completed,
      total
    };
  }, [requirements]);

  // Fetch requirements
  const fetchRequirements = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      queryParams.append('applicationId', applicationId);
      
      // Add filters
      filters.status.forEach(status => queryParams.append('status', status));
      filters.category.forEach(category => queryParams.append('category', category));
      filters.requirementType.forEach(type => queryParams.append('requirementType', type));
      if (filters.isRequired !== null) {
        queryParams.append('isRequired', filters.isRequired.toString());
      }
      
      // Add sorting
      queryParams.append('sortBy', sortBy);
      queryParams.append('sortOrder', sortOrder);

      const response = await fetch(`/api/application-requirements?${queryParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch requirements');
      }

      setRequirements(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requirements');
    } finally {
      setLoading(false);
    }
  };

  // Update requirement status
  const updateRequirementStatus = async (requirementId: string, status: RequirementStatus, notes?: string) => {
    try {
      const response = await fetch(`/api/application-requirements/${requirementId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update requirement status');
      }

      // Update local state with proper typing
      setRequirements(prev => prev.map(req => 
        req._id === requirementId ? { ...req, status, notes } : req
      ));

      onRequirementUpdate?.();
    } catch (err) {
      console.error('Error updating requirement status:', err);
      // You might want to show a toast notification here
    }
  };

  // Link document to requirement
  const linkDocumentToRequirement = async (requirementId: string, documentId: string, notes?: string) => {
    try {
      const response = await fetch(`/api/application-requirements/${requirementId}/link-document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, notes })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to link document');
      }

      // Update local state with proper typing
      setRequirements(prev => prev.map(req => 
        req._id === requirementId ? { ...req, ...data.data } : req
      ));

      onRequirementUpdate?.();
    } catch (err) {
      console.error('Error linking document:', err);
      // You might want to show a toast notification here
    }
  };

  // Update requirement properties
  const updateRequirement = async (requirementId: string, updates: Partial<RequirementData>) => {
    try {
      const response = await fetch(`/api/application-requirements/${requirementId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update requirement');
      }

      // Update local state
      setRequirements(prev => prev.map(req => 
        req._id === requirementId ? { ...req, ...updates } : req
      ));

      onRequirementUpdate?.();
    } catch (err) {
      console.error('Error updating requirement:', err);
      // You might want to show a toast notification here
    }
  };

  // Filter requirements based on current filters
  const filteredRequirements = React.useMemo(() => {
    return requirements.filter(req => {
      if (filters.status.length > 0 && !filters.status.includes(req.status)) return false;
      if (filters.category.length > 0 && !filters.category.includes(req.category)) return false;
      if (filters.requirementType.length > 0 && !filters.requirementType.includes(req.requirementType)) return false;
      if (filters.isRequired !== null && req.isRequired !== filters.isRequired) return false;
      return true;
    });
  }, [requirements, filters]);

  // Sort requirements
  const sortedRequirements = React.useMemo(() => {
    return [...filteredRequirements].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        default:
          aValue = a.order;
          bValue = b.order;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredRequirements, sortBy, sortOrder]);

  useEffect(() => {
    fetchRequirements();
  }, [applicationId, filters, sortBy, sortOrder]);

  const getStatusIcon = (status: RequirementStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
      case 'waived':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'not_applicable':
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRequirementTypeIcon = (type: RequirementType) => {
    switch (type) {
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'fee':
        return <DollarSign className="h-4 w-4" />;
      case 'interview':
        return <Users className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: RequirementStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'waived':
        return 'bg-blue-100 text-blue-800';
      case 'not_applicable':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
            <Button onClick={fetchRequirements} className="mt-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Requirements Checklist</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {applicationName} • {progress.completed} of {progress.total} completed
              </p>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Requirement
            </Button>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">{progress.percentage}%</span>
            </div>
            <Progress value={progress.percentage} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Filters and Sorting */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <Select
              value={filters.status.join(',') || 'all'}
              onValueChange={(value) => 
                setFilters(prev => ({ 
                  ...prev, 
                  status: value === 'all' ? [] : [value as RequirementStatus] 
                }))
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="waived">Waived</SelectItem>
                <SelectItem value="not_applicable">Not Applicable</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.category.join(',') || 'all'}
              onValueChange={(value) => 
                setFilters(prev => ({ 
                  ...prev, 
                  category: value === 'all' ? [] : [value as RequirementCategory] 
                }))
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="administrative">Administrative</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.requirementType.join(',') || 'all'}
              onValueChange={(value) => 
                setFilters(prev => ({ 
                  ...prev, 
                  requirementType: value === 'all' ? [] : [value as RequirementType] 
                }))
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="test_score">Test Score</SelectItem>
                <SelectItem value="fee">Fee</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.isRequired === null ? 'all' : filters.isRequired.toString()}
              onValueChange={(value) => 
                setFilters(prev => ({ 
                  ...prev, 
                  isRequired: value === 'all' ? null : value === 'true' 
                }))
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Required" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Required</SelectItem>
                <SelectItem value="false">Optional</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm font-medium">Sort:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {sortBy === 'order' ? 'Order' : 
                     sortBy === 'name' ? 'Name' : 
                     sortBy === 'status' ? 'Status' : 'Category'}
                    {sortOrder === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSortBy('order')}>
                    Order
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('name')}>
                    Name
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('status')}>
                    Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('category')}>
                    Category
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirements List */}
      <div className="space-y-4">
        {sortedRequirements.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No requirements found matching the current filters.</p>
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => setFilters({
                  status: [],
                  category: [],
                  requirementType: [],
                  isRequired: null
                })}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          sortedRequirements.map((requirement) => (
            <RequirementCard
              key={requirement._id}
              requirement={requirement}
              onStatusUpdate={updateRequirementStatus}
              onDocumentLink={linkDocumentToRequirement}
              onRequirementUpdate={updateRequirement}
            />
          ))
        )}
      </div>

      {/* Add Requirement Modal */}
      {showAddModal && (
        <AddRequirementModal
          applicationId={applicationId}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchRequirements();
            onRequirementUpdate?.();
          }}
        />
      )}
    </div>
  );
}; 