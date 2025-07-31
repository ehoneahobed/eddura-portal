'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CalendarIcon, Wand2, Users, Loader2, Info, Mail, Building, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';
import SearchableRecipientSelect from '@/components/recommendations/SearchableRecipientSelect';

interface Recipient {
  _id: string;
  name: string;
  emails: string[];
  primaryEmail: string;
  title: string;
  institution: string;
  department?: string;
  prefersDrafts: boolean;
}

interface RecommendationRequest {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  status: 'pending' | 'sent' | 'received' | 'overdue' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  recipientId: Recipient;
  createdAt: string;
  sentAt?: string;
  receivedAt?: string;
  purpose: string;
  relationshipContext: string;
  additionalContext?: string;
  requestType: string;
  submissionMethod: string;
  communicationStyle: string;
  institutionName?: string;
  schoolEmail?: string;
  schoolInstructions?: string;
  includeDraft: boolean;
  draftContent?: string;
  reminderIntervals: number[];
}

export default function EditRecommendationPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [includeDraft, setIncludeDraft] = useState(false);

  const [formData, setFormData] = useState({
    recipientId: '',
    title: '',
    description: '',
    priority: 'medium',
    purpose: '',
    highlights: '',
    relationship: '',
    customInstructions: '',
    reminderIntervals: [7, 3, 1],
    requestType: 'direct_platform',
    submissionMethod: 'platform_only',
    communicationStyle: 'polite',
    relationshipContext: '',
    additionalContext: '',
    institutionName: '',
    schoolEmail: '',
    schoolInstructions: '',
  });

  const fetchRequest = useCallback(async () => {
    try {
      const response = await fetch(`/api/recommendations/requests/${params.id}`);
      const data = await response.json();
      if (response.ok) {
        const request = data.request;
        setFormData({
          recipientId: request.recipientId._id,
          title: request.title,
          description: request.description,
          priority: request.priority,
          purpose: request.purpose,
          highlights: '',
          relationship: '',
          customInstructions: '',
          reminderIntervals: request.reminderIntervals || [7, 3, 1],
          requestType: request.requestType || 'direct_platform',
          submissionMethod: request.submissionMethod || 'platform_only',
          communicationStyle: request.communicationStyle || 'polite',
          relationshipContext: request.relationshipContext || '',
          additionalContext: request.additionalContext || '',
          institutionName: request.institutionName || '',
          schoolEmail: request.schoolEmail || '',
          schoolInstructions: request.schoolInstructions || '',
        });
        setSelectedDate(new Date(request.deadline));
        setIncludeDraft(request.includeDraft || false);
      } else {
        toast.error(data.error || 'Failed to fetch request details');
        router.push('/recommendations');
      }
    } catch (error) {
      console.error('Error fetching request:', error);
      toast.error('Failed to fetch request details');
      router.push('/recommendations');
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    if (params.id) {
      fetchRequest();
      fetchRecipients();
    }
  }, [params.id, fetchRequest]);

  const fetchRecipients = async () => {
    try {
      const response = await fetch('/api/recommendations/recipients');
      const data = await response.json();
      if (response.ok) {
        setRecipients(data.recipients);
      }
    } catch (error) {
      console.error('Error fetching recipients:', error);
    }
  };

  const handleRecipientAdded = (newRecipient: Recipient) => {
    setRecipients(prev => [newRecipient, ...prev]);
  };

  const generateDraft = async () => {
    if (!formData.recipientId || !formData.purpose) {
      toast.error('Please select a recipient and provide a purpose for the draft generation');
      return;
    }

    setGeneratingDraft(true);
    try {
      const response = await fetch('/api/recommendations/generate-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: formData.recipientId,
          purpose: formData.purpose,
          highlights: formData.highlights,
          relationship: formData.relationship,
          customInstructions: formData.customInstructions,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setFormData(prev => ({
          ...prev,
          description: data.draft,
        }));
        toast.success('Draft generated successfully!');
      } else {
        toast.error(data.error || 'Failed to generate draft');
      }
    } catch (error) {
      console.error('Error generating draft:', error);
      toast.error('Failed to generate draft');
    } finally {
      setGeneratingDraft(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate) {
      toast.error('Please select a deadline');
      return;
    }

    if (!formData.recipientId || !formData.title || !formData.description || !formData.relationshipContext) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/recommendations/requests/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          deadline: selectedDate.toISOString(),
          includeDraft,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Recommendation request updated successfully!');
        router.push(`/recommendations/${params.id}`);
      } else {
        toast.error(data.error || 'Failed to update request');
      }
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
    } finally {
      setSaving(false);
    }
  };

  const selectedRecipient = recipients.find(r => r._id === formData.recipientId);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href={`/recommendations/${params.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Recommendation Request</h1>
            <p className="text-gray-600 mt-2">
              Update your recommendation letter request
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recipient Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Recipient
            </CardTitle>
            <CardDescription>
              Choose the professor, supervisor, or manager who will write your recommendation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="recipient">Recipient *</Label>
                <SearchableRecipientSelect
                  recipients={recipients}
                  value={formData.recipientId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, recipientId: value }))}
                  placeholder="Select a recipient"
                  onRecipientAdded={handleRecipientAdded}
                />
              </div>

              {selectedRecipient && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{selectedRecipient.name}</h4>
                      <p className="text-sm text-gray-600">
                        {selectedRecipient.title} • {selectedRecipient.institution}
                      </p>
                      {selectedRecipient.department && (
                        <p className="text-sm text-gray-600">{selectedRecipient.department}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={selectedRecipient.prefersDrafts ? 'default' : 'secondary'}>
                        {selectedRecipient.prefersDrafts ? 'Prefers Drafts' : 'No Drafts'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Request Type and Submission Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Request Type & Submission Method
            </CardTitle>
            <CardDescription>
              Choose how the recommendation letter will be submitted
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium mb-3 block">Request Type *</Label>
              <RadioGroup 
                value={formData.requestType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, requestType: value }))}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="direct_platform" id="direct_platform" />
                  <Label htmlFor="direct_platform" className="flex-1">
                    <div className="font-medium">Direct Platform Submission</div>
                    <div className="text-sm text-gray-600">
                      The professor will submit the letter through our platform
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="school_direct" id="school_direct" />
                  <Label htmlFor="school_direct" className="flex-1">
                    <div className="font-medium">School/Institution Direct</div>
                    <div className="text-sm text-gray-600">
                      The school will send the professor their own submission link
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hybrid" id="hybrid" />
                  <Label htmlFor="hybrid" className="flex-1">
                    <div className="font-medium">Hybrid Approach</div>
                    <div className="text-sm text-gray-600">
                      Both platform and school submission options available
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">Submission Method *</Label>
              <RadioGroup 
                value={formData.submissionMethod} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, submissionMethod: value }))}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="platform_only" id="platform_only" />
                  <Label htmlFor="platform_only" className="flex-1">
                    <div className="font-medium">Platform Only</div>
                    <div className="text-sm text-gray-600">
                      Submit through our platform only
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="school_only" id="school_only" />
                  <Label htmlFor="school_only" className="flex-1">
                    <div className="font-medium">School Only</div>
                    <div className="text-sm text-gray-600">
                      Submit through school&apos;s system only (we provide context)
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="both" />
                  <Label htmlFor="both" className="flex-1">
                    <div className="font-medium">Both Options</div>
                    <div className="text-sm text-gray-600">
                      Professor can choose platform or school submission
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* School/Institution Information */}
            {(formData.requestType === 'school_direct' || formData.requestType === 'hybrid') && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium text-blue-900">School/Institution Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="institutionName">Institution Name</Label>
                    <Input
                      id="institutionName"
                      value={formData.institutionName}
                      onChange={(e) => setFormData(prev => ({ ...prev, institutionName: e.target.value }))}
                      placeholder="e.g., Stanford University"
                    />
                  </div>
                  <div>
                    <Label htmlFor="schoolEmail">School Email (if known)</Label>
                    <Input
                      id="schoolEmail"
                      value={formData.schoolEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, schoolEmail: e.target.value }))}
                      placeholder="e.g., recommendations@stanford.edu"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="schoolInstructions">School Instructions (if provided)</Label>
                  <Textarea
                    id="schoolInstructions"
                    value={formData.schoolInstructions}
                    onChange={(e) => setFormData(prev => ({ ...prev, schoolInstructions: e.target.value }))}
                    placeholder="Any specific instructions from the school..."
                    rows={3}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Communication Style */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Communication Style
            </CardTitle>
            <CardDescription>
              Choose how formal or friendly the communication should be
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium mb-3 block">Communication Tone *</Label>
                <RadioGroup 
                  value={formData.communicationStyle} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, communicationStyle: value }))}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="formal" id="formal" />
                    <Label htmlFor="formal" className="flex-1">
                      <div className="font-medium">Formal</div>
                      <div className="text-sm text-gray-600">
                        Very professional and formal language
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="polite" id="polite" />
                    <Label htmlFor="polite" className="flex-1">
                      <div className="font-medium">Polite</div>
                      <div className="text-sm text-gray-600">
                        Professional but warm and courteous
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="friendly" id="friendly" />
                    <Label htmlFor="friendly" className="flex-1">
                      <div className="font-medium">Friendly</div>
                      <div className="text-sm text-gray-600">
                        Warm and friendly, for close relationships
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="relationshipContext">How do you know this person? *</Label>
                <Textarea
                  id="relationshipContext"
                  value={formData.relationshipContext}
                  onChange={(e) => setFormData(prev => ({ ...prev, relationshipContext: e.target.value }))}
                  placeholder="e.g., I was a student in their Advanced Mathematics course last semester, or I worked as a research assistant under their supervision for 6 months..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="additionalContext">Additional Context (Optional)</Label>
                <Textarea
                  id="additionalContext"
                  value={formData.additionalContext}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalContext: e.target.value }))}
                  placeholder="Any additional information that might help the professor write a better recommendation..."
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Request Details */}
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
            <CardDescription>
              Provide information about your recommendation request
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Request Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Recommendation for Master's Program Application"
              />
            </div>

            <div>
              <Label htmlFor="purpose">Purpose *</Label>
              <Input
                id="purpose"
                value={formData.purpose}
                onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                placeholder="e.g., Applying for Master's in Computer Science at Stanford"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Deadline *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Draft Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              AI Draft Generation
            </CardTitle>
            <CardDescription>
              Generate a professional draft using AI to help your recipient
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="include-draft"
                checked={includeDraft}
                onCheckedChange={setIncludeDraft}
              />
              <Label htmlFor="include-draft">Include AI-generated draft</Label>
            </div>

            {includeDraft && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="relationship">Your Relationship</Label>
                  <Input
                    id="relationship"
                    value={formData.relationship}
                    onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
                    placeholder="e.g., Student, Research Assistant, Intern"
                  />
                </div>

                <div>
                  <Label htmlFor="highlights">Key Achievements & Highlights</Label>
                  <Textarea
                    id="highlights"
                    value={formData.highlights}
                    onChange={(e) => setFormData(prev => ({ ...prev, highlights: e.target.value }))}
                    placeholder="List your key achievements, skills, and experiences that should be highlighted"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="custom-instructions">Custom Instructions (Optional)</Label>
                  <Textarea
                    id="custom-instructions"
                    value={formData.customInstructions}
                    onChange={(e) => setFormData(prev => ({ ...prev, customInstructions: e.target.value }))}
                    placeholder="Any specific instructions or preferences for the draft"
                    rows={2}
                  />
                </div>

                <Button
                  type="button"
                  onClick={generateDraft}
                  disabled={generatingDraft || !formData.recipientId || !formData.purpose}
                  className="w-full"
                >
                  {generatingDraft ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Draft...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate Draft
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
            <CardDescription>
              Provide additional context for your recommendation request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Provide detailed information about your request, achievements, and any specific points you'd like the recommender to address..."
                rows={6}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link href={`/recommendations/${params.id}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Request...
              </>
            ) : (
              'Update Request'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 