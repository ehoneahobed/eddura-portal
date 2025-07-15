# AI Content Generation Integration Guide

This guide explains how to set up and use the AI content generation feature for document creation in the application.

## Overview

The AI integration allows users to generate compelling content for various document types (personal statements, motivation letters, CVs, etc.) using advanced AI models. The system is designed to be provider-agnostic, making it easy to switch between different AI services.

## Features

- **Multi-Provider Support**: Currently supports Google Gemini, with plans for OpenAI and Anthropic
- **Document Type Awareness**: AI generates content tailored to specific document types and their guidelines
- **Context-Aware Generation**: Uses user-provided context to create personalized content
- **Voice Preservation**: Generates content in the user's voice, not as AI assistance
- **Easy Integration**: Seamless integration with existing document creation and editing workflows

## Setup Instructions

### 1. Environment Configuration

Add the following environment variables to your `.env.local` file:

```bash
# AI Services
GOOGLE_AI_API_KEY=your-google-ai-api-key-here
OPENAI_API_KEY=your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

### 2. Getting API Keys

#### Google Gemini (Recommended)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env.local` file

#### OpenAI (Future Support)
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key to your `.env.local` file

#### Anthropic (Future Support)
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create a new API key
3. Copy the key to your `.env.local` file

### 3. Configuration

The AI provider is configured in `lib/ai-config.ts`. By default, the system uses Google Gemini. To change the provider:

```typescript
export const aiConfig: AIConfig = {
  defaultProvider: 'google', // Change to 'openai' or 'anthropic'
  // ... rest of config
};
```

## Usage

### For Users

1. **Creating New Documents**:
   - Open the "Create Document" dialog
   - Fill in basic information (title, type, etc.)
   - Click "Generate with AI" button next to the content field
   - Fill in the AI generation form with your context and goals
   - Click "Generate Content" to create AI-generated content
   - Review and edit the generated content as needed

2. **Editing Existing Documents**:
   - Open any document for editing
   - Click "Generate with AI" button next to the content field
   - Provide context and generate new content
   - The generated content will replace the current content

### AI Generation Form Fields

- **Document Type**: Select the type of document you're creating
- **Context**: Describe your background, experiences, goals, and what makes you unique
- **Target Program**: The specific academic program you're targeting
- **Target Scholarship**: The specific scholarship you're applying for
- **Target Institution**: The university or institution you're targeting
- **Additional Information**: Any other relevant information for better content generation

## Technical Implementation

### API Endpoint

The AI generation is handled by `/api/ai/generate` which:

1. Validates user input
2. Crafts comprehensive prompts based on document type
3. Calls the configured AI provider
4. Returns generated content with word/character counts

### Prompt Engineering

The system uses sophisticated prompt engineering to ensure:

- Content is written in the user's voice (no AI prefixes)
- Content follows document type guidelines
- Content incorporates user context and target information
- Content meets recommended length requirements

### Error Handling

The system includes comprehensive error handling for:

- Missing API keys
- Invalid user input
- AI service failures
- Network issues

## Security Considerations

- API keys are stored server-side only
- User authentication is required for all AI generation requests
- Input validation prevents malicious prompts
- Rate limiting can be implemented as needed

## Troubleshooting

### Common Issues

1. **"AI service not configured" error**:
   - Check that your API key is set in `.env.local`
   - Verify the API key is valid and has sufficient credits

2. **"Failed to generate content" error**:
   - Check your internet connection
   - Verify the AI service is operational
   - Check API key permissions and quotas

3. **Poor quality generated content**:
   - Provide more detailed context in the generation form
   - Be specific about your goals and experiences
   - Use the additional information field for extra context

### Debug Mode

To enable debug logging, add to your `.env.local`:

```bash
DEBUG_AI=true
```

## Future Enhancements

- [ ] OpenAI GPT-4 integration
- [ ] Anthropic Claude integration
- [ ] Model selection per document type
- [ ] Content refinement suggestions
- [ ] Batch content generation
- [ ] Content quality scoring
- [ ] Template-based generation
- [ ] Multi-language support

## Support

For technical support or questions about the AI integration:

1. Check the troubleshooting section above
2. Review the API documentation
3. Contact the development team

## Contributing

To add support for new AI providers:

1. Update `lib/ai-config.ts` with the new provider configuration
2. Add the provider implementation in `/api/ai/generate/route.ts`
3. Update the environment variables documentation
4. Add tests for the new provider
5. Update this guide with setup instructions