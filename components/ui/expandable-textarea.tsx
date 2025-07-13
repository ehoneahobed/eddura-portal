'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle } from 'lucide-react';

export interface ExpandableTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minLength?: number;
  maxLength?: number;
  showCharacterCount?: boolean;
  expandable?: boolean;
  defaultExpanded?: boolean;
  onValidationChange?: (isValid: boolean, message?: string) => void;
}

const ExpandableTextarea = React.forwardRef<HTMLTextAreaElement, ExpandableTextareaProps>(
  ({ 
    className, 
    minLength, 
    maxLength, 
    showCharacterCount = true, 
    expandable = true,
    defaultExpanded = false,
    onValidationChange,
    value = '',
    onChange,
    ...props 
  }, ref) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const [charCount, setCharCount] = useState((value as string)?.length || 0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Update character count when value changes
    useEffect(() => {
      const currentLength = (value as string)?.length || 0;
      setCharCount(currentLength);
      
      // Validate and notify parent component
      if (onValidationChange) {
        let isValid = true;
        let message = '';
        
        if (minLength && currentLength < minLength) {
          isValid = false;
          message = `At least ${minLength} characters required`;
        } else if (maxLength && currentLength > maxLength) {
          isValid = false;
          message = `Maximum ${maxLength} characters allowed`;
        }
        
        onValidationChange(isValid, message);
      }
    }, [value, minLength, maxLength, onValidationChange]);

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

    const getCharacterCountColor = () => {
      if (maxLength && charCount > maxLength) {
        return 'text-red-600';
      }
      if (minLength && charCount < minLength) {
        return 'text-orange-600';
      }
      return 'text-gray-500';
    };

    const getCharacterCountIcon = () => {
      if (maxLength && charCount > maxLength) {
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      }
      if (minLength && charCount < minLength) {
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      }
      if (minLength && charCount >= minLength) {
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      }
      return null;
    };

    const getCharacterCountMessage = () => {
      if (maxLength && charCount > maxLength) {
        return `${charCount - maxLength} characters over limit`;
      }
      if (minLength && charCount < minLength) {
        return `${minLength - charCount} more characters needed`;
      }
      if (minLength && charCount >= minLength) {
        return 'Minimum requirement met';
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
              textareaRef.current = node;
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

        {showCharacterCount && (minLength || maxLength) && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              {getCharacterCountIcon()}
              <span className={cn('font-medium', getCharacterCountColor())}>
                {charCount}
                {maxLength && ` / ${maxLength}`}
              </span>
            </div>
            {getCharacterCountMessage() && (
              <span className={cn('text-xs', getCharacterCountColor())}>
                {getCharacterCountMessage()}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

ExpandableTextarea.displayName = 'ExpandableTextarea';

export { ExpandableTextarea };