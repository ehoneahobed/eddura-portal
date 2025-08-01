# AI Recommendation Draft System

## Overview

The AI Recommendation Draft System has been significantly improved to provide a better user experience for students requesting recommendation letters. The system now includes:

1. **AI-Powered Draft Generation**: Generate professional recommendation letter drafts using Google's Gemini AI
2. **Draft Refinement**: Refine drafts with specific feedback and additional context
3. **Template-Based Generation**: Different templates for various use cases (academic, professional, scholarship, etc.)
4. **Interactive Review Process**: Review and edit drafts before sending requests

## How It Works

### 1. Draft Generation Process

When a student creates a recommendation request:

1. **Fill in Details**: Student provides recipient, purpose, achievements, and relationship context
2. **Select Template**: Choose from different recommendation letter templates
3. **Generate Draft**: AI creates a professional draft based on the provided information
4. **Review & Refine**: Student can review the draft and provide feedback for improvements
5. **Finalize**: Once satisfied, the draft is included in the recommendation request

### 2. Template Types

The system supports five different template types:

- **Academic**: For academic programs, research positions, or educational opportunities
- **Professional**: For job applications, internships, or professional development
- **Scholarship**: For scholarship applications and financial aid
- **Research**: For research positions, grants, or academic research opportunities
- **Leadership**: For leadership positions, student government, or organizational roles

### 3. AI Integration

The system uses Google's Gemini AI model (`gemini-pro`) for generating and refining drafts. Each template has specific prompts that focus on relevant aspects:

- **Academic Template**: Focuses on academic performance, research experience, and intellectual capabilities
- **Professional Template**: Emphasizes work ethic, leadership, and professional skills
- **Scholarship Template**: Highlights academic excellence, financial need, and character
- **Research Template**: Concentrates on research experience, methodology, and innovation
- **Leadership Template**: Emphasizes leadership experience, team management, and impact

## API Endpoints

### 1. Generate Draft
```
POST /api/recommendations/generate-draft
```

**Request Body:**
```json
{
  "recipientId": "string",
  "purpose": "string",
  "highlights": "string",
  "relationship": "string",
  "templateType": "academic|professional|scholarship|research|leadership",
  "customInstructions": "string (optional)"
}
```

**Response:**
```json
{
  "draft": "string"
}
```

### 2. Refine Draft
```
POST /api/recommendations/refine-draft
```

**Request Body:**
```json
{
  "currentDraft": "string",
  "feedback": "string",
  "additionalContext": "string (optional)",
  "recipientInfo": "object (optional)",
  "studentInfo": "object (optional)",
  "templateType": "string (optional)"
}
```

**Response:**
```json
{
  "draft": "string"
}
```

### 3. Get Templates
```
GET /api/recommendations/generate-draft
```

**Response:**
```json
{
  "templates": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "fields": ["string"]
    }
  ]
}
```

## User Interface Features

### 1. Draft Generation Section

- **Template Selection**: Dropdown to choose from different recommendation types
- **Relationship Input**: Text field for describing the relationship with the recommender
- **Achievements Input**: Textarea for listing key achievements and highlights
- **Custom Instructions**: Optional field for specific requirements
- **Generate Button**: Triggers AI draft generation

### 2. Draft Editor

- **Current Draft Display**: Shows the generated draft in an editable textarea
- **Feedback Input**: Textarea for providing specific feedback for refinement
- **Refine Button**: Sends feedback to AI for draft improvement
- **Hide/Done Buttons**: Controls for managing the editor interface

### 3. Integration with Description

- Generated drafts automatically populate the main description field
- Students can edit the draft directly in the description area
- Helpful tips guide users on how to use the AI features

## Error Handling

The system includes comprehensive error handling:

1. **API Key Validation**: Checks for valid Google AI API key
2. **Required Field Validation**: Ensures all necessary fields are provided
3. **AI Generation Errors**: Graceful handling of AI API failures
4. **User Feedback**: Clear error messages for different failure scenarios

## Testing

### Manual Testing

1. **Test Draft Generation**:
   ```bash
   npm run test:ai-draft
   ```

2. **Test API Endpoints**:
   - Create a recommendation request with AI draft enabled
   - Test different template types
   - Test draft refinement with feedback

### Automated Testing

The system includes unit tests for:
- AI prompt generation
- Template selection
- Error handling
- API response validation

## Configuration

### Environment Variables

```env
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

### AI Configuration

The system uses the AI configuration from `lib/ai-config.ts`:
- Default provider: Google Gemini
- Model: `gemini-pro`
- Fallback providers: OpenAI GPT, Anthropic Claude

## Best Practices

### For Students

1. **Provide Detailed Information**: The more context you provide, the better the draft
2. **Use Specific Examples**: Include concrete achievements and experiences
3. **Review and Refine**: Always review the generated draft and provide feedback
4. **Customize the Draft**: Edit the draft to match your specific needs
5. **Test Different Templates**: Try different templates for different purposes

### For Developers

1. **Error Handling**: Always handle AI API failures gracefully
2. **User Feedback**: Provide clear feedback during generation and refinement
3. **Template Management**: Keep templates updated and relevant
4. **Performance**: Consider caching for frequently used templates
5. **Security**: Validate all user inputs before sending to AI

## Troubleshooting

### Common Issues

1. **Draft Generation Fails**:
   - Check if `GOOGLE_AI_API_KEY` is set correctly
   - Verify internet connection
   - Check Google AI API status

2. **Poor Quality Drafts**:
   - Ensure all required fields are filled
   - Provide more specific information
   - Try different template types
   - Use the refinement feature with specific feedback

3. **Refinement Not Working**:
   - Provide specific, actionable feedback
   - Include additional context if needed
   - Check if the current draft is valid

### Debug Commands

```bash
# Test AI integration
npm run test:ai-draft

# Check environment variables
echo $GOOGLE_AI_API_KEY

# Test API endpoints
curl -X POST /api/recommendations/generate-draft \
  -H "Content-Type: application/json" \
  -d '{"recipientId":"...","purpose":"..."}'
```

## Future Enhancements

1. **Multi-language Support**: Support for different languages
2. **Advanced Templates**: More specialized templates for specific industries
3. **Draft History**: Save and manage multiple draft versions
4. **Collaborative Editing**: Allow multiple people to review and edit drafts
5. **Smart Suggestions**: AI-powered suggestions for improving drafts
6. **Integration with Document Management**: Direct integration with document storage

## Security Considerations

1. **API Key Protection**: Never expose API keys in client-side code
2. **Input Validation**: Validate all user inputs before processing
3. **Rate Limiting**: Implement rate limiting for AI API calls
4. **Data Privacy**: Ensure user data is handled securely
5. **Audit Logging**: Log AI interactions for monitoring and debugging