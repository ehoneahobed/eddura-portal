'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { countries } from '@/utils/countries';
import { academicFields } from '@/utils/fields';
import { usePageTranslation } from '@/hooks/useTranslation';

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
  const { t } = usePageTranslation('scholarships');
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-[var(--eddura-primary-900)] dark:text-white">
      {/* Frequency */}
      <div>
        <Label htmlFor="frequency" className="text-sm font-medium text-[var(--eddura-primary-800)] dark:text-[var(--eddura-primary-200)]">
          {t('filters.frequency.label')}
        </Label>
        <Select value={filters.frequency} onValueChange={(value) => updateFilter('frequency', value)}>
          <SelectTrigger className="mt-1 border-gray-200 dark:border-[var(--eddura-primary-700)] bg-white text-gray-700 dark:bg-[var(--eddura-primary-900)] dark:text-white">
            <SelectValue placeholder={t('filters.frequency.placeholder')} />
          </SelectTrigger>
          <SelectContent className="bg-white text-gray-900 border-gray-200 dark:bg-[var(--eddura-primary-900)] dark:text-white dark:border-[var(--eddura-primary-700)]">
            <SelectItem value="all">{t('filters.frequency.allTypes')}</SelectItem>
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
        <Label htmlFor="minGPA" className="text-sm font-medium text-[var(--eddura-primary-800)] dark:text-[var(--eddura-primary-200)]">
          {t('filters.minGPA')}
        </Label>
        <Input
          type="number"
          step="0.1"
          min="0"
          max="4"
          placeholder={t('filters.minGPAPlaceholder')}
          value={filters.minGPA}
          onChange={(e) => updateFilter('minGPA', e.target.value)}
          className="mt-1 bg-white dark:bg-[var(--eddura-primary-900)] border-[var(--eddura-primary-200)] dark:border-[var(--eddura-primary-700)]"
        />
      </div>

      {/* Application Requirements */}
      <div className="md:col-span-2 lg:col-span-4">
        <Label className="text-sm font-medium text-[var(--eddura-primary-800)] dark:text-[var(--eddura-primary-200)] mb-2 block">
          {t('filters.requirements')}
        </Label>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasEssay"
              checked={filters.hasEssay}
              onCheckedChange={(checked) => updateFilter('hasEssay', checked as boolean)}
            />
            <Label htmlFor="hasEssay" className="text-sm text-[var(--eddura-primary-700)] dark:text-[var(--eddura-primary-300)]">
              {t('filters.requiresEssay')}
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasCV"
              checked={filters.hasCV}
              onCheckedChange={(checked) => updateFilter('hasCV', checked as boolean)}
            />
            <Label htmlFor="hasCV" className="text-sm text-[var(--eddura-primary-700)] dark:text-[var(--eddura-primary-300)]">
              {t('filters.requiresCV')}
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasRecommendations"
              checked={filters.hasRecommendations}
              onCheckedChange={(checked) => updateFilter('hasRecommendations', checked as boolean)}
            />
            <Label htmlFor="hasRecommendations" className="text-sm text-[var(--eddura-primary-700)] dark:text-[var(--eddura-primary-300)]">
              {t('filters.requiresRecommendations')}
            </Label>
          </div>
        </div>
      </div>

      {/* Location Filter */}
      <div className="md:col-span-2">
        <Label className="text-sm font-medium text-[var(--eddura-primary-800)] dark:text-[var(--eddura-primary-200)] mb-2 block">
          {t('filters.locations')}
        </Label>
        <div className="space-y-2">
          <Select
            value=""
            onValueChange={(value) => addToArray('locations', value)}
          >
            <SelectTrigger className="h-10 border-gray-200 bg-white text-gray-700 dark:border-[var(--eddura-primary-700)] dark:bg-[var(--eddura-primary-900)] dark:text-white">
              <SelectValue placeholder={t('filters.selectCountries')} />
            </SelectTrigger>
            <SelectContent className="bg-white text-gray-900 border-gray-200 dark:bg-[var(--eddura-primary-900)] dark:text-white dark:border-[var(--eddura-primary-700)]">
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex flex-wrap gap-2">
            {filters.locations.map((location, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-[var(--eddura-primary-800)] text-gray-800 dark:text-[var(--eddura-primary-200)]">
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
        <Label className="text-sm font-medium text-[var(--eddura-primary-800)] dark:text-[var(--eddura-primary-200)] mb-2 block">
          {t('filters.academicDisciplines')}
        </Label>
        <div className="space-y-2">
          <Select
            value=""
            onValueChange={(value) => addToArray('disciplines', value)}
          >
            <SelectTrigger className="h-10 border-gray-200 bg-white text-gray-700 dark:border-[var(--eddura-primary-700)] dark:bg-[var(--eddura-primary-900)] dark:text-white">
              <SelectValue placeholder={t('filters.selectDisciplines')} />
            </SelectTrigger>
            <SelectContent className="bg-white text-gray-900 border-gray-200 dark:bg-[var(--eddura-primary-900)] dark:text-white dark:border-[var(--eddura-primary-700)]">
              {academicFields.map((field) => (
                <SelectItem key={field} value={field}>
                  {field}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex flex-wrap gap-2">
            {filters.disciplines.map((discipline, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-[var(--eddura-primary-800)] text-gray-800 dark:text-[var(--eddura-primary-200)]">
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