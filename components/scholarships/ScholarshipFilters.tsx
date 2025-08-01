'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { countries } from '@/utils/countries';
import { academicFields } from '@/utils/fields';

interface Filters {
  frequency: string;
  minGPA: string;
  hasEssay: boolean;
  hasCV: boolean;
  hasRecommendations: boolean;
  locations: string[];
  disciplines: string[];
}

interface ScholarshipFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export default function ScholarshipFilters({ filters, onFiltersChange }: ScholarshipFiltersProps) {
  const updateFilter = (key: keyof Filters, value: string | boolean | string[]) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const addToArray = (key: 'locations' | 'disciplines', value: string) => {
    if (value && !filters[key].includes(value)) {
      updateFilter(key, [...filters[key], value]);
    }
  };

  const removeFromArray = (key: 'locations' | 'disciplines', value: string) => {
    updateFilter(key, filters[key].filter(item => item !== value));
  };

  const frequencies = [
    'One-time',
    'Annual',
    'Full Duration'
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Frequency */}
      <div>
        <Label htmlFor="frequency" className="text-sm font-medium text-gray-700">
          Frequency
        </Label>
        <Select value={filters.frequency} onValueChange={(value) => updateFilter('frequency', value)}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {frequencies.map((freq) => (
              <SelectItem key={freq} value={freq}>
                {freq}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Min GPA */}
      <div>
        <Label htmlFor="minGPA" className="text-sm font-medium text-gray-700">
          Min GPA
        </Label>
        <Input
          type="number"
          step="0.1"
          min="0"
          max="4"
          placeholder="e.g., 3.5"
          value={filters.minGPA}
          onChange={(e) => updateFilter('minGPA', e.target.value)}
          className="mt-1"
        />
      </div>

      {/* Application Requirements */}
      <div className="md:col-span-2 lg:col-span-4">
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Application Requirements
        </Label>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasEssay"
              checked={filters.hasEssay}
              onCheckedChange={(checked) => updateFilter('hasEssay', checked as boolean)}
            />
            <Label htmlFor="hasEssay" className="text-sm text-gray-600">
              Requires Essay
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasCV"
              checked={filters.hasCV}
              onCheckedChange={(checked) => updateFilter('hasCV', checked as boolean)}
            />
            <Label htmlFor="hasCV" className="text-sm text-gray-600">
              Requires CV
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasRecommendations"
              checked={filters.hasRecommendations}
              onCheckedChange={(checked) => updateFilter('hasRecommendations', checked as boolean)}
            />
            <Label htmlFor="hasRecommendations" className="text-sm text-gray-600">
              Requires Recommendations
            </Label>
          </div>
        </div>
      </div>

      {/* Location Filter */}
      <div className="md:col-span-2">
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Available Locations
        </Label>
        <div className="space-y-2">
          <Select
            value=""
            onValueChange={(value) => addToArray('locations', value)}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select countries" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex flex-wrap gap-2">
            {filters.locations.map((location, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                {location}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-500"
                  onClick={() => removeFromArray('locations', location)}
                />
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Discipline Filter */}
      <div className="md:col-span-2">
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Academic Disciplines
        </Label>
        <div className="space-y-2">
          <Select
            value=""
            onValueChange={(value) => addToArray('disciplines', value)}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select disciplines" />
            </SelectTrigger>
            <SelectContent>
              {academicFields.map((field) => (
                <SelectItem key={field} value={field}>
                  {field}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex flex-wrap gap-2">
            {filters.disciplines.map((discipline, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                {discipline}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-500"
                  onClick={() => removeFromArray('disciplines', discipline)}
                />
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}