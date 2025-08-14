'use client';

import React, { useState, useRef, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Maximize2, Minimize2 } from 'lucide-react';
import { useFormTranslation } from '@/hooks/useTranslation';
import { getValidationMessage } from '@/lib/validation';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  className?: string;
  height?: number;
  preview?: 'live' | 'edit' | 'preview';
  wordCount?: boolean;
  maxWords?: number;
  minWords?: number;
  maxLength?: number;
  minLength?: number;
  error?: string;
  disabled?: boolean;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write your content here...",
  className,
  height = 400,
  preview = 'live',
  wordCount = false,
  maxWords,
  minWords,
  maxLength,
  minLength,
  error,
  disabled = false
}: MarkdownEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPreview, setShowPreview] = useState(preview === 'preview');
  const editorRef = useRef<HTMLDivElement>(null);

  // Calculate word and character counts
  const wordCountValue = value ? value.trim().split(/\s+/).filter(word => word.length > 0).length : 0;
  const charCountValue = value ? value.length : 0;

  const { t } = useFormTranslation();

  // Validation messages
  const getValidationMessage = () => {
    if (maxWords && wordCountValue > maxWords) {
      return t('validation.maxWords', { max: maxWords }) + ` (current: ${wordCountValue})`;
    }
    if (minWords && wordCountValue < minWords) {
      return t('validation.minWords', { min: minWords }) + ` (current: ${wordCountValue})`;
    }
    if (maxLength && charCountValue > maxLength) {
      return t('validation.maxLength', { max: maxLength }) + ` (current: ${charCountValue})`;
    }
    if (minLength && charCountValue < minLength) {
      return t('validation.minLength', { min: minLength }) + ` (current: ${charCountValue})`;
    }
    return null;
  };

  const validationMessage = getValidationMessage();

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle preview toggle
  const togglePreview = () => {
    setShowPreview(!showPreview);
  };



  return (
    <div className={cn(
      "markdown-editor-container",
      isFullscreen && "fixed inset-0 z-50 bg-white",
      className
    )}>
      {/* Editor Header */}
      <div className="flex items-center justify-between p-2 border-b bg-gray-50 rounded-t-md">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={togglePreview}
            className="h-8 px-2"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="ml-1 text-xs">
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </span>
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          {wordCount && (
            <div className="text-xs text-gray-600">
              {wordCountValue} words, {charCountValue} chars
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="h-8 px-2"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Markdown Editor */}
      <div 
        ref={editorRef}
        className={cn(
          "markdown-editor",
          error && "border-red-500",
          disabled && "opacity-50 pointer-events-none"
        )}
        style={{ height: isFullscreen ? 'calc(100vh - 60px)' : height }}
      >
        <MDEditor
          value={value}
          onChange={onChange}
          preview={showPreview ? 'preview' : 'edit'}
          height="100%"
          placeholder={placeholder}
          className="border-0"
          data-color-mode="light"
          hideToolbar={false}
          visibleDragbar={false}
          previewOptions={{
            style: {
              backgroundColor: 'transparent',
              fontSize: '14px',
              lineHeight: '1.6'
            }
          }}
        />
      </div>

      {/* Validation Messages */}
      {(error || validationMessage) && (
        <div className="p-2 bg-red-50 border-t border-red-200 rounded-b-md">
          <p className="text-sm text-red-600">
            {error || validationMessage}
          </p>
        </div>
      )}

      {/* Help Text */}
      <div className="p-2 bg-gray-50 border-t text-xs text-gray-600 rounded-b-md">
        <p>
          <strong>Markdown Tips:</strong> Use <code>**bold**</code>, <code>*italic*</code>, <code># headers</code>, 
          <code>- lists</code>, <code>[links](url)</code>, and <code>![images](url)</code>
        </p>
      </div>
    </div>
  );
}

export default MarkdownEditor; 