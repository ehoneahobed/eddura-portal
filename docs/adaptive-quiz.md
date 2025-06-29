# Adaptive Quiz System

## Overview

The Eddura quiz system has been enhanced with adaptive logic that tailors the quiz experience based on the user's educational level and program interests. This ensures that users only see relevant questions and receive more targeted recommendations.

## Key Features

### 1. Educational Level Adaptation

The quiz adapts based on whether the user is seeking:
- **Undergraduate programs** (Bachelor's degrees)
- **Postgraduate programs** (Master's, Ph.D., MBA)
- **Diploma/Certificate programs**

### 2. Conditional Question Logic

Questions can be conditionally shown based on previous responses:

```typescript
{
  id: 'careerProgression',
  conditionalLogic: {
    dependsOn: 'programInterest',
    showWhen: ['postgraduate']
  }
}
```

### 3. Section Filtering

Entire sections can be filtered based on user responses:

```typescript
{
  id: 'academic-preparation',
  showFor: {
    programInterest: ['undergraduate']
  }
}
```

## Quiz Flow

### For Undergraduate Students

1. **Education & Aspirations** - Basic educational background
2. **Academic Preparation** - High school subjects and achievements
3. **Interest Areas** - Broad field interests
4. **Work Environment** - Preferred work settings
5. **Work Style** - Natural working approach
6. **Strengths & Skills** - Academic and personal strengths
7. **Career Goals & Values** - What motivates them
8. **Academic Subjects** - Preferred subjects and learning style
9. **Time Commitment** - How much time they can dedicate
10. **Budget Considerations** - Financial constraints
11. **Location Preferences** - Where they want to study

### For Postgraduate Students

1. **Education & Aspirations** - Previous degrees and career goals
2. **Postgraduate Background** - Work experience and research interests
3. **Interest Areas** - Specialized field interests
4. **Work Environment** - Preferred work settings
5. **Work Style** - Natural working approach
6. **Strengths & Skills** - Professional strengths
7. **Career Goals & Values** - What motivates them
8. **Academic Subjects** - Preferred subjects and learning style
9. **Time Commitment** - How much time they can dedicate
10. **Budget Considerations** - Financial constraints
11. **Location Preferences** - Where they want to study

## Data Collection

### Undergraduate-Specific Data

- **High School Subjects**: Mathematics, Physics, Chemistry, Biology, English Literature, History, etc.
- **Academic Achievements**: GPA, Honors courses, Science fairs, Competitions, Leadership roles
- **Academic Background**: Previous subjects studied

### Postgraduate-Specific Data

- **Work Experience**: Entry-level, Mid-level, Senior-level, Management, Research, Teaching, etc.
- **Research Interests**: AI/ML, Sustainability, Healthcare Innovation, Data Science, etc.
- **Career Progression Goals**: Same field advancement, Field switch, Specialization, Research/Academia, etc.
- **Previous Degree Field**: What they studied in their most recent degree

## AI Recommendations

The AI recommendation engine now uses this adaptive data to provide more targeted suggestions:

### Undergraduate Recommendations

- **Engineering**: Based on strong mathematics/physics performance
- **Business**: Based on business studies/economics background
- **Health Sciences**: Based on biology/chemistry performance
- **Arts & Humanities**: Based on English literature/history performance

### Postgraduate Recommendations

- **MBA**: For career advancement and leadership goals
- **Data Science**: For technical specialization and research interests
- **Public Policy**: For social impact and public service goals
- **Engineering**: For technical advancement in the same field
- **Research Programs**: For those with research experience and interests

## Technical Implementation

### Key Functions

- `getFilteredSections()`: Returns sections based on user responses
- `getFilteredQuestions()`: Returns questions based on conditional logic
- `getNextSection()`: Gets the next section in the adaptive flow
- `getPreviousSection()`: Gets the previous section in the adaptive flow
- `getAdaptiveProgressPercentage()`: Calculates progress based on filtered sections

### Data Structure

```typescript
interface QuizQuestion {
  conditionalLogic?: {
    dependsOn: string;
    showWhen: string[];
  };
}

interface QuizSection {
  showFor?: {
    educationLevel?: string[];
    programInterest?: string[];
  };
}
```

## Benefits

1. **Relevant Questions**: Users only see questions that apply to their situation
2. **Faster Completion**: Reduced quiz length for better user experience
3. **Better Recommendations**: More targeted AI suggestions based on relevant data
4. **Improved UX**: Less overwhelming and more focused experience
5. **Higher Completion Rates**: Shorter, more relevant quizzes lead to better completion

## Testing

Use the test component (`test-adaptive-quiz.tsx`) to verify the adaptive logic:

1. Select different program interests
2. Observe how sections and questions change
3. Verify navigation works correctly
4. Check that progress calculations are accurate

## Future Enhancements

- **Dynamic Question Ordering**: Questions could be reordered based on importance
- **Branching Logic**: More complex conditional paths based on multiple factors
- **Personalization**: Questions could adapt based on user behavior patterns
- **A/B Testing**: Different question sets for different user segments 