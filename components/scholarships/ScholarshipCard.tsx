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

interface Scholarship {
  _id: string;
  title: string;
  provider: string;
  scholarshipDetails: string;
  value?: number | string;
  currency?: string;
  frequency: 'One-time' | 'Annual' | 'Full Duration';
  deadline: string;
  startDate?: string;
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

  const getDeadlineStatus = (days: number) => {
    if (days < 0) return { status: 'expired', color: 'bg-red-100 text-red-800', icon: AlertCircle };
    if (days <= 7) return { status: 'urgent', color: 'bg-orange-100 text-orange-800', icon: Clock };
    if (days <= 30) return { status: 'soon', color: 'bg-yellow-100 text-yellow-800', icon: Calendar };
    return { status: 'normal', color: 'bg-green-100 text-green-800', icon: CheckCircle };
  };

  const getStartDateInfo = (startDate?: string) => {
    if (!startDate) return null;
    
    const startDateObj = new Date(startDate);
    const today = new Date();
    const diffTime = startDateObj.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return null; // Already open
    if (diffDays <= 7) return { status: 'opens-soon', color: 'bg-cyan-100 text-cyan-800', text: `Opens in ${diffDays} days` };
    return { status: 'not-open', color: 'bg-gray-100 text-gray-800', text: `Opens ${startDateObj.toLocaleDateString()}` };
  };

  const daysUntilDeadline = getDaysUntilDeadline(scholarship.deadline);
  const deadlineStatus = getDeadlineStatus(daysUntilDeadline);
  const DeadlineIcon = deadlineStatus.icon;

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
      <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Header */}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
                {scholarship.title}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                {scholarship.provider}
              </CardDescription>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSaved(!isSaved)}
              className="ml-2 flex-shrink-0"
            >
              <Heart 
                className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
              />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Value and Frequency */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-green-600">
                {formatValue(scholarship.value, scholarship.currency)}
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              {scholarship.frequency}
            </Badge>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-3 mb-4">
            {scholarship.scholarshipDetails}
          </p>

          {/* Eligibility */}
          <div className="space-y-2 mb-4">
            {scholarship.eligibility.degreeLevels && (
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-600">
                  {scholarship.eligibility.degreeLevels.join(', ')}
                </span>
              </div>
            )}
            
            {scholarship.eligibility.fieldsOfStudy && (
              <div className="flex items-center space-x-2">
                <BookOpen className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-600">
                  {scholarship.eligibility.fieldsOfStudy.slice(0, 2).join(', ')}
                  {scholarship.eligibility.fieldsOfStudy.length > 2 && '...'}
                </span>
              </div>
            )}

            {scholarship.eligibility.minGPA && (
              <div className="flex items-center space-x-2">
                <Star className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-600">
                  Min GPA: {scholarship.eligibility.minGPA}
                </span>
              </div>
            )}
          </div>

          {/* Requirements */}
          {requirements.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-700 mb-2">Requirements:</p>
              <div className="flex flex-wrap gap-1">
                {requirements.slice(0, 3).map((req, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {req}
                  </Badge>
                ))}
                {requirements.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{requirements.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Start Date */}
          {(() => {
            const startDateInfo = getStartDateInfo(scholarship.startDate);
            return startDateInfo && (
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-600">
                    {startDateInfo.text}
                  </span>
                </div>
                <Badge className={`text-xs ${startDateInfo.color}`}>
                  {startDateInfo.status === 'opens-soon' ? 'Opens Soon' : 'Not Open'}
                </Badge>
              </div>
            );
          })()}

          {/* Deadline */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <DeadlineIcon className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-600">
                {daysUntilDeadline >= 0 ? `${daysUntilDeadline} days left` : 'Expired'}
              </span>
            </div>
            <Badge className={`text-xs ${deadlineStatus.color}`}>
              {deadlineStatus.status === 'expired' ? 'Expired' : 
               deadlineStatus.status === 'urgent' ? 'Urgent' :
               deadlineStatus.status === 'soon' ? 'Soon' : 'Open'}
            </Badge>
          </div>

          {/* Tags */}
          {scholarship.tags && scholarship.tags.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {scholarship.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {scholarship.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{scholarship.tags.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link href={`/scholarships/${scholarship._id}`}>
                <Button variant="outline" size="sm">
                  View Details
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
              
              {(() => {
                const startDateInfo = getStartDateInfo(scholarship.startDate);
                const isOpen = !startDateInfo; // If no start date info, it's open
                const isNotExpired = daysUntilDeadline >= 0;
                
                return isOpen && isNotExpired && (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Apply Now
                  </Button>
                );
              })()}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}