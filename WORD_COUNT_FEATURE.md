# Word Count Feature for Long Text and Essay Questions

This feature enhances the existing `ExpandableTextarea` component to support both character and word count validation for long text and essay type questions.

## Overview

The word count feature provides:
- Real-time word counting alongside character counting
- Minimum and maximum word limits
- Visual indicators for validation status
- Combined character and word validation
- Smart word detection that handles multiple spaces and whitespace

## Implementation Details

### 1. Enhanced Types

Updated `types/index.ts` to include word count properties:

```typescript
export interface Question {
  // ... existing properties
  maxWords?: number;
  minWords?: number;
  // ... other properties
}
```

### 2. Enhanced ExpandableTextarea Component

Updated `components/ui/expandable-textarea.tsx` with new props:

```typescript
export interface ExpandableTextareaProps {
  // ... existing props
  minWords?: number;
  maxWords?: number;
  showWordCount?: boolean;
  // ... other props
}
```

### 3. Word Count Calculation

Implemented smart word counting that:
- Handles empty text and whitespace
- Splits on multiple whitespace characters
- Filters out empty strings
- Works with markdown formatting

```typescript
const calculateWordCount = (text: string): number => {
  if (!text || text.trim().length === 0) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};
```

### 4. Validation Logic

Enhanced validation to check both character and word limits:

```typescript
// Check character limits
if (minLength && currentLength < minLength) {
  isValid = false;
  message = `At least ${minLength} characters required`;
} else if (maxLength && currentLength > maxLength) {
  isValid = false;
  message = `Maximum ${maxLength} characters allowed`;
}

// Check word limits
if (minWords && currentWordCount < minWords) {
  isValid = false;
  message = `At least ${minWords} words required`;
} else if (maxWords && currentWordCount > maxWords) {
  isValid = false;
  message = `Maximum ${maxWords} words allowed`;
}
```

### 5. Visual Indicators

The component now shows:
- Character count with validation status
- Word count with validation status
- Color-coded indicators (red for over limit, orange for under minimum, green for valid)
- Progress messages for both character and word counts

## Usage Examples

### Essay with Both Character and Word Limits

```typescript
<ExpandableTextarea
  maxLength={2000}
  minLength={800}
  maxWords={300}
  minWords={150}
  showCharacterCount={true}
  showWordCount={true}
  // ... other props
/>
```

### Personal Statement with Word Limits Only

```typescript
<ExpandableTextarea
  maxWords={500}
  minWords={200}
  showCharacterCount={false}
  showWordCount={true}
  // ... other props
/>
```

### Long Text with Character Limits Only

```typescript
<ExpandableTextarea
  maxLength={1500}
  minLength={500}
  showCharacterCount={true}
  showWordCount={false}
  // ... other props
/>
```

## Updated Components

### 1. Test Application Page

Updated `app/test-application/page.tsx` to include word count examples:

- Essay question with both character (800-2000) and word (150-300) limits
- All textarea, essay, and statement question types now support word count

### 2. Demo Page

Created `app/demo-word-count/page.tsx` to showcase:
- Different combinations of character and word limits
- Visual examples of validation states
- Feature overview and documentation

## Features

### Character Count
- Real-time character counting
- Minimum and maximum limits
- Visual indicators (red/orange/green)
- Progress messages

### Word Count
- Real-time word counting
- Minimum and maximum word limits
- Smart word detection (handles multiple spaces)
- Visual indicators (red/orange/green)

### Validation
- Combined character and word validation
- Real-time validation feedback
- Clear error messages
- Success indicators

### User Experience
- Expandable textarea
- Focus management
- Responsive design
- Accessible interface

## Testing

The word count functionality has been tested with:
- Empty text and whitespace
- Simple text with single words
- Multiple spaces and whitespace characters
- Punctuation and special characters
- Markdown formatting
- Long text with various formatting

## Demo

Visit `/demo-word-count` to see the component in action with various configurations:

1. **Essay with Character & Word Limits**: 800-2000 characters, 150-300 words
2. **Personal Statement with Word Limits Only**: 200-500 words
3. **Long Text with Character Limits Only**: 500-1500 characters

## Benefits

1. **Better UX**: Users can see both character and word counts in real-time
2. **Flexible Validation**: Support for character-only, word-only, or combined limits
3. **Clear Feedback**: Visual indicators and progress messages
4. **Smart Counting**: Handles edge cases like multiple spaces and formatting
5. **Accessibility**: Proper labeling and screen reader support
