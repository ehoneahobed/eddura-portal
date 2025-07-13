'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Award, 
  DollarSign, 
  Calendar, 
  MapPin, 
  GraduationCap,
  User,
  FileText,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  Building,
  Globe,
  BookOpen,
  Target,
  Sparkles,
  Loader2,
  RefreshCw,
  Mail,
  Phone,
  ChevronLeft, ChevronRight,
  Bookmark,
  Share2,
  BookmarkPlus,
  BookmarkCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { useScholarship } from '@/hooks/use-scholarships';
import { toast } from 'sonner';

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

  // Format deadline
  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Expired';
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays <= 7) {
      return `${diffDays} days left`;
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
    }
  };

  // Get deadline color and status
  const getDeadlineInfo = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { color: 'bg-red-100 text-red-800', status: 'Expired', icon: AlertCircle };
    }
    if (diffDays <= 7) {
      return { color: 'bg-orange-100 text-orange-800', status: 'Urgent', icon: Clock };
    }
    if (diffDays <= 30) {
      return { color: 'bg-yellow-100 text-yellow-800', status: 'Soon', icon: Clock };
    }
    return { color: 'bg-green-100 text-green-800', status: 'Open', icon: CheckCircle };
  };

  // Check if user is eligible based on basic criteria
  const checkBasicEligibility = () => {
    if (!scholarship) return { eligible: false, reasons: [] };
    
    const reasons = [];
    let eligible = true;

    // Check if expired
    const deadline = new Date(scholarship.deadline);
    const now = new Date();
    if (deadline < now) {
      eligible = false;
      reasons.push('Application deadline has passed');
    }

    return { eligible, reasons };
  };

  // Check if scholarship is saved
  useEffect(() => {
    if (scholarship && session?.user?.id) {
      checkIfSaved();
    }
  }, [scholarship, session?.user?.id]);

  const checkIfSaved = async () => {
    try {
      const response = await fetch(`/api/user/saved-scholarships?scholarshipId=${scholarshipId}`);
      if (response.ok) {
        const data = await response.json();
        setIsSaved(data.savedScholarships.length > 0);
      }
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

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
        toast.success('Link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
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
              The scholarship you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push('/scholarships')}>
              Back to Scholarships
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const deadlineInfo = getDeadlineInfo(scholarship.deadline);
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
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${deadlineInfo.color} border shadow-sm`}>
                <deadlineInfo.icon className="h-4 w-4" aria-label="Status" />
                <span>{deadlineInfo.status}</span>
              </div>
              <div className="flex items-center gap-1 text-green-100 font-semibold bg-green-700/20 px-3 py-1 rounded-full">
                <DollarSign className="h-4 w-4" aria-label="Value" />
                {formatCurrency(scholarship.value ?? 0, scholarship.currency ?? 'USD')}
              </div>
              {scholarship.linkedSchool && (
                <div className="flex items-center gap-1 text-purple-100 font-semibold bg-purple-700/20 px-3 py-1 rounded-full">
                  <MapPin className="h-4 w-4" aria-label="Institution" />
                  {scholarship.linkedSchool}
                </div>
              )}
              <div className="flex items-center gap-1 text-blue-100 font-medium bg-blue-700/20 px-3 py-1 rounded-full">
                <Calendar className="h-4 w-4" aria-label="Deadline" />
                {formatDeadline(scholarship.deadline)}
              </div>
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

          {/* Eligibility Requirements */}
          <section aria-labelledby="eligibility-header" className="animate-slide-in-up">
            <Card className="border-0 shadow">
              <CardHeader>
                <CardTitle id="eligibility-header" className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-purple-600" aria-label="Eligibility" />
                  Eligibility Requirements
                </CardTitle>
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
              <div className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-semibold ${eligibilityCheck.eligible ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}> 
                {eligibilityCheck.eligible ? (
                  <CheckCircle className="h-5 w-5 text-green-600" aria-label="Eligible" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" aria-label="Not Eligible" />
                )}
                {eligibilityCheck.eligible ? 'Eligible to Apply' : 'Not Eligible'}
              </div>
              <div className="flex flex-col gap-2">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all" aria-label="Apply Now">Apply Now</Button>
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