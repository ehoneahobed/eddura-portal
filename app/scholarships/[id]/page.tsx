'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Award, 
  Calendar, 
  DollarSign, 
  MapPin, 
  GraduationCap, 
  Users, 
  BookOpen,
  ExternalLink,
  Clock,
  FileText,
  CheckCircle,
  Star,
  Share2,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import StudentLayout from '@/components/layout/StudentLayout';

interface Scholarship {
  _id: string;
  title: string;
  provider: string;
  scholarshipDetails: string;
  value?: number | string;
  currency?: string;
  frequency: 'One-time' | 'Annual' | 'Full Duration';
  deadline: string;
  applicationLink: string;
  eligibility: {
    degreeLevels?: string[];
    fieldsOfStudy?: string[];
    nationalities?: string[];
    minGPA?: number;
    ageLimit?: string;
    countryResidency?: string[];
    incomeStatus?: string;
    additionalCriteria?: string;
  };
  applicationRequirements: {
    essay?: boolean;
    cv?: boolean;
    recommendationLetters?: number;
    requirementsDescription?: string;
    documentsToSubmit?: string[];
  };
  selectionCriteria: string[];
  coverage: string[];
  tags?: string[];
  linkedSchool?: string;
  linkedProgram?: string;
  numberOfAwardsPerYear?: number;
  renewalConditions?: string;
  decisionTimeline?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
  };
}

export default function ScholarshipDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchScholarship();
    }
  }, [params.id]);

  const fetchScholarship = async () => {
    try {
      const response = await fetch(`/api/scholarships/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setScholarship(data);
      } else {
        console.error('Failed to fetch scholarship');
      }
    } catch (error) {
      console.error('Error fetching scholarship:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatValue = (value: number | string | undefined, currency?: string) => {
    if (typeof value === 'number') {
      return `${currency || '$'}${value.toLocaleString()}`;
    }
    return value || 'Varies';
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDeadlineStatus = (deadline: string) => {
    const daysLeft = getDaysUntilDeadline(deadline);
    if (daysLeft < 0) return { status: 'expired', text: 'Deadline passed', color: 'text-red-600' };
    if (daysLeft <= 7) return { status: 'urgent', text: `${daysLeft} days left`, color: 'text-red-600' };
    if (daysLeft <= 30) return { status: 'soon', text: `${daysLeft} days left`, color: 'text-orange-600' };
    return { status: 'normal', text: `${daysLeft} days left`, color: 'text-green-600' };
  };

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-[#007fbd] rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Scholarship</h2>
            <p className="text-gray-600">Getting the details...</p>
          </motion.div>
        </div>
      </StudentLayout>
    );
  }

  if (!scholarship) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Scholarship not found</h3>
            <p className="text-gray-600 mb-4">
              The scholarship you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push('/scholarships')} variant="outline">
              Back to Scholarships
            </Button>
          </motion.div>
        </div>
      </StudentLayout>
    );
  }

  const deadlineStatus = getDeadlineStatus(scholarship.deadline);

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => router.push('/scholarships')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Scholarships
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {scholarship.title}
              </h1>
              <p className="text-xl text-gray-600 mb-4">
                {scholarship.provider}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                {isFavorite ? 'Saved' : 'Save'}
              </Button>
            </div>
          </div>

          {/* Key Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Value</p>
                    <p className="font-semibold">{formatValue(scholarship.value, scholarship.currency)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Deadline</p>
                    <p className={`font-semibold ${deadlineStatus.color}`}>
                      {deadlineStatus.text}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-purple-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Frequency</p>
                    <p className="font-semibold">{scholarship.frequency}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Award className="w-5 h-5 text-orange-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Awards</p>
                    <p className="font-semibold">
                      {scholarship.numberOfAwardsPerYear || 'Varies'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    About this Scholarship
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {scholarship.scholarshipDetails}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Eligibility */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Eligibility Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {scholarship.eligibility.degreeLevels && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Degree Levels</h4>
                      <div className="flex flex-wrap gap-2">
                        {scholarship.eligibility.degreeLevels.map((level, index) => (
                          <Badge key={index}>{level}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {scholarship.eligibility.fieldsOfStudy && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Fields of Study</h4>
                      <div className="flex flex-wrap gap-2">
                        {scholarship.eligibility.fieldsOfStudy.map((field, index) => (
                          <Badge key={index}>{field}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {scholarship.eligibility.nationalities && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Nationalities</h4>
                      <div className="flex flex-wrap gap-2">
                        {scholarship.eligibility.nationalities.map((nationality, index) => (
                          <Badge key={index}>{nationality}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {scholarship.eligibility.minGPA && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Minimum GPA</h4>
                      <p className="text-gray-700">{scholarship.eligibility.minGPA}/4.0</p>
                    </div>
                  )}

                  {scholarship.eligibility.additionalCriteria && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Additional Criteria</h4>
                      <p className="text-gray-700">{scholarship.eligibility.additionalCriteria}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Application Requirements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Application Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`w-4 h-4 ${scholarship.applicationRequirements.essay ? 'text-green-600' : 'text-gray-400'}`} />
                      <span>Essay</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`w-4 h-4 ${scholarship.applicationRequirements.cv ? 'text-green-600' : 'text-gray-400'}`} />
                      <span>CV/Resume</span>
                    </div>
                    {scholarship.applicationRequirements.recommendationLetters && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>{scholarship.applicationRequirements.recommendationLetters} Recommendation Letters</span>
                      </div>
                    )}
                  </div>

                  {scholarship.applicationRequirements.requirementsDescription && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Requirements Description</h4>
                      <p className="text-gray-700">{scholarship.applicationRequirements.requirementsDescription}</p>
                    </div>
                  )}

                  {scholarship.applicationRequirements.documentsToSubmit && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Documents to Submit</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {scholarship.applicationRequirements.documentsToSubmit.map((doc, index) => (
                          <li key={index}>{doc}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Selection Criteria */}
            {scholarship.selectionCriteria && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Selection Criteria
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      {scholarship.selectionCriteria.map((criterion, index) => (
                        <li key={index}>{criterion}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <Button 
                    className="w-full mb-4" 
                    size="lg"
                    onClick={() => window.open(scholarship.applicationLink, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Apply Now
                  </Button>
                  
                  {deadlineStatus.status === 'expired' ? (
                    <p className="text-red-600 text-sm text-center">Application deadline has passed</p>
                  ) : (
                    <p className="text-gray-600 text-sm text-center">
                      Deadline: {new Date(scholarship.deadline).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Coverage */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">What's Covered</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {scholarship.coverage.map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tags */}
            {scholarship.tags && scholarship.tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {scholarship.tags.map((tag, index) => (
                        <Badge key={index}>{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Contact Info */}
            {scholarship.contactInfo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {scholarship.contactInfo.email && (
                      <p className="text-sm">
                        <span className="font-medium">Email:</span> {scholarship.contactInfo.email}
                      </p>
                    )}
                    {scholarship.contactInfo.phone && (
                      <p className="text-sm">
                        <span className="font-medium">Phone:</span> {scholarship.contactInfo.phone}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}