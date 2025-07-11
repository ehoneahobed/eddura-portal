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
The fix involved two main changes:

### 1. API Endpoint Fixes
Updated the API endpoints to return the data directly instead of wrapped in an object, and added proper data transformation:

**Files Modified:**
1. **app/api/schools/[id]/route.ts** - Changed `return NextResponse.json({ school });` to `return NextResponse.json(transformSchool(school));`
2. **app/api/programs/[id]/route.ts** - Changed `return NextResponse.json({ program });` to `return NextResponse.json(transformProgram(program));` and added `transformProgram` function
3. **app/api/scholarships/[id]/route.ts** - Changed `return NextResponse.json({ scholarship });` to `return NextResponse.json(transformScholarship(scholarship));` and added `transformScholarship` function

**Data Transformation Functions:**
All three APIs now have consistent data transformation functions that:
- Handle MongoDB lean queries properly
- Add an `id` field from the MongoDB `_id` field
- Return the data in the format expected by the frontend

### 2. View Page Fixes
Converted all view pages from server-side rendering to client-side rendering to avoid server-side fetch issues:

**Files Modified:**
1. **app/admin/schools/[id]/page.tsx** - Converted to client-side rendering with useState and useEffect
2. **app/admin/programs/[id]/page.tsx** - Converted to client-side rendering with useState and useEffect  
3. **app/admin/scholarships/[id]/page.tsx** - Converted to client-side rendering with useState and useEffect

**View Page Changes:**
- Added `'use client'` directive
- Replaced server-side fetch with client-side fetch using React hooks
- Added loading states and error handling
- Maintained the same UI and functionality

## Impact
With these changes:
- ✅ School view and edit pages now display all data correctly
- ✅ Program view and edit pages now display all data correctly  
- ✅ Scholarship view and edit pages now display all data correctly
- ✅ Application templates continue to work as before (no changes needed)

## Testing
After implementing these changes, verify that:
1. **View Pages**: Navigate to any school, program, or scholarship view page - all fields should show their actual values with proper loading states
2. **Edit Pages**: Navigate to any school, program, or scholarship edit page - all form fields should be pre-populated with existing data
3. **Data Persistence**: Edit and save any entity - the data should persist correctly
4. **Application Templates**: Continue to work as before (no changes needed)
5. **Loading States**: View pages should show loading spinners while fetching data
6. **Error Handling**: Proper error messages should display if data fails to load

## Technical Details
Both view and edit pages now use client-side rendering with `useState` and `useEffect` for consistent data fetching behavior. This approach:
- Avoids server-side fetch issues with host headers
- Provides better loading states and error handling
- Ensures consistent behavior across all pages
- Makes debugging easier with client-side console logs

The application templates were already working because they use a custom hook (`useApplicationTemplate`) that handles the data fetching correctly, and their API endpoint was already returning data in the right format.

## Why This Happened
The original issue occurred because:
1. **API Inconsistency**: Schools, programs, and scholarships APIs were wrapping data in objects while application templates API returned data directly
2. **Server-side Fetch Issues**: Server-side rendering had issues with host headers and absolute URLs
3. **Data Transformation**: MongoDB `_id` fields needed to be converted to `id` fields for frontend compatibility

The fix ensures all APIs return data in the same format and all pages use the same data fetching approach.