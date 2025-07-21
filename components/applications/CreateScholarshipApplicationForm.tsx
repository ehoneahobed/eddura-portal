'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, DollarSign, Calendar, FileText, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Scholarship {
  _id: string;
  name: string;
  amount: number;
  deadline: string;
  requirements: string[];
  description: string;
  eligibilityCriteria: string[];
}

interface ApplicationPackage {
  _id: string;
  name: string;
  type: string;
}

interface CreateScholarshipApplicationFormProps {
  userId: string;
}

export default function CreateScholarshipApplicationForm({ userId }: CreateScholarshipApplicationFormProps) {
  const router = useRouter();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [applicationPackages, setApplicationPackages] = useState<ApplicationPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [requiresInterview, setRequiresInterview] = useState(false);
  const [notes, setNotes] = useState('');
  const [formResponses, setFormResponses] = useState<Array<{ questionId: string; answer: string; attachments?: string[] }>>([]);

  useEffect(() => {
    fetchScholarships();
    fetchApplicationPackages();
  }, []);

  const fetchScholarships = async () => {
    try {
      const response = await fetch('/api/scholarships');
      if (response.ok) {
        const data = await response.json();
        setScholarships(data.scholarships || []);
      }
    } catch (error) {
      console.error('Error fetching scholarships:', error);
    }
  };

  const fetchApplicationPackages = async () => {
    try {
      const response = await fetch('/api/application-packages');
      if (response.ok) {
        const data = await response.json();
        setApplicationPackages(data.applicationPackages || []);
      }
    } catch (error) {
      console.error('Error fetching application packages:', error);
    }
  };

  const filteredScholarships = scholarships.filter(scholarship =>
    scholarship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scholarship.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleScholarshipSelect = (scholarship: Scholarship) => {
    setSelectedScholarship(scholarship);
    setSearchTerm('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedScholarship) {
      toast.error('Please select a scholarship');
      return;
    }

    setLoading(true);

    try {
      const applicationData = {
        scholarshipId: selectedScholarship._id,
        applicationPackageId: selectedPackage || undefined,
        requiresInterview,
        notes: notes || undefined,
        formResponses: formResponses.length > 0 ? formResponses : undefined
      };

      const response = await fetch('/api/scholarship-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData)
      });

      if (response.ok) {
        toast.success('Scholarship application created successfully');
        router.push('/applications/scholarships');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create application');
      }
    } catch (error) {
      toast.error('Error creating application');
    } finally {
      setLoading(false);
    }
  };

  const addFormResponse = () => {
    setFormResponses([...formResponses, { questionId: '', answer: '' }]);
  };

  const updateFormResponse = (index: number, field: 'questionId' | 'answer', value: string) => {
    const updated = [...formResponses];
    updated[index][field] = value;
    setFormResponses(updated);
  };

  const removeFormResponse = (index: number) => {
    setFormResponses(formResponses.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Create Scholarship Application</h1>
        <p className="text-gray-600 mt-2">Start a new scholarship application and track your progress</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Scholarship Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Select Scholarship
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedScholarship ? (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search scholarships..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {filteredScholarships.map((scholarship) => (
                    <Card
                      key={scholarship._id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleScholarshipSelect(scholarship)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{scholarship.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{scholarship.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                {scholarship.amount.toLocaleString()} USD
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(scholarship.deadline).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <Badge variant="secondary">
                            {scholarship.requirements.length} requirements
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedScholarship.name}</h3>
                    <p className="text-gray-600 mt-1">{selectedScholarship.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {selectedScholarship.amount.toLocaleString()} USD
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Deadline: {new Date(selectedScholarship.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedScholarship(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {selectedScholarship.requirements.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Requirements:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {selectedScholarship.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Package Link */}
        {applicationPackages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Link Application Package (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an application package to link" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No package linked</SelectItem>
                  {applicationPackages.map((pkg) => (
                    <SelectItem key={pkg._id} value={pkg._id}>
                      {pkg.name} ({pkg.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-600 mt-2">
                Linking an application package will help organize related documents and track progress.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Interview Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Interview Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="requiresInterview"
                checked={requiresInterview}
                onCheckedChange={(checked) => setRequiresInterview(checked as boolean)}
              />
              <Label htmlFor="requiresInterview">
                This scholarship requires an interview
              </Label>
            </div>
            {requiresInterview && (
              <p className="text-sm text-gray-600 mt-2">
                You'll be able to schedule the interview after creating the application.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Form Responses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Application Form Responses
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFormResponse}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Response
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {formResponses.length === 0 ? (
              <p className="text-gray-600 text-center py-4">
                No form responses added yet. Add responses if the scholarship has specific questions.
              </p>
            ) : (
              <div className="space-y-4">
                {formResponses.map((response, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Response {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFormResponse(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div>
                      <Label htmlFor={`question-${index}`}>Question</Label>
                      <Input
                        id={`question-${index}`}
                        value={response.questionId}
                        onChange={(e) => updateFormResponse(index, 'questionId', e.target.value)}
                        placeholder="Enter the question"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`answer-${index}`}>Answer</Label>
                      <Textarea
                        id={`answer-${index}`}
                        value={response.answer}
                        onChange={(e) => updateFormResponse(index, 'answer', e.target.value)}
                        placeholder="Enter your answer"
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes about this application..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !selectedScholarship}
          >
            {loading ? 'Creating...' : 'Create Application'}
          </Button>
        </div>
      </form>
    </div>
  );
}