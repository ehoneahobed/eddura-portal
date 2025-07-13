'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Scholarship } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Info, Copy } from 'lucide-react';
import { getNames as getCountryNames } from 'country-list';
import CustomMultiSelect from '@/components/CustomMultiSelect';

interface ScholarshipFormProps {
  scholarship?: Scholarship;
  onSubmit: (data: Partial<Scholarship>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const popularCurrencies = [
  'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'ZAR', 'NGN', 'GHS', 'SGD', 'BRL', 'SEK', 'NOK', 'DKK', 'RUB', 'KRW', 'MXN', 'TRY', 'PLN', 'NZD', 'HKD', 'MYR', 'IDR', 'THB', 'SAR', 'AED', 'EGP', 'KES', 'TZS', 'UGX', 'MAD', 'XOF', 'XAF', 'UAH', 'CZK', 'HUF', 'ILS', 'PKR', 'BDT', 'PHP', 'COP', 'CLP', 'ARS', 'VND', 'LKR', 'QAR', 'OMR', 'BHD', 'KWD', 'JOD', 'DZD', 'TND', 'LBP', 'SDG', 'ETB', 'SOS', 'MZN', 'AOA', 'ZMW', 'BWP', 'MUR', 'SCR', 'MGA', 'MWK', 'BIF', 'RWF', 'CDF', 'GMD', 'SLL', 'GNF', 'XPF', 'FJD', 'PGK', 'TOP', 'WST', 'VUV', 'KZT', 'UZS', 'TJS', 'KGS', 'MNT', 'LAK', 'KHR', 'MMK', 'BND', 'BTN', 'NPR', 'AFN', 'IRR', 'IQD', 'YER', 'SYP', 'LYD', 'TMT', 'AZN', 'GEL', 'AMD', 'MDL', 'BYN', 'ISK', 'HRK', 'MKD', 'ALL', 'RON', 'BGN', 'SRD', 'GYD', 'TTD', 'JMD', 'BBD', 'BSD', 'BZD', 'KYD', 'XCD', 'TTD', 'HTG', 'DOP', 'HNL', 'NIO', 'PAB', 'PYG', 'UYU', 'BOB', 'PEN', 'GTQ', 'CRC', 'SVC', 'BMD', 'ANG', 'AWG', 'CUC', 'CUP', 'DZD', 'MAD', 'TND', 'SDG', 'SSP', 'DJF', 'SZL', 'LSL', 'NAD', 'ZWL', 'MRO', 'MRU', 'GHS', 'NGN', 'XOF', 'XAF', 'CFA', 'CVE', 'STD', 'STN', 'SHP', 'FKP', 'GIP', 'JEP', 'IMP', 'GGP', 'SPL', 'TVD', 'ZWD', 'ZWL', 'ZMW', 'ZAR', 'ZMK', 'YUN', 'YUD', 'YUM', 'YUG', 'YER', 'XTS', 'XXX', 'XUA', 'XSU', 'XRE', 'XPT', 'XPD', 'XPF', 'XOF', 'XDR', 'XCD', 'XBC', 'XBB', 'XBA', 'XAG', 'XAF', 'WST', 'VUV', 'VND', 'VEF', 'UZS', 'UYU', 'USD', 'UAH', 'TZS', 'TWD', 'TTD', 'TRY', 'TOP', 'TND', 'TMT', 'THB', 'SZL', 'SYP', 'SVC', 'STD', 'SRD', 'SOS', 'SLL', 'SGD', 'SEK', 'SDG', 'SCR', 'SAR', 'RWF', 'RUB', 'RON', 'QAR', 'PYG', 'PLN', 'PHP', 'PGK', 'PEN', 'PKR', 'OMR', 'NZD', 'NPR', 'NOK', 'NGN', 'NAD', 'MZN', 'MWK', 'MUR', 'MRO', 'MOP', 'MMK', 'MKD', 'MGA', 'MDL', 'MAD', 'LYD', 'LSL', 'LRD', 'LBP', 'LAK', 'KZT', 'KWD', 'KRW', 'KMF', 'KES', 'JOD', 'JPY', 'JMD', 'ISK', 'IQD', 'INR', 'ILS', 'IDR', 'HUF', 'HTG', 'HRK', 'HNL', 'HKD', 'GYD', 'GTQ', 'GNF', 'GMD', 'GEL', 'FJD', 'ETB', 'ERN', 'EGP', 'DZD', 'DOP', 'DKK', 'DJF', 'CZK', 'CVE', 'CUP', 'CRC', 'COP', 'CNY', 'CLP', 'CHF', 'CDF', 'BZD', 'BWP', 'BTN', 'BSD', 'BRL', 'BND', 'BMD', 'BIF', 'BGN', 'BDT', 'BBD', 'AZN', 'AWG', 'AUD', 'ARS', 'AOA', 'ANG', 'ALL', 'AFN'
];

const awardUsageOptions = ['Tuition', 'Living Expenses', 'Travel', 'Books', 'Accommodation', 'Other'];
const regionOptions = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania', 'Middle East', 'Other'];

export default function ScholarshipForm({ scholarship, onSubmit, onCancel, isLoading }: ScholarshipFormProps) {
  const [selectedFrequency, setSelectedFrequency] = useState(scholarship?.frequency || '');
  const [valueType, setValueType] = useState<'number' | 'text'>(
    typeof scholarship?.value === 'number' ? 'number' : 'text'
  );
  const [bulkCountriesInput, setBulkCountriesInput] = useState('');
  const [bulkNationalitiesInput, setBulkNationalitiesInput] = useState('');

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<Scholarship>({
    defaultValues: scholarship || {
      title: '',
      scholarshipDetails: '',
      provider: '',
      coverage: [],
      value: '',
      currency: 'USD',
      frequency: 'Annual',
      deadline: '',
      startDate: '',
      applicationLink: '',
      tags: [],
      eligibility: {
        nationalities: [],
        genders: [],
        degreeLevels: [],
        fieldsOfStudy: [],
        countryResidency: []
      },
      applicationRequirements: {
        documentsToSubmit: []
      },
      selectionCriteria: []
    }
  });

  const [newCoverage, setNewCoverage] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newNationality, setNewNationality] = useState('');
  const [newDegreeLevel, setNewDegreeLevel] = useState('');
  const [newFieldOfStudy, setNewFieldOfStudy] = useState('');
  const [newCountryResidency, setNewCountryResidency] = useState('');
  const [newDocument, setNewDocument] = useState('');
  const [newSelectionCriteria, setNewSelectionCriteria] = useState('');

  const watchedCoverage = watch('coverage') || [];
  const watchedTags = watch('tags') || [];
  const watchedNationalities = watch('eligibility.nationalities') || [];
  const watchedDegreeLevels = watch('eligibility.degreeLevels') || [];
  const watchedFieldsOfStudy = watch('eligibility.fieldsOfStudy') || [];
  const watchedCountryResidency = watch('eligibility.countryResidency') || [];
  const watchedDocuments = watch('applicationRequirements.documentsToSubmit') || [];
  const watchedSelectionCriteria = watch('selectionCriteria') || [];

  const addToArray = (field: string, value: string, setter: (value: string) => void, currentArray: string[]) => {
    if (value.trim() && !currentArray.includes(value.trim())) {
      const fieldPath = field.split('.');
      if (fieldPath.length === 1) {
        setValue(field as keyof Scholarship, [...currentArray, value.trim()] as any);
      } else {
        const [parent, child] = fieldPath;
        setValue(`${parent}.${child}` as any, [...currentArray, value.trim()]);
      }
      setter('');
    }
  };

  const removeFromArray = (field: string, value: string, currentArray: string[]) => {
    const fieldPath = field.split('.');
    if (fieldPath.length === 1) {
      setValue(field as keyof Scholarship, currentArray.filter(item => item !== value) as any);
    } else {
      const [parent, child] = fieldPath;
      setValue(`${parent}.${child}` as any, currentArray.filter(item => item !== value));
    }
  };

  const handleBulkCountriesSubmit = () => {
    if (bulkCountriesInput.trim()) {
      // Split by common delimiters and clean up
      const countries = bulkCountriesInput
        .split(/[,;\n\r]+/)
        .map(country => country.trim())
        .filter(country => country.length > 0);
      
      // Add each country to the existing list
      countries.forEach(country => {
        if (!watchedCountryResidency.includes(country)) {
          addToArray('eligibility.countryResidency', country, setNewCountryResidency, watchedCountryResidency);
        }
      });
      
      setBulkCountriesInput('');
    }
  };

  const handleBulkNationalitiesSubmit = () => {
    if (bulkNationalitiesInput.trim()) {
      // Split by common delimiters and clean up
      const nationalities = bulkNationalitiesInput
        .split(/[,;\n\r]+/)
        .map(nationality => nationality.trim())
        .filter(nationality => nationality.length > 0);
      
      // Add each nationality to the existing list
      nationalities.forEach(nationality => {
        if (!watchedNationalities.includes(nationality)) {
          addToArray('eligibility.nationalities', nationality, setNewNationality, watchedNationalities);
        }
      });
      
      setBulkNationalitiesInput('');
    }
  };

  const handleFormSubmit = (data: Scholarship) => {
    // Validate required fields that aren't handled by react-hook-form
    if (!selectedFrequency) {
      // Don't submit if frequency is not selected
      return;
    }

    if (watchedCoverage.length === 0) {
      // Don't submit if no coverage items
      return;
    }

    // Convert value to appropriate type
    let processedValue: number | string | undefined = data.value;
    if (valueType === 'number' && typeof data.value === 'string') {
      processedValue = data.value ? parseFloat(data.value) : undefined;
    } else if (typeof data.value === 'string' && data.value.trim() === '') {
      // Convert empty strings to undefined for optional field
      processedValue = undefined;
    }
    
    onSubmit({
      ...data,
      value: processedValue,
      frequency: selectedFrequency as Scholarship['frequency']
    });
  };

  // Get country options from country-list
  const countryOptions = getCountryNames();

  // Handle value type switching
  const handleValueTypeChange = (newType: 'number' | 'text') => {
    setValueType(newType);
    // Clear the value when switching types to avoid confusion
    setValue('value', '');
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register('title', { required: 'Title is required' })}
              placeholder="Enter scholarship title"
              className="h-11"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="scholarshipDetails">Scholarship Details *</Label>
            <Textarea
              id="scholarshipDetails"
              {...register('scholarshipDetails', { required: 'Scholarship details are required' })}
              placeholder="Detailed description of the scholarship program"
              rows={4}
              className="resize-y min-h-[80px]"
            />
            {errors.scholarshipDetails && (
              <p className="text-sm text-red-600">{errors.scholarshipDetails.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="provider">Provider *</Label>
              <Input
                id="provider"
                {...register('provider', { required: 'Provider is required' })}
                placeholder="Enter provider name"
                className="h-11"
              />
              {errors.provider && (
                <p className="text-sm text-red-600">{errors.provider.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedSchool">Linked School</Label>
              <Input
                id="linkedSchool"
                {...register('linkedSchool')}
                placeholder="School name (if applicable)"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Value (Optional)</Label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    id="value"
                    type={valueType}
                    {...register('value', { 
                      valueAsNumber: valueType === 'number'
                    })}
                    placeholder={valueType === 'number' ? '0' : 'e.g., Full coverage, Variable, $10,000'}
                    className="h-11"
                  />
                </div>
                <Select value={valueType} onValueChange={(val: 'number' | 'text') => handleValueTypeChange(val)}>
                  <SelectTrigger className="w-24 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-gray-500">
                {valueType === 'number' 
                  ? 'Enter a specific amount' 
                  : 'Enter descriptive text (e.g., "Full coverage", "Variable", "Up to $10,000")'
                }
              </p>
              {errors.value && (
                <p className="text-sm text-red-600">{errors.value.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={watch('currency')}
                onValueChange={val => setValue('currency', val)}
                disabled={valueType === 'text'}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {popularCurrencies
                    .filter(cur => cur !== watch('currency'))
                    .map((cur) => (
                      <SelectItem key={cur} value={cur}>{cur}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {valueType === 'text' && (
                <p className="text-xs text-gray-500">Currency not applicable for text values</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Frequency *</Label>
              <Select value={selectedFrequency} onValueChange={setSelectedFrequency}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="One-time">One-time</SelectItem>
                  <SelectItem value="Annual">Annual</SelectItem>
                  <SelectItem value="Full Duration">Full Duration</SelectItem>
                </SelectContent>
              </Select>
              {!selectedFrequency && (
                <p className="text-sm text-red-600">Frequency is required</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfAwardsPerYear">Awards Per Year</Label>
              <Input
                id="numberOfAwardsPerYear"
                type="number"
                min={0}
                {...register('numberOfAwardsPerYear', { valueAsNumber: true })}
                placeholder="Awards per year"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Application Start Date</Label>
              <Input
                id="startDate"
                type="date"
                {...register('startDate')}
                className="h-11"
              />
              <p className="text-xs text-gray-500">When applications open (optional)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Application Deadline *</Label>
              <Input
                id="deadline"
                type="date"
                {...register('deadline', { required: 'Deadline is required' })}
                className="h-11"
              />
              {errors.deadline && (
                <p className="text-sm text-red-600">{errors.deadline.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="applicationLink">Application Link *</Label>
              <Input
                id="applicationLink"
                {...register('applicationLink', { 
                  required: 'Application link is required',
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'Please enter a valid URL starting with http:// or https://'
                  }
                })}
                placeholder="https://example.com/apply"
                className="h-11"
              />
              {errors.applicationLink && (
                <p className="text-sm text-red-600">{errors.applicationLink.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coverage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Coverage & Benefits *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Coverage *</Label>
            <div className="flex space-x-2">
              <Input
                value={newCoverage}
                onChange={(e) => setNewCoverage(e.target.value)}
                placeholder="Add coverage item (e.g., Full tuition)"
                className="h-10"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray('coverage', newCoverage, setNewCoverage, watchedCoverage);
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => addToArray('coverage', newCoverage, setNewCoverage, watchedCoverage)}
                size="sm"
                className="h-10 px-4"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {watchedCoverage.map((item, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  {item}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeFromArray('coverage', item, watchedCoverage)}
                  />
                </Badge>
              ))}
            </div>
            {watchedCoverage.length === 0 && (
              <p className="text-sm text-red-600">At least one coverage item is required</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Eligibility */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Eligibility Criteria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="minGPA">Minimum GPA</Label>
              <Input
                id="minGPA"
                type="number"
                min={0}
                max={4}
                step={0.01}
                {...register('eligibility.minGPA', { valueAsNumber: true })}
                placeholder="Minimum GPA"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ageLimit">Age Limit</Label>
              <Input
                id="ageLimit"
                {...register('eligibility.ageLimit')}
                placeholder="e.g., 18-25 years"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="incomeStatus">Income Status</Label>
              <Input
                id="incomeStatus"
                {...register('eligibility.incomeStatus')}
                placeholder="e.g., Need-based, Merit-based"
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalCriteria">Additional Criteria</Label>
            <Textarea
              id="additionalCriteria"
              {...register('eligibility.additionalCriteria')}
              placeholder="Any additional eligibility requirements"
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Nationalities */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Eligible Nationalities</Label>
            
            {/* Bulk Input Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-gray-600">Bulk Input (Copy & Paste)</Label>
                <Info className="h-3 w-3 text-gray-400" />
              </div>
              <div className="flex space-x-2">
                <Textarea
                  value={bulkNationalitiesInput}
                  onChange={(e) => setBulkNationalitiesInput(e.target.value)}
                  placeholder="Paste nationalities here (separated by commas, semicolons, or new lines)&#10;Example:&#10;United States, Canada, United Kingdom&#10;Germany; France; Italy"
                  rows={3}
                  className="resize-none text-sm"
                />
                <Button
                  type="button"
                  onClick={handleBulkNationalitiesSubmit}
                  size="sm"
                  className="h-10 px-4 self-start"
                  disabled={!bulkNationalitiesInput.trim()}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Paste multiple nationalities from the scholarships page. They will be automatically separated and added.
              </p>
            </div>

            {/* Individual Nationality Selection */}
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Add Individual Nationalities</Label>
              <Select
                value=""
                onValueChange={val => {
                  if (val && !watchedNationalities.includes(val)) {
                    addToArray('eligibility.nationalities', val, setNewNationality, watchedNationalities);
                  }
                }}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Add nationality" />
                </SelectTrigger>
                <SelectContent>
                  {countryOptions.map((country: string) => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Display Selected Nationalities */}
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Selected Nationalities ({watchedNationalities.length})</Label>
              <div className="flex flex-wrap gap-2">
                {watchedNationalities.map((item, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                    {item}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-500"
                      onClick={() => removeFromArray('eligibility.nationalities', item, watchedNationalities)}
                    />
                  </Badge>
                ))}
                {watchedNationalities.length === 0 && (
                  <p className="text-sm text-gray-400 italic">No nationalities selected</p>
                )}
              </div>
            </div>
          </div>

          {/* Degree Levels */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Eligible Degree Levels</Label>
            <div className="flex space-x-2">
              <Input
                value={newDegreeLevel}
                onChange={(e) => setNewDegreeLevel(e.target.value)}
                placeholder="Add degree level"
                className="h-10"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray('eligibility.degreeLevels', newDegreeLevel, setNewDegreeLevel, watchedDegreeLevels);
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => addToArray('eligibility.degreeLevels', newDegreeLevel, setNewDegreeLevel, watchedDegreeLevels)}
                size="sm"
                className="h-10 px-4"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {watchedDegreeLevels.map((item, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  {item}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeFromArray('eligibility.degreeLevels', item, watchedDegreeLevels)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Country Residency */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Eligible Country Residency</Label>
            
            {/* Bulk Input Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-gray-600">Bulk Input (Copy & Paste)</Label>
                <Info className="h-3 w-3 text-gray-400" />
              </div>
              <div className="flex space-x-2">
                <Textarea
                  value={bulkCountriesInput}
                  onChange={(e) => setBulkCountriesInput(e.target.value)}
                  placeholder="Paste countries here (separated by commas, semicolons, or new lines)&#10;Example:&#10;United States, Canada, United Kingdom&#10;Germany; France; Italy"
                  rows={3}
                  className="resize-none text-sm"
                />
                <Button
                  type="button"
                  onClick={handleBulkCountriesSubmit}
                  size="sm"
                  className="h-10 px-4 self-start"
                  disabled={!bulkCountriesInput.trim()}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Paste multiple countries from the scholarships page. They will be automatically separated and added.
              </p>
            </div>

            {/* Individual Country Selection */}
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Add Individual Countries</Label>
              <Select
                value=""
                onValueChange={val => {
                  if (val && !watchedCountryResidency.includes(val)) {
                    addToArray('eligibility.countryResidency', val, setNewCountryResidency, watchedCountryResidency);
                  }
                }}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Add country" />
                </SelectTrigger>
                <SelectContent>
                  {countryOptions.map((country: string) => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Display Selected Countries */}
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Selected Countries ({watchedCountryResidency.length})</Label>
              <div className="flex flex-wrap gap-2">
                {watchedCountryResidency.map((item, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                    {item}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-500"
                      onClick={() => removeFromArray('eligibility.countryResidency', item, watchedCountryResidency)}
                    />
                  </Badge>
                ))}
                {watchedCountryResidency.length === 0 && (
                  <p className="text-sm text-gray-400 italic">No countries selected</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Application Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="recommendationLetters">Recommendation Letters</Label>
              <Input
                id="recommendationLetters"
                type="number"
                min={0}
                {...register('applicationRequirements.recommendationLetters', { valueAsNumber: true })}
                placeholder="Recommendation letters"
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirementsDescription">Requirements Description</Label>
            <Textarea
              id="requirementsDescription"
              {...register('applicationRequirements.requirementsDescription')}
              placeholder="Detailed description of application requirements"
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Documents to Submit */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Documents to Submit</Label>
            <div className="flex space-x-2">
              <Input
                value={newDocument}
                onChange={(e) => setNewDocument(e.target.value)}
                placeholder="Add required document"
                className="h-10"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray('applicationRequirements.documentsToSubmit', newDocument, setNewDocument, watchedDocuments);
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => addToArray('applicationRequirements.documentsToSubmit', newDocument, setNewDocument, watchedDocuments)}
                size="sm"
                className="h-10 px-4"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {watchedDocuments.map((item, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  {item}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeFromArray('applicationRequirements.documentsToSubmit', item, watchedDocuments)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selection & Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Selection & Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selection Criteria */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Selection Criteria</Label>
            <div className="flex space-x-2">
              <Input
                value={newSelectionCriteria}
                onChange={(e) => setNewSelectionCriteria(e.target.value)}
                placeholder="Add selection criteria"
                className="h-10"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray('selectionCriteria', newSelectionCriteria, setNewSelectionCriteria, watchedSelectionCriteria);
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => addToArray('selectionCriteria', newSelectionCriteria, setNewSelectionCriteria, watchedSelectionCriteria)}
                size="sm"
                className="h-10 px-4"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {watchedSelectionCriteria.map((item, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  {item}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeFromArray('selectionCriteria', item, watchedSelectionCriteria)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tags</Label>
            <div className="flex space-x-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag"
                className="h-10"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray('tags', newTag, setNewTag, watchedTags);
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => addToArray('tags', newTag, setNewTag, watchedTags)}
                size="sm"
                className="h-10 px-4"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {watchedTags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeFromArray('tags', tag, watchedTags)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="renewalConditions">Renewal Conditions</Label>
              <Textarea
                id="renewalConditions"
                {...register('renewalConditions')}
                placeholder="Conditions for scholarship renewal"
                rows={2}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="decisionTimeline">Decision Timeline</Label>
              <Input
                id="decisionTimeline"
                {...register('decisionTimeline')}
                placeholder="e.g., 3-4 months"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vectorId">Vector ID</Label>
              <Input
                id="vectorId"
                {...register('vectorId')}
                placeholder="Unique vector identifier"
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Additional notes or comments"
              rows={3}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Award Details Section */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Award Details</h3>
        <Label>Award Usage <span title="What the scholarship funds can be used for."><Info className="inline w-4 h-4 text-gray-400" /></span></Label>
        <CustomMultiSelect
          options={awardUsageOptions}
          value={watch('awardUsage') || []}
          onChange={(val: string[]) => setValue('awardUsage', val)}
          placeholder="Select or type usage..."
          allowCustom
        />
      </section>

      {/* Contact Section */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
        <Label>Email</Label>
        <Input type="email" {...register('contactInfo.email')} placeholder="Contact email" />
        <Label>Phone</Label>
        <Input type="tel" {...register('contactInfo.phone')} placeholder="Contact phone" />
      </section>

      {/* Application Process Section */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Application Process</h3>
        <Label>Application Method <span title="How to apply (e.g., online, mail, through school)"><Info className="inline w-4 h-4 text-gray-400" /></span></Label>
        <Input {...register('applicationMethod')} placeholder="e.g., Online, Mail, Through School" />
        <Label>Selection Process <span title="How recipients are selected (e.g., interview, test, document review)"><Info className="inline w-4 h-4 text-gray-400" /></span></Label>
        <Input {...register('selectionProcess')} placeholder="e.g., Interview, Document Review" />
        <Label>Notification Method <span title="How applicants are notified (e.g., email, portal, mail)"><Info className="inline w-4 h-4 text-gray-400" /></span></Label>
        <Input {...register('notificationMethod')} placeholder="e.g., Email, Portal, Mail" />
        <Label>Deferral Policy <span title="Can the award be deferred if admission is postponed?"><Info className="inline w-4 h-4 text-gray-400" /></span></Label>
        <Input {...register('deferralPolicy')} placeholder="e.g., Can be deferred for 1 year" />
        <Label>Disbursement Details <span title="How and when the award is paid out."><Info className="inline w-4 h-4 text-gray-400" /></span></Label>
        <Textarea {...register('disbursementDetails')} placeholder="Describe how the award is paid out..." rows={2} style={{ resize: 'vertical' }} />
      </section>

      {/* Info & Links Section */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Info & Links</h3>
        <Label>Official Info Page</Label>
        <Input type="url" {...register('infoPage')} placeholder="https://..." />
        <Label>FAQ/Help Link</Label>
        <Input type="url" {...register('faqLink')} placeholder="https://..." />
      </section>

      {/* Eligibility Regions Section */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Eligible Regions</h3>
        <CustomMultiSelect
          options={regionOptions}
          value={watch('eligibleRegions') || []}
          onChange={(val: string[]) => setValue('eligibleRegions', val)}
          placeholder="Select or type region..."
          allowCustom
        />
      </section>

      {/* Past Recipients Section */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Past Recipients / Testimonials</h3>
        <Textarea {...register('pastRecipients')} placeholder="Share stories, stats, or testimonials about previous recipients..." rows={2} style={{ resize: 'vertical' }} />
      </section>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel} className="px-8">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="px-8">
          {isLoading ? 'Saving...' : scholarship ? 'Update Scholarship' : 'Create Scholarship'}
        </Button>
      </div>
    </form>
  );
}