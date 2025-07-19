'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (session?.user?.id) {
      fetchApplicationData();
    }
  }, [session?.user?.id, applicationId]);

  const fetchApplicationData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch application package
      const appResponse = await fetch(`/api/applications/${applicationId}`);
      if (appResponse.ok) {
        const appData = await appResponse.json();
        setApplication(appData.application);
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
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
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
          <p className="text-gray-600 mb-4">The application package you're looking for doesn't exist.</p>
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
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
            <TabsTrigger value="submission">Submission</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Application Details */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Application Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                      <Label className="text-sm font-medium text-gray-600">Progress</Label>
                      <div className="mt-1">
                        <Progress value={application.progress} className="h-2" />
                        <p className="text-sm text-gray-600 mt-1">{application.progress}% complete</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Requirements</Label>
                      <p className="mt-1 font-medium">
                        {application.requirementsProgress.completed}/{application.requirementsProgress.total} completed
                      </p>
                    </div>
                  </div>

                  {application.applicationDeadline && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">Application Deadline</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">
                          {format(new Date(application.applicationDeadline), 'PPP')}
                        </span>
                        {daysUntilDeadline !== null && (
                          <Badge variant={daysUntilDeadline <= 7 ? 'destructive' : daysUntilDeadline <= 30 ? 'secondary' : 'default'}>
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

                  {application.externalApplicationUrl && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <ExternalLink className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">External Application</span>
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
            </div>

            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Progress Overview</CardTitle>
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
                  <Button size="sm" onClick={() => setShowDocumentLinker(true)}>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Link Documents
                  </Button>
                </CardTitle>
                <CardDescription>
                  Link documents to requirements and track their status
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
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleQuickLink(requirement)}
                                    >
                                      <LinkIcon className="h-3 w-3 mr-1" />
                                      Link Document
                                    </Button>
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
                            <p className="text-sm">Create documents in your document library first</p>
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
      </div>
    </div>
  );
} 