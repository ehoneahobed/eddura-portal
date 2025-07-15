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