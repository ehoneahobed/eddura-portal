'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { School } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Info } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { Controller } from 'react-hook-form';
import { getNames as getCountryNames } from 'country-list';

interface SchoolFormProps {
  school?: School;
  onSubmit: (data: Partial<School>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function SchoolForm({ school, onSubmit, onCancel, isLoading }: SchoolFormProps) {
  const [selectedCampusType, setSelectedCampusType] = useState(school?.campusType || '');
  const [countrySearch, setCountrySearch] = useState('');
  const countryInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors }, watch, setValue, control } = useForm<School>({
    defaultValues: school || {
      name: '',
      country: '',
      city: '',
      types: [],
      contactEmails: [],
      contactPhones: [],
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
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const watchedTypes = watch('types') || [];
  const watchedLanguages = watch('languagesOfInstruction') || [];
  const watchedHousing = watch('housingOptions') || [];
  const watchedServices = watch('supportServices') || [];
  const watchedAccreditations = watch('accreditationBodies') || [];
  const watchedEmails = watch('contactEmails') || [];
  const watchedPhones = watch('contactPhones') || [];

  // Get country options from country-list
  const countryOptions = getCountryNames();

  // School types list (can be extended)
  const schoolTypeOptions = [
    'Public', 'Private', 'Charter', 'Religious', 'Vocational', 'International', 'Boarding', 'Online', 'Community College', 'Research University', 'Liberal Arts College', 'Technical Institute', 'Unknown'
  ];
  const [schoolTypeSearch, setSchoolTypeSearch] = useState('');
  const [customSchoolType, setCustomSchoolType] = useState('');
  // Years for dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1799 }, (_, i) => String(currentYear - i));

  // Short list of common languages
  const commonLanguages = [
    'English', 'French', 'Spanish', 'German', 'Mandarin', 'Arabic', 'Portuguese', 'Russian', 'Japanese', 'Hindi',
    'Italian', 'Korean', 'Dutch', 'Turkish', 'Swedish', 'Polish', 'Ukrainian', 'Greek', 'Czech', 'Finnish',
    'Danish', 'Norwegian', 'Hebrew', 'Hungarian', 'Romanian', 'Thai', 'Vietnamese', 'Indonesian', 'Malay', 'Swahili'
  ];
  const [languageSearch, setLanguageSearch] = useState('');
  const [customLanguage, setCustomLanguage] = useState('');

  // Short lists for housing options, support services, and accreditation bodies
  const housingOptionsList = [
    'On-campus Dormitory', 'Off-campus Apartment', 'Homestay', 'Student Hostel', 'Shared Housing', 'None', 'Other'
  ];
  const supportServicesList = [
    'Academic Advising', 'Career Counseling', 'Health Services', 'Disability Support', 'Financial Aid', 'Tutoring', 'Counseling', 'International Student Office', 'Language Support', 'Other'
  ];
  const accreditationBodiesList = [
    'ABET', 'AACSB', 'AMBA', 'EQUIS', 'MSCHE', 'NEASC', 'WASC', 'NAFSA', 'Other'
  ];
  const [housingSearch, setHousingSearch] = useState('');
  const [supportSearch, setSupportSearch] = useState('');
  const [accreditationSearch, setAccreditationSearch] = useState('');

  // Short list for campus facilities
  const campusFacilitiesList = [
    'Library', 'Gym', 'Laboratories', 'Health Center', 'Cafeteria', 'Sports Complex', 'Student Center', 'Computer Labs', 'Art Studio', 'Music Room', 'Auditorium', 'Chapel', 'Swimming Pool', 'Other'
  ];
  const [facilitySearch, setFacilitySearch] = useState('');
  // Short list for climate
  const climateList = [
    'Temperate', 'Tropical', 'Arid', 'Continental', 'Polar', 'Mediterranean', 'Monsoon', 'Oceanic', 'Other'
  ];
  // Short list for safety rating
  const safetyRatings = ['Very Safe', 'Safe', 'Moderate', 'Unsafe', 'Unknown'];
  // Short list for accessibility
  const accessibilityList = [
    'Fully Accessible', 'Partially Accessible', 'Not Accessible', 'Unknown', 'Other'
  ];
  // State for new fields
  const [climateSearch, setClimateSearch] = useState('');
  const [customClimate, setCustomClimate] = useState('');
  const [customAccessibility, setCustomAccessibility] = useState('');

  const addToArray = (field: keyof School, value: string, setter: (value: string) => void, currentArray: string[]) => {
    if (typeof value === 'string' && value.trim() && !(currentArray || []).includes(value.trim())) {
      const newArray = [...(currentArray || []), value.trim()];
      setValue(field, newArray as any);
      setter('');
    }
  };

  const removeFromArray = (field: keyof School, value: string, currentArray: string[]) => {
    const newArray = (currentArray || []).filter(item => item !== value);
    setValue(field, newArray as any);
  };

  const handleFormSubmit = (data: School) => {
    try {
      // Validate required fields
      if (!data.name || !data.country || !data.city) {
        throw new Error('Name, country, and city are required');
      }

      // Clean up array fields to remove empty strings
      const cleanData = {
        ...data,
        campusType: selectedCampusType as School['campusType'] || 'Unknown',
        types: (data.types || []).filter(t => t && t.trim()),
        contactEmails: (data.contactEmails || []).filter(e => e && e.trim()),
        contactPhones: (data.contactPhones || []).filter(p => p && p.trim()),
        languagesOfInstruction: (data.languagesOfInstruction || []).filter(l => l && l.trim()),
        housingOptions: (data.housingOptions || []).filter(h => h && h.trim()),
        supportServices: (data.supportServices || []).filter(s => s && s.trim()),
        accreditationBodies: (data.accreditationBodies || []).filter(a => a && a.trim()),
        campusFacilities: (data.campusFacilities || []).filter(f => f && f.trim()),
      };

      onSubmit(cleanData);
    } catch (error) {
      console.error('Form submission error:', error);
      // You could add toast notification here if needed
    }
  };

  // Auto-focus the search input when SelectContent is rendered
  useEffect(() => {
    if (countryInputRef.current) {
      countryInputRef.current.focus();
    }
  }, [countryInputRef, countrySearch]);

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
              <span className="ml-1 text-gray-400" title="The official name of the school."><Info className="inline w-4 h-4" /></span>
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
              <span className="ml-1 text-gray-400" title="The country where the school is located."><Info className="inline w-4 h-4" /></span>
              {/* Country dropdown using country-list and react-hook-form */}
              <Select
                value={watch('country')}
                onValueChange={val => setValue('country', val)}
                name="country"
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {/* Search input for filtering countries */}
                  <div className="px-2 py-2">
                    <Input
                      ref={countryInputRef}
                      value={countrySearch}
                      onChange={e => setCountrySearch(e.target.value)}
                      placeholder="Search country..."
                      className="h-9 mb-2"
                      onKeyDown={e => e.stopPropagation()} // Prevent Select from hijacking key events
                    />
                  </div>
                  {countryOptions
                    .filter((country: string) => country.toLowerCase().includes(countrySearch.toLowerCase()))
                    .map((country: string) => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.country && (
                <p className="text-sm text-red-600">{errors.country.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <span className="ml-1 text-gray-400" title="The city where the school is located."><Info className="inline w-4 h-4" /></span>
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
              <Label>Year Founded</Label>
              <span className="ml-1 text-gray-400" title="The year the school was founded."><Info className="inline w-4 h-4" /></span>
              <Select
                value={watch('yearFounded') ? String(watch('yearFounded')) : ''}
                onValueChange={val => setValue('yearFounded', val ? parseInt(val) : undefined)}
                name="yearFounded"
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            <div className="space-y-2">
              <Label>Acceptance Rate</Label>
              <span className="ml-1 text-gray-400" title="The percentage of applicants who are accepted (0-100). Leave blank if unknown."><Info className="inline w-4 h-4" /></span>
              <Input
                id="acceptanceRate"
                type="number"
                min={0}
                max={100}
                step={0.1}
                {...register('acceptanceRate', { valueAsNumber: true, min: 0, max: 100 })}
                placeholder="e.g. 45.5"
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
            {/* Emails */}
            <div className="space-y-2">
              <Label>Contact Emails</Label>
              <div className="flex space-x-2">
                <Input
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="Add email"
                  className="h-10"
                  type="email"
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArray('contactEmails', newEmail, setNewEmail, watchedEmails);
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => addToArray('contactEmails', newEmail, setNewEmail, watchedEmails)}
                  size="sm"
                  className="h-10 px-4"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {watchedEmails.map((email, idx) => (
                  <Badge key={idx} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                    {email}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-500"
                      onClick={() => removeFromArray('contactEmails', email, watchedEmails)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
            {/* Phones */}
            <div className="space-y-2">
              <Label>Contact Phones</Label>
              <div className="flex space-x-2">
                <Input
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  placeholder="Add phone number"
                  className="h-10"
                  type="tel"
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArray('contactPhones', newPhone, setNewPhone, watchedPhones);
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => addToArray('contactPhones', newPhone, setNewPhone, watchedPhones)}
                  size="sm"
                  className="h-10 px-4"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {watchedPhones.map((phone, idx) => (
                  <Badge key={idx} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                    {phone}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-500"
                      onClick={() => removeFromArray('contactPhones', phone, watchedPhones)}
                    />
                  </Badge>
                ))}
              </div>
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
            <Label className="text-sm font-medium">Type(s) of School</Label>
            <span className="ml-1 text-gray-400" title="Select all applicable types. You can add a custom type if not listed."><Info className="inline w-4 h-4" /></span>
            <div className="flex flex-wrap gap-2 mb-2">
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
            <Input
              value={schoolTypeSearch}
              onChange={e => setSchoolTypeSearch(e.target.value)}
              placeholder="Search or add type..."
              className="h-10 mb-2"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (schoolTypeOptions.some(opt => opt.toLowerCase() === schoolTypeSearch.toLowerCase())) {
                    addToArray('types', schoolTypeSearch, setSchoolTypeSearch, watchedTypes);
                  } else if (schoolTypeSearch.trim()) {
                    addToArray('types', schoolTypeSearch, setSchoolTypeSearch, watchedTypes);
                  }
                }
              }}
            />
            <div className="flex flex-wrap gap-2">
              {schoolTypeOptions
                .filter(opt => opt.toLowerCase().includes(schoolTypeSearch.toLowerCase()) && !watchedTypes.includes(opt))
                .map(opt => (
                  <Button
                    key={opt}
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mb-1"
                    onClick={() => addToArray('types', opt, setSchoolTypeSearch, watchedTypes)}
                  >
                    {opt}
                  </Button>
                ))}
            </div>
          </div>

          {/* Languages of Instruction */}
          <div className="space-y-3">
            <Label>Languages of Instruction</Label>
            <span className="ml-1 text-gray-400" title="Select all languages used for instruction. You can add a custom language if not listed."><Info className="inline w-4 h-4" /></span>
            <div className="flex flex-wrap gap-2 mb-2">
              {watchedLanguages.map((lang, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  {lang}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeFromArray('languagesOfInstruction', lang, watchedLanguages)}
                  />
                </Badge>
              ))}
            </div>
            <Input
              value={languageSearch}
              onChange={e => setLanguageSearch(e.target.value)}
              placeholder="Search or add language..."
              className="h-10 mb-2"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (commonLanguages.some(l => l.toLowerCase() === languageSearch.toLowerCase())) {
                    addToArray('languagesOfInstruction', languageSearch, setLanguageSearch, watchedLanguages);
                  } else if (languageSearch.trim()) {
                    addToArray('languagesOfInstruction', languageSearch, setLanguageSearch, watchedLanguages);
                  }
                }
              }}
            />
            <div className="flex flex-wrap gap-2">
              {commonLanguages
                .filter(l => l.toLowerCase().includes(languageSearch.toLowerCase()) && !watchedLanguages.includes(l))
                .map(l => (
                  <Button
                    key={l}
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mb-1"
                    onClick={() => addToArray('languagesOfInstruction', l, setLanguageSearch, watchedLanguages)}
                  >
                    {l}
                  </Button>
                ))}
            </div>
          </div>

          {/* Housing Options */}
          <div className="space-y-2">
            <Label>Housing Options</Label>
            <span className="ml-1 text-gray-400" title="Select all available housing options. You can add a custom option if not listed."><Info className="inline w-4 h-4" /></span>
            <div className="flex flex-wrap gap-2 mb-2">
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
            <Input
              value={housingSearch}
              onChange={e => setHousingSearch(e.target.value)}
              placeholder="Search or add housing option..."
              className="h-10 mb-2"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (housingOptionsList.some(opt => opt.toLowerCase() === housingSearch.toLowerCase())) {
                    addToArray('housingOptions', housingSearch, setHousingSearch, watchedHousing);
                  } else if (housingSearch.trim()) {
                    addToArray('housingOptions', housingSearch, setHousingSearch, watchedHousing);
                  }
                }
              }}
            />
            <div className="flex flex-wrap gap-2">
              {housingOptionsList
                .filter(opt => opt.toLowerCase().includes(housingSearch.toLowerCase()) && !watchedHousing.includes(opt))
                .map(opt => (
                  <Button
                    key={opt}
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mb-1"
                    onClick={() => addToArray('housingOptions', opt, setHousingSearch, watchedHousing)}
                  >
                    {opt}
                  </Button>
                ))}
            </div>
          </div>

          {/* Support Services */}
          <div className="space-y-2">
            <Label>Support Services</Label>
            <span className="ml-1 text-gray-400" title="Select all available support services. You can add a custom service if not listed."><Info className="inline w-4 h-4" /></span>
            <div className="flex flex-wrap gap-2 mb-2">
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
            <Input
              value={supportSearch}
              onChange={e => setSupportSearch(e.target.value)}
              placeholder="Search or add support service..."
              className="h-10 mb-2"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (supportServicesList.some(opt => opt.toLowerCase() === supportSearch.toLowerCase())) {
                    addToArray('supportServices', supportSearch, setSupportSearch, watchedServices);
                  } else if (supportSearch.trim()) {
                    addToArray('supportServices', supportSearch, setSupportSearch, watchedServices);
                  }
                }
              }}
            />
            <div className="flex flex-wrap gap-2">
              {supportServicesList
                .filter(opt => opt.toLowerCase().includes(supportSearch.toLowerCase()) && !watchedServices.includes(opt))
                .map(opt => (
                  <Button
                    key={opt}
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mb-1"
                    onClick={() => addToArray('supportServices', opt, setSupportSearch, watchedServices)}
                  >
                    {opt}
                  </Button>
                ))}
            </div>
          </div>

          {/* Accreditation Bodies */}
          <div className="space-y-2">
            <Label>Accreditation Bodies</Label>
            <span className="ml-1 text-gray-400" title="Select all accreditation bodies. You can add a custom body if not listed."><Info className="inline w-4 h-4" /></span>
            <div className="flex flex-wrap gap-2 mb-2">
              {watchedAccreditations.map((body, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  {body}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeFromArray('accreditationBodies', body, watchedAccreditations)}
                  />
                </Badge>
              ))}
            </div>
            <Input
              value={accreditationSearch}
              onChange={e => setAccreditationSearch(e.target.value)}
              placeholder="Search or add accreditation body..."
              className="h-10 mb-2"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (accreditationBodiesList.some(opt => opt.toLowerCase() === accreditationSearch.toLowerCase())) {
                    addToArray('accreditationBodies', accreditationSearch, setAccreditationSearch, watchedAccreditations);
                  } else if (accreditationSearch.trim()) {
                    addToArray('accreditationBodies', accreditationSearch, setAccreditationSearch, watchedAccreditations);
                  }
                }
              }}
            />
            <div className="flex flex-wrap gap-2">
              {accreditationBodiesList
                .filter(opt => opt.toLowerCase().includes(accreditationSearch.toLowerCase()) && !watchedAccreditations.includes(opt))
                .map(opt => (
                  <Button
                    key={opt}
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mb-1"
                    onClick={() => addToArray('accreditationBodies', opt, setAccreditationSearch, watchedAccreditations)}
                  >
                    {opt}
                  </Button>
                ))}
            </div>
          </div>

          {/* Campus Facilities */}
          <div className="space-y-2">
            <Label>Campus Facilities</Label>
            <span className="ml-1 text-gray-400" title="Select all available campus facilities. You can add a custom facility if not listed."><Info className="inline w-4 h-4" /></span>
            <div className="flex flex-wrap gap-2 mb-2">
              {(watch('campusFacilities') || []).map((facility: string, index: number) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  {facility}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeFromArray('campusFacilities', facility, watch('campusFacilities') || [])}
                  />
                </Badge>
              ))}
            </div>
            <Input
              value={facilitySearch}
              onChange={e => setFacilitySearch(e.target.value)}
              placeholder="Search or add facility..."
              className="h-10 mb-2"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (campusFacilitiesList.some(f => f.toLowerCase() === facilitySearch.toLowerCase())) {
                    addToArray('campusFacilities', facilitySearch, setFacilitySearch, watch('campusFacilities') || []);
                  } else if (facilitySearch.trim()) {
                    addToArray('campusFacilities', facilitySearch, setFacilitySearch, watch('campusFacilities') || []);
                  }
                }
              }}
            />
            <div className="flex flex-wrap gap-2">
              {campusFacilitiesList
                .filter(f => f.toLowerCase().includes(facilitySearch.toLowerCase()) && !(watch('campusFacilities') || []).includes(f))
                .map(f => (
                  <Button
                    key={f}
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mb-1"
                    onClick={() => addToArray('campusFacilities', f, setFacilitySearch, watch('campusFacilities') || [])}
                  >
                    {f}
                  </Button>
                ))}
            </div>
          </div>

          {/* Climate/Weather */}
          <div className="space-y-2">
            <Label>Climate/Weather</Label>
            <span className="ml-1 text-gray-400" title="General climate of the school's location."><Info className="inline w-4 h-4" /></span>
            <Select
              value={watch('climate') || ''}
              onValueChange={val => setValue('climate', val)}
              name="climate"
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select climate" />
              </SelectTrigger>
              <SelectContent>
                {climateList.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={customClimate}
              onChange={e => setCustomClimate(e.target.value)}
              placeholder="Add custom climate..."
              className="h-10 mt-2"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (customClimate.trim()) {
                    setValue('climate', customClimate);
                    setCustomClimate('');
                  }
                }
              }}
            />
          </div>

          {/* Safety/Crime Statistics */}
          <div className="space-y-2">
            <Label>Safety/Crime Statistics</Label>
            <span className="ml-1 text-gray-400" title="General safety rating and optional description or link to statistics."><Info className="inline w-4 h-4" /></span>
            <Select
              value={watch('safetyRating') || ''}
              onValueChange={val => setValue('safetyRating', val)}
              name="safetyRating"
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select safety rating" />
              </SelectTrigger>
              <SelectContent>
                {safetyRatings.map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              value={watch('safetyDescription') || ''}
              onChange={e => setValue('safetyDescription', e.target.value)}
              placeholder="Description or link to safety/crime statistics..."
              className="h-20 mt-2"
            />
          </div>

          {/* Internships/Co-op Opportunities */}
          <div className="space-y-2">
            <Label>Internships/Co-op Opportunities</Label>
            <span className="ml-1 text-gray-400" title="Are internships or co-op opportunities available? Optionally describe."><Info className="inline w-4 h-4" /></span>
            <Select
              value={typeof watch('internshipsAvailable') === 'boolean' ? String(watch('internshipsAvailable')) : (watch('internshipsAvailable') === undefined ? 'unknown' : '')}
              onValueChange={val => setValue('internshipsAvailable', val === 'true' ? true : val === 'false' ? false : undefined)}
              name="internshipsAvailable"
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              value={watch('internshipsDescription') || ''}
              onChange={e => setValue('internshipsDescription', e.target.value)}
              placeholder="Description or list of internship/co-op opportunities..."
              className="h-20 mt-2"
            />
          </div>

          {/* Career Services */}
          <div className="space-y-2">
            <Label>Career Services</Label>
            <span className="ml-1 text-gray-400" title="Are career services available? Optionally describe."><Info className="inline w-4 h-4" /></span>
            <Select
              value={typeof watch('careerServicesAvailable') === 'boolean' ? String(watch('careerServicesAvailable')) : (watch('careerServicesAvailable') === undefined ? 'unknown' : '')}
              onValueChange={val => setValue('careerServicesAvailable', val === 'true' ? true : val === 'false' ? false : undefined)}
              name="careerServicesAvailable"
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              value={watch('careerServicesDescription') || ''}
              onChange={e => setValue('careerServicesDescription', e.target.value)}
              placeholder="Description of career services..."
              className="h-20 mt-2"
            />
          </div>

          {/* Language Support */}
          <div className="space-y-2">
            <Label>Language Support</Label>
            <span className="ml-1 text-gray-400" title="Is language support available? Optionally describe."><Info className="inline w-4 h-4" /></span>
            <Select
              value={typeof watch('languageSupportAvailable') === 'boolean' ? String(watch('languageSupportAvailable')) : (watch('languageSupportAvailable') === undefined ? 'unknown' : '')}
              onValueChange={val => setValue('languageSupportAvailable', val === 'true' ? true : val === 'false' ? false : undefined)}
              name="languageSupportAvailable"
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              value={watch('languageSupportDescription') || ''}
              onChange={e => setValue('languageSupportDescription', e.target.value)}
              placeholder="Description of language support..."
              className="h-20 mt-2"
            />
          </div>

          {/* Student Diversity */}
          <div className="space-y-2">
            <Label>Student Diversity</Label>
            <span className="ml-1 text-gray-400" title="E.g., % international students, gender ratio, etc."><Info className="inline w-4 h-4" /></span>
            <Input
              value={watch('studentDiversity') || ''}
              onChange={e => setValue('studentDiversity', e.target.value)}
              placeholder="E.g., 20% international, 60% female, etc."
              className="h-10"
            />
          </div>

          {/* Accessibility */}
          <div className="space-y-2">
            <Label>Accessibility</Label>
            <span className="ml-1 text-gray-400" title="Is the campus accessible for students with disabilities? Optionally describe."><Info className="inline w-4 h-4" /></span>
            <Select
              value={watch('accessibility') || ''}
              onValueChange={val => setValue('accessibility', val)}
              name="accessibility"
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select accessibility" />
              </SelectTrigger>
              <SelectContent>
                {accessibilityList.map(a => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={customAccessibility}
              onChange={e => setCustomAccessibility(e.target.value)}
              placeholder="Add custom accessibility..."
              className="h-10 mt-2"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (customAccessibility.trim()) {
                    setValue('accessibility', customAccessibility);
                    setCustomAccessibility('');
                  }
                }
              }}
            />
            <Textarea
              value={watch('accessibilityDescription') || ''}
              onChange={e => setValue('accessibilityDescription', e.target.value)}
              placeholder="Description of accessibility services..."
              className="h-20 mt-2"
            />
          </div>

          {/* Transport/Location */}
          <div className="space-y-2">
            <Label>Transport/Location</Label>
            <span className="ml-1 text-gray-400" title="E.g., near metro, airport, city center, etc."><Info className="inline w-4 h-4" /></span>
            <Input
              value={watch('transportLocation') || ''}
              onChange={e => setValue('transportLocation', e.target.value)}
              placeholder="E.g., 10 min walk to metro, 30 min to airport, etc."
              className="h-10"
            />
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