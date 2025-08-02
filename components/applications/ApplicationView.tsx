'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  FileDown, 
  ArrowLeft,
  Calendar,
  Award,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Question {
  id: string;
  type: string;
  title: string;
  description?: string;
  required: boolean;
  order: number;
  options?: Array<{ value: string; label: string }>;
}

interface Section {
  id: string;
  title: string;
  description?: string;
  order: number;
  questions: Question[];
}

interface QuestionResponse {
  questionId: string;
  value: string | string[] | number | boolean | Date;
  files?: string[];
  timestamp: Date;
  isComplete: boolean;
}

interface SectionResponse {
  sectionId: string;
  responses: QuestionResponse[];
  isComplete: boolean;
  startedAt: Date;
  completedAt?: Date;
}

interface Application {
  _id: string;
  scholarshipId: {
    _id: string;
    title: string;
    value?: number;
    currency?: string;
    deadline: string;
  };
  applicationTemplateId: {
    _id: string;
    title: string;
    sections: Section[];
  };
  status: string;
  sections: SectionResponse[];
  progress: number;
  startedAt: string;
  lastActivityAt: string;
  submittedAt?: string;
}

interface ApplicationViewProps {
  applicationId: string;
}

export default function ApplicationView({ applicationId }: ApplicationViewProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const fetchApplication = useCallback(async () => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`);
      if (response.ok) {
        const data = await response.json();
        setApplication(data.application);
      } else {
        toast.error('Failed to fetch application');
        router.push('/applications');
      }
    } catch (error) {
      console.error('Error fetching application:', error);
      toast.error('Failed to fetch application');
      router.push('/applications');
    } finally {
      setIsLoading(false);
    }
  }, [applicationId, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchApplication();
    }
  }, [session?.user?.id, applicationId, fetchApplication]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'draft':
        return { color: 'bg-gray-100 text-gray-800', icon: FileText, label: 'Draft' };
      case 'in_progress':
        return { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'In Progress' };
      case 'submitted':
        return { color: 'bg-yellow-100 text-yellow-800', icon: CheckCircle, label: 'Submitted' };
      case 'under_review':
        return { color: 'bg-purple-100 text-purple-800', icon: Clock, label: 'Under Review' };
      case 'approved':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' };
      case 'rejected':
        return { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Rejected' };
      case 'waitlisted':
        return { color: 'bg-orange-100 text-orange-800', icon: Clock, label: 'Waitlisted' };
      case 'withdrawn':
        return { color: 'bg-gray-100 text-gray-800', icon: FileText, label: 'Withdrawn' };
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
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQuestionResponse = (sectionId: string, questionId: string) => {
    const section = application?.sections.find(s => s.sectionId === sectionId);
    if (!section) return null;
    
    const response = section.responses.find(r => r.questionId === questionId);
    return response;
  };

  const formatResponseValue = (value: any, questionType: string) => {
    if (value === null || value === undefined || value === '') {
      return 'Not provided';
    }

    switch (questionType) {
      case 'date':
        return formatDate(value);
      case 'checkbox':
      case 'multiselect':
        return Array.isArray(value) ? value.join(', ') : value;
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'number':
        return value.toString();
      case 'file':
        return Array.isArray(value) ? value.join(', ') : value;
      default:
        return value.toString();
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/applications/${applicationId}/download/pdf`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `application-${application?.scholarshipId.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('PDF downloaded successfully');
      } else {
        toast.error('Failed to download PDF');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadWord = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/applications/${applicationId}/download/word`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `application-${application?.scholarshipId.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Word document downloaded successfully');
      } else {
        toast.error('Failed to download Word document');
      }
    } catch (error) {
      console.error('Error downloading Word document:', error);
      toast.error('Failed to download Word document');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Application</h2>
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
          <p className="text-gray-600 mb-4">The application you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
          <Button onClick={() => router.push('/applications')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(application.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.push('/applications')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Application View</h1>
            <p className="text-gray-600 mt-1">
              {application.scholarshipId.title}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            Download PDF
          </Button>
          <Button 
            onClick={handleDownloadWord}
            disabled={isDownloading}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Download Word
          </Button>
        </div>
      </div>

      {/* Application Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{application.scholarshipId.title}</CardTitle>
              <CardDescription className="mt-2">
                Application submitted on {application.submittedAt ? formatDateTime(application.submittedAt) : 'Not submitted yet'}
              </CardDescription>
            </div>
            <Badge className={statusInfo.color}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">
                {application.scholarshipId.value 
                  ? formatCurrency(application.scholarshipId.value, application.scholarshipId.currency)
                  : 'Amount not specified'
                }
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">
                Deadline: {formatDate(application.scholarshipId.deadline)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">
                Progress: {application.progress}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Sections */}
      <div className="space-y-6">
        {application.applicationTemplateId.sections.map((section) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{section.title}</CardTitle>
                {section.description && (
                  <CardDescription>{section.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {section.questions.map((question) => {
                  const response = getQuestionResponse(section.id, question.id);
                  const responseValue = response ? formatResponseValue(response.value, question.type) : 'Not answered';
                  
                  return (
                    <div key={question.id} className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {question.title}
                            {question.required && <span className="text-red-500 ml-1">*</span>}
                          </h4>
                          {question.description && (
                            <p className="text-sm text-gray-600 mt-1">{question.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">Your Answer:</div>
                        <div className="text-gray-900 whitespace-pre-wrap">
                          {responseValue}
                        </div>
                        {response?.files && response.files.length > 0 && (
                          <div className="mt-2">
                            <div className="text-sm text-gray-600 mb-1">Attached Files:</div>
                            <div className="space-y-1">
                              {response.files.map((file, index) => (
                                <div key={index} className="text-sm text-blue-600 hover:text-blue-800">
                                  <a href={file} target="_blank" rel="noopener noreferrer">
                                    {file.split('/').pop()}
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}