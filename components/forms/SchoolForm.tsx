'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { School } from '@/types';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface SchoolFormProps {
  school?: School;
  onSubmit: (data: Partial<School>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function SchoolForm({ school, onSubmit, onCancel, isLoading }: SchoolFormProps) {
  const [selectedCampusType, setSelectedCampusType] = useState(school?.campusType || '');

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<School>({
    defaultValues: school || {
      name: '',
      country: '',
      city: '',
      types: [],
      contactEmail: '',
      contactPhone: '',
      websiteUrl: '',
      languagesOfInstruction: [],
      housingOptions: [],
      supportServices: [],
      accreditationBodies: [],
      socialLinks: {
        facebook: '',
        twitter: '',
        linkedin: '',
        youtube: ''
      }
    }
  });

  const [newType, setNewType] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newHousingOption, setNewHousingOption] = useState('');
  const [newSupportService, setNewSupportService] = useState('');
  const [newAccreditation, setNewAccreditation] = useState('');

  const watchedTypes = watch('types') || [];
  const watchedLanguages = watch('languagesOfInstruction') || [];
  const watchedHousing = watch('housingOptions') || [];
  const watchedServices = watch('supportServices') || [];
  const watchedAccreditations = watch('accreditationBodies') || [];

  const addToArray = (field: keyof School, value: string, setter: (value: string) => void, currentArray: string[]) => {
    if (value.trim() && !currentArray.includes(value.trim())) {
      setValue(field, [...currentArray, value.trim()] as any);
      setter('');
    }
  };

  const removeFromArray = (field: keyof School, value: string, currentArray: string[]) => {
    setValue(field, currentArray.filter(item => item !== value) as any);
  };

  const handleFormSubmit = (data: School) => {
    onSubmit({
      ...data,
      campusType: selectedCampusType as School['campusType']
    });
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">School Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'School name is required' })}
                placeholder="Enter school name"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                {...register('country', { required: 'Country is required' })}
                placeholder="Enter country"
              />
              {errors.country && (
                <p className="text-sm text-red-600 mt-1">{errors.country.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                {...register('city', { required: 'City is required' })}
                placeholder="Enter city"
              />
              {errors.city && (
                <p className="text-sm text-red-600 mt-1">{errors.city.message}</p>
              )}
            </div>

            <div>
              <Label>Campus Type</Label>
              <Select value={selectedCampusType} onValueChange={setSelectedCampusType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select campus type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Urban">Urban</SelectItem>
                  <SelectItem value="Suburban">Suburban</SelectItem>
                  <SelectItem value="Rural">Rural</SelectItem>
                  <SelectItem value="Unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="globalRanking">Global Ranking</Label>
              <Input
                id="globalRanking"
                type="number"
                {...register('globalRanking', { valueAsNumber: true })}
                placeholder="Enter ranking"
              />
            </div>

            <div>
              <Label htmlFor="yearFounded">Year Founded</Label>
              <Input
                id="yearFounded"
                type="number"
                {...register('yearFounded', { valueAsNumber: true })}
                placeholder="Enter year founded"
              />
            </div>

            <div>
              <Label htmlFor="internationalStudentCount">International Student Count</Label>
              <Input
                id="internationalStudentCount"
                type="number"
                {...register('internationalStudentCount', { valueAsNumber: true })}
                placeholder="Number of international students"
              />
            </div>

            <div>
              <Label htmlFor="studentFacultyRatio">Student Faculty Ratio</Label>
              <Input
                id="studentFacultyRatio"
                {...register('studentFacultyRatio')}
                placeholder="e.g., 15:1"
              />
            </div>

            <div>
              <Label htmlFor="avgLivingCost">Average Living Cost</Label>
              <Input
                id="avgLivingCost"
                type="number"
                {...register('avgLivingCost', { valueAsNumber: true })}
                placeholder="Annual living cost"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="visaSupportServices"
                {...register('visaSupportServices')}
                className="rounded border-gray-300"
              />
              <Label htmlFor="visaSupportServices">Visa Support Services</Label>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                {...register('contactEmail')}
                placeholder="Enter contact email"
              />
            </div>

            <div>
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                {...register('contactPhone')}
                placeholder="Enter contact phone"
              />
            </div>

            <div>
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                {...register('websiteUrl')}
                placeholder="https://example.com"
              />
            </div>

            <div>
              <Label htmlFor="virtualTourLink">Virtual Tour Link</Label>
              <Input
                id="virtualTourLink"
                {...register('virtualTourLink')}
                placeholder="https://example.com/tour"
              />
            </div>

            <div>
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                {...register('logoUrl')}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Social Media Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                {...register('socialLinks.facebook')}
                placeholder="https://facebook.com/school"
              />
            </div>

            <div>
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                {...register('socialLinks.twitter')}
                placeholder="https://twitter.com/school"
              />
            </div>

            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                {...register('socialLinks.linkedin')}
                placeholder="https://linkedin.com/school/school"
              />
            </div>

            <div>
              <Label htmlFor="youtube">YouTube</Label>
              <Input
                id="youtube"
                {...register('socialLinks.youtube')}
                placeholder="https://youtube.com/school"
              />
            </div>
          </div>
        </div>

        {/* School Types */}
        <div>
          <Label>School Types</Label>
          <div className="flex space-x-2 mt-1">
            <Input
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              placeholder="Add school type"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToArray('types', newType, setNewType, watchedTypes);
                }
              }}
            />
            <Button
              type="button"
              onClick={() => addToArray('types', newType, setNewType, watchedTypes)}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {watchedTypes.map((type, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {type}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFromArray('types', type, watchedTypes)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Languages of Instruction */}
        <div>
          <Label>Languages of Instruction</Label>
          <div className="flex space-x-2 mt-1">
            <Input
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              placeholder="Add language"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToArray('languagesOfInstruction', newLanguage, setNewLanguage, watchedLanguages);
                }
              }}
            />
            <Button
              type="button"
              onClick={() => addToArray('languagesOfInstruction', newLanguage, setNewLanguage, watchedLanguages)}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {watchedLanguages.map((language, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {language}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFromArray('languagesOfInstruction', language, watchedLanguages)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Housing Options */}
        <div>
          <Label>Housing Options</Label>
          <div className="flex space-x-2 mt-1">
            <Input
              value={newHousingOption}
              onChange={(e) => setNewHousingOption(e.target.value)}
              placeholder="Add housing option"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToArray('housingOptions', newHousingOption, setNewHousingOption, watchedHousing);
                }
              }}
            />
            <Button
              type="button"
              onClick={() => addToArray('housingOptions', newHousingOption, setNewHousingOption, watchedHousing)}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {watchedHousing.map((option, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {option}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFromArray('housingOptions', option, watchedHousing)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Support Services */}
        <div>
          <Label>Support Services</Label>
          <div className="flex space-x-2 mt-1">
            <Input
              value={newSupportService}
              onChange={(e) => setNewSupportService(e.target.value)}
              placeholder="Add support service"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToArray('supportServices', newSupportService, setNewSupportService, watchedServices);
                }
              }}
            />
            <Button
              type="button"
              onClick={() => addToArray('supportServices', newSupportService, setNewSupportService, watchedServices)}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {watchedServices.map((service, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {service}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFromArray('supportServices', service, watchedServices)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Accreditation Bodies */}
        <div>
          <Label>Accreditation Bodies</Label>
          <div className="flex space-x-2 mt-1">
            <Input
              value={newAccreditation}
              onChange={(e) => setNewAccreditation(e.target.value)}
              placeholder="Add accreditation body"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToArray('accreditationBodies', newAccreditation, setNewAccreditation, watchedAccreditations);
                }
              }}
            />
            <Button
              type="button"
              onClick={() => addToArray('accreditationBodies', newAccreditation, setNewAccreditation, watchedAccreditations)}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {watchedAccreditations.map((accreditation, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {accreditation}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFromArray('accreditationBodies', accreditation, watchedAccreditations)}
                />
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : school ? 'Update School' : 'Create School'}
          </Button>
        </div>
      </form>
    </div>
  );
}