'use client';

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Award } from 'lucide-react';
import { useScholarships } from '@/hooks/use-scholarships';

interface SearchableScholarshipSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function SearchableScholarshipSelect({
  value,
  onValueChange,
  placeholder = "Select a scholarship",
  disabled = false,
  className
}: SearchableScholarshipSelectProps) {
  const [scholarshipSearch, setScholarshipSearch] = useState('');

  const { scholarships, isLoading } = useScholarships({
    page: 1,
    limit: 100
  });

  // Filter scholarships based on search
  const filteredScholarships = scholarships.filter(scholarship =>
    scholarship.title.toLowerCase().includes(scholarshipSearch.toLowerCase()) ||
    scholarship.provider.toLowerCase().includes(scholarshipSearch.toLowerCase()) ||
    scholarship.scholarshipDetails.toLowerCase().includes(scholarshipSearch.toLowerCase())
  );

  return (
    <Select 
      value={value} 
      onValueChange={onValueChange}
      disabled={disabled || isLoading}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <div className="px-2 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              value={scholarshipSearch}
              onChange={(e) => setScholarshipSearch(e.target.value)}
              placeholder="Search scholarships..."
              className="pl-10 h-9 mb-2"
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="px-2 py-4 text-center text-gray-500">
            Loading scholarships...
          </div>
        ) : filteredScholarships.length === 0 ? (
          <div className="px-2 py-4 text-center text-gray-500">
            {scholarshipSearch ? 'No scholarships found matching your search' : 'No scholarships available'}
          </div>
        ) : (
          filteredScholarships.map((scholarship) => (
            <SelectItem key={scholarship.id} value={scholarship.id}>
              <div className="flex flex-col">
                <div className="font-medium text-sm">{scholarship.title}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {scholarship.provider}
                </div>
                {scholarship.value && (
                  <div className="text-xs text-green-600 font-medium">
                    {typeof scholarship.value === 'number' 
                      ? `${scholarship.currency || 'USD'} ${scholarship.value.toLocaleString()}`
                      : scholarship.value
                    }
                  </div>
                )}
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
} 