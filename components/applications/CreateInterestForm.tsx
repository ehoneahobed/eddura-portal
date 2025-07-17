'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Building, 
  ExternalLink, 
  ArrowLeft,
  Loader2,
  Target,
  Calendar,
  FileText,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Program {
  _id: string;
  name: string;
  degreeType: string;
  fieldOfStudy: string;
  schoolId: {
    _id: string;
    name: string;
    country: string;
    city: string;
  };
}

interface School {
  _id: string;
  name: string;
  country: string;
  city: string;
}

export default function CreateInterestForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [interestType, setInterestType] = useState<'program' | 'school' | 'external'>('program');
  const [searchTerm, setSearchTerm] = useState('');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [externalSchool, setExternalSchool] = useState('');
  const [externalProgram, setExternalProgram] = useState('');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [notes, setNotes] = useState('');
  const [requiresInterview, setRequiresInterview] = useState(false);
  const [interviewType, setInterviewType] = useState<'in-person' | 'virtual' | 'phone'>('in-person');

  const handleSearchPrograms = async (search: string) => {
    if (search.length < 2) return;
    
    try {
      const response = await fetch(`/api/programs?search=${encodeURIComponent(search)}`);
      if (response.ok) {
        const data = await response.json();
        setPrograms(data.programs || []);
      }
    } catch (error) {
      console.error('Error searching programs:', error);
    }
  };

  const handleSearchSchools = async (search: string) => {
    if (search.length < 2) return;
    
    try {
      const response = await fetch(`/api/schools?search=${encodeURIComponent(search)}`);
      if (response.ok) {
        const data = await response.json();
        setSchools(data.schools || []);
      }
    } catch (error) {
      console.error('Error searching schools:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const interestData: any = {
        priority,
        notes: notes || undefined,
        requiresInterview,
        interviewType: requiresInterview ? interviewType : undefined
      };

      if (interestType === 'program') {
        if (!selectedProgram) {
          toast.error('Please select a program');
          return;
        }
        interestData.programId = selectedProgram;
      } else if (interestType === 'school') {
        if (!selectedSchool) {
          toast.error('Please select a school');
          return;
        }
        interestData.schoolId = selectedSchool;
      } else if (interestType === 'external') {
        if (!externalSchool || !externalProgram) {
          toast.error('Please provide both school and program names');
          return;
        }
        interestData.schoolName = externalSchool;
        interestData.programName = externalProgram;
        interestData.applicationUrl = applicationUrl || undefined;
      }

      const response = await fetch('/api/user-interests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(interestData),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Interest created successfully!');
        router.push('/applications');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create interest');
      }
    } catch (error) {
      console.error('Error creating interest:', error);
      toast.error('Failed to create interest');
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Interest</h1>
          <p className="text-gray-600 mt-1">
            Track your interest in a program, school, or external institution
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Interest Details
          </CardTitle>
          <CardDescription>
            Choose the type of interest you want to add and provide the necessary details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Interest Type Selection */}
            <div className="space-y-4">
              <Label>Interest Type</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card 
                  className={`cursor-pointer transition-all ${
                    interestType === 'program' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setInterestType('program')}
                >
                  <CardContent className="p-4 text-center">
                    <GraduationCap className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <h3 className="font-medium">Program</h3>
                    <p className="text-sm text-gray-600">From our database</p>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`cursor-pointer transition-all ${
                    interestType === 'school' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setInterestType('school')}
                >
                  <CardContent className="p-4 text-center">
                    <Building className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <h3 className="font-medium">School</h3>
                    <p className="text-sm text-gray-600">From our database</p>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`cursor-pointer transition-all ${
                    interestType === 'external' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setInterestType('external')}
                >
                  <CardContent className="p-4 text-center">
                    <ExternalLink className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <h3 className="font-medium">External</h3>
                    <p className="text-sm text-gray-600">Not in our database</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Program Selection */}
            {interestType === 'program' && (
              <div className="space-y-4">
                <Label>Select Program</Label>
                <div className="space-y-2">
                  <Input
                    placeholder="Search for programs..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      handleSearchPrograms(e.target.value);
                    }}
                  />
                  {programs.length > 0 && (
                    <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
                      {programs.map((program) => (
                        <div
                          key={program._id}
                          className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                            selectedProgram === program._id ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                          onClick={() => setSelectedProgram(program._id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{program.name}</h4>
                              <p className="text-sm text-gray-600">
                                {program.degreeType} in {program.fieldOfStudy}
                              </p>
                              <p className="text-sm text-gray-500">
                                {program.schoolId.name}, {program.schoolId.city}, {program.schoolId.country}
                              </p>
                            </div>
                            {selectedProgram === program._id && (
                              <Badge className="bg-blue-100 text-blue-800">Selected</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* School Selection */}
            {interestType === 'school' && (
              <div className="space-y-4">
                <Label>Select School</Label>
                <div className="space-y-2">
                  <Input
                    placeholder="Search for schools..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      handleSearchSchools(e.target.value);
                    }}
                  />
                  {schools.length > 0 && (
                    <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
                      {schools.map((school) => (
                        <div
                          key={school._id}
                          className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                            selectedSchool === school._id ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                          onClick={() => setSelectedSchool(school._id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{school.name}</h4>
                              <p className="text-sm text-gray-600">
                                {school.city}, {school.country}
                              </p>
                            </div>
                            {selectedSchool === school._id && (
                              <Badge className="bg-blue-100 text-blue-800">Selected</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* External Institution */}
            {interestType === 'external' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="externalSchool">School Name</Label>
                    <Input
                      id="externalSchool"
                      placeholder="Enter school name"
                      value={externalSchool}
                      onChange={(e) => setExternalSchool(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="externalProgram">Program Name</Label>
                    <Input
                      id="externalProgram"
                      placeholder="Enter program name"
                      value={externalProgram}
                      onChange={(e) => setExternalProgram(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="applicationUrl">Application URL (Optional)</Label>
                  <Input
                    id="applicationUrl"
                    type="url"
                    placeholder="https://..."
                    value={applicationUrl}
                    onChange={(e) => setApplicationUrl(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Priority */}
            <div className="space-y-4">
              <Label>Priority Level</Label>
              <div className="flex gap-2">
                {(['high', 'medium', 'low'] as const).map((level) => (
                  <Badge
                    key={level}
                    className={`cursor-pointer ${
                      priority === level ? getPriorityColor(level) : 'bg-gray-100 text-gray-600'
                    }`}
                    onClick={() => setPriority(level)}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Interview Requirements */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="requiresInterview"
                  checked={requiresInterview}
                  onChange={(e) => setRequiresInterview(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="requiresInterview">Requires Interview</Label>
              </div>
              
              {requiresInterview && (
                <div>
                  <Label>Interview Type</Label>
                  <Select value={interviewType} onValueChange={(value: 'in-person' | 'virtual' | 'phone') => setInterviewType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-person">In-Person</SelectItem>
                      <SelectItem value="virtual">Virtual</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes about this interest..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Create Interest
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}