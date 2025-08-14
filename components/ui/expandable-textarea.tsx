'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle } from 'lucide-react';
import { useFormTranslation } from '@/hooks/useTranslation';

export interface ExpandableTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minLength?: number;
  maxLength?: number;
  minWords?: number;
  maxWords?: number;
  showCharacterCount?: boolean;
  showWordCount?: boolean;
  expandable?: boolean;
  defaultExpanded?: boolean;
  onValidationChange?: (isValid: boolean, message?: string) => void;
}

const ExpandableTextarea = React.forwardRef<HTMLTextAreaElement, ExpandableTextareaProps>(
  ({ 
    className, 
    minLength, 
    maxLength, 
    minWords,
    maxWords,
    showCharacterCount = true, 
    showWordCount = true,
    expandable = true,
    defaultExpanded = false,
    onValidationChange,
    value = '',
    onChange,
    ...props 
  }, ref) => {
    const { t } = useFormTranslation();
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const [charCount, setCharCount] = useState((value as string)?.length || 0);
    const [wordCount, setWordCount] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Helper function to calculate word count
    const calculateWordCount = (text: string): number => {
      if (!text || text.trim().length === 0) return 0;
      return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    };

    // Update character and word count when value changes
    useEffect(() => {
      const currentLength = (value as string)?.length || 0;
      const currentWordCount = calculateWordCount(value as string);
      setCharCount(currentLength);
      setWordCount(currentWordCount);
      
      // Validate and notify parent component
      if (onValidationChange) {
        let isValid = true;
        let message = '';
        
        // Check character limits
        if (minLength && currentLength < minLength) {
          isValid = false;
          message = t('validation.minLength', { min: minLength });
        } else if (maxLength && currentLength > maxLength) {
          isValid = false;
          message = t('validation.maxLength', { max: maxLength });
        }
        
        // Check word limits
        if (minWords && currentWordCount < minWords) {
          isValid = false;
          message = t('validation.minWords', { min: minWords });
        } else if (maxWords && currentWordCount > maxWords) {
          isValid = false;
          message = t('validation.maxWords', { max: maxWords });
        }
        
        onValidationChange(isValid, message);
      }
    }, [value, minLength, maxLength, minWords, maxWords, onValidationChange, t]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) {
        onChange(e);
      }
    };

    const toggleExpanded = () => {
      setIsExpanded(!isExpanded);
      // Focus the textarea after expansion
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);
    };

    const getCountColor = (count: number, min?: number, max?: number) => {
      if (max && count > max) {
        return 'text-red-600';
      }
      if (min && count < min) {
        return 'text-orange-600';
      }
      return 'text-gray-500';
    };

    const getCountIcon = (count: number, min?: number, max?: number) => {
      if (max && count > max) {
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      }
      if (min && count < min) {
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      }
      if (min && count >= min) {
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      }
      return null;
    };

    const getCountMessage = (count: number, type: 'characters' | 'words', min?: number, max?: number) => {
      if (max && count > max) {
        return `${count - max} ${type} over limit`;
      }
      if (min && count < min) {
        return `${min - count} more ${type} needed`;
      }
      if (min && count >= min) {
        return `Minimum ${type} requirement met`;
      }
      return '';
    };

    return (
      <div className="space-y-2">
        <div className={cn(
          'relative border border-input bg-background rounded-md transition-all duration-200',
          isExpanded ? 'min-h-[400px]' : 'min-h-[120px]',
          className
        )}>
          <textarea
            ref={(node) => {
              // Handle both refs
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
              // Update our internal ref
              (textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
            }}
            className={cn(
              'w-full rounded-md bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
              isExpanded ? 'min-h-[380px]' : 'min-h-[100px]'
            )}
            value={value}
            onChange={handleChange}
            maxLength={maxLength}
            {...props}
          />
          
          {expandable && (
            <button
              type="button"
              onClick={toggleExpanded}
              className="absolute bottom-2 right-2 p-1 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              )}
            </button>
          )}
        </div>

        {((showCharacterCount && (minLength || maxLength)) || (showWordCount && (minWords || maxWords))) && (
          <div className="space-y-2">
            {/* Character Count */}
            {showCharacterCount && (minLength || maxLength) && (
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  {getCountIcon(charCount, minLength, maxLength)}
                  <span className={cn('font-medium', getCountColor(charCount, minLength, maxLength))}>
                    {charCount}
                    {maxLength && ` / ${maxLength}`}
                  </span>
                  <span className="text-gray-500">characters</span>
                </div>
                {getCountMessage(charCount, 'characters', minLength, maxLength) && (
                  <span className={cn('text-xs', getCountColor(charCount, minLength, maxLength))}>
                    {getCountMessage(charCount, 'characters', minLength, maxLength)}
                  </span>
                )}
              </div>
            )}
            
            {/* Word Count */}
            {showWordCount && (minWords || maxWords) && (
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  {getCountIcon(wordCount, minWords, maxWords)}
                  <span className={cn('font-medium', getCountColor(wordCount, minWords, maxWords))}>
                    {wordCount}
                    {maxWords && ` / ${maxWords}`}
                  </span>
                  <span className="text-gray-500">words</span>
                </div>
                {getCountMessage(wordCount, 'words', minWords, maxWords) && (
                  <span className={cn('text-xs', getCountColor(wordCount, minWords, maxWords))}>
                    {getCountMessage(wordCount, 'words', minWords, maxWords)}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

ExpandableTextarea.displayName = 'ExpandableTextarea';

export { ExpandableTextarea };