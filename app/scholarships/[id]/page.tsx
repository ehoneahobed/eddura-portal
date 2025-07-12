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
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useScholarship } from '@/hooks/use-scholarships';

function ScholarshipDetailContent() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const scholarshipId = params.id as string;
  
  const { scholarship, isLoading, isError, mutate } = useScholarship(scholarshipId);

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

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Scholarship</h2>
          <p className="text-gray-600">Getting the details...</p>
        </div>
      </div>
    );
  }

  if (!session?.user?.id) {
    router.push('/auth/signin');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !scholarship) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </div>
    );
  }

  const deadlineInfo = getDeadlineInfo(scholarship.deadline);
  const eligibilityCheck = checkBasicEligibility();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/scholarships" className="flex items-center space-x-2 mr-6 hover:text-[#007fbd] transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Scholarships</span>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#007fbd] rounded-lg flex items-center justify-center">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[#00334e]">Scholarship Details</h1>
              </div>
            </div>
            
            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">
                    {session?.user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">Student</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-6">
            {/* Scholarship Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-0 shadow-lg overflow-hidden">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                          <Award className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-blue-100 text-sm font-medium">Scholarship Opportunity</p>
                          <p className="text-white/80 text-sm">{scholarship.provider}</p>
                        </div>
                      </div>
                      
                      <h1 className="text-3xl font-bold mb-4 leading-tight">
                        {scholarship.title}
                      </h1>
                      
                      {/* Tags */}
                      {scholarship.tags && scholarship.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {scholarship.tags.map((tag, index) => (
                            <Badge key={index} className="bg-white/20 text-white border border-white/30">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className={`${deadlineInfo.color} flex items-center space-x-1 text-sm font-semibold px-3 py-1 rounded-full border`}>
                        <deadlineInfo.icon className="h-4 w-4" />
                        <span>{deadlineInfo.status}</span>
                      </div>
                      <p className="text-blue-100 text-sm mt-2">
                        {formatDeadline(scholarship.deadline)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <CardContent>
                  {/* Key Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Value */}
                    {scholarship.value && (
                      <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-green-600" />
                          </div>
                          <span className="font-semibold text-green-800">Award Value</span>
                        </div>
                        <p className="text-2xl font-bold text-green-700 mb-1">
                          {formatCurrency(scholarship.value, scholarship.currency)}
                        </p>
                        <p className="text-sm text-green-600 font-medium">{scholarship.frequency}</p>
                      </div>
                    )}

                    {/* Deadline */}
                    <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200 shadow-sm">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-orange-600" />
                        </div>
                        <span className="font-semibold text-orange-800">Deadline</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900 mb-1">
                        {formatDeadline(scholarship.deadline)}
                      </p>
                      <p className="text-sm text-orange-600">
                        {deadlineInfo.status}
                      </p>
                    </div>

                    {/* Coverage */}
                    {scholarship.coverage && scholarship.coverage.length > 0 && (
                      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Award className="h-5 w-5 text-blue-600" />
                          </div>
                          <span className="font-semibold text-blue-800">Coverage</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 mb-1">
                          {scholarship.coverage.join(', ')}
                        </p>
                        <p className="text-sm text-blue-600">Comprehensive support</p>
                      </div>
                    )}

                    {/* Location */}
                    {scholarship.linkedSchool && (
                      <div className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200 shadow-sm">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-purple-600" />
                          </div>
                          <span className="font-semibold text-purple-800">Institution</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 mb-1">
                          {scholarship.linkedSchool}
                        </p>
                        <p className="text-sm text-purple-600">Partner institution</p>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {scholarship.scholarshipDetails && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-gray-600" />
                        <span>Description</span>
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <p className="text-gray-700 leading-relaxed text-base">
                          {scholarship.scholarshipDetails}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Eligibility Requirements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    <span>Eligibility Requirements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Degree Levels */}
                    {scholarship.eligibility?.degreeLevels && scholarship.eligibility.degreeLevels.length > 0 && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <GraduationCap className="h-4 w-4 text-blue-600" />
                          <span>Degree Levels</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {scholarship.eligibility.degreeLevels.map((level: string, index: number) => (
                            <div key={index} className="bg-blue-100 text-blue-800 border border-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                              {level}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fields of Study */}
                    {scholarship.eligibility?.fieldsOfStudy && scholarship.eligibility.fieldsOfStudy.length > 0 && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-green-600" />
                          <span>Fields of Study</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {scholarship.eligibility.fieldsOfStudy.map((field: string, index: number) => (
                            <div key={index} className="bg-green-100 text-green-800 border border-green-200 px-2 py-1 rounded-full text-xs font-medium">
                              {field}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Nationalities */}
                    {scholarship.eligibility?.nationalities && scholarship.eligibility.nationalities.length > 0 && (
                      <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-orange-600" />
                          <span>Eligible Nationalities</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {scholarship.eligibility.nationalities.map((nationality: string, index: number) => (
                            <div key={index} className="bg-orange-100 text-orange-800 border border-orange-200 px-2 py-1 rounded-full text-xs font-medium">
                              {nationality}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* GPA Requirement */}
                    {scholarship.eligibility?.minGPA && (
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                          <Target className="h-4 w-4 text-purple-600" />
                          <span>Minimum GPA</span>
                        </h4>
                        <p className="text-gray-700 font-medium">{scholarship.eligibility.minGPA}</p>
                      </div>
                    )}

                    {/* Age Limit */}
                    {scholarship.eligibility?.ageLimit && (
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-red-600" />
                          <span>Age Limit</span>
                        </h4>
                        <p className="text-gray-700 font-medium">{scholarship.eligibility.ageLimit}</p>
                      </div>
                    )}

                    {/* Additional Criteria */}
                    {scholarship.eligibility?.additionalCriteria && (
                      <div className="md:col-span-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-600" />
                          <span>Additional Criteria</span>
                        </h4>
                        <p className="text-gray-700 leading-relaxed">{scholarship.eligibility.additionalCriteria}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Application Requirements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    <span>Application Requirements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Required Documents */}
                    {scholarship.applicationRequirements?.documentsToSubmit && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Required Documents</span>
                        </h4>
                        <ul className="space-y-2">
                          {scholarship.applicationRequirements.documentsToSubmit.map((doc: string, index: number) => (
                            <li key={index} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-gray-700">{doc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Requirements Description */}
                    {scholarship.applicationRequirements?.requirementsDescription && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span>Requirements Description</span>
                        </h4>
                        <p className="text-gray-700 leading-relaxed">{scholarship.applicationRequirements.requirementsDescription}</p>
                      </div>
                    )}

                    {/* Specific Requirements */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {scholarship.applicationRequirements?.essay && (
                        <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <CheckCircle className="h-4 w-4 text-yellow-600" />
                          <span className="text-gray-700 font-medium">Essay Required</span>
                        </div>
                      )}
                      
                      {scholarship.applicationRequirements?.cv && (
                        <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <CheckCircle className="h-4 w-4 text-purple-600" />
                          <span className="text-gray-700 font-medium">CV/Resume Required</span>
                        </div>
                      )}
                      
                      {scholarship.applicationRequirements?.testScores && (
                        <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <CheckCircle className="h-4 w-4 text-orange-600" />
                          <span className="text-gray-700 font-medium">Test Scores Required</span>
                        </div>
                      )}
                      
                      {scholarship.applicationRequirements?.recommendationLetters && (
                        <div className="flex items-center space-x-2 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
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
            </motion.div>

            {/* Selection Criteria */}
            {scholarship.selectionCriteria && scholarship.selectionCriteria.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span>Selection Criteria</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {scholarship.selectionCriteria.map((criterion: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Sparkles className="h-4 w-4 text-blue-600 mt-0.5" />
                          <span className="text-gray-700">{criterion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Application Status - Sticky */}
            <div className="sticky top-24">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>Application Status</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className={`p-4 rounded-lg border ${eligibilityCheck.eligible ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center space-x-2 mb-3">
                          {eligibilityCheck.eligible ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          ) : (
                            <AlertCircle className="h-6 w-6 text-red-600" />
                          )}
                          <span className={`font-semibold text-lg ${eligibilityCheck.eligible ? 'text-green-800' : 'text-red-800'}`}>
                            {eligibilityCheck.eligible ? 'Eligible to Apply' : 'Not Eligible'}
                          </span>
                        </div>
                        {eligibilityCheck.reasons.length > 0 && (
                          <ul className="text-sm space-y-1">
                            {eligibilityCheck.reasons.map((reason, index) => (
                              <li key={index} className="text-red-700 flex items-start space-x-2">
                                <span className="text-red-500 mt-1">•</span>
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Apply Button */}
                      <Button 
                        className="w-full h-12 text-lg font-semibold" 
                        size="lg"
                        disabled={!eligibilityCheck.eligible}
                        onClick={() => window.open(scholarship.applicationLink, '_blank')}
                      >
                        <ExternalLink className="h-5 w-5 mr-2" />
                        Apply Now
                      </Button>

                      {/* Application Link */}
                      <div className="text-center pt-2">
                        <a 
                          href={scholarship.applicationLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 underline font-medium"
                        >
                          View Application Page
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Key Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span>Key Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Number of Awards */}
                    {scholarship.numberOfAwardsPerYear && (
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div>
                          <p className="text-sm text-gray-600">Awards per Year</p>
                          <p className="font-semibold text-gray-900">{scholarship.numberOfAwardsPerYear}</p>
                        </div>
                        <Award className="h-5 w-5 text-green-600" />
                      </div>
                    )}

                    {/* Decision Timeline */}
                    {scholarship.decisionTimeline && (
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div>
                          <p className="text-sm text-gray-600">Decision Timeline</p>
                          <p className="font-semibold text-gray-900">{scholarship.decisionTimeline}</p>
                        </div>
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                    )}

                    {/* Renewal Conditions */}
                    {scholarship.renewalConditions && (
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div>
                          <p className="text-sm text-gray-600">Renewal Conditions</p>
                          <p className="font-semibold text-gray-900">{scholarship.renewalConditions}</p>
                        </div>
                        <RefreshCw className="h-5 w-5 text-purple-600" />
                      </div>
                    )}

                    {/* Contact Information */}
                    {scholarship.contactInfo && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-3">Contact Information</p>
                        {scholarship.contactInfo.email && (
                          <div className="flex items-center space-x-2 mb-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <a href={`mailto:${scholarship.contactInfo.email}`} className="text-sm text-blue-600 hover:text-blue-800">
                              {scholarship.contactInfo.email}
                            </a>
                          </div>
                        )}
                        {scholarship.contactInfo.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <a href={`tel:${scholarship.contactInfo.phone}`} className="text-sm text-blue-600 hover:text-blue-800">
                              {scholarship.contactInfo.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Additional Links */}
            {(scholarship.infoPage || scholarship.faqLink) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Additional Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {scholarship.infoPage && (
                        <Button variant="outline" className="w-full" asChild>
                          <a href={scholarship.infoPage} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            More Information
                          </a>
                        </Button>
                      )}
                      
                      {scholarship.faqLink && (
                        <Button variant="outline" className="w-full" asChild>
                          <a href={scholarship.faqLink} target="_blank" rel="noopener noreferrer">
                            <FileText className="h-4 w-4 mr-2" />
                            FAQ
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </main>
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