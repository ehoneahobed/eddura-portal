/**
 * Application configuration
 * Centralized configuration management for environment variables
 */

export const config = {
  // Launch status - controls whether to show full landing page or coming soon
  isLaunched: process.env.NEXT_PUBLIC_LAUNCHED === 'true',
  
  // Telegram channel URL for coming soon page
  telegramChannel: 'https://t.me/edduraofficial',
  
  // Application metadata
  appName: 'Eddura',
  appDescription: 'Revolutionize your university & scholarship applications with AI-powered insights',
  
  // Database configuration
  mongodbUri: process.env.MONGODB_URI || '',
  
  // Feature flags
  features: {
    enableAdminPanel: true,
    enableApplicationTemplates: true,
    enableScholarshipManagement: true,
  }
} as const;

export type Config = typeof config; 