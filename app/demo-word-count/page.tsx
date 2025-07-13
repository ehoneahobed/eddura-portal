'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ExpandableTextarea } from '@/components/ui/expandable-textarea';
import { Badge } from '@/components/ui/badge';

export default function DemoWordCountPage() {
  const [essayValue, setEssayValue] = useState('');
  const [statementValue, setStatementValue] = useState('');
  const [longTextValue, setLongTextValue] = useState('');

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Word Count Demo</h1>
          <p className="text-lg text-gray-600">
            Demonstrating character and word count functionality for long text and essay questions
          </p>
        </div>

        <div className="grid gap-6">
          {/* Essay with both character and word limits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Essay Question
                <Badge variant="secondary">Character & Word Limits</Badge>
              </CardTitle>
              <CardDescription>
                Write a detailed essay explaining why you deserve this scholarship. 
                Include specific examples of your achievements and how this scholarship will help you achieve your goals.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label htmlFor="essay">Why do you deserve this scholarship?</Label>
              <ExpandableTextarea
                id="essay"
                value={essayValue}
                onChange={(e) => setEssayValue(e.target.value)}
                placeholder="Write your essay here... You can use **bold**, *italic*, and `code` formatting."
                className="min-h-[200px] resize-none text-base leading-relaxed p-4"
                maxLength={2000}
                minLength={800}
                maxWords={300}
                minWords={150}
                showCharacterCount={true}
                showWordCount={true}
                expandable={true}
                defaultExpanded={false}
              />
              <p className="text-sm text-gray-500">
                Be specific about your achievements and future goals. Show how this scholarship will help you achieve them.
              </p>
            </CardContent>
          </Card>

          {/* Personal Statement with word limits only */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Personal Statement
                <Badge variant="outline">Word Limits Only</Badge>
              </CardTitle>
              <CardDescription>
                Write a personal statement about your academic journey and future aspirations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label htmlFor="statement">Personal Statement</Label>
              <ExpandableTextarea
                id="statement"
                value={statementValue}
                onChange={(e) => setStatementValue(e.target.value)}
                placeholder="Write your personal statement here..."
                className="min-h-[200px] resize-none text-base leading-relaxed p-4"
                maxWords={500}
                minWords={200}
                showCharacterCount={false}
                showWordCount={true}
                expandable={true}
                defaultExpanded={false}
              />
              <p className="text-sm text-gray-500">
                Focus on your academic achievements, personal growth, and future goals.
              </p>
            </CardContent>
          </Card>

          {/* Long text with character limits only */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Long Text Response
                <Badge variant="outline">Character Limits Only</Badge>
              </CardTitle>
              <CardDescription>
                Provide a detailed response about your research interests and experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label htmlFor="long-text">Research Interests</Label>
              <ExpandableTextarea
                id="long-text"
                value={longTextValue}
                onChange={(e) => setLongTextValue(e.target.value)}
                placeholder="Describe your research interests and relevant experience..."
                className="min-h-[200px] resize-none text-base leading-relaxed p-4"
                maxLength={1500}
                minLength={500}
                showCharacterCount={true}
                showWordCount={false}
                expandable={true}
                defaultExpanded={false}
              />
              <p className="text-sm text-gray-500">
                Include specific examples of research projects, publications, or relevant coursework.
              </p>
            </CardContent>
          </Card>

          {/* Features Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Features Overview</CardTitle>
              <CardDescription>
                Key features of the enhanced textarea component
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold">Character Count</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Real-time character counting</li>
                    <li>• Minimum and maximum limits</li>
                    <li>• Visual indicators (red/orange/green)</li>
                    <li>• Progress messages</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Word Count</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Real-time word counting</li>
                    <li>• Minimum and maximum word limits</li>
                    <li>• Smart word detection (handles multiple spaces)</li>
                    <li>• Visual indicators (red/orange/green)</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Validation</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Combined character and word validation</li>
                    <li>• Real-time validation feedback</li>
                    <li>• Clear error messages</li>
                    <li>• Success indicators</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">User Experience</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Expandable textarea</li>
                    <li>• Focus management</li>
                    <li>• Responsive design</li>
                    <li>• Accessible interface</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}