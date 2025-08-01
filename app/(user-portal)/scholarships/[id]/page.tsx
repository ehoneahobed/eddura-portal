'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  Award, 
  DollarSign, 
  Calendar, 
  MapPin, 
  GraduationCap,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Target,
  Sparkles,
  Loader2,
  Share2,
  BookmarkPlus,
  BookmarkCheck,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useScholarship } from '@/hooks/use-scholarships';
import { toast } from 'sonner';
import { getScholarshipStatus, formatDeadline } from '@/lib/scholarship-status';
import { ApplicationPackageBuilder } from '@/components/applications/ApplicationPackageBuilder';

function ScholarshipDetailContent() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const scholarshipId = params.id as string;
  
  const { scholarship, isLoading, isError, mutate } = useScholarship(scholarshipId);
  
  // Save/Share state
  const [isSaved, setIsSaved] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveNotes, setSaveNotes] = useState('');
  const [saveStatus, setSaveStatus] = useState('saved');
  const [isSaving, setIsSaving] = useState(false);

  // Application form request state
  const [hasApplicationForm, setHasApplicationForm] = useState(false);
  const [hasRequestedForm, setHasRequestedForm] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [requestReason, setRequestReason] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);

  // Application package creation state
  const [isApplicationPackageModalOpen, setIsApplicationPackageModalOpen] = useState(false);
  const [isCreatingApplication, setIsCreatingApplication] = useState(false);

  // Format currency
  const formatCurrency = (value: number | string, currency: string = 'USD') => {
    if (typeof value === 'string') return value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Get scholarship status using the unified utility
  const scholarshipStatus = scholarship ? getScholarshipStatus(scholarship.deadline, scholarship.openingDate) : null;

  // Check if user is eligible based on basic criteria
  const checkBasicEligibility = () => {
    if (!scholarship) return { eligible: false, reasons: [] };
    
    const reasons = [];
    let eligible = true;

    // Check if application deadline has passed
    if (scholarshipStatus?.isExpired) {
      eligible = false;
      reasons.push('Application deadline has passed');
    }

    // Note: This is a basic eligibility check that only verifies the deadline
    // For a complete eligibility assessment, we would need to check:
    // - User's nationality vs scholarship requirements
    // - User's age vs age limits
    // - User's GPA vs minimum GPA requirements
    // - User's degree level vs required degree levels
    // - User's field of study vs required fields
    // - Other specific criteria like gender, disability status, etc.
    
    return { 
      eligible, 
      reasons,
      isBasicCheck: true // Flag to indicate this is only a basic check
    };
  };

  const checkIfSaved = useCallback(async () => {
    try {
      const response = await fetch(`/api/user/saved-scholarships?scholarshipId=${scholarshipId}`);
      if (response.ok) {
        const data = await response.json();
        setIsSaved(data.savedScholarships.length > 0);
      }
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  }, [scholarshipId]);

  const checkApplicationFormStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/application-templates?scholarshipId=${scholarshipId}`);
      if (response.ok) {
        const data = await response.json();
        setHasApplicationForm(data.templates && data.templates.length > 0);
      }
    } catch (error) {
      console.error('Error checking application form status:', error);
    }
  }, [scholarshipId]);

  const checkIfRequestedForm = useCallback(async () => {
    try {
      const response = await fetch(`/api/application-form-requests?scholarshipId=${scholarshipId}`);
      if (response.ok) {
        const data = await response.json();
        setHasRequestedForm(data.requests && data.requests.length > 0);
      }
    } catch (error) {
      console.error('Error checking if form was requested:', error);
    }
  }, [scholarshipId]);

  // Check if scholarship is saved and has application form
  useEffect(() => {
    if (scholarship && session?.user?.id) {
      checkIfSaved();
      checkApplicationFormStatus();
      checkIfRequestedForm();
    }
  }, [scholarship, session?.user?.id, checkIfSaved, checkApplicationFormStatus, checkIfRequestedForm]);

  const handleSave = async () => {
    if (!scholarship) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/user/saved-scholarships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scholarshipId: scholarshipId,
          notes: saveNotes,
          status: saveStatus
        })
      });

      if (response.ok) {
        setIsSaved(true);
        toast.success('Scholarship saved successfully!');
        setIsSaveDialogOpen(false);
        setSaveNotes('');
        setSaveStatus('saved');
      } else {
        toast.error('Failed to save scholarship');
      }
    } catch (error) {
      console.error('Error saving scholarship:', error);
      toast.error('Failed to save scholarship');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnsave = async () => {
    if (!scholarship) return;

    try {
      const response = await fetch(`/api/user/saved-scholarships/${scholarshipId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setIsSaved(false);
        toast.success('Scholarship removed from saved list');
      } else {
        toast.error('Failed to remove scholarship');
      }
    } catch (error) {
      console.error('Error unsaving scholarship:', error);
      toast.error('Failed to remove scholarship');
    }
  };

  const handleApply = async () => {
    if (!scholarship || !eligibilityCheck.eligible) return;

    try {
      // Check if application already exists
      const existingResponse = await fetch(`/api/applications/check?scholarshipId=${scholarshipId}`);
      if (existingResponse.ok) {
        const existingData = await existingResponse.json();
        if (existingData.exists) {
          // Application exists, redirect to continue
          router.push(`/applications/${existingData.applicationId}`);
          return;
        }
      }

      // Open the application package builder modal
      setIsApplicationPackageModalOpen(true);
    } catch (error) {
      console.error('Error checking existing application:', error);
      toast.error('Failed to check existing application');
    }
  };

  const handleShare = async () => {
    if (!scholarship) return;

    const url = `${window.location.origin}/scholarships/${scholarshipId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: scholarship.title,
          text: `Check out this scholarship: ${scholarship.title} - ${scholarship.provider}`,
          url: url
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Scholarship link copied to clipboard!', {
          description: 'You can now share this link with others.',
          duration: 3000,
        });
      } catch (error) {
        console.error('Failed to copy scholarship link:', error);
        toast.error('Failed to copy link to clipboard', {
          description: 'Please try selecting and copying the link manually.',
          duration: 4000,
        });
      }
    }
  };

  const handleRequestApplicationForm = async () => {
    if (!scholarship) return;

    setIsRequesting(true);
    try {
      const response = await fetch('/api/application-form-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scholarshipId: scholarshipId,
          requestReason: requestReason
        })
      });

      if (response.ok) {
        setHasRequestedForm(true);
        toast.success('Application form request submitted successfully!');
        setIsRequestDialogOpen(false);
        setRequestReason('');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error requesting application form:', error);
      toast.error('Failed to submit request');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleApplicationPackageComplete = async (applicationData: any) => {
    // Close the modal
    setIsApplicationPackageModalOpen(false);
    
    // Refresh the scholarship data to update the UI
    await mutate();
    
    // Navigate to the new application if we have the application data
    if (applicationData && applicationData._id) {
      router.push(`/applications/${applicationData._id}`);
    }
  };

  const handleApplicationPackageCancel = () => {
    setIsApplicationPackageModalOpen(false);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session?.user?.id) {
    router.push('/auth/signin');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError || !scholarship) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Scholarship Not Found</h3>
            <p className="text-gray-600 mb-4">
              The scholarship you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Button onClick={() => router.push('/scholarships')}>
              Back to Scholarships
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const eligibilityCheck = checkBasicEligibility();

  return (
    <div className="max-w-6xl mx-auto py-6 px-2 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="rounded-2xl overflow-hidden mb-8 shadow-lg animate-fade-in">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Award className="h-7 w-7 text-white" aria-label="Scholarship" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1 drop-shadow">{scholarship.title}</h1>
                <p className="text-blue-100 text-sm">{scholarship.provider}</p>
              </div>
            </div>
            {scholarship.tags && scholarship.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {scholarship.tags.map((tag, idx) => (
                  <Badge key={idx} className="bg-white/20 text-white border border-white/30 text-xs font-medium">{tag}</Badge>
                ))}
              </div>
            )}
          </div>
          {/* Key Info Stats Bar */}
          <div className="flex flex-col gap-2 md:gap-4 md:items-end">
            <div className="flex flex-wrap gap-3">
              {/* Opening Date Status */}
              {scholarshipStatus && (
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${scholarshipStatus.openingDateInfo.color} border shadow-sm`}>
                  <scholarshipStatus.openingDateInfo.icon className="h-4 w-4" aria-label="Opening Status" />
                  <span>{scholarshipStatus.openingDateInfo.status}</span>
                </div>
              )}
              
              {/* Deadline Status */}
              {scholarshipStatus && (
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${scholarshipStatus.deadlineInfo.color} border shadow-sm`}>
                  <scholarshipStatus.deadlineInfo.icon className="h-4 w-4" aria-label="Deadline Status" />
                  <span>{scholarshipStatus.deadlineInfo.status}</span>
                </div>
              )}
              
              {/* Value */}
              <div className="flex items-center gap-1 text-green-100 font-semibold bg-green-700/20 px-3 py-1 rounded-full">
                <DollarSign className="h-4 w-4" aria-label="Value" />
                {formatCurrency(scholarship.value ?? 0, scholarship.currency ?? 'USD')}
              </div>
              
              {/* Institution */}
              {scholarship.linkedSchool && (
                <div className="flex items-center gap-1 text-purple-100 font-semibold bg-purple-700/20 px-3 py-1 rounded-full">
                  <MapPin className="h-4 w-4" aria-label="Institution" />
                  {scholarship.linkedSchool}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-10">
          {/* Description */}
          {scholarship.scholarshipDetails && (
            <section aria-labelledby="desc-header" className="animate-slide-in-up">
              <Card className="border-0 shadow">
                <CardHeader>
                  <CardTitle id="desc-header" className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-gray-600" aria-label="Description" />
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed text-base">
                    {scholarship.scholarshipDetails}
                  </p>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Coverage */}
          {scholarship.coverage && scholarship.coverage.length > 0 && (
            <section aria-labelledby="coverage-header" className="animate-slide-in-up">
              <Card className="border-0 shadow">
                <CardHeader>
                  <CardTitle id="coverage-header" className="flex items-center gap-2 text-lg">
                    <DollarSign className="h-5 w-5 text-green-600" aria-label="Coverage" />
                    What This Scholarship Covers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {scholarship.coverage.map((item: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Eligibility Requirements */}
          <section aria-labelledby="eligibility-header" className="animate-slide-in-up">
            <Card className="border-0 shadow">
              <CardHeader>
                <CardTitle id="eligibility-header" className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-purple-600" aria-label="Eligibility" />
                  Eligibility Requirements
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Please review these requirements carefully. You must meet all applicable criteria to be considered for this scholarship.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {scholarship.eligibility?.degreeLevels && scholarship.eligibility.degreeLevels.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-blue-600" /> Degree Levels
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {scholarship.eligibility.degreeLevels.map((level: string, idx: number) => (
                          <Badge key={idx} className="bg-blue-100 text-blue-800 border border-blue-200 px-2 py-1 text-xs font-medium">{level}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {scholarship.eligibility?.fieldsOfStudy && scholarship.eligibility.fieldsOfStudy.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-green-600" /> Fields of Study
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {scholarship.eligibility.fieldsOfStudy.map((field: string, idx: number) => (
                          <Badge key={idx} className="bg-green-100 text-green-800 border border-green-200 px-2 py-1 text-xs font-medium">{field}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {scholarship.eligibility?.nationalities && scholarship.eligibility.nationalities.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Globe className="h-4 w-4 text-orange-600" /> Eligible Nationalities
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {scholarship.eligibility.nationalities.map((nationality: string, idx: number) => (
                          <Badge key={idx} className="bg-orange-100 text-orange-800 border border-orange-200 px-2 py-1 text-xs font-medium">{nationality}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {scholarship.eligibility?.minGPA && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4 text-purple-600" /> Minimum GPA
                      </h4>
                      <p className="text-gray-700 font-medium">{scholarship.eligibility.minGPA}</p>
                    </div>
                  )}
                  {scholarship.eligibility?.ageLimit && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-red-600" /> Age Limit
                      </h4>
                      <p className="text-gray-700 font-medium">{scholarship.eligibility.ageLimit}</p>
                    </div>
                  )}
                  {scholarship.eligibility?.additionalCriteria && (
                    <div className="md:col-span-2">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-600" /> Additional Criteria
                      </h4>
                      <p className="text-gray-700 leading-relaxed">{scholarship.eligibility.additionalCriteria}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Application Requirements */}
          <section aria-labelledby="app-req-header" className="animate-slide-in-up">
            <Card className="border-0 shadow">
              <CardHeader>
                <CardTitle id="app-req-header" className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-indigo-600" aria-label="Application Requirements" />
                  Application Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {scholarship.applicationRequirements?.documentsToSubmit && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" /> Required Documents
                      </h4>
                      <ul className="space-y-2">
                        {scholarship.applicationRequirements.documentsToSubmit.map((doc: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-700">{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {scholarship.applicationRequirements?.requirementsDescription && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" /> Requirements Description
                      </h4>
                      <p className="text-gray-700 leading-relaxed">{scholarship.applicationRequirements.requirementsDescription}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scholarship.applicationRequirements?.essay && (
                      <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <CheckCircle className="h-4 w-4 text-yellow-600" />
                        <span className="text-gray-700 font-medium">Essay Required</span>
                      </div>
                    )}
                    {scholarship.applicationRequirements?.cv && (
                      <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <CheckCircle className="h-4 w-4 text-purple-600" />
                        <span className="text-gray-700 font-medium">CV/Resume Required</span>
                      </div>
                    )}
                    {scholarship.applicationRequirements?.testScores && (
                      <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <CheckCircle className="h-4 w-4 text-orange-600" />
                        <span className="text-gray-700 font-medium">Test Scores Required</span>
                      </div>
                    )}
                    {scholarship.applicationRequirements?.recommendationLetters && (
                      <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                        <CheckCircle className="h-4 w-4 text-indigo-600" />
                        <span className="text-gray-700 font-medium">
                          {scholarship.applicationRequirements.recommendationLetters} Recommendation Letter(s)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Selection Criteria */}
          {scholarship.selectionCriteria && scholarship.selectionCriteria.length > 0 && (
            <section aria-labelledby="selection-header" className="animate-slide-in-up">
              <Card className="border-0 shadow">
                <CardHeader>
                  <CardTitle id="selection-header" className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5 text-blue-600" aria-label="Selection Criteria" />
                    Selection Criteria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {scholarship.selectionCriteria.map((criterion: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-blue-600 mt-0.5" aria-label="Criterion" />
                        <span className="text-gray-700">{criterion}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </section>
          )}
        </div>

        {/* Sidebar Summary */}
        <aside className="lg:col-span-1 lg:sticky top-24 h-fit animate-fade-in">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" aria-label="Scholarship Summary" />
                Scholarship Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Opening Date Status */}
              {scholarshipStatus && (
                <div className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-semibold ${scholarshipStatus.openingDateInfo.color}`}> 
                  <scholarshipStatus.openingDateInfo.icon className="h-5 w-5" aria-label="Opening Status" />
                  <span>{scholarshipStatus.openingDateInfo.status}</span>
                </div>
              )}
              
              {/* Deadline Status */}
              {scholarshipStatus && (
                <div className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-semibold ${scholarshipStatus.deadlineInfo.color}`}> 
                  <scholarshipStatus.deadlineInfo.icon className="h-5 w-5" aria-label="Deadline Status" />
                  <span>{scholarshipStatus.deadlineInfo.status}</span>
                </div>
              )}
              
              {/* Eligibility Status */}
              <div className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-semibold ${eligibilityCheck.eligible ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-red-50 border-red-200 text-red-800'}`}> 
                {eligibilityCheck.eligible ? (
                  <CheckCircle className="h-5 w-5 text-blue-600" aria-label="Can Apply" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" aria-label="Cannot Apply" />
                )}
                {eligibilityCheck.eligible ? 'Can Start Application' : 'Cannot Apply'}
                {!eligibilityCheck.eligible && eligibilityCheck.reasons.length > 0 && (
                  <div className="text-xs mt-1">
                    {eligibilityCheck.reasons.join(', ')}
                  </div>
                )}
                {eligibilityCheck.eligible && (
                  <div className="text-xs mt-1 text-blue-600">
                    Note: This only checks if the deadline hasn&apos;t passed. Review eligibility requirements below.
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                {/* Always show Prepare Application button for scholarships with application forms */}
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all" 
                  aria-label={scholarshipStatus?.applyButtonText || "Prepare Application"}
                  onClick={handleApply}
                  disabled={scholarshipStatus?.applyButtonDisabled || !eligibilityCheck.eligible || isCreatingApplication}
                >
                  {isCreatingApplication ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Preparing Application...
                    </>
                  ) : (
                    scholarshipStatus?.applyButtonText || "Prepare Application"
                  )}
                </Button>
                

                
                {/* Show Request Application Form button as secondary option */}
                {!hasApplicationForm && !hasRequestedForm && (
                  <Button 
                    variant="outline"
                    className="w-full bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100" 
                    aria-label="Request Application Form"
                    onClick={() => setIsRequestDialogOpen(true)}
                    disabled={scholarshipStatus?.applyButtonDisabled || !eligibilityCheck.eligible}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Request Application Form
                  </Button>
                )}
                
                {hasRequestedForm && (
                  <Button 
                    variant="outline"
                    className="w-full bg-yellow-50 border-yellow-200 text-yellow-700" 
                    disabled
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Request Submitted
                  </Button>
                )}
                {isSaved ? (
                  <Button 
                    variant="outline" 
                    className="w-full bg-green-50 border-green-200 text-green-700 hover:bg-green-100" 
                    onClick={handleUnsave}
                    aria-label="Unsave Scholarship"
                  >
                    <BookmarkCheck className="h-4 w-4 mr-2" />
                    Saved
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => setIsSaveDialogOpen(true)}
                    aria-label="Save Scholarship"
                  >
                    <BookmarkPlus className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  className="w-full" 
                  onClick={handleShare}
                  aria-label="Share Scholarship"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
              {/* Opening Date */}
              {scholarship.openingDate && (
                <div className="flex items-center gap-2 text-blue-700">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Opens:</span>
                  <span>{new Date(scholarship.openingDate).toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric'
                  })}</span>
                </div>
              )}
              
              {/* Deadline */}
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="h-4 w-4 text-orange-600" />
                <span className="font-medium">Deadline:</span>
                <span>{formatDeadline(scholarship.deadline)}</span>
              </div>
              {scholarship.value && (
                <div className="flex items-center gap-2 text-green-700">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-medium">Value:</span>
                  <span>{formatCurrency(scholarship.value ?? 0, scholarship.currency ?? 'USD')}</span>
                </div>
              )}
              {scholarship.frequency && (
                <div className="flex items-center gap-2 text-blue-700">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-medium">Frequency:</span>
                  <span>{scholarship.frequency}</span>
                </div>
              )}
              {scholarship.linkedSchool && (
                <div className="flex items-center gap-2 text-purple-700">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">Institution:</span>
                  <span>{scholarship.linkedSchool}</span>
                </div>
              )}
              {scholarship.eligibility?.degreeLevels && scholarship.eligibility.degreeLevels.length > 0 && (
                <div>
                  <div className="font-medium mb-1 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-blue-600" />
                    <span>Degree Levels:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {scholarship.eligibility.degreeLevels.map((level: string, idx: number) => (
                      <Badge key={idx} className="bg-blue-100 text-blue-800 border border-blue-200 px-2 py-1 text-xs font-medium">{level}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {scholarship.eligibility?.minGPA && (
                <div className="flex items-center gap-2 text-yellow-700">
                  <Target className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium">Min GPA:</span>
                  <span>{scholarship.eligibility.minGPA}</span>
                </div>
              )}
              {scholarship.applicationRequirements?.recommendationLetters && (
                <div className="flex items-center gap-2 text-gray-700">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Recommendations:</span>
                  <span>{scholarship.applicationRequirements.recommendationLetters}</span>
                </div>
              )}
              {scholarship.tags && scholarship.tags.length > 0 && (
                <div>
                  <div className="font-medium mb-1">Tags:</div>
                  <div className="flex flex-wrap gap-1">
                    {scholarship.tags.map((tag, idx) => (
                      <Badge key={idx} className="bg-gray-100 text-gray-700 border border-gray-200 px-2 py-1 text-xs font-medium">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {scholarship.coverage && scholarship.coverage.length > 0 && (
                <div>
                  <div className="font-medium mb-1 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span>Covers:</span>
                  </div>
                  <div className="space-y-1">
                    {scholarship.coverage.slice(0, 3).map((item: string, idx: number) => (
                      <div key={idx} className="text-sm text-gray-700 bg-green-50 px-2 py-1 rounded border border-green-200">
                        {item}
                      </div>
                    ))}
                    {scholarship.coverage.length > 3 && (
                      <div className="text-xs text-gray-500 italic">
                        +{scholarship.coverage.length - 3} more items
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Save Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Scholarship</DialogTitle>
            <DialogDescription>
              Add this scholarship to your saved list with notes and status.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={saveStatus} onValueChange={setSaveStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saved">Saved</SelectItem>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="not-interested">Not Interested</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Notes (Optional)</label>
              <Textarea
                placeholder="Add your notes about this scholarship..."
                value={saveNotes}
                onChange={(e) => setSaveNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Scholarship'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Application Form Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Application Form</DialogTitle>
            <DialogDescription>
              This scholarship doesn&apos;t have an application form yet. Request one and we&apos;ll notify you when it&apos;s available.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Reason for Request (Optional)</label>
              <Textarea
                placeholder="Tell us why you're interested in this scholarship..."
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestApplicationForm} disabled={isRequesting}>
              {isRequesting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Application Package Builder Modal */}
      <Dialog 
        open={isApplicationPackageModalOpen} 
        onOpenChange={setIsApplicationPackageModalOpen}
      >

        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Prepare Application Package
            </DialogTitle>
            <DialogDescription>
              Create a comprehensive application package for {scholarship?.title}. 
              This will help you organize your documents and track your application progress.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <ApplicationPackageBuilder
              onComplete={handleApplicationPackageComplete}
              onCancel={handleApplicationPackageCancel}
              autoNavigate={false}
              prefillData={{
                applicationType: 'scholarship',
                targetId: scholarshipId,
                targetName: scholarship?.title || '',
                applicationDeadline: scholarship?.deadline || '',
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ScholarshipDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Scholarship</h2>
          <p className="text-gray-600">Getting the details...</p>
        </div>
      </div>
    }>
      <ScholarshipDetailContent />
    </Suspense>
  );
}