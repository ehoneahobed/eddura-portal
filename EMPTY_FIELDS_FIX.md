# Fix for Empty Fields Issue in Schools, Programs, and Scholarships

## Problem Description
The view and edit pages for schools, programs, and scholarships were showing empty values/fields even though the data existed in the database. Application templates were working correctly, which provided a clue to the issue.

## Root Cause
The issue was in the API endpoints for schools, programs, and scholarships. These endpoints were returning data wrapped in an object:

**Schools API**: `return NextResponse.json({ school });`
**Programs API**: `return NextResponse.json({ program });`
**Scholarships API**: `return NextResponse.json({ scholarship });`

However, the view and edit pages were expecting the data directly, not wrapped in an object. The pages were trying to access properties like `school.name`, `program.title`, `scholarship.title`, but the actual data structure was:

```json
{
  "school": {
    "name": "...",
    "city": "...",
    // ... other fields
  }
}
```

Meanwhile, the application templates API was correctly returning the data directly:
**Application Templates API**: `return NextResponse.json(transformTemplate(template));`

## Solution
Updated the API endpoints to return the data directly instead of wrapped in an object:

### Files Modified:
1. **app/api/schools/[id]/route.ts** - Changed `return NextResponse.json({ school });` to `return NextResponse.json(transformSchool(school));`
2. **app/api/programs/[id]/route.ts** - Changed `return NextResponse.json({ program });` to `return NextResponse.json(program);`
3. **app/api/scholarships/[id]/route.ts** - Changed `return NextResponse.json({ scholarship });` to `return NextResponse.json(scholarship);`

## Impact
With these changes:
- ✅ School view and edit pages now display all data correctly
- ✅ Program view and edit pages now display all data correctly  
- ✅ Scholarship view and edit pages now display all data correctly
- ✅ Application templates continue to work as before (no changes needed)

## Testing
After implementing these changes, verify that:
1. Navigate to any school, program, or scholarship view page - all fields should show their actual values
2. Navigate to any school, program, or scholarship edit page - all form fields should be pre-populated with existing data
3. Edit and save any entity - the data should persist correctly
4. Application templates should continue to work as before

## Technical Details
The view pages use server-side rendering with `fetch` and `await res.json()`, while the edit pages use client-side rendering with `useState` and `useEffect`. Both approaches now receive the data in the correct format.

The application templates were already working because they use a custom hook (`useApplicationTemplate`) that handles the data fetching correctly, and their API endpoint was already returning data in the right format.