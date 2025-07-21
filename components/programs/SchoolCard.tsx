import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building, Star, Users, Globe, ArrowRight } from 'lucide-react';
import Image from 'next/image';

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
  return (
    <Card
      className="cursor-pointer group h-full bg-white hover:bg-gray-50 transition-all duration-300 border-0 shadow-sm hover:shadow-xl hover:-translate-y-1"
      onClick={() => onSelect(school)}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          {/* School Logo */}
          <div className="flex-shrink-0">
            {school.logoUrl ? (
              <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-100 group-hover:border-blue-200 transition-colors shadow-sm">
                <Image
                  src={school.logoUrl}
                  alt={school.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <Building className="w-8 h-8 text-white" />
              </div>
            )}
          </div>

          {/* School Info */}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2 leading-tight">
              {school.name}
            </CardTitle>
            
            <CardDescription className="text-sm text-gray-600 flex items-center gap-1 mb-3">
              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{school.city}, {school.country}</span>
            </CardDescription>

            {/* Ranking Badge */}
            {school.globalRanking && (
              <Badge variant="secondary" className="text-xs font-medium bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors">
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
            <div className="flex items-center text-xs text-gray-500">
              <Building className="w-3 h-3 mr-2 flex-shrink-0" />
              <span>Founded {school.yearFounded}</span>
            </div>
          )}

          {/* International Students */}
          {school.internationalStudentCount && (
            <div className="flex items-center text-xs text-gray-500">
              <Users className="w-3 h-3 mr-2 flex-shrink-0" />
              <span>{school.internationalStudentCount.toLocaleString()} international students</span>
            </div>
          )}

          {/* Languages */}
          {school.languagesOfInstruction && school.languagesOfInstruction.length > 0 && (
            <div className="flex items-center text-xs text-gray-500">
              <Globe className="w-3 h-3 mr-2 flex-shrink-0" />
              <span className="truncate">
                {school.languagesOfInstruction.slice(0, 2).join(', ')}
                {school.languagesOfInstruction.length > 2 && ` +${school.languagesOfInstruction.length - 2} more`}
              </span>
            </div>
          )}

          {/* Campus Type */}
          {school.campusType && school.campusType !== 'Unknown' && (
            <Badge variant="outline" className="text-xs bg-gray-50">
              {school.campusType} Campus
            </Badge>
          )}
        </div>

        {/* Call to Action */}
        <div className="pt-3 border-t border-gray-100 group-hover:border-blue-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700 transition-colors">
              View Programs
            </span>
            <ArrowRight className="w-4 h-4 text-blue-600 group-hover:text-blue-700 transition-colors group-hover:translate-x-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SchoolCard; 