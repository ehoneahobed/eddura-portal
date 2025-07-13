'use client';

import { useState } from 'react';
import { ExpandableTextarea } from '@/components/ui/expandable-textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function DemoExpandableTextareaPage() {
  const [essayValue, setEssayValue] = useState('');
  const [longTextValue, setLongTextValue] = useState('');
  const [shortTextValue, setShortTextValue] = useState('');
  const [validationStates, setValidationStates] = useState<Record<string, { isValid: boolean; message?: string }>>({});

  const handleValidationChange = (fieldId: string, isValid: boolean, message?: string) => {
    setValidationStates(prev => ({
      ...prev,
      [fieldId]: { isValid, message }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Expandable Textarea Demo</h1>
          <p className="text-xl text-gray-600">
            Showcasing expandable fields with real-time character count validation
          </p>
        </div>

        <div className="grid gap-8">
          {/* Essay with rich text formatting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Essay Question
                <Badge variant="secondary">Rich Text</Badge>
              </CardTitle>
              <CardDescription>
                Write a detailed essay with formatting options. Minimum 800 characters, maximum 2000 characters.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-md">
                <div className="flex border-b bg-gray-50 p-2 space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      const textarea = document.getElementById('essay') as HTMLTextAreaElement;
                      if (textarea) {
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const text = textarea.value;
                        const before = text.substring(0, start);
                        const selection = text.substring(start, end);
                        const after = text.substring(end);
                        const newText = before + '**' + selection + '**' + after;
                        setEssayValue(newText);
                        setTimeout(() => {
                          textarea.setSelectionRange(start + 2, end + 2);
                          textarea.focus();
                        }, 0);
                      }
                    }}
                    className="px-2 py-1 text-sm bg-white border rounded hover:bg-gray-100"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const textarea = document.getElementById('essay') as HTMLTextAreaElement;
                      if (textarea) {
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const text = textarea.value;
                        const before = text.substring(0, start);
                        const selection = text.substring(start, end);
                        const after = text.substring(end);
                        const newText = before + '*' + selection + '*' + after;
                        setEssayValue(newText);
                        setTimeout(() => {
                          textarea.setSelectionRange(start + 1, end + 1);
                          textarea.focus();
                        }, 0);
                      }
                    }}
                    className="px-2 py-1 text-sm bg-white border rounded hover:bg-gray-100 italic"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const textarea = document.getElementById('essay') as HTMLTextAreaElement;
                      if (textarea) {
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const text = textarea.value;
                        const before = text.substring(0, start);
                        const selection = text.substring(start, end);
                        const after = text.substring(end);
                        const newText = before + '`' + selection + '`' + after;
                        setEssayValue(newText);
                        setTimeout(() => {
                          textarea.setSelectionRange(start + 1, end + 1);
                          textarea.focus();
                        }, 0);
                      }
                    }}
                    className="px-2 py-1 text-sm bg-white border rounded hover:bg-gray-100 font-mono"
                  >
                    Code
                  </button>
                </div>
                <ExpandableTextarea
                  id="essay"
                  value={essayValue}
                  onChange={(e) => setEssayValue(e.target.value)}
                  placeholder="Write your essay here... You can use **bold**, *italic*, and `code` formatting."
                  className="min-h-[200px] resize-none text-base leading-relaxed p-4 border-0 focus:ring-0"
                  maxLength={2000}
                  minLength={800}
                  showCharacterCount={true}
                  expandable={true}
                  defaultExpanded={false}
                  onValidationChange={(isValid, message) => handleValidationChange('essay', isValid, message)}
                />
              </div>
              <div className="flex items-center gap-2">
                {validationStates.essay?.isValid ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                )}
                <span className="text-sm text-gray-600">
                  {validationStates.essay?.message || 'Validation status will appear here'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Long text with minimum requirement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Personal Statement
                <Badge variant="outline">Minimum Required</Badge>
              </CardTitle>
              <CardDescription>
                Write a personal statement. Minimum 500 characters required.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ExpandableTextarea
                value={longTextValue}
                onChange={(e) => setLongTextValue(e.target.value)}
                placeholder="Write your personal statement here..."
                className="min-h-[200px] resize-none text-base leading-relaxed p-4"
                minLength={500}
                showCharacterCount={true}
                expandable={true}
                defaultExpanded={false}
                onValidationChange={(isValid, message) => handleValidationChange('longText', isValid, message)}
              />
              <div className="flex items-center gap-2">
                {validationStates.longText?.isValid ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                )}
                <span className="text-sm text-gray-600">
                  {validationStates.longText?.message || 'Validation status will appear here'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Short text with maximum limit */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Brief Description
                <Badge variant="destructive">Maximum Limit</Badge>
              </CardTitle>
              <CardDescription>
                Write a brief description. Maximum 200 characters allowed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ExpandableTextarea
                value={shortTextValue}
                onChange={(e) => setShortTextValue(e.target.value)}
                placeholder="Write a brief description..."
                className="min-h-[100px] resize-none text-base leading-relaxed p-4"
                maxLength={200}
                showCharacterCount={true}
                expandable={true}
                defaultExpanded={false}
                onValidationChange={(isValid, message) => handleValidationChange('shortText', isValid, message)}
              />
              <div className="flex items-center gap-2">
                {validationStates.shortText?.isValid ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span className="text-sm text-gray-600">
                  {validationStates.shortText?.message || 'Validation status will appear here'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Non-expandable textarea */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Standard Textarea
                <Badge variant="secondary">Non-expandable</Badge>
              </CardTitle>
              <CardDescription>
                A standard textarea without expandable functionality.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExpandableTextarea
                placeholder="This is a standard textarea..."
                className="min-h-[100px] resize-none text-base leading-relaxed p-4"
                expandable={false}
                showCharacterCount={false}
              />
            </CardContent>
          </Card>
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Features Demonstrated</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Expandable/collapsible textarea with smooth transitions</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Real-time character count with visual indicators</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Minimum character requirement validation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Maximum character limit validation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Color-coded feedback (green for valid, orange for minimum, red for over limit)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Rich text formatting toolbar for essays</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Responsive design with proper focus management</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}