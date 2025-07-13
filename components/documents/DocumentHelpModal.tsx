'use client';

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, FileText, Tag, Target, Building, GraduationCap, Eye, MessageCircle, History, Save, Plus, Info } from 'lucide-react';

interface DocumentHelpModalProps {
  trigger?: React.ReactNode;
}

const fieldExplanations = [
  {
    field: 'Document Title',
    description: 'A clear, descriptive title for your document. This will help you identify it later.',
    example: 'Personal Statement for Stanford CS MS',
    icon: FileText,
    required: true
  },
  {
    field: 'Document Type',
    description: 'The type of document you are creating. This helps with organization and templates.',
    examples: ['CV/Resume', 'Personal Statement', 'Essay', 'Recommendation Letter', 'Transcript', 'Certificate', 'Portfolio', 'Other'],
    icon: FileText,
    required: true
  },
  {
    field: 'Category',
    description: 'The category helps group similar documents together.',
    examples: ['Academic', 'Professional', 'Personal', 'Creative', 'Other'],
    icon: Tag,
    required: true
  },
  {
    field: 'Document Content',
    description: 'The main content of your document. There is no character limit - write as much as you need.',
    example: 'Your actual document text goes here...',
    icon: FileText,
    required: true,
    note: 'Word and character counts are displayed in real-time'
  },
  {
    field: 'Description',
    description: 'A brief description of what this document is for and any important notes.',
    example: 'Personal statement for computer science graduate program applications',
    icon: Info,
    required: false
  },
  {
    field: 'Tags',
    description: 'Keywords that help you find and organize your documents. Maximum 10 tags allowed.',
    example: 'computer-science, graduate-school, personal-statement',
    icon: Tag,
    required: false
  },
  {
    field: 'Target Audience',
    description: 'Who will be reading this document?',
    example: 'Admissions Committee, Employer, Academic Advisor',
    icon: Target,
    required: false
  },
  {
    field: 'Target Institution',
    description: 'The specific institution this document is intended for.',
    example: 'Stanford University, Google, MIT',
    icon: Building,
    required: false
  },
  {
    field: 'Target Program',
    description: 'The specific program or position this document targets.',
    example: 'Computer Science MS, Software Engineer, PhD Program',
    icon: GraduationCap,
    required: false
  },
  {
    field: 'Status',
    description: 'Current status of your document.',
    examples: [
      'Draft - Still working on it',
      'Review - Ready for feedback',
      'Final - Complete and ready to use'
    ],
    icon: Save,
    required: false
  },
  {
    field: 'Public Visibility',
    description: 'If enabled, other users can view this document (useful for sharing with mentors or peers).',
    icon: Eye,
    required: false
  },
  {
    field: 'Allow Comments',
    description: 'If enabled, other users can leave comments and suggestions on your document.',
    icon: MessageCircle,
    required: false
  }
];

const versioningInfo = [
  {
    title: 'Automatic Versioning',
    description: 'When you make significant changes to your document content (more than 100 characters), a new version is automatically created.',
    icon: History
  },
  {
    title: 'Manual Versioning',
    description: 'You can also manually create a new version by checking "Create New Version" when editing.',
    icon: Plus
  },
  {
    title: 'Version History',
    description: 'All previous versions are preserved and can be accessed through the document history.',
    icon: History
  },
  {
    title: 'Version Numbers',
    description: 'Versions are numbered sequentially (v1, v2, v3, etc.) and only the latest version is shown in the main library.',
    icon: FileText
  }
];

export default function DocumentHelpModal({ trigger }: DocumentHelpModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <HelpCircle className="h-4 w-4 mr-2" />
            Help & Documentation
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Document Management Help
          </DialogTitle>
          <DialogDescription>
            Learn about document fields, versioning, and best practices for managing your documents.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Field Explanations */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Document Fields Explained</h3>
            <div className="grid gap-4">
              {fieldExplanations.map((field, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <field.icon className="h-4 w-4 text-blue-600" />
                      <CardTitle className="text-base">
                        {field.field}
                        {field.required && <Badge className="ml-2 text-xs">Required</Badge>}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-gray-600">{field.description}</p>
                    {field.example && (
                      <div className="text-xs">
                        <span className="font-medium text-gray-700">Example:</span>{' '}
                        <span className="text-gray-600 italic">{field.example}</span>
                      </div>
                    )}
                    {field.examples && (
                      <div className="text-xs">
                        <span className="font-medium text-gray-700">Examples:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {field.examples.map((example, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {example}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {field.note && (
                      <div className="text-xs bg-blue-50 p-2 rounded">
                        <span className="font-medium text-blue-700">Note:</span>{' '}
                        <span className="text-blue-600">{field.note}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Versioning Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Document Versioning</h3>
            <div className="grid gap-4">
              {versioningInfo.map((info, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <info.icon className="h-4 w-4 text-green-600" />
                      <CardTitle className="text-base">{info.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{info.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Best Practices */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Best Practices</h3>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">Use Descriptive Titles</h4>
                      <p className="text-sm text-gray-600">
                        Choose clear, specific titles that help you identify documents quickly.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">Add Relevant Tags</h4>
                      <p className="text-sm text-gray-600">
                        Use tags to categorize and find documents easily. Think of keywords that describe the content.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">Specify Target Information</h4>
                      <p className="text-sm text-gray-600">
                        Include target institution and program to help organize documents for specific applications.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      4
                    </div>
                    <div>
                      <h4 className="font-medium">Use Status Tracking</h4>
                      <p className="text-sm text-gray-600">
                        Update document status as you work on it: Draft → Review → Final.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      5
                    </div>
                    <div>
                      <h4 className="font-medium">Leverage Versioning</h4>
                      <p className="text-sm text-gray-600">
                        Create new versions for significant changes to preserve your work history.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Guidelines */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Content Guidelines</h3>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium">No Character Limits</h4>
                      <p className="text-sm text-gray-600">
                        Write as much content as you need. The system tracks word and character counts in real-time.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium">Real-time Statistics</h4>
                      <p className="text-sm text-gray-600">
                        See word count and character count as you type to help meet application requirements.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium">Auto-save</h4>
                      <p className="text-sm text-gray-600">
                        Your work is automatically saved as you type to prevent data loss.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}