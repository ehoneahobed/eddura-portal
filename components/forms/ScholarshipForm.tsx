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
import { X } from 'lucide-react';

interface ScholarshipFormProps {
  scholarship?: Scholarship;
  onSubmit: (data: Partial<Scholarship>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ScholarshipForm({ scholarship, onSubmit, onCancel, isLoading }: ScholarshipFormProps) {
  const [selectedFrequency, setSelectedFrequency] = useState(scholarship?.frequency || '');

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<Scholarship>({
    defaultValues: scholarship || {
      title: '',
      scholarshipDetails: '',
      provider: '',
      coverage: [],
      value: 0,
      currency: 'USD',
      frequency: 'Annual',
      deadline: '',
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

  const handleFormSubmit = (data: Scholarship) => {
    onSubmit({
      ...data,
      frequency: selectedFrequency as Scholarship['frequency']
    });
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register('title', { required: 'Title is required' })}
                placeholder="Enter scholarship title"
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="scholarshipDetails">Scholarship Details *</Label>
              <Textarea
                id="scholarshipDetails"
                {...register('scholarshipDetails', { required: 'Scholarship details are required' })}
                placeholder="Detailed description of the scholarship program"
                rows={4}
              />
              {errors.scholarshipDetails && (
                <p className="text-sm text-red-600 mt-1">{errors.scholarshipDetails.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="provider">Provider *</Label>
              <Input
                id="provider"
                {...register('provider', { required: 'Provider is required' })}
                placeholder="Enter provider name"
              />
              {errors.provider && (
                <p className="text-sm text-red-600 mt-1">{errors.provider.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="linkedSchool">Linked School</Label>
              <Input
                id="linkedSchool"
                {...register('linkedSchool')}
                placeholder="School name (if applicable)"
              />
            </div>

            <div>
              <Label htmlFor="value">Value *</Label>
              <Input
                id="value"
                type="number"
                {...register('value', { required: 'Value is required', valueAsNumber: true })}
                placeholder="0"
              />
              {errors.value && (
                <p className="text-sm text-red-600 mt-1">{errors.value.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                {...register('currency')}
                placeholder="USD"
              />
            </div>

            <div>
              <Label>Frequency *</Label>
              <Select value={selectedFrequency} onValueChange={setSelectedFrequency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="One-time">One-time</SelectItem>
                  <SelectItem value="Annual">Annual</SelectItem>
                  <SelectItem value="Full Duration">Full Duration</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="numberOfAwardsPerYear">Awards Per Year</Label>
              <Input
                id="numberOfAwardsPerYear"
                type="number"
                {...register('numberOfAwardsPerYear', { valueAsNumber: true })}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="deadline">Application Deadline *</Label>
              <Input
                id="deadline"
                type="date"
                {...register('deadline', { required: 'Deadline is required' })}
              />
              {errors.deadline && (
                <p className="text-sm text-red-600 mt-1">{errors.deadline.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="applicationLink">Application Link *</Label>
              <Input
                id="applicationLink"
                {...register('applicationLink', { required: 'Application link is required' })}
                placeholder="https://example.com/apply"
              />
              {errors.applicationLink && (
                <p className="text-sm text-red-600 mt-1">{errors.applicationLink.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Coverage */}
        <div>
          <Label>Coverage</Label>
          <div className="flex space-x-2 mt-1">
            <Input
              value={newCoverage}
              onChange={(e) => setNewCoverage(e.target.value)}
              placeholder="Add coverage item"
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
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {watchedCoverage.map((item, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {item}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFromArray('coverage', item, watchedCoverage)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Eligibility */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Eligibility Criteria</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minGPA">Minimum GPA</Label>
              <Input
                id="minGPA"
                type="number"
                step="0.1"
                {...register('eligibility.minGPA', { valueAsNumber: true })}
                placeholder="3.0"
              />
            </div>

            <div>
              <Label htmlFor="ageLimit">Age Limit</Label>
              <Input
                id="ageLimit"
                {...register('eligibility.ageLimit')}
                placeholder="e.g., 18-25 years"
              />
            </div>

            <div>
              <Label htmlFor="incomeStatus">Income Status</Label>
              <Input
                id="incomeStatus"
                {...register('eligibility.incomeStatus')}
                placeholder="e.g., Need-based, Merit-based"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="additionalCriteria">Additional Criteria</Label>
              <Textarea
                id="additionalCriteria"
                {...register('eligibility.additionalCriteria')}
                placeholder="Any additional eligibility requirements"
                rows={2}
              />
            </div>
          </div>

          {/* Nationalities */}
          <div>
            <Label>Eligible Nationalities</Label>
            <div className="flex space-x-2 mt-1">
              <Input
                value={newNationality}
                onChange={(e) => setNewNationality(e.target.value)}
                placeholder="Add nationality"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray('eligibility.nationalities', newNationality, setNewNationality, watchedNationalities);
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => addToArray('eligibility.nationalities', newNationality, setNewNationality, watchedNationalities)}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {watchedNationalities.map((item, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {item}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFromArray('eligibility.nationalities', item, watchedNationalities)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Degree Levels */}
          <div>
            <Label>Eligible Degree Levels</Label>
            <div className="flex space-x-2 mt-1">
              <Input
                value={newDegreeLevel}
                onChange={(e) => setNewDegreeLevel(e.target.value)}
                placeholder="Add degree level"
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
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {watchedDegreeLevels.map((item, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {item}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFromArray('eligibility.degreeLevels', item, watchedDegreeLevels)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Application Requirements */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Application Requirements</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="recommendationLetters">Recommendation Letters</Label>
              <Input
                id="recommendationLetters"
                type="number"
                {...register('applicationRequirements.recommendationLetters', { valueAsNumber: true })}
                placeholder="0"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="requirementsDescription">Requirements Description</Label>
              <Textarea
                id="requirementsDescription"
                {...register('applicationRequirements.requirementsDescription')}
                placeholder="Detailed description of application requirements"
                rows={3}
              />
            </div>
          </div>

          {/* Documents to Submit */}
          <div>
            <Label>Documents to Submit</Label>
            <div className="flex space-x-2 mt-1">
              <Input
                value={newDocument}
                onChange={(e) => setNewDocument(e.target.value)}
                placeholder="Add required document"
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
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {watchedDocuments.map((item, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {item}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFromArray('applicationRequirements.documentsToSubmit', item, watchedDocuments)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Selection Criteria */}
        <div>
          <Label>Selection Criteria</Label>
          <div className="flex space-x-2 mt-1">
            <Input
              value={newSelectionCriteria}
              onChange={(e) => setNewSelectionCriteria(e.target.value)}
              placeholder="Add selection criteria"
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
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {watchedSelectionCriteria.map((item, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {item}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFromArray('selectionCriteria', item, watchedSelectionCriteria)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <Label>Tags</Label>
          <div className="flex space-x-2 mt-1">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add tag"
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
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {watchedTags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {tag}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFromArray('tags', tag, watchedTags)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="renewalConditions">Renewal Conditions</Label>
              <Textarea
                id="renewalConditions"
                {...register('renewalConditions')}
                placeholder="Conditions for scholarship renewal"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="decisionTimeline">Decision Timeline</Label>
              <Input
                id="decisionTimeline"
                {...register('decisionTimeline')}
                placeholder="e.g., 3-4 months"
              />
            </div>

            <div>
              <Label htmlFor="vectorId">Vector ID</Label>
              <Input
                id="vectorId"
                {...register('vectorId')}
                placeholder="Unique vector identifier"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Additional notes or comments"
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : scholarship ? 'Update Scholarship' : 'Create Scholarship'}
          </Button>
        </div>
      </form>
    </div>
  );
}