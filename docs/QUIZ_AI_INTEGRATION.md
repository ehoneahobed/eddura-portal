# AI-Powered Quiz Integration

## Overview

The AI-powered quiz integration enhances the existing career discovery quiz by providing intelligent analysis of user responses and generating personalized recommendations for career paths, educational programs, and scholarship opportunities.

## Features

### 1. AI Analysis Engine
- **Comprehensive Analysis**: Analyzes quiz responses to identify career preferences, skills, and interests
- **Career Path Recommendations**: Suggests primary and alternative career paths with detailed information
- **Program Matching**: Recommends undergraduate and postgraduate programs based on user preferences
- **Scholarship Recommendations**: Identifies relevant scholarship types and opportunities
- **Action Planning**: Provides immediate steps and long-term goals for career development

### 2. Database Integration
- **Program Matching**: Automatically finds matching programs from the database based on AI recommendations
- **Scholarship Matching**: Identifies relevant scholarships from the database
- **Career Preferences Update**: Updates user career preferences with AI insights

### 3. User Interface
- **Interactive Results**: Tabbed interface showing career paths, programs, scholarships, and action plans
- **AI Generation Button**: One-click AI analysis generation
- **Progress Tracking**: Real-time loading states and error handling
- **Responsive Design**: Mobile-friendly interface with modern UI components

## Architecture

### API Endpoints

#### `/api/ai/quiz-analysis` (POST)
Generates AI-powered analysis of quiz responses.

**Request Body:**
```typescript
{
  userId: string;
  analysisType: 'career_recommendations' | 'program_recommendations' | 'scholarship_recommendations' | 'comprehensive';
  customInstructions?: string;
}
```

**Response:**
```typescript
{
  analysis: AIAnalysis;
  matchingPrograms: MatchingProgram[];
  matchingScholarships: MatchingScholarship[];
  updatedCareerPreferences: CareerPreferences;
}
```

#### `/api/quiz/results` (GET)
Enhanced quiz results with scholarship recommendations.

**Response:**
```typescript
{
  quizCompleted: boolean;
  quizCompletedAt: string;
  matchScore: number;
  insights: QuizInsights;
  careerPreferences: CareerPreferences;
  recommendedPrograms: Program[];
  recommendedSchools: School[];
  recommendedScholarships: Scholarship[];
  quizResponses: QuizResponses;
}
```

### Components

#### `QuizResults.tsx`
Main component for displaying quiz results with AI integration.

**Key Features:**
- AI analysis generation button
- Tabbed interface for different recommendation types
- Interactive program and scholarship cards
- Action plan visualization
- Download and share functionality

#### `useAIRecommendations.ts`
Custom hook for managing AI recommendations.

**Methods:**
- `generateAnalysis()`: Generate AI analysis
- `clearAnalysis()`: Clear current analysis
- `retryAnalysis()`: Retry failed analysis

### Data Models

#### AIAnalysis Interface
```typescript
interface AIAnalysis {
  careerInsights: {
    primaryCareerPaths: CareerPath[];
    alternativeCareerPaths: CareerPath[];
    skillGaps: SkillGap[];
    personalityTraits: string[];
    workStyle: string[];
  };
  programRecommendations: {
    undergraduatePrograms: ProgramRecommendation[];
    postgraduatePrograms: ProgramRecommendation[];
    specializations: Specialization[];
  };
  scholarshipRecommendations: {
    scholarshipTypes: ScholarshipType[];
    targetFields: string[];
    applicationStrategy: ApplicationStrategy;
  };
  actionPlan: {
    immediateSteps: ActionStep[];
    shortTermGoals: string[];
    longTermGoals: string[];
  };
  summary: {
    keyStrengths: string[];
    areasForDevelopment: string[];
    overallAssessment: string;
    confidenceLevel: string;
  };
}
```

## Implementation Details

### AI Prompt Engineering

The AI analysis uses sophisticated prompt engineering to ensure high-quality recommendations:

