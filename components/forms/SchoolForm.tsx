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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus } from 'lucide-react';

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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">School Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'School name is required' })}
                placeholder="Enter school name"
                className="h-11"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                {...register('country', { required: 'Country is required' })}
                placeholder="Enter country"
                className="h-11"
              />
              {errors.country && (
                <p className="text-sm text-red-600">{errors.country.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                {...register('city', { required: 'City is required' })}
                placeholder="Enter city"
                className="h-11"
              />
              {errors.city && (
                <p className="text-sm text-red-600">{errors.city.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Campus Type</Label>
              <Select value={selectedCampusType} onValueChange={setSelectedCampusType}>
                <SelectTrigger className="h-11">
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

            <div className="space-y-2">
              <Label htmlFor="globalRanking">Global Ranking</Label>
              <Input
                id="globalRanking"
                type="number"
                min={0}
                {...register('globalRanking', { valueAsNumber: true })}
                placeholder="Enter ranking"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearFounded">Year Founded</Label>
              <Input
                id="yearFounded"
                type="number"
                min={0}
                {...register('yearFounded', { valueAsNumber: true })}
                placeholder="Enter year founded"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="internationalStudentCount">International Student Count</Label>
              <Input
                id="internationalStudentCount"
                type="number"
                min={0}
                {...register('internationalStudentCount', { valueAsNumber: true })}
                placeholder="Number of international students"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentFacultyRatio">Student Faculty Ratio</Label>
              <Input
                id="studentFacultyRatio"
                {...register('studentFacultyRatio')}
                placeholder="e.g., 15:1"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avgLivingCost">Average Living Cost (Annual)</Label>
              <Input
                id="avgLivingCost"
                type="number"
                min={0}
                {...register('avgLivingCost', { valueAsNumber: true })}
                placeholder="Annual living cost"
                className="h-11"
              />
            </div>

            <div className="flex items-center space-x-3 pt-8">
              <input
                type="checkbox"
                id="visaSupportServices"
                {...register('visaSupportServices')}
                className="w-4 h-4 rounded border-gray-300"
              />
              <Label htmlFor="visaSupportServices" className="text-sm font-medium">
                Visa Support Services Available
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                {...register('contactEmail')}
                placeholder="Enter contact email"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                {...register('contactPhone')}
                placeholder="Enter contact phone"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                {...register('websiteUrl')}
                placeholder="https://example.com"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="virtualTourLink">Virtual Tour Link</Label>
              <Input
                id="virtualTourLink"
                {...register('virtualTourLink')}
                placeholder="https://example.com/tour"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                {...register('logoUrl')}
                placeholder="https://example.com/logo.png"
                className="h-11"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Media Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Social Media Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                {...register('socialLinks.facebook')}
                placeholder="https://facebook.com/school"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                {...register('socialLinks.twitter')}
                placeholder="https://twitter.com/school"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                {...register('socialLinks.linkedin')}
                placeholder="https://linkedin.com/school/school"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube</Label>
              <Input
                id="youtube"
                {...register('socialLinks.youtube')}
                placeholder="https://youtube.com/school"
                className="h-11"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Arrays */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* School Types */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">School Types</Label>
            <div className="flex space-x-2">
              <Input
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                placeholder="Add school type (e.g., Public, Private)"
                className="h-10"
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
                size="sm"
                className="h-10 px-4"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {watchedTypes.map((type, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  {type}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeFromArray('types', type, watchedTypes)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Languages of Instruction */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Languages of Instruction</Label>
            <div className="flex space-x-2">
              <Input
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                placeholder="Add language (e.g., English, Spanish)"
                className="h-10"
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
                size="sm"
                className="h-10 px-4"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {watchedLanguages.map((language, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  {language}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeFromArray('languagesOfInstruction', language, watchedLanguages)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Housing Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Housing Options</Label>
            <div className="flex space-x-2">
              <Input
                value={newHousingOption}
                onChange={(e) => setNewHousingOption(e.target.value)}
                placeholder="Add housing option (e.g., On-campus dormitories)"
                className="h-10"
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
                size="sm"
                className="h-10 px-4"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {watchedHousing.map((option, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  {option}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeFromArray('housingOptions', option, watchedHousing)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Support Services */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Support Services</Label>
            <div className="flex space-x-2">
              <Input
                value={newSupportService}
                onChange={(e) => setNewSupportService(e.target.value)}
                placeholder="Add support service (e.g., Career counseling)"
                className="h-10"
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
                size="sm"
                className="h-10 px-4"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {watchedServices.map((service, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  {service}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeFromArray('supportServices', service, watchedServices)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Accreditation Bodies */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Accreditation Bodies</Label>
            <div className="flex space-x-2">
              <Input
                value={newAccreditation}
                onChange={(e) => setNewAccreditation(e.target.value)}
                placeholder="Add accreditation body (e.g., WASC, ABET)"
                className="h-10"
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
                size="sm"
                className="h-10 px-4"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {watchedAccreditations.map((accreditation, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  {accreditation}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeFromArray('accreditationBodies', accreditation, watchedAccreditations)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel} className="px-8">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="px-8">
          {isLoading ? 'Saving...' : school ? 'Update School' : 'Create School'}
        </Button>
      </div>
    </form>
  );
}