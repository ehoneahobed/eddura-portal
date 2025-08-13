'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  DollarSign, 
  Calendar,
  MapPin,
  BookOpen,
  Star,
  Heart,
  Share2,
  ArrowRight,
  Clock,
  Globe,
  Users,
  Award,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Program {
  _id: string;
  name: string;
  degreeType: 'Diploma' | 'Bachelor' | 'Master' | 'MBA' | 'PhD' | 'Certificate' | 'Short Course';
  fieldOfStudy: string;
  subfield?: string;
  mode: 'Full-time' | 'Part-time' | 'Online' | 'Hybrid';
  duration: string;
  languages: string[];
  applicationDeadlines: string[];
  intakeSessions: string[];
  tuitionFees: {
    local: number;
    international: number;
    currency: string;
  };
  availableScholarships?: string[];
  applicationFee?: number;
  employabilityRank?: number;
  programLevel: 'Undergraduate' | 'Postgraduate';
  school: {
    _id: string;
    name: string;
    country: string;
    city: string;
    globalRanking?: number;
  };
}

interface ProgramCardProps {
  program: Program;
}

export default function ProgramCard({ program }: ProgramCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  const formatTuition = (amount: number, currency: string) => {
    return `${currency}${amount.toLocaleString()}`;
  };

  const getNextDeadline = () => {
    if (!program.applicationDeadlines || program.applicationDeadlines.length === 0) {
      return null;
    }
    
    const today = new Date();
    const deadlines = program.applicationDeadlines
      .map(deadline => new Date(deadline))
      .filter(deadline => deadline > today)
      .sort((a, b) => a.getTime() - b.getTime());
    
    return deadlines.length > 0 ? deadlines[0] : null;
  };

  const getDaysUntilDeadline = (deadline: Date) => {
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nextDeadline = getNextDeadline();
  const daysUntilDeadline = nextDeadline ? getDaysUntilDeadline(nextDeadline) : null;

  const getDeadlineStatus = (days: number) => {
    if (days <= 7) return { status: 'urgent', color: 'bg-red-100 text-red-800' };
    if (days <= 30) return { status: 'soon', color: 'bg-orange-100 text-orange-800' };
    return { status: 'normal', color: 'bg-green-100 text-green-800' };
  };

  const deadlineStatus = daysUntilDeadline ? getDeadlineStatus(daysUntilDeadline) : null;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full border border-[var(--eddura-primary-100)] dark:border-[var(--eddura-primary-800)] bg-white dark:bg-[var(--eddura-primary-900)] shadow-[0_4px_14px_rgba(25,103,117,0.08)] hover:shadow-[0_16px_34px_rgba(25,103,117,0.18)] transition-all duration-300 overflow-hidden">
        {/* Header */}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
                {program.name}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                {program.school.name}
              </CardDescription>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSaved(!isSaved)}
              className="ml-2 flex-shrink-0"
            >
              <Heart 
                className={`h-4 w-4 ${isSaved ? 'fill-eddura-500 text-eddura-500' : 'text-gray-400 dark:text-gray-500'}`} 
              />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* University Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-eddura-600 dark:text-eddura-300" />
              <span className="text-sm font-medium text-eddura-600 dark:text-eddura-300">
                {program.school.name}
              </span>
            </div>
            {program.school.globalRanking && (
              <Badge variant="outline" className="text-xs">
                #{program.school.globalRanking} Global
              </Badge>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center space-x-2 mb-4">
            <MapPin className="h-3 w-3 text-gray-400 dark:text-gray-500" />
            <span className="text-xs text-gray-600 dark:text-gray-300">
              {program.school.city}, {program.school.country}
            </span>
          </div>

          {/* Program Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                <span className="text-xs text-gray-600 dark:text-gray-300">{program.degreeType}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {program.programLevel}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <BookOpen className="h-3 w-3 text-gray-400 dark:text-gray-500" />
              <span className="text-xs text-gray-600 dark:text-gray-300">
                {program.fieldOfStudy}
                {program.subfield && ` - ${program.subfield}`}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="h-3 w-3 text-gray-400 dark:text-gray-500" />
              <span className="text-xs text-gray-600 dark:text-gray-300">
                {program.duration} • {program.mode}
              </span>
            </div>

            {program.languages.length > 0 && (
              <div className="flex items-center space-x-2">
                <Globe className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {program.languages.join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* Tuition */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-eddura-600 dark:text-eddura-300" />
              <span className="font-semibold text-eddura-600 dark:text-eddura-300">
                {formatTuition(program.tuitionFees.international, program.tuitionFees.currency)}/year
              </span>
            </div>
            {program.applicationFee && (
              <Badge variant="outline" className="text-xs">
                ${program.applicationFee} fee
              </Badge>
            )}
          </div>

          {/* Scholarships */}
          {program.availableScholarships && program.availableScholarships.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <Award className="h-3 w-3 text-eddura-600 dark:text-eddura-300" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                  {program.availableScholarships.length} Scholarships Available
                </span>
              </div>
            </div>
          )}

          {/* Employability */}
          {program.employabilityRank && (
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <Star className="h-3 w-3 text-eddura-600 dark:text-eddura-300" />
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  Employability Rank: #{program.employabilityRank}
                </span>
              </div>
            </div>
          )}

          {/* Intake Sessions */}
          {program.intakeSessions.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-700 mb-1">Intake Sessions:</p>
              <div className="flex flex-wrap gap-1">
                {program.intakeSessions.slice(0, 3).map((session, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {session}
                  </Badge>
                ))}
                {program.intakeSessions.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{program.intakeSessions.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Application Deadline */}
          {nextDeadline && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {daysUntilDeadline} days left
                </span>
              </div>
              {deadlineStatus && (
                <Badge className={`text-xs ${deadlineStatus.color}`}>
                  {deadlineStatus.status === 'urgent' ? 'Urgent' :
                   deadlineStatus.status === 'soon' ? 'Soon' : 'Open'}
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-[var(--eddura-primary-800)]">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link href={`/programs/${program._id}`}>
                <Button variant="outline" size="sm">
                  View Details
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
              
              <Button size="sm" className="bg-eddura-500 hover:bg-eddura-600 text-white shadow-eddura">
                Apply Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}