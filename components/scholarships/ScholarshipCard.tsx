'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Award, 
  DollarSign, 
  Calendar,
  MapPin,
  GraduationCap,
  Users,
  BookOpen,
  Star,
  Heart,
  Share2,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getScholarshipStatus } from '@/lib/scholarship-status';

interface Scholarship {
  _id: string;
  title: string;
  provider: string;
  scholarshipDetails: string;
  value?: number | string;
  currency?: string;
  frequency: 'One-time' | 'Annual' | 'Full Duration';
  deadline: string;
  openingDate?: string;
  locations?: string[];
  disciplines?: string[];
  eligibility: {
    degreeLevels?: string[];
    fieldsOfStudy?: string[];
    nationalities?: string[];
    minGPA?: number;
  };
  applicationRequirements: {
    essay?: boolean;
    cv?: boolean;
    recommendationLetters?: number;
  };
  linkedSchool?: string;
  linkedProgram?: string;
  coverage: string[];
  tags?: string[];
}

interface ScholarshipCardProps {
  scholarship: Scholarship;
}

export default function ScholarshipCard({ scholarship }: ScholarshipCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const providerInitial = (scholarship.provider || '?').charAt(0).toUpperCase();

  const formatValue = (value: number | string | undefined, currency?: string) => {
    if (typeof value === 'number') {
      return `${currency || '$'}${value.toLocaleString()}`;
    }
    return value || 'Varies';
  };

  // Get unified scholarship status
  const scholarshipStatus = getScholarshipStatus(scholarship.deadline, scholarship.openingDate);

  const requirements = [];
  if (scholarship.applicationRequirements.essay) requirements.push('Essay');
  if (scholarship.applicationRequirements.cv) requirements.push('CV');
  if (scholarship.applicationRequirements.recommendationLetters) {
    requirements.push(`${scholarship.applicationRequirements.recommendationLetters} Recommendations`);
  }

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full transition-all duration-300 overflow-hidden border border-gray-200 dark:border-[var(--eddura-primary-800)] bg-white dark:bg-[var(--eddura-primary-900)] text-gray-900 dark:text-white rounded-2xl shadow-sm hover:shadow-eddura-lg">
        {/* Brand accent top bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[var(--eddura-primary)] via-[var(--eddura-primary-light)] to-[var(--eddura-accent)]" />
        {/* Header */}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 flex gap-3">
              <div className="h-9 w-9 flex items-center justify-center rounded-full bg-gradient-to-br from-[var(--eddura-primary)] to-[var(--eddura-primary-light)] text-white font-semibold shadow-sm flex-shrink-0">
                {providerInitial}
              </div>
              <div className="min-w-0">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
                  {scholarship.title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-[var(--eddura-primary-300)]">
                  {scholarship.provider}
                </CardDescription>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSaved(!isSaved)}
              className="ml-2 flex-shrink-0"
            >
              <Heart 
                className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-400 dark:text-[var(--eddura-primary-300)]'}`} 
              />
            </Button>
          </div>
        </CardHeader>
        {/* Soft divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-[var(--eddura-primary-800)]" />

        <CardContent className="pt-0">
          {/* Value and Frequency */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-[var(--eddura-success)]" />
              <span className="font-semibold text-[var(--eddura-success)]">
                {formatValue(scholarship.value, scholarship.currency)}
              </span>
            </div>
            <Badge variant="outline" className="text-xs pointer-events-none border-gray-200 dark:border-[var(--eddura-primary-700)] text-gray-700 dark:text-[var(--eddura-primary-200)] bg-[var(--eddura-primary-50)]/60">
              {scholarship.frequency}
            </Badge>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-700 dark:text-[var(--eddura-primary-200)] line-clamp-3 mb-4">
            {scholarship.scholarshipDetails}
          </p>

          {/* Eligibility */}
          <div className="space-y-2 mb-4">
            {scholarship.eligibility.degreeLevels && (
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-3 w-3 text-gray-400 dark:text-[var(--eddura-primary-300)]" />
                <span className="text-xs text-gray-600 dark:text-[var(--eddura-primary-200)]">
                  {scholarship.eligibility.degreeLevels.join(', ')}
                </span>
              </div>
            )}
            
            {scholarship.eligibility.fieldsOfStudy && (
              <div className="flex items-center space-x-2">
                <BookOpen className="h-3 w-3 text-gray-400 dark:text-[var(--eddura-primary-300)]" />
                <span className="text-xs text-gray-600 dark:text-[var(--eddura-primary-200)]">
                  {scholarship.eligibility.fieldsOfStudy.slice(0, 2).join(', ')}
                  {scholarship.eligibility.fieldsOfStudy.length > 2 && '...'}
                </span>
              </div>
            )}

            {scholarship.eligibility.minGPA && (
              <div className="flex items-center space-x-2">
                <Star className="h-3 w-3 text-gray-400 dark:text-[var(--eddura-primary-300)]" />
                <span className="text-xs text-gray-600 dark:text-[var(--eddura-primary-200)]">
                  Min GPA: {scholarship.eligibility.minGPA}
                </span>
              </div>
            )}

            {/* New Location and Discipline fields */}
            {scholarship.locations && scholarship.locations.length > 0 && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-3 w-3 text-gray-400 dark:text-[var(--eddura-primary-300)]" />
                <span className="text-xs text-gray-600 dark:text-[var(--eddura-primary-200)]">
                  {scholarship.locations.slice(0, 2).join(', ')}
                  {scholarship.locations.length > 2 && '...'}
                </span>
              </div>
            )}

            {scholarship.disciplines && scholarship.disciplines.length > 0 && (
              <div className="flex items-center space-x-2">
                <BookOpen className="h-3 w-3 text-gray-400 dark:text-[var(--eddura-primary-300)]" />
                <span className="text-xs text-gray-600 dark:text-[var(--eddura-primary-200)]">
                  {scholarship.disciplines.slice(0, 2).join(', ')}
                  {scholarship.disciplines.length > 2 && '...'}
                </span>
              </div>
            )}
          </div>

          {/* Requirements */}
          {requirements.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-[var(--eddura-primary-800)] dark:text-[var(--eddura-primary-200)] mb-2">Requirements:</p>
              <div className="flex flex-wrap gap-1">
                {requirements.slice(0, 3).map((req, index) => (
                  <Badge key={index} variant="secondary" className="text-xs pointer-events-none bg-[var(--eddura-primary-50)]/60 dark:bg-[var(--eddura-primary-800)]">
                    {req}
                  </Badge>
                ))}
                {requirements.length > 3 && (
                  <Badge variant="secondary" className="text-xs pointer-events-none bg-[var(--eddura-primary-50)]/60 dark:bg-[var(--eddura-primary-800)]">
                    +{requirements.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Status and Deadline */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <scholarshipStatus.deadlineInfo.icon className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-600">
                {scholarshipStatus.isNotYetOpen && scholarship.openingDate 
                  ? `${Math.ceil((new Date(scholarship.openingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days to opening`
                  : scholarshipStatus.deadlineInfo.daysLeft >= 0 
                    ? `${scholarshipStatus.deadlineInfo.daysLeft} days to close` 
                    : 'Expired'
                }
              </span>
            </div>
            <div className="flex gap-1">
              {/* Unified Status Badge - Show only one status */}
              <Badge 
                className={`text-xs ${scholarshipStatus.isNotYetOpen ? scholarshipStatus.openingDateInfo.color : scholarshipStatus.deadlineInfo.color} pointer-events-none`}
              >
                {scholarshipStatus.isNotYetOpen 
                  ? scholarshipStatus.openingDateInfo.status 
                  : scholarshipStatus.deadlineInfo.status
                }
              </Badge>
            </div>
          </div>

          {/* Preparation Message for Not Yet Open Scholarships */}
          {scholarshipStatus.isNotYetOpen && scholarship.openingDate && (
            <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                💡 You can start preparing your application now, even though applications haven&apos;t opened yet.
              </p>
            </div>
          )}

          {/* Tags */}
          {scholarship.tags && scholarship.tags.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {scholarship.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs pointer-events-none border-gray-200 dark:border-[var(--eddura-primary-700)] text-gray-700 dark:text-[var(--eddura-primary-200)]">
                    {tag}
                  </Badge>
                ))}
                {scholarship.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs pointer-events-none border-gray-200 dark:border-[var(--eddura-primary-700)] text-gray-700 dark:text-[var(--eddura-primary-200)]">
                    +{scholarship.tags.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          {/* Footer with subtle tint */}
          <div className="mt-4 pt-4 -mx-6 px-6 border-t border-gray-100 dark:border-[var(--eddura-primary-800)] bg-[var(--eddura-primary-50)]/40 dark:bg-transparent rounded-b-2xl">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link href={`/scholarships/${scholarship._id}`}>
                <Button variant="outline" size="sm" className="bg-[var(--eddura-primary)] hover:bg-[var(--eddura-primary-dark)] text-white border-[var(--eddura-primary)]">
                  View Details
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}