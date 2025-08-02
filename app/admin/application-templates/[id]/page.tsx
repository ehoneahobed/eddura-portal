'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  FileText, 
  Clock, 
  Users, 
  Settings,
  Calendar,
  CheckCircle,
  XCircle,
  Award,
  ExternalLink
} from 'lucide-react';
import { useApplicationTemplate } from '@/hooks/use-application-templates';
import { useScholarship } from '@/hooks/use-scholarships';
import { ApplicationTemplate, QuestionType, FormSection, Question } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { deleteApplicationTemplate, updateApplicationTemplate } from '@/hooks/use-application-templates';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

interface ViewApplicationTemplatePageProps {
  params: Promise<{ id: string }>;
}

const getQuestionTypeDisplayName = (type: QuestionType): string => {
  const typeNames: Record<QuestionType, string> = {
    text: 'Short Text',
    textarea: 'Long Text',
    email: 'Email',
    phone: 'Phone Number',
    number: 'Number',
    date: 'Date',
    select: 'Single Choice Dropdown',
    multiselect: 'Multiple Choice Dropdown',
    radio: 'Single Choice (Radio)',
    checkbox: 'Multiple Choice (Checkbox)',
    file: 'File Upload',
    url: 'URL',
    address: 'Address',
    education: 'Education History',
    experience: 'Work Experience',
    reference: 'Reference Contact',
    essay: 'Essay',
    statement: 'Personal Statement',
    gpa: 'GPA',
    test_score: 'Test Score',
    country: 'Country Selection'
  };
  
  return typeNames[type] || type;
};

