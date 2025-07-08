# Question Required Field Fix

## Problem
When adding a new question in the application template form, if you choose "required" and save it, the required option doesn't get stored properly. When you view the template after saving, the required option is not checked.

## Root Cause
The issue was with how the `Switch` component from the UI library was being integrated with `react-hook-form`. The `Switch` component doesn't work the same way as regular HTML inputs with the `...register()` spread operator.

### Original Implementation (Broken)
```tsx
<Switch
  {...register(`sections.${sectionIndex}.questions.${questionIndex}.required` as const)}
  defaultChecked={question.required ?? false}
/>
```

### Issues with the Original Implementation:
1. **Incompatible Registration**: The `Switch` component doesn't accept the same props as HTML inputs, so `...register()` doesn't work properly
2. **State Management**: The form state wasn't being updated when the switch was toggled
3. **Persistence**: Changes to the switch weren't being saved to the form data

## Solution
I fixed the issue by properly handling the `Switch` component state with `react-hook-form` using the `checked` and `onCheckedChange` props:

### Fixed Implementation for Question Required Field
```tsx
<Switch
  checked={question.required ?? false}
  onCheckedChange={(checked) => {
    const currentSections = getValues('sections') || [];
    const updatedSections = [...currentSections];
    updatedSections[sectionIndex].questions[questionIndex].required = checked;
    updateSections(updatedSections);
  }}
/>
```

### Fixed Implementation for Template Level Settings
```tsx
<Switch
  id="isActive"
  checked={watch('isActive') ?? true}
  onCheckedChange={(checked) => setValue('isActive', checked)}
/>
```

## Key Changes Made

### 1. Question Required Field
- **Location**: `components/forms/ApplicationTemplateForm.tsx`
- **Change**: Used `checked` prop with current question state and `onCheckedChange` to update form state
- **Method**: Direct manipulation of sections array with `updateSections()` helper

### 2. Template Level Switch Fields
Fixed the following template-level switches:
- `isActive` - Active Template
- `allowDraftSaving` - Allow Draft Saving  
- `requireEmailVerification` - Require Email Verification
- `requirePhoneVerification` - Require Phone Verification

**Method**: Used `watch()` to get current value and `setValue()` to update form state

## Technical Details

### Why This Works
1. **Proper State Binding**: `checked` prop correctly reflects the current form state
2. **Real-time Updates**: `onCheckedChange` immediately updates the form state when toggled
3. **Form Integration**: Uses `react-hook-form`'s `setValue` and `getValues` for proper state management
4. **Persistence**: Changes are properly saved when the form is submitted

### Helper Functions Used
- `getValues('sections')` - Get current sections data
- `updateSections(updatedSections)` - Update sections and trigger re-render
- `setValue(field, value)` - Update specific form field
- `watch(field)` - Watch for changes in form field

## Testing
To verify the fix:
1. Create a new application template
2. Add a question to a section
3. Toggle the "Required" switch to ON
4. Save the template
5. View the saved template - the question should show as required
6. Edit the template - the "Required" switch should be checked

## Related Files Modified
- `components/forms/ApplicationTemplateForm.tsx` - Main form component with all Switch fixes

## Best Practices for Switch Components
When using Switch components with react-hook-form:

### ✅ Correct Way
```tsx
<Switch
  checked={watch('fieldName') ?? defaultValue}
  onCheckedChange={(checked) => setValue('fieldName', checked)}
/>
```

### ❌ Incorrect Way
```tsx
<Switch
  {...register('fieldName')}
  defaultChecked={defaultValue}
/>
```

## Future Considerations
1. **Component Wrapper**: Consider creating a wrapper component for Switch + react-hook-form integration
2. **Form Validation**: Add validation rules for required fields if needed
3. **Error Handling**: Add error states for Switch components
4. **Testing**: Add unit tests for Switch component behavior

This fix ensures that all Switch components in the application template form properly save their state and persist correctly when the form is submitted.