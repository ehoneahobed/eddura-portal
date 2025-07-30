export interface AIProviderConfig {
  name: string;
  apiKey: string;
  model: string;
  enabled: boolean;
}

export interface AIConfig {
  defaultProvider: 'google' | 'openai' | 'anthropic';
  providers: {
    google: AIProviderConfig;
    openai: AIProviderConfig;
    anthropic: AIProviderConfig;
  };
  // Retry and fallback settings
  retrySettings: {
    maxRetries: number;
    enableFallback: boolean;
    enableProviderFallback: boolean; // Try different AI providers if one fails
    baseDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
    fallbackScores: {
      overall: number;
      contentQuality: number;
      completeness: number;
      relevance: number;
      formatting: number;
      clarity: number;
      strength: number;
    };
  };
}

export const aiConfig: AIConfig = {
  defaultProvider: 'google',
  providers: {
    google: {
      name: 'Google Gemini',
      apiKey: process.env.GOOGLE_AI_API_KEY || '',
      model: 'gemini-1.5-flash',
      enabled: !!process.env.GOOGLE_AI_API_KEY
    },
    openai: {
      name: 'OpenAI GPT',
      apiKey: process.env.OPENAI_API_KEY || '',
      model: 'gpt-4o-mini',
      enabled: !!process.env.OPENAI_API_KEY
    },
    anthropic: {
      name: 'Anthropic Claude',
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      model: 'claude-3-haiku-20240307',
      enabled: !!process.env.ANTHROPIC_API_KEY
    }
  },
  retrySettings: {
    maxRetries: 5, // Increased from 3 to 5
    enableFallback: true,
    enableProviderFallback: true, // New: try different providers
    baseDelay: 2000, // Increased from 1000 to 2000ms
    maxDelay: 10000, // Increased from 5000 to 10000ms
    backoffMultiplier: 2,
    fallbackScores: {
      overall: 50,
      contentQuality: 50,
      completeness: 50,
      relevance: 50,
      formatting: 50,
      clarity: 50,
      strength: 50
    }
  }
};

export function getActiveProvider() {
  const config = aiConfig.providers[aiConfig.defaultProvider];
  return config.enabled ? config : null;
}

export function getAvailableProviders() {
  return Object.entries(aiConfig.providers)
    .filter(([_, config]) => config.enabled)
    .map(([key, config]) => ({ key, ...config }));
}