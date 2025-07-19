'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  HelpCircle,
  Save,
  Award,
  FileText,
  Loader2,
  AlertCircle,
  CalendarIcon,
  Upload,
  Trash2,
  GraduationCap,
  Briefcase,
  User,
  MapPin,
  Calculator,
  ExternalLink,
  Link as LinkIcon,
  Unlink,
  Eye,
  Edit,
  Plus,
  CheckSquare,
  Square,
  Star,
  Target,
  TrendingUp,
  FileCheck,
  FileX,
  Send,
  MessageSquare,
  Calendar,
  Clock3,
  AlertTriangle,
  Info,
  Download,
  Share2,
  Copy,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Filter,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
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
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';
import { ProgressTracker } from './ProgressTracker';
import { RequirementsChecklist } from './RequirementsChecklist';
import DocumentLinker from './DocumentLinker';
import InterviewScheduler from './InterviewScheduler';
import SubmissionTracker from './SubmissionTracker';

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

interface Document {
  _id: string;
  title: string;
  type: string;
  category: string;
  status: 'draft' | 'review' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  sharedForFeedback?: boolean;
  feedbackReceived?: boolean;
  linkedToRequirements?: string[];
}

interface Requirement {
  _id: string;
  name: string;
  description?: string;
  category: string;
  requirementType: string;
  status: 'pending' | 'in_progress' | 'completed' | 'waived' | 'not_applicable';
  isRequired: boolean;
  isOptional: boolean;
  linkedDocumentId?: string;
  linkedDocument?: Document;
  notes?: string;
  deadline?: string;
  // Fee-specific fields
  applicationFeeAmount?: number;
  applicationFeeCurrency?: string;
  applicationFeeDescription?: string;
}

interface Interview {
  _id: string;
  type: 'video' | 'phone' | 'in_person';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  scheduledDate?: string;
  duration?: number;
  notes?: string;
  interviewer?: string;
  location?: string;
  isVirtual?: boolean;
  meetingLink?: string;
  meetingId?: string;
  meetingPassword?: string;
  createdAt: string;
  updatedAt: string;
}

interface SubmissionStatus {
  _id: string;
  applicationSubmitted: boolean;
  submittedAt?: string;
  submissionMethod: 'online' | 'email' | 'mail' | 'in_person';
  confirmationNumber?: string;
  confirmationEmail?: string;
  submissionNotes?: string;
  followUpRequired: boolean;
  followUpNotes?: string;
  nextFollowUpDate?: string;
  followUpCompleted: boolean;
  followUpHistory: FollowUpEntry[];
  createdAt: string;
  updatedAt: string;
}

interface FollowUpEntry {
  _id: string;
  date: string;
  type: 'email' | 'phone' | 'in_person' | 'portal';
  notes: string;
  outcome?: string;
  nextAction?: string;
  nextActionDate?: string;
}

interface ApplicationPackageManagerProps {
  applicationId: string;
}