export default function ViewApplicationTemplatePage({ params }: ViewApplicationTemplatePageProps) {
  const router = useRouter();
  const [templateId, setTemplateId] = useState<string | null>(null);
  const { template, error, isLoading } = useApplicationTemplate(templateId || '');
  const { scholarship, isLoading: isLoadingScholarship } = useScholarship(template?.scholarshipId || '');

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setTemplateId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  const handleEdit = () => {
    if (!templateId) return;
    router.push(`/admin/application-templates/${templateId}/edit`);
  };

  const handleDelete = async () => {
    if (!template || !templateId) return;
    
    if (confirm(`Are you sure you want to delete "${template.title}"?`)) {
      try {
        await deleteApplicationTemplate(templateId);
        toast.success('Application template deleted successfully');
        router.push('/admin/application-templates');
      } catch (error) {
        console.error('Error deleting template:', error);
        toast.error('Failed to delete application template');
      }
    }
  };

  const handleToggleActive = async () => {
    if (!template || !templateId) return;
    
    try {
      await updateApplicationTemplate(templateId, { isActive: !template.isActive });
      toast.success(`Template ${template.isActive ? 'deactivated' : 'activated'} successfully`);
      // Refresh the template data
      window.location.reload();
    } catch (error) {
      console.error('Error toggling template status:', error);
      toast.error('Failed to update template status');
    }
  };

  const formatScholarshipValue = (scholarship: any) => {
    if (!scholarship.value) return null;
    
    if (typeof scholarship.value === 'number') {
      return `${scholarship.currency || 'USD'} ${scholarship.value.toLocaleString()}`;
    }
    return scholarship.value;
  };

  const formatDeadline = (deadline: string) => {
    try {
      const date = new Date(deadline);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return deadline;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">
              {error ? `Error loading template: ${error.message}` : 'Template not found'}
            </p>
            <Button
              onClick={() => router.push('/admin/application-templates')}
              className="mt-4"
            >
              Back to Templates
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalQuestions = template.sections?.reduce((total: number, section: FormSection) => 
    total + (section.questions?.length || 0), 0
  ) || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/application-templates')}
          className="flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Templates
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{template.title}</h1>
            <p className="text-gray-600 mt-2">
              Application form template {scholarship ? `for ${scholarship.title}` : 'for scholarship'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleToggleActive}
              variant={template.isActive ? "outline" : "default"}
              className={`flex items-center gap-2 ${template.isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}`}
            >
              {template.isActive ? (
                <>
                  <XCircle className="w-4 h-4" />
                  Deactivate
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Activate
                </>
              )}
            </Button>
            <Button
              onClick={handleEdit}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Template
            </Button>
            <Button
              onClick={handleDelete}
              variant="outline"
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Template Details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Linked Scholarship */}
          {template.scholarshipId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Linked Scholarship
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingScholarship ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ) : scholarship ? (
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{scholarship.title}</h3>
                      <p className="text-sm text-gray-600">{scholarship.provider}</p>
                    </div>
                    
                    {formatScholarshipValue(scholarship) && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Value</label>
                        <p className="text-green-600 font-semibold">{formatScholarshipValue(scholarship)}</p>
                      </div>
                    )}
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Frequency</label>
                      <p className="text-gray-900 capitalize">{scholarship.frequency?.toLowerCase()}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Application Deadline</label>
                      <p className="text-gray-900">{formatDeadline(scholarship.deadline)}</p>
                    </div>
                    
                    {scholarship.coverage && scholarship.coverage.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Coverage</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {scholarship.coverage.slice(0, 3).map((coverage: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {coverage}
                            </Badge>
                          ))}
                          {scholarship.coverage.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{scholarship.coverage.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {scholarship.applicationLink && (
                      <div className="pt-2 border-t">
                        <a 
                          href={scholarship.applicationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Scholarship Details
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Scholarship not found</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Template Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Template Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">
                  <Badge variant={template.isActive ? "default" : "secondary"}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Version</label>
                <p className="text-gray-900">{template.version}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Estimated Time</label>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">{template.estimatedTime} minutes</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Sections</label>
                <div className="flex items-center gap-2 mt-1">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">{template.sections?.length || 0} sections</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Total Questions</label>
                <div className="flex items-center gap-2 mt-1">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">{totalQuestions} questions</span>
                </div>
              </div>

              {template.submissionDeadline && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Submission Deadline</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">
                      {new Date(template.submissionDeadline).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              )}

              {template.createdAt && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Created</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">
                      {formatDistanceToNow(new Date(template.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700">Settings</label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    {template.allowDraftSaving ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm text-gray-600">Allow draft saving</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {template.requireEmailVerification ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm text-gray-600">Require email verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {template.requirePhoneVerification ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm text-gray-600">Require phone verification</span>
                  </div>
                </div>
              </div>

              {template.maxFileSize && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Max File Size</label>
                  <p className="text-gray-900">{template.maxFileSize} MB</p>
                </div>
              )}

              {template.allowedFileTypes && template.allowedFileTypes.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Allowed File Types</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {template.allowedFileTypes.map((type: string) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Form Sections */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Form Sections
              </CardTitle>
            </CardHeader>
            <CardContent>
              {template.sections && template.sections.length > 0 ? (
                <div className="space-y-6">
                  {template.sections.map((section: FormSection, sectionIndex: number) => (
                    <div key={section.id} className="border rounded-lg p-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {sectionIndex + 1}. {section.title}
                        </h3>
                        {section.description && (
                          <p className="text-gray-600 text-sm">{section.description}</p>
                        )}
                        {section.isRepeatable && (
                          <Badge variant="outline" className="mt-2">
                            Repeatable {section.maxRepeats && `(max ${section.maxRepeats})`}
                          </Badge>
                        )}
                      </div>

                      {section.questions && section.questions.length > 0 ? (
                        <div className="space-y-4">
                          {section.questions.map((question: Question, questionIndex: number) => (
                            <div key={question.id} className="border-l-4 border-blue-500 pl-4 py-2">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 mb-1">
                                    {questionIndex + 1}. {question.title}
                                  </h4>
                                  {question.description && (
                                    <p className="text-gray-600 text-sm mb-2">{question.description}</p>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {getQuestionTypeDisplayName(question.type)}
                                    </Badge>
                                    {question.required && (
                                      <Badge variant="destructive" className="text-xs">
                                        Required
                                      </Badge>
                                    )}
                                  </div>
                                  {question.helpText && (
                                    <p className="text-gray-500 text-xs mt-1">{question.helpText}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No questions in this section</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No sections defined</p>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          {template.instructions && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Instructions for Applicants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{template.instructions}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 