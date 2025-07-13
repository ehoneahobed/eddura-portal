# Expandable Textarea Feature

## Overview

This feature implements expandable textarea fields for essay and long text questions with real-time character count validation. The component provides a better user experience for writing longer content by allowing users to expand the textarea when needed and providing immediate feedback on character count requirements.

## Features

### 1. Expandable/Collapsible Interface
- **Expand Button**: Click to expand the textarea from compact to full-size view
- **Collapse Button**: Click to collapse back to compact view
- **Smooth Transitions**: Animated height changes for better UX
- **Focus Management**: Automatically focuses the textarea after expansion

### 2. Real-time Character Count Validation
- **Live Counter**: Shows current character count in real-time
- **Minimum Length**: Validates against minimum character requirements
- **Maximum Length**: Validates against maximum character limits
- **Visual Indicators**: Color-coded feedback for different states

### 3. Visual Feedback System
- **Green Checkmark**: ✅ When minimum requirement is met
- **Orange Warning**: ⚠️ When below minimum requirement
- **Red Error**: ❌ When over maximum limit
- **Character Messages**: Dynamic messages showing how many characters are needed or over limit

### 4. Rich Text Support for Essays
- **Formatting Toolbar**: Bold, italic, and code formatting buttons
- **Markdown-style**: Uses `**bold**`, `*italic*`, and `` `code` `` syntax
- **Selection Preservation**: Maintains cursor position after formatting

## Component Usage

### Basic Usage
```tsx
import { ExpandableTextarea } from '@/components/ui/expandable-textarea';

<ExpandableTextarea
  placeholder="Write your content here..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
  maxLength={1000}
  minLength={500}
  showCharacterCount={true}
  expandable={true}
  defaultExpanded={false}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `minLength` | `number` | `undefined` | Minimum number of characters required |
| `maxLength` | `number` | `undefined` | Maximum number of characters allowed |
| `showCharacterCount` | `boolean` | `true` | Whether to show character count display |
| `expandable` | `boolean` | `true` | Whether the textarea can be expanded |
| `defaultExpanded` | `boolean` | `false` | Whether the textarea starts expanded |
| `onValidationChange` | `function` | `undefined` | Callback for validation state changes |

### Validation States

1. **Below Minimum**: Orange warning with message "X more characters needed"
2. **Within Range**: Green checkmark with message "Minimum requirement met"
3. **Over Maximum**: Red error with message "X characters over limit"

## Implementation Details

### Files Modified

1. **`components/ui/expandable-textarea.tsx`** - New component
2. **`app/test-application/page.tsx`** - Updated to use expandable textarea
3. **`components/applications/ApplicationForm.tsx`** - Updated to use expandable textarea
4. **`app/demo-expandable-textarea/page.tsx`** - Demo page showcasing features

### Integration Points

The expandable textarea is now used for:
- **Essay questions** (`type: 'essay'`)
- **Long text questions** (`type: 'textarea'`)
- **Personal statement questions** (`type: 'statement'`)

### Character Count Logic

```typescript
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
```

## Demo

Visit `/demo-expandable-textarea` to see the component in action with various configurations:

1. **Essay with Rich Text**: 800-2000 characters with formatting toolbar
2. **Personal Statement**: Minimum 500 characters required
3. **Brief Description**: Maximum 200 characters allowed
4. **Standard Textarea**: Non-expandable version

## Benefits

1. **Better UX**: Users can expand textareas when writing longer content
2. **Immediate Feedback**: Real-time validation prevents submission errors
3. **Visual Clarity**: Color-coded indicators make requirements clear
4. **Accessibility**: Proper focus management and keyboard navigation
5. **Responsive**: Works well on different screen sizes

## Future Enhancements

1. **Word Count**: Add word count alongside character count
2. **Auto-save**: Automatic saving of draft content
3. **Spell Check**: Integrated spell checking
4. **Rich Text Editor**: Full WYSIWYG editor for essays
5. **Template Support**: Pre-filled templates for common essay types