export default function ApplicationPackageManager({ applicationId }: ApplicationPackageManagerProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [application, setApplication] = useState<ApplicationPackage | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showDocumentLinker, setShowDocumentLinker] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [showQuickLinkModal, setShowQuickLinkModal] = useState(false);
  const [quickLinkRequirement, setQuickLinkRequirement] = useState<Requirement | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // Application form tracking
  const [applicationFormStatus, setApplicationFormStatus] = useState<'not_started' | 'draft' | 'in_progress' | 'ready_for_submission' | 'submitted' | 'completed'>('not_started');
  const [applicationFormProgress, setApplicationFormProgress] = useState(0);
  const [applicationFormId, setApplicationFormId] = useState<string | null>(null);

  const fetchApplicationData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch application package
      const appResponse = await fetch(`/api/applications/${applicationId}`);
      if (appResponse.ok) {
        const appData = await appResponse.json();
        setApplication(appData.application);

        // Fetch application form status for scholarship packages
        if (appData.application?.applicationType === 'scholarship' && !appData.application?.isExternal) {
          console.log('Fetching application form status for scholarship:', appData.application.targetId);
          
          // Use the applications API to get all applications for this user
          const formResponse = await fetch('/api/applications');
          if (formResponse.ok) {
            const formData = await formResponse.json();
            console.log('All applications:', formData.applications);
            
            // Find the current package in the list to get its applicationFormId and status
            const currentPackage = formData.applications?.find((app: any) => app._id === applicationId);
            console.log('Current package:', currentPackage);
            
            if (currentPackage?.applicationFormId) {
              // Use the status and progress from the main applications API
              setApplicationFormId(currentPackage.applicationFormId);
              setApplicationFormStatus(currentPackage.applicationFormStatus || 'not_started');
              setApplicationFormProgress(currentPackage.applicationFormProgress || 0);
              console.log('Set application form data from main API:', {
                id: currentPackage.applicationFormId,
                status: currentPackage.applicationFormStatus,
                progress: currentPackage.applicationFormProgress
              });
            } else {
              // Reset form data if no form found
              setApplicationFormId(null);
              setApplicationFormStatus('not_started');
              setApplicationFormProgress(0);
              console.log('No application form found, resetting data');
            }
          }
        }
      }

      // Fetch documents
      const docsResponse = await fetch('/api/documents');
      if (docsResponse.ok) {
        const docsData = await docsResponse.json();
        setDocuments(docsData.data || []);
      }

      // Fetch requirements
      const reqResponse = await fetch(`/api/application-requirements?applicationId=${applicationId}`);
      if (reqResponse.ok) {
        const reqData = await reqResponse.json();
        setRequirements(reqData.data || []);
      }

      // Fetch interviews
      const intResponse = await fetch(`/api/applications/${applicationId}/interviews`);
      if (intResponse.ok) {
        const intData = await intResponse.json();
        setInterviews(intData.interviews || []);
      }

      // Fetch submission status
      const subResponse = await fetch(`/api/applications/${applicationId}/submission-status`);
      if (subResponse.ok) {
        const subData = await subResponse.json();
        setSubmissionStatus(subData.submissionStatus);
      }

    } catch (error) {
      console.error('Error fetching application data:', error);
      toast.error('Failed to load application data');
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchApplicationData();
    }
  }, [session?.user?.id, applicationId, fetchApplicationData]);

  // Refresh data when returning to the page
  useEffect(() => {
    const handleFocus = () => {
      if (session?.user?.id) {
        fetchApplicationData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [session?.user?.id, fetchApplicationData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'ready_for_submission': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'waitlisted': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilDeadline = () => {
    if (!application?.applicationDeadline) return null;
    const now = new Date();
    const deadline = new Date(application.applicationDeadline);
    const diffTime = deadline.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleDocumentLink = async (requirementId: string, documentId: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/requirements/${requirementId}/link-document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId })
      });

      if (response.ok) {
        toast.success('Document linked successfully');
        fetchApplicationData(); // Refresh data
      } else {
        toast.error('Failed to link document');
      }
    } catch (error) {
      console.error('Error linking document:', error);
      toast.error('Failed to link document');
    }
  };

  const handleDocumentUnlink = async (requirementId: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/requirements/${requirementId}/unlink-document`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Document unlinked successfully');
        fetchApplicationData(); // Refresh data
      } else {
        toast.error('Failed to unlink document');
      }
    } catch (error) {
      console.error('Error unlinking document:', error);
      toast.error('Failed to unlink document');
    }
  };

  const handleQuickLink = (requirement: Requirement) => {
    setQuickLinkRequirement(requirement);
    setShowQuickLinkModal(true);
  };

  const isDocumentLinked = (documentId: string) => {
    return requirements.some(req => req.linkedDocumentId === documentId);
  };

  const handleRequirementStatusUpdate = async (requirementId: string, status: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/requirements/${requirementId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast.success('Requirement status updated');
        fetchApplicationData(); // Refresh data
      } else {
        toast.error('Failed to update requirement status');
      }
    } catch (error) {
      console.error('Error updating requirement status:', error);
      toast.error('Failed to update requirement status');
    }
  };

  // Interview management handlers
  const handleInterviewCreate = async (interview: Partial<Interview>) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/interviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interview)
      });

      if (response.ok) {
        toast.success('Interview scheduled successfully');
        fetchApplicationData(); // Refresh data
      } else {
        toast.error('Failed to schedule interview');
      }
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast.error('Failed to schedule interview');
    }
  };

  const handleInterviewUpdate = async (interviewId: string, updates: Partial<Interview>) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/interviews/${interviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        toast.success('Interview updated successfully');
        fetchApplicationData(); // Refresh data
      } else {
        toast.error('Failed to update interview');
      }
    } catch (error) {
      console.error('Error updating interview:', error);
      toast.error('Failed to update interview');
    }
  };

  const handleInterviewDelete = async (interviewId: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/interviews/${interviewId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Interview deleted successfully');
        fetchApplicationData(); // Refresh data
      } else {
        toast.error('Failed to delete interview');
      }
    } catch (error) {
      console.error('Error deleting interview:', error);
      toast.error('Failed to delete interview');
    }
  };

  // Submission management handlers
  const handleSubmissionUpdate = async (updates: Partial<SubmissionStatus>) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/submission-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        toast.success('Submission status updated successfully');
        fetchApplicationData(); // Refresh data
      } else {
        toast.error('Failed to update submission status');
      }
    } catch (error) {
      console.error('Error updating submission status:', error);
      toast.error('Failed to update submission status');
    }
  };

  const handleFollowUpAdd = async (followUp: any) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/submission-status/follow-ups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(followUp)
      });

      if (response.ok) {
        toast.success('Follow-up added successfully');
        fetchApplicationData(); // Refresh data
      } else {
        toast.error('Failed to add follow-up');
      }
    } catch (error) {
      console.error('Error adding follow-up:', error);
      toast.error('Failed to add follow-up');
    }
  };

  const handleFollowUpUpdate = async (followUpId: string, updates: any) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/submission-status/follow-ups/${followUpId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        toast.success('Follow-up updated successfully');
        fetchApplicationData(); // Refresh data
      } else {
        toast.error('Failed to update follow-up');
      }
    } catch (error) {
      console.error('Error updating follow-up:', error);
      toast.error('Failed to update follow-up');
    }
  };

  const handleFollowUpDelete = async (followUpId: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/submission-status/follow-ups/${followUpId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Follow-up deleted successfully');
        fetchApplicationData(); // Refresh data
      } else {
        toast.error('Failed to delete follow-up');
      }
    } catch (error) {
      console.error('Error deleting follow-up:', error);
      toast.error('Failed to delete follow-up');
    }
  };

  const handleAddCommonRequirements = async () => {
    try {
      const commonRequirements = [
        {
          name: 'Personal Statement',
          description: 'A personal statement or statement of purpose',
          requirementType: 'document',
          category: 'personal',
          isRequired: true,
          isOptional: false,
          documentType: 'personal_statement',
          wordLimit: 1000,
          order: 1
        },
        {
          name: 'Academic Transcripts',
          description: 'Official academic transcripts from previous institutions',
          requirementType: 'document',
          category: 'academic',
          isRequired: true,
          isOptional: false,
          documentType: 'transcript',
          order: 2
        },
        {
          name: 'Letters of Recommendation',
          description: 'Letters of recommendation from professors or employers',
          requirementType: 'document',
          category: 'academic',
          isRequired: true,
          isOptional: false,
          documentType: 'recommendation_letter',
          order: 3
        },
        {
          name: 'Resume/CV',
          description: 'Current resume or curriculum vitae',
          requirementType: 'document',
          category: 'professional',
          isRequired: true,
          isOptional: false,
          documentType: 'cv',
          order: 4
        },
        {
          name: 'English Language Test Scores',
          description: 'TOEFL, IELTS, or other English proficiency test scores',
          requirementType: 'test_score',
          category: 'academic',
          isRequired: true,
          isOptional: false,
          testType: 'toefl',
          minScore: 90,
          order: 5
        }
      ];

      // Add each requirement
      for (const req of commonRequirements) {
        const response = await fetch(`/api/applications/${applicationId}/requirements`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req)
        });

        if (!response.ok) {
          console.warn(`Failed to add requirement: ${req.name}`);
        }
      }

      toast.success('Common requirements added successfully');
      fetchApplicationData(); // Refresh data
    } catch (error) {
      console.error('Error adding common requirements:', error);
      toast.error('Failed to add common requirements');
    }
  };

  const handleCreateApplicationForm = async () => {
    console.log('handleCreateApplicationForm called');
    console.log('application:', application);
    console.log('applicationId:', applicationId);
    
    try {
      if (!application?.targetId) {
        console.log('No targetId found in application');
        toast.error('No scholarship associated with this package');
        return;
      }

      console.log('Making API call to create form...');
      const response = await fetch('/api/applications/create-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: applicationId,
          scholarshipId: application.targetId,
        }),
      });

      console.log('API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Form created successfully:', data);
        toast.success('Application form created successfully');
        setApplicationFormId(data.applicationId);
        setApplicationFormStatus('draft');
        setApplicationFormProgress(0);
        // Refresh the application data to ensure everything is up to date
        await fetchApplicationData();
        // Navigate to the new application form
        router.push(`/applications/${data.applicationId}/form`);
      } else {
        const error = await response.json();
        console.log('API error:', error);
        if (error.applicationId) {
          // Application form already exists, navigate to it
          toast.success('Application form found');
          setApplicationFormId(error.applicationId);
          // Refresh the application data to ensure everything is up to date
          await fetchApplicationData();
          router.push(`/applications/${error.applicationId}/form`);
        } else {
          toast.error(error.error || 'Failed to create application form');
        }
      }
    } catch (error) {
      console.error('Error creating application form:', error);
      toast.error('Failed to create application form');
    }
  };

  const handleDeleteApplication = async () => {
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Application package deleted successfully');
        router.push('/applications/packages');
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Application Package</h2>
          <p className="text-gray-600">Getting your application data...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Not Found</h2>
          <p className="text-gray-600 mb-4">The application package you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/applications/packages')}>
            Back to Application Packages
          </Button>
        </div>
      </div>
    );
  }

  const daysUntilDeadline = getDaysUntilDeadline();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/applications/packages')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Packages
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{application.name}</h1>
                <p className="text-gray-600 mt-1">{application.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(application.status)}>
                {application.status.replace('_', ' ')}
              </Badge>
              <Badge className={getPriorityColor(application.priority)}>
                {application.priority}
              </Badge>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Package
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            {application.applicationType === 'scholarship' && !application.isExternal && (
              <TabsTrigger value="application-form">Application Form</TabsTrigger>
            )}
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
            <TabsTrigger value="submission">Submission</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Critical Alerts & Status */}
            <div className="space-y-4">
              {/* Deadline Alert */}
              {application.applicationDeadline && daysUntilDeadline !== null && daysUntilDeadline <= 7 && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-red-800">Application Deadline Approaching!</h3>
                        <p className="text-red-700 text-sm">
                          {daysUntilDeadline === 0 
                            ? 'Your application is due today!'
                            : daysUntilDeadline < 0
                            ? `Your application is ${Math.abs(daysUntilDeadline)} days overdue!`
                            : `Your application is due in ${daysUntilDeadline} day${daysUntilDeadline === 1 ? '' : 's'}!`
                          }
                        </p>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => setActiveTab('submission')}>
                        Submit Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Submission Status Alert */}
              {submissionStatus?.applicationSubmitted && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-green-800">Application Submitted!</h3>
                        <p className="text-green-700 text-sm">
                          Submitted on {submissionStatus.submittedAt ? format(new Date(submissionStatus.submittedAt), 'PPP') : 'Unknown date'}
                          {submissionStatus.confirmationNumber && ` • Confirmation: ${submissionStatus.confirmationNumber}`}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setActiveTab('submission')}>
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Upcoming Interview Alert */}
              {interviews.filter(i => i.status === 'scheduled' && i.scheduledDate && new Date(i.scheduledDate) > new Date()).length > 0 && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-blue-800">Upcoming Interview!</h3>
                        <p className="text-blue-700 text-sm">
                          You have {interviews.filter(i => i.status === 'scheduled' && i.scheduledDate && new Date(i.scheduledDate) > new Date()).length} scheduled interview(s)
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setActiveTab('interviews')}>
                        View Interviews
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Application Details & Progress */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Application Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Type</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {application.applicationType === 'scholarship' && <Award className="h-4 w-4 text-yellow-600" />}
                        {application.applicationType === 'school' && <GraduationCap className="h-4 w-4 text-blue-600" />}
                        {application.applicationType === 'program' && <Briefcase className="h-4 w-4 text-green-600" />}
                        <span className="capitalize">{application.applicationType}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Target</Label>
                      <p className="mt-1 font-medium">{application.targetName || 'External Application'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Status</Label>
                      <div className="mt-1">
                        <Badge className={getStatusColor(application.status)}>
                          {application.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Priority</Label>
                      <div className="mt-1">
                        <Badge className={getPriorityColor(application.priority)}>
                          {application.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Overall Progress</Label>
                      <div className="mt-2">
                        <Progress value={application.progress} className="h-3" />
                        <p className="text-sm text-gray-600 mt-1">{application.progress}% complete</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Requirements</p>
                        <p className="text-lg font-semibold">
                          {application.requirementsProgress.completed}/{application.requirementsProgress.total}
                        </p>
                        <p className="text-xs text-gray-500">completed</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Required</p>
                        <p className="text-lg font-semibold">
                          {application.requirementsProgress.requiredCompleted}/{application.requirementsProgress.required}
                        </p>
                        <p className="text-xs text-gray-500">completed</p>
                      </div>
                    </div>
                  </div>

                  {/* Deadline Section */}
                  {application.applicationDeadline && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">Application Deadline</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-gray-600">
                            {format(new Date(application.applicationDeadline), 'PPP')}
                          </span>
                          {daysUntilDeadline !== null && (
                            <p className="text-sm text-gray-500">
                              {daysUntilDeadline > 0 
                                ? `${daysUntilDeadline} days remaining`
                                : daysUntilDeadline === 0
                                ? 'Due today'
                                : `${Math.abs(daysUntilDeadline)} days overdue`
                              }
                            </p>
                          )}
                        </div>
                        {daysUntilDeadline !== null && (
                          <Badge variant={daysUntilDeadline <= 7 ? 'destructive' : daysUntilDeadline <= 30 ? 'secondary' : 'default'}>
                            {daysUntilDeadline <= 7 ? 'Urgent' : daysUntilDeadline <= 30 ? 'Soon' : 'Plenty of Time'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Application Form Status - Only for scholarship packages */}
                  {application.applicationType === 'scholarship' && !application.isExternal && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Application Form</span>
                        <Badge className={cn(
                          'text-xs',
                          applicationFormStatus === 'not_started' ? 'bg-gray-100 text-gray-800' :
                          applicationFormStatus === 'draft' ? 'bg-blue-100 text-blue-800' :
                          applicationFormStatus === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          applicationFormStatus === 'ready_for_submission' ? 'bg-green-100 text-green-800' :
                          applicationFormStatus === 'submitted' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        )}>
                          {applicationFormStatus.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        {applicationFormProgress > 0 && (
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>Form Progress</span>
                              <span>{applicationFormProgress}%</span>
                            </div>
                            <Progress value={applicationFormProgress} className="h-2" />
                          </div>
                        )}
                        <div className="flex gap-2">
                          {applicationFormId ? (
                            <Button 
                              size="sm"
                              onClick={() => router.push(`/applications/${applicationFormId}/form`)}
                              className="flex-1"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              {applicationFormStatus === 'submitted' || applicationFormStatus === 'completed'
                                ? 'View Form'
                                : 'Continue Form'
                              }
                            </Button>
                          ) : (
                            <Button 
                              size="sm"
                              onClick={handleCreateApplicationForm}
                              className="flex-1"
                              variant="outline"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Start Form
                            </Button>
                          )}
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveTab('application-form')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* External Application Link */}
                  {application.externalApplicationUrl && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <ExternalLink className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">External Application Portal</span>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <a href={application.externalApplicationUrl} target="_blank" rel="noopener noreferrer">
                          Open Application Portal
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions & Stats */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('requirements')}
                    >
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Manage Requirements
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('documents')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Link Documents
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('interviews')}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Schedule Interviews
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('submission')}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Track Submission
                    </Button>
                  </CardContent>
                </Card>

                {/* Key Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Key Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Interviews</span>
                      <Badge variant="outline">{interviews.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Scheduled</span>
                      <Badge variant="outline">{interviews.filter(i => i.status === 'scheduled').length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Completed</span>
                      <Badge variant="outline">{interviews.filter(i => i.status === 'completed').length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Documents Linked</span>
                      <Badge variant="outline">{documents.filter(d => d.linkedToRequirements && d.linkedToRequirements.length > 0).length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Submission Status</span>
                      <Badge variant={submissionStatus?.applicationSubmitted ? 'default' : 'secondary'}>
                        {submissionStatus?.applicationSubmitted ? 'Submitted' : 'Not Submitted'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Timeline & Important Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Timeline & Important Dates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Application Timeline */}
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div className="w-0.5 h-8 bg-gray-300 mt-2"></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Application Created</h4>
                      <p className="text-sm text-gray-600">{format(new Date(application.createdAt), 'PPP')}</p>
                    </div>
                  </div>

                  {/* Deadline */}
                  {application.applicationDeadline && (
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          daysUntilDeadline !== null && daysUntilDeadline <= 7 ? "bg-red-500" : "bg-orange-500"
                        )}></div>
                        <div className="w-0.5 h-8 bg-gray-300 mt-2"></div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Application Deadline</h4>
                        <p className="text-sm text-gray-600">{format(new Date(application.applicationDeadline), 'PPP')}</p>
                        {daysUntilDeadline !== null && (
                          <Badge variant={daysUntilDeadline <= 7 ? 'destructive' : 'secondary'} className="mt-1">
                            {daysUntilDeadline > 0 
                              ? `${daysUntilDeadline} days remaining`
                              : daysUntilDeadline === 0
                              ? 'Due today'
                              : `${Math.abs(daysUntilDeadline)} days overdue`
                            }
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Submission */}
                  {submissionStatus?.applicationSubmitted && submissionStatus.submittedAt && (
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div className="w-0.5 h-8 bg-gray-300 mt-2"></div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Application Submitted</h4>
                        <p className="text-sm text-gray-600">{format(new Date(submissionStatus.submittedAt), 'PPP')}</p>
                        {submissionStatus.confirmationNumber && (
                          <p className="text-sm text-gray-500">Confirmation: {submissionStatus.confirmationNumber}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Upcoming Interviews */}
                  {interviews.filter(i => i.status === 'scheduled' && i.scheduledDate && new Date(i.scheduledDate) > new Date()).map((interview, index) => (
                    <div key={interview._id} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        {index < interviews.filter(i => i.status === 'scheduled' && i.scheduledDate && new Date(i.scheduledDate) > new Date()).length - 1 && (
                          <div className="w-0.5 h-8 bg-gray-300 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Interview - {interview.interviewer || 'TBD'}</h4>
                        <p className="text-sm text-gray-600">
                          {interview.scheduledDate ? format(new Date(interview.scheduledDate), 'PPP p') : 'TBD'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {interview.type === 'video' ? 'Video Call' : interview.type === 'phone' ? 'Phone Call' : 'In Person'}
                          </Badge>
                          {interview.isVirtual && interview.meetingLink && (
                            <Button size="sm" variant="ghost" asChild>
                              <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Follow-up Required */}
                  {submissionStatus?.followUpRequired && submissionStatus.nextFollowUpDate && (
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Follow-up Required</h4>
                        <p className="text-sm text-gray-600">{format(new Date(submissionStatus.nextFollowUpDate), 'PPP')}</p>
                        {submissionStatus.followUpNotes && (
                          <p className="text-sm text-gray-500">{submissionStatus.followUpNotes}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressTracker applicationId={applicationId} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requirements Tab */}
          <TabsContent value="requirements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Requirements Management</span>
                  <Button size="sm" onClick={() => setShowDocumentLinker(true)}>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Link Documents
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RequirementsChecklist 
                  applicationId={applicationId}
                  applicationName={application.name}
                  onRequirementUpdate={() => fetchApplicationData()}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Document Management</span>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => router.push('/documents')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Document
                    </Button>
                    <Button size="sm" onClick={() => setShowDocumentLinker(true)}>
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Link Documents
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Create new documents or link existing ones to requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading documents...</span>
                  </div>
                ) : (
                  <div className="space-y-6">

                    {/* Requirements Needing Documents */}
                    <div>
                      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                        Requirements Needing Documents
                        <Badge variant="secondary">
                          {requirements.filter(req => 
                            (req.requirementType === 'document' || req.requirementType === 'test_score') &&
                            !req.linkedDocumentId && 
                            req.status !== 'waived' && 
                            req.status !== 'not_applicable'
                          ).length}
                        </Badge>
                      </h3>
                      <div className="space-y-3">
                        {requirements.filter(req => 
                          (req.requirementType === 'document' || req.requirementType === 'test_score') &&
                          !req.linkedDocumentId && 
                          req.status !== 'waived' && 
                          req.status !== 'not_applicable'
                        ).length === 0 ? (
                          <div className="text-center py-6 text-gray-500 bg-green-50 rounded-lg">
                            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-300" />
                            <p>All document requirements have documents linked!</p>
                          </div>
                        ) : (
                          requirements.filter(req => 
                            (req.requirementType === 'document' || req.requirementType === 'test_score') &&
                            !req.linkedDocumentId && 
                            req.status !== 'waived' && 
                            req.status !== 'not_applicable'
                          ).map(requirement => (
                            <div key={requirement._id} className="p-4 border rounded-lg bg-orange-50">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{requirement.name}</h4>
                                  <p className="text-sm text-gray-600">{requirement.category}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    {requirement.isRequired && (
                                      <Badge variant="destructive" className="text-xs">Required</Badge>
                                    )}
                                    <Badge variant="outline" className="text-xs">
                                      {requirement.requirementType === 'document' ? 'Document' : 'Test Score'}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={cn(
                                    'text-xs',
                                    requirement.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    requirement.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  )}>
                                    {requirement.status.replace('_', ' ')}
                                  </Badge>
                                  {requirement.linkedDocumentId ? (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleDocumentUnlink(requirement._id)}
                                    >
                                      <Unlink className="h-3 w-3 mr-1" />
                                      Unlink Document
                                    </Button>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleQuickLink(requirement)}
                                        disabled={documents.length === 0}
                                      >
                                        <LinkIcon className="h-3 w-3 mr-1" />
                                        Link Document
                                      </Button>
                                      {documents.length === 0 && (
                                        <Button
                                          size="sm"
                                          variant="secondary"
                                          onClick={() => router.push('/documents')}
                                        >
                                          <Plus className="h-3 w-3 mr-1" />
                                          Create Document
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Linked Documents */}
                    <div>
                      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                        <LinkIcon className="h-5 w-5 text-green-500" />
                        Linked Documents
                        <Badge variant="secondary">
                          {requirements.filter(req => req.linkedDocumentId).length}
                        </Badge>
                      </h3>
                      <div className="space-y-3">
                        {requirements.filter(req => req.linkedDocumentId).length === 0 ? (
                          <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                            <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                            <p>No documents linked yet</p>
                          </div>
                        ) : (
                          requirements.filter(req => req.linkedDocumentId).map(requirement => {
                            const linkedDocument = documents.find(doc => doc._id === requirement.linkedDocumentId);
                            return (
                              <div key={requirement._id} className="p-4 border rounded-lg bg-green-50">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">{requirement.name}</h4>
                                    <p className="text-sm text-gray-600">{requirement.category}</p>
                                    {linkedDocument && (
                                      <div className="mt-2 p-2 bg-white rounded border">
                                        <div className="flex items-center gap-2">
                                          <FileText className="h-4 w-4 text-blue-500" />
                                          <span className="font-medium text-sm">{linkedDocument.title}</span>
                                          <Badge variant="outline" className="text-xs">
                                            {linkedDocument.type}
                                          </Badge>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge className={cn(
                                      'text-xs',
                                      requirement.status === 'completed' ? 'bg-green-100 text-green-800' :
                                      requirement.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-gray-100 text-gray-800'
                                    )}>
                                      {requirement.status.replace('_', ' ')}
                                    </Badge>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDocumentUnlink(requirement._id)}
                                    >
                                      <Unlink className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Available Documents for Linking */}
                    <div>
                      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-purple-500" />
                        Available Documents
                        <Badge variant="secondary">{documents.length}</Badge>
                      </h3>
                      <div className="space-y-3">
                        {documents.length === 0 ? (
                          <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No documents available</p>
                            <p className="text-sm mb-4">Create documents in your document library first</p>
                            <div className="flex items-center justify-center gap-2">
                              <Button 
                                onClick={() => router.push('/documents')}
                                className="flex items-center gap-2"
                              >
                                <Plus className="h-4 w-4" />
                                Create Your First Document
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={() => router.push('/documents')}
                              >
                                Browse Document Library
                              </Button>
                            </div>
                          </div>
                        ) : (
                          documents.slice(0, 3).map(doc => (
                            <div key={doc._id} className="p-4 border rounded-lg bg-purple-50">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{doc.title}</h4>
                                  <p className="text-sm text-gray-600">{doc.category} • {doc.type}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {doc.status}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      Created {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant={isDocumentLinked(doc._id) ? "secondary" : "outline"}
                                  onClick={() => setShowDocumentLinker(true)}
                                >
                                  <LinkIcon className="h-3 w-3 mr-1" />
                                  {isDocumentLinked(doc._id) ? "Already Linked" : "Link to Requirement"}
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                        {documents.length > 3 && (
                          <div className="text-center py-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowDocumentLinker(true)}
                            >
                              View All {documents.length} Documents
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Other Requirements (Fees, Interviews, etc.) */}
                    <div>
                      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                        <Info className="h-5 w-5 text-blue-500" />
                        Other Requirements
                        <Badge variant="secondary">
                          {requirements.filter(req => 
                            req.requirementType !== 'document' && 
                            req.requirementType !== 'test_score' &&
                            req.status !== 'waived' && 
                            req.status !== 'not_applicable'
                          ).length}
                        </Badge>
                      </h3>
                      <div className="space-y-3">
                        {requirements.filter(req => 
                          req.requirementType !== 'document' && 
                          req.requirementType !== 'test_score' &&
                          req.status !== 'waived' && 
                          req.status !== 'not_applicable'
                        ).length === 0 ? (
                          <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                            <Info className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No other requirements</p>
                          </div>
                        ) : (
                          requirements.filter(req => 
                            req.requirementType !== 'document' && 
                            req.requirementType !== 'test_score' &&
                            req.status !== 'waived' && 
                            req.status !== 'not_applicable'
                          ).map(requirement => (
                            <div key={requirement._id} className="p-4 border rounded-lg bg-blue-50">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{requirement.name}</h4>
                                  <p className="text-sm text-gray-600">{requirement.category}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    {requirement.isRequired && (
                                      <Badge variant="destructive" className="text-xs">Required</Badge>
                                    )}
                                    <Badge variant="outline" className="text-xs">
                                      {requirement.requirementType === 'fee' ? 'Application Fee' :
                                       requirement.requirementType === 'interview' ? 'Interview' :
                                       requirement.requirementType}
                                    </Badge>
                                  </div>
                                  {requirement.requirementType === 'fee' && requirement.applicationFeeAmount && (
                                    <p className="text-sm text-gray-600 mt-1">
                                      Amount: {requirement.applicationFeeAmount} {requirement.applicationFeeCurrency || 'USD'}
                                    </p>
                                  )}
                                </div>
                                <Badge className={cn(
                                  'text-xs',
                                  requirement.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  requirement.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                )}>
                                  {requirement.status.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Application Form Tab - Only for scholarship packages */}
          {application.applicationType === 'scholarship' && !application.isExternal && (
            <TabsContent value="application-form" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Scholarship Application Form
                  </CardTitle>
                  <CardDescription>
                    Fill out the official application form for {application.targetName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Application Form Status */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Application Form Status</h3>
                        <p className="text-sm text-gray-600">
                          {applicationFormStatus === 'not_started' && 'No application form has been started yet'}
                          {applicationFormStatus === 'draft' && 'Application form is in draft stage'}
                          {applicationFormStatus === 'in_progress' && 'Application form is in progress'}
                          {applicationFormStatus === 'ready_for_submission' && 'Application form is complete and ready for submission to the scholarship provider'}
                          {applicationFormStatus === 'submitted' && 'Application has been submitted to the scholarship provider'}
                          {applicationFormStatus === 'completed' && 'Application form is completed'}
                        </p>
                      </div>
                    </div>
                    <Badge className={cn(
                      'text-sm',
                      applicationFormStatus === 'not_started' ? 'bg-gray-100 text-gray-800' :
                      applicationFormStatus === 'draft' ? 'bg-blue-100 text-blue-800' :
                      applicationFormStatus === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      applicationFormStatus === 'submitted' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    )}>
                      {applicationFormStatus.replace('_', ' ')}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  {applicationFormProgress > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Form Progress</span>
                        <span className="text-sm text-gray-600">{applicationFormProgress}%</span>
                      </div>
                      <Progress value={applicationFormProgress} className="h-2" />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {applicationFormId ? (
                      <Button 
                        onClick={() => router.push(`/applications/${applicationFormId}/form`)}
                        className="flex-1"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        {applicationFormStatus === 'ready_for_submission' || applicationFormStatus === 'submitted' || applicationFormStatus === 'completed'
                          ? 'Review Application Form'
                          : 'Continue Application Form'
                        }
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => {
                          console.log('Start Application Form button clicked');
                          handleCreateApplicationForm();
                        }}
                        className="flex-1"
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Start Application Form
                      </Button>
                    )}
                    
                    {applicationFormId && (
                      <Button 
                        variant="outline"
                        onClick={() => router.push(`/applications/${applicationFormId}/view`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Form
                      </Button>
                    )}
                  </div>

                  {/* Information */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">About Application Forms</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          This platform helps you prepare your scholarship application by providing a structured form 
                          that matches the official requirements. Once completed, you can download your responses 
                          and copy them to the actual scholarship provider&apos;s website or portal.
                        </p>
                        <p className="text-sm text-blue-600 mt-2">
                          <strong>Note:</strong> This platform does not submit applications directly to scholarship providers. 
                          You&apos;ll need to manually submit your completed application to the official scholarship portal.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Interviews Tab */}
          <TabsContent value="interviews" className="space-y-6">
            <InterviewScheduler
              applicationId={applicationId}
              interviews={interviews}
              onInterviewCreate={handleInterviewCreate}
              onInterviewUpdate={handleInterviewUpdate}
              onInterviewDelete={handleInterviewDelete}
            />
          </TabsContent>

          {/* Submission Tab */}
          <TabsContent value="submission" className="space-y-6">
            <SubmissionTracker
              applicationId={applicationId}
              submissionStatus={submissionStatus}
              onSubmissionUpdate={handleSubmissionUpdate}
              onFollowUpAdd={handleFollowUpAdd}
              onFollowUpUpdate={handleFollowUpUpdate}
              onFollowUpDelete={handleFollowUpDelete}
            />
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressTracker applicationId={applicationId} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Document Linker Modal */}
        {showDocumentLinker && (
          <DocumentLinker
            applicationId={applicationId}
            requirements={requirements}
            documents={documents}
            onDocumentLink={handleDocumentLink}
            onDocumentUnlink={handleDocumentUnlink}
            onClose={() => setShowDocumentLinker(false)}
          />
        )}

        {/* Quick Link Modal */}
        {showQuickLinkModal && quickLinkRequirement && (
          <Dialog open={showQuickLinkModal} onOpenChange={setShowQuickLinkModal}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Link Document to {quickLinkRequirement.name}</DialogTitle>
                <DialogDescription>
                  Select a document to link to this requirement
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {documents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No documents available</p>
                    <p className="text-sm">Create documents in your document library first</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {documents.map(doc => (
                      <div
                        key={doc._id}
                        className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => {
                          handleDocumentLink(quickLinkRequirement._id, doc._id);
                          setShowQuickLinkModal(false);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{doc.title}</h4>
                            <p className="text-sm text-gray-600">{doc.category} • {doc.type}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {doc.status}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                Created {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                              </span>
                            </div>
                          </div>
                          <LinkIcon className="h-4 w-4 text-blue-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowQuickLinkModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowDocumentLinker(true)}>
                  View All Documents
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Application Package</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &ldquo;{application?.name}&rdquo;? This action cannot be undone.
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
                onClick={handleDeleteApplication}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'Deleting...' : 'Delete Package'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
} 