1. **Context-Aware Analysis**: Considers user's educational background, interests, and constraints
2. **Structured Output**: Enforces JSON format for consistent parsing
3. **Comprehensive Coverage**: Analyzes career paths, programs, scholarships, and action plans
4. **Realistic Recommendations**: Focuses on achievable and relevant suggestions

### Database Integration

#### Program Matching
```typescript
async function getMatchingPrograms(recommendations: any): Promise<any[]> {
  const programFields = [
    ...recommendations.programRecommendations?.undergraduatePrograms?.map(p => p.fieldOfStudy),
    ...recommendations.programRecommendations?.postgraduatePrograms?.map(p => p.fieldOfStudy),
    ...recommendations.programRecommendations?.specializations?.map(s => s.area)
  ].filter(Boolean);

  const fieldQueries = programFields.map(field => ({
    $or: [
      { fieldOfStudy: { $regex: field, $options: 'i' } },
      { name: { $regex: field, $options: 'i' } },
      { description: { $regex: field, $options: 'i' } }
    ]
  }));

  return await Program.find({ $or: fieldQueries })
    .populate('schoolId', 'name country globalRanking')
    .limit(15)
    .lean();
}
```

#### Scholarship Matching
```typescript
async function getMatchingScholarships(recommendations: any): Promise<any[]> {
  const scholarshipTypes = recommendations.scholarshipRecommendations?.scholarshipTypes || [];
  const targetFields = recommendations.scholarshipRecommendations?.targetFields || [];

  const queries = [];
  
  scholarshipTypes.forEach(type => {
    if (type.type) {
      queries.push({
        $or: [
          { name: { $regex: type.type, $options: 'i' } },
          { description: { $regex: type.type, $options: 'i' } },
          { eligibilityCriteria: { $regex: type.type, $options: 'i' } }
        ]
      });
    }
  });

  return await Scholarship.find({ $or: queries })
    .populate('schoolId', 'name country')
    .limit(10)
    .lean();
}
```

### Error Handling

The system includes comprehensive error handling:

1. **Retry Logic**: Automatic retries for transient failures
2. **Fallback Responses**: Graceful degradation when AI service is unavailable
3. **User-Friendly Messages**: Clear error messages for different failure types
4. **Validation**: Input validation and response parsing validation

### Performance Optimization

1. **Caching**: AI analysis results are cached to avoid redundant API calls
2. **Lazy Loading**: Program and scholarship data loaded on demand
3. **Pagination**: Limited results to prevent performance issues
4. **Database Indexing**: Optimized queries for fast program and scholarship matching

## Usage Examples

### Generating AI Analysis

```typescript
import { useAIRecommendations } from '@/hooks/use-ai-recommendations';

function QuizResults() {
  const { generateAnalysis, isLoading, error, analysis } = useAIRecommendations();

  const handleGenerateAnalysis = async () => {
    const result = await generateAnalysis('comprehensive');
    if (result) {
      // Handle successful analysis
      console.log('AI analysis generated:', result);
    }
  };

  return (
    <div>
      <Button onClick={handleGenerateAnalysis} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate AI Analysis'}
      </Button>
      {error && <Alert>{error}</Alert>}
      {analysis && <AnalysisDisplay analysis={analysis} />}
    </div>
  );
}
```

### Displaying Career Paths

```typescript
function CareerPathsTab({ analysis }: { analysis: AIAnalysis }) {
  return (
    <div>
      <h3>Primary Career Paths</h3>
      {analysis.careerInsights.primaryCareerPaths.map((career, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{career.title}</CardTitle>
            <CardDescription>{career.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <h4>Education Requirements</h4>
              {career.educationRequirements.map((req, idx) => (
                <div key={idx}>{req}</div>
              ))}
            </div>
            <div>
              <h4>Key Skills</h4>
              {career.skillsNeeded.map((skill, idx) => (
                <Badge key={idx}>{skill}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

## Configuration

### Environment Variables

```env
# AI Provider Configuration
GOOGLE_AI_API_KEY=your_google_ai_api_key
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# AI Configuration
AI_DEFAULT_PROVIDER=google
AI_MAX_RETRIES=3
AI_BASE_DELAY=2000
AI_MAX_DELAY=10000
```

### AI Configuration

```typescript
// lib/ai-config.ts
export const aiConfig: AIConfig = {
  defaultProvider: 'google',
  providers: {
    google: {
      name: 'Google Gemini',
      apiKey: process.env.GOOGLE_AI_API_KEY || '',
      model: 'gemini-1.5-flash',
      enabled: !!process.env.GOOGLE_AI_API_KEY
    },
    // ... other providers
  },
  retrySettings: {
    maxRetries: 5,
    enableFallback: true,
    baseDelay: 2000,
    maxDelay: 10000,
    backoffMultiplier: 2
  }
};
```

## Testing

### Unit Tests

```typescript
// tests/unit/ai-quiz-analysis.test.ts
import { craftAnalysisPrompt, parseAIResponse } from '@/lib/ai-quiz-utils';

describe('AI Quiz Analysis', () => {
  test('craftAnalysisPrompt generates valid prompt', () => {
    const quizResponses = { educationLevel: ['bachelors'] };
    const prompt = craftAnalysisPrompt(quizResponses, 'comprehensive');
    expect(prompt).toContain('You are an expert career counselor');
    expect(prompt).toContain('STUDENT QUIZ RESPONSES');
  });

  test('parseAIResponse handles valid JSON', () => {
    const mockResponse = JSON.stringify({
      careerInsights: { primaryCareerPaths: [] },
      programRecommendations: { undergraduatePrograms: [] }
    });
    const result = parseAIResponse(mockResponse);
    expect(result.careerInsights).toBeDefined();
    expect(result.programRecommendations).toBeDefined();
  });
});
```

### Integration Tests

```typescript
// tests/integration/quiz-ai-api.test.ts
describe('Quiz AI API', () => {
  test('POST /api/ai/quiz-analysis generates analysis', async () => {
    const response = await request(app)
      .post('/api/ai/quiz-analysis')
      .send({
        userId: 'test-user-id',
        analysisType: 'comprehensive'
      })
      .expect(200);

    expect(response.body.analysis).toBeDefined();
    expect(response.body.matchingPrograms).toBeDefined();
    expect(response.body.matchingScholarships).toBeDefined();
  });
});
```

## Future Enhancements

### Planned Features

1. **Advanced Analytics**: Track user engagement with recommendations
2. **Personalization**: Learn from user interactions to improve recommendations
3. **Multi-language Support**: Support for multiple languages in AI analysis
4. **Export Functionality**: PDF export of analysis results
5. **Comparison Tools**: Compare different career paths side-by-side

### Technical Improvements

1. **Caching Strategy**: Implement Redis caching for AI responses
2. **Batch Processing**: Process multiple users' quiz responses in batches
3. **Real-time Updates**: WebSocket integration for real-time analysis updates
4. **A/B Testing**: Test different AI prompts and recommendation algorithms

## Troubleshooting

### Common Issues

1. **AI Service Unavailable**
   - Check API key configuration
   - Verify network connectivity
   - Check service status pages

2. **Slow Response Times**
   - Implement caching
   - Optimize database queries
   - Consider using faster AI models

3. **Inaccurate Recommendations**
   - Review and improve AI prompts
   - Validate quiz response data
   - Update recommendation algorithms

### Debug Mode

Enable debug mode to get detailed logs:

```typescript
// lib/ai-config.ts
export const aiConfig: AIConfig = {
  // ... existing config
  debug: process.env.NODE_ENV === 'development',
  logLevel: 'debug'
};
```

## Contributing

### Development Setup

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Set up environment variables
4. Run development server: `pnpm dev`
5. Test AI integration: `pnpm test:ai`

### Code Style

- Follow TypeScript best practices
- Use SOLID principles
- Write comprehensive tests
- Document all public APIs
- Follow the existing code style

### Pull Request Process

1. Create a feature branch
2. Implement changes with tests
3. Update documentation
4. Submit pull request with detailed description
5. Address review feedback
6. Merge after approval

## License

This feature is part of the Eddura platform and follows the same licensing terms as the main project. 