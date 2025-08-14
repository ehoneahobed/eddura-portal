import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building, Star, Users, Globe, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { usePageTranslation } from '@/hooks/useTranslation';

interface School {
  _id: string;
  name: string;
  country: string;
  city: string;
  globalRanking?: number;
  logoUrl?: string;
  yearFounded?: number;
  internationalStudentCount?: number;
  languagesOfInstruction?: string[];
  campusType?: string;
}

interface SchoolCardProps {
  school: School;
  onSelect: (school: School) => void;
}

/**
 * Enhanced SchoolCard displays comprehensive school information
 * with improved visual design and hover effects.
 */
const SchoolCard: React.FC<SchoolCardProps> = ({ school, onSelect }) => {
  const { t } = usePageTranslation('programs');
  return (
    <Card
      className="cursor-pointer group h-full bg-white dark:bg-[var(--eddura-primary-900)] transition-all duration-300 border border-[var(--eddura-primary-100)] dark:border-[var(--eddura-primary-800)] shadow-[0_4px_14px_rgba(25,103,117,0.08)] hover:shadow-[0_16px_34px_rgba(25,103,117,0.18)] hover:-translate-y-1"
      onClick={() => onSelect(school)}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          {/* School Logo */}
          <div className="flex-shrink-0">
            {school.logoUrl ? (
              <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-[var(--eddura-primary-100)] group-hover:border-[var(--eddura-primary-200)] dark:border-[var(--eddura-primary-800)] dark:group-hover:border-[var(--eddura-primary-700)] transition-colors shadow-sm">
                <Image
                  src={school.logoUrl}
                  alt={school.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-teal flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <Building className="w-8 h-8 text-white" />
              </div>
            )}
          </div>

          {/* School Info */}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-eddura-600 dark:group-hover:text-eddura-300 transition-colors line-clamp-2 mb-2 leading-tight">
              {school.name}
            </CardTitle>
            
            <CardDescription className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1 mb-3">
              <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <span className="truncate">{school.city}, {school.country}</span>
            </CardDescription>

            {/* Ranking Badge */}
            {school.globalRanking && (
              <Badge
                variant="secondary"
                className="text-xs font-medium bg-[var(--eddura-primary-50)] text-[var(--eddura-primary-700)] border-[var(--eddura-primary-200)] hover:bg-[var(--eddura-primary-100)] dark:bg-[var(--eddura-primary-800)] dark:text-[var(--eddura-primary-200)] dark:border-[var(--eddura-primary-700)] transition-colors"
              >
                <Star className="w-3 h-3 mr-1" />
                #{school.globalRanking} Global
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Additional School Details */}
        <div className="space-y-3 mb-4">
          {/* Founded Year */}
          {school.yearFounded && (
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Building className="w-3 h-3 mr-2 flex-shrink-0" />
                <span>{t('school.founded', { year: school.yearFounded })}</span>
            </div>
          )}

          {/* International Students */}
          {school.internationalStudentCount && (
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Users className="w-3 h-3 mr-2 flex-shrink-0" />
                <span>{t('school.internationalStudents', { count: school.internationalStudentCount.toLocaleString() })}</span>
            </div>
          )}

          {/* Languages */}
          {school.languagesOfInstruction && school.languagesOfInstruction.length > 0 && (
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Globe className="w-3 h-3 mr-2 flex-shrink-0" />
              <span className="truncate">
                {school.languagesOfInstruction.slice(0, 2).join(', ')}
                {school.languagesOfInstruction.length > 2 && ` +${school.languagesOfInstruction.length - 2} ${t('school.more')}`}
              </span>
            </div>
          )}

          {/* Campus Type */}
          {school.campusType && school.campusType !== 'Unknown' && (
            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200 dark:bg-[var(--eddura-primary-800)] dark:text-[var(--eddura-primary-200)] dark:border-[var(--eddura-primary-700)]">
              {t('school.campusType', { type: school.campusType })}
            </Badge>
          )}
        </div>

        {/* Call to Action */}
        <div className="pt-3 border-t border-gray-100 dark:border-[var(--eddura-primary-800)] group-hover:border-[var(--eddura-primary-200)] dark:group-hover:border-[var(--eddura-primary-700)] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-eddura-600 dark:text-eddura-300 group-hover:text-eddura-700 dark:group-hover:text-eddura-200 transition-colors">{t('school.viewPrograms')}</span>
            <ArrowRight className="w-4 h-4 text-eddura-600 dark:text-eddura-300 group-hover:text-eddura-700 dark:group-hover:text-eddura-200 transition-colors group-hover:translate-x-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SchoolCard; 