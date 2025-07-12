'use client';

import { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useScholarship } from '@/hooks/use-scholarships';

export default function ScholarshipDetailPage() {
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
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/scholarships" className="flex items-center space-x-2 mr-6">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
                <span className="text-gray-600">Back to Scholarships</span>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#007fbd] rounded-lg flex items-center justify-center">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[#00334e]">Scholarship Details</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Scholarship Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{scholarship.title}</CardTitle>
                      <CardDescription className="text-lg mb-4">
                        {scholarship.provider}
                      </CardDescription>
                      
                      {/* Tags */}
                      {scholarship.tags && scholarship.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {scholarship.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <Badge className={`${deadlineInfo.color} flex items-center space-x-1`}>
                      <deadlineInfo.icon className="h-4 w-4" />
                      <span>{deadlineInfo.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Value */}
                    {scholarship.value && (
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <DollarSign className="h-6 w-6 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-600">Award Value</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(scholarship.value, scholarship.currency)}
                          </p>
                          <p className="text-xs text-gray-500">{scholarship.frequency}</p>
                        </div>
                      </div>
                    )}

                    {/* Deadline */}
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Calendar className="h-6 w-6 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Application Deadline</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatDeadline(scholarship.deadline)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(scholarship.deadline).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Coverage */}
                    {scholarship.coverage && scholarship.coverage.length > 0 && (
                      <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                        <Award className="h-6 w-6 text-purple-600" />
                        <div>
                          <p className="text-sm text-gray-600">Coverage</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {scholarship.coverage.join(', ')}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Location */}
                    {scholarship.linkedSchool && (
                      <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                        <MapPin className="h-6 w-6 text-orange-600" />
                        <div>
                          <p className="text-sm text-gray-600">Institution</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {scholarship.linkedSchool}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {scholarship.scholarshipDetails && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {scholarship.scholarshipDetails}
                      </p>
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
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Eligibility Requirements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Degree Levels */}
                    {scholarship.eligibility?.degreeLevels && scholarship.eligibility.degreeLevels.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                          <GraduationCap className="h-4 w-4" />
                          <span>Degree Levels</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {scholarship.eligibility.degreeLevels.map((level, index) => (
                            <Badge key={index} variant="outline">
                              {level}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fields of Study */}
                    {scholarship.eligibility?.fieldsOfStudy && scholarship.eligibility.fieldsOfStudy.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                          <BookOpen className="h-4 w-4" />
                          <span>Fields of Study</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {scholarship.eligibility.fieldsOfStudy.map((field, index) => (
                            <Badge key={index} variant="outline">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Nationalities */}
                    {scholarship.eligibility?.nationalities && scholarship.eligibility.nationalities.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                          <Globe className="h-4 w-4" />
                          <span>Eligible Nationalities</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {scholarship.eligibility.nationalities.map((nationality, index) => (
                            <Badge key={index} variant="outline">
                              {nationality}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* GPA Requirement */}
                    {scholarship.eligibility?.minGPA && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Minimum GPA</h4>
                        <p className="text-gray-700">{scholarship.eligibility.minGPA}</p>
                      </div>
                    )}

                    {/* Age Limit */}
                    {scholarship.eligibility?.ageLimit && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Age Limit</h4>
                        <p className="text-gray-700">{scholarship.eligibility.ageLimit}</p>
                      </div>
                    )}

                    {/* Additional Criteria */}
                    {scholarship.eligibility?.additionalCriteria && (
                      <div className="md:col-span-2">
                        <h4 className="font-medium text-gray-900 mb-2">Additional Criteria</h4>
                        <p className="text-gray-700">{scholarship.eligibility.additionalCriteria}</p>
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
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Application Requirements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Required Documents */}
                    {scholarship.applicationRequirements?.documentsToSubmit && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Required Documents</h4>
                        <ul className="space-y-2">
                          {scholarship.applicationRequirements.documentsToSubmit.map((doc, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-gray-700">{doc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Requirements Description */}
                    {scholarship.applicationRequirements?.requirementsDescription && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Requirements Description</h4>
                        <p className="text-gray-700">{scholarship.applicationRequirements.requirementsDescription}</p>
                      </div>
                    )}

                    {/* Specific Requirements */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {scholarship.applicationRequirements?.essay && (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-gray-700">Essay Required</span>
                        </div>
                      )}
                      
                      {scholarship.applicationRequirements?.cv && (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-gray-700">CV/Resume Required</span>
                        </div>
                      )}
                      
                      {scholarship.applicationRequirements?.testScores && (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-gray-700">Test Scores Required</span>
                        </div>
                      )}
                      
                      {scholarship.applicationRequirements?.recommendationLetters && (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-gray-700">
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
                      {scholarship.selectionCriteria.map((criterion, index) => (
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
            {/* Application Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Application Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className={`p-3 rounded-lg ${eligibilityCheck.eligible ? 'bg-green-50' : 'bg-red-50'}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        {eligibilityCheck.eligible ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span className={`font-medium ${eligibilityCheck.eligible ? 'text-green-800' : 'text-red-800'}`}>
                          {eligibilityCheck.eligible ? 'Eligible to Apply' : 'Not Eligible'}
                        </span>
                      </div>
                      {eligibilityCheck.reasons.length > 0 && (
                        <ul className="text-sm space-y-1">
                          {eligibilityCheck.reasons.map((reason, index) => (
                            <li key={index} className="text-red-700">• {reason}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Apply Button */}
                    <Button 
                      className="w-full" 
                      size="lg"
                      disabled={!eligibilityCheck.eligible}
                      onClick={() => window.open(scholarship.applicationLink, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Apply Now
                    </Button>

                    {/* Application Link */}
                    <div className="text-center">
                      <a 
                        href={scholarship.applicationLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        View Application Page
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Key Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Key Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Number of Awards */}
                    {scholarship.numberOfAwardsPerYear && (
                      <div>
                        <p className="text-sm text-gray-600">Awards per Year</p>
                        <p className="font-medium text-gray-900">{scholarship.numberOfAwardsPerYear}</p>
                      </div>
                    )}

                    {/* Decision Timeline */}
                    {scholarship.decisionTimeline && (
                      <div>
                        <p className="text-sm text-gray-600">Decision Timeline</p>
                        <p className="font-medium text-gray-900">{scholarship.decisionTimeline}</p>
                      </div>
                    )}

                    {/* Renewal Conditions */}
                    {scholarship.renewalConditions && (
                      <div>
                        <p className="text-sm text-gray-600">Renewal Conditions</p>
                        <p className="font-medium text-gray-900">{scholarship.renewalConditions}</p>
                      </div>
                    )}

                    {/* Contact Information */}
                    {scholarship.contactInfo && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Contact Information</p>
                        {scholarship.contactInfo.email && (
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">Email:</span> {scholarship.contactInfo.email}
                          </p>
                        )}
                        {scholarship.contactInfo.phone && (
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">Phone:</span> {scholarship.contactInfo.phone}
                          </p>
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