# AI Recommendation Draft System - Setup Guide

## Quick Setup

### 1. Get Google AI API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure Environment Variables

Add the API key to your `.env.local` file:

```env
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

### 3. Test the Setup

Run the test script to verify everything is working:

```bash
npm run test:ai-draft
```

You should see output like:
```
🧪 Testing AI Draft Generation...

✅ API Key found
📝 Generating test draft...
✅ Draft generated successfully!
🎉 All tests passed! AI draft generation is working correctly.
```

## Troubleshooting

### Common Issues

#### 1. "AI service not configured" Error

**Cause**: Missing or invalid API key
**Solution**: 
- Check that `GOOGLE_AI_API_KEY` is set in your `.env.local` file
- Verify the API key is correct and active
- Restart your development server after adding the environment variable

#### 2. "Failed to generate draft" Error

**Cause**: API key issues or network problems
**Solution**:
- Check your internet connection
- Verify the API key has sufficient quota
- Check [Google AI API status](https://status.ai.google.com/)

#### 3. Model Not Found Error

**Cause**: Using outdated model name
**Solution**: 
- The system now uses `gemini-1.5-flash` (updated automatically)
- Make sure you're using the latest version of the code

### Debug Steps

1. **Check Environment Variables**:
   ```bash
   echo $GOOGLE_AI_API_KEY
   ```

2. **Test API Key**:
   ```bash
   npm run test:ai-draft
   ```

3. **Check Network**:
   ```bash
   curl -I https://generativelanguage.googleapis.com
   ```

4. **Verify API Quota**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Check your usage and quota limits

## API Key Security

### Best Practices

1. **Never commit API keys to version control**
2. **Use environment variables** for all API keys
3. **Rotate keys regularly** for security
4. **Monitor usage** to prevent unexpected charges

### Environment Setup

#### Development (.env.local)
```env
GOOGLE_AI_API_KEY=your_development_key_here
```

#### Production (Vercel)
1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add `GOOGLE_AI_API_KEY` with your production key

## Usage Limits

### Google AI Free Tier
- **Rate Limit**: 15 requests per minute
- **Daily Limit**: 1,500 requests per day
- **Model**: gemini-1.5-flash

### Monitoring Usage

1. **Check Vercel Logs**: Monitor API calls in your deployment logs
2. **Google AI Studio**: Track usage in the Google AI Studio dashboard
3. **Application Logs**: Check console logs for AI-related errors

## Advanced Configuration

### Multiple AI Providers

The system supports multiple AI providers. To switch providers:

1. **Update AI Config** (`lib/ai-config.ts`):
   ```typescript
   export const aiConfig: AIConfig = {
     defaultProvider: 'openai', // or 'anthropic'
     // ... rest of config
   };
   ```

2. **Add Provider API Keys**:
   ```env
   OPENAI_API_KEY=your_openai_key_here
   ANTHROPIC_API_KEY=your_anthropic_key_here
   ```

### Custom Models

To use different models:

1. **Update Model Name** (`lib/ai-config.ts`):
   ```typescript
   providers: {
     google: {
       model: 'gemini-1.5-pro', // or other available models
       // ... rest of config
     }
   }
   ```

2. **Check Model Availability**: Verify the model is available in your API key's quota

## Support

### Getting Help

1. **Check Logs**: Look for error messages in the browser console and server logs
2. **Test API**: Use the test script to verify basic functionality
3. **Documentation**: Refer to `AI_RECOMMENDATION_DRAFT_SYSTEM.md` for detailed information

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "AI service not configured" | Missing API key | Add `GOOGLE_AI_API_KEY` to environment |
| "Failed to generate draft" | API key invalid or quota exceeded | Check API key and quota limits |
| "Model not found" | Outdated model name | Update to use `gemini-1.5-flash` |
| "Network error" | Connection issues | Check internet connection and API status |

### Contact

For technical support:
1. Check the troubleshooting section above
2. Review the error logs
3. Test with the provided test script
4. Verify your API key and quota status