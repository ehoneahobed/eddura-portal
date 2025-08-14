import { Locale, defaultLocale } from '@/i18n/config';
import { TranslationKeys } from '@/i18n/types';

// Cache for loaded translations
const translationCache = new Map<Locale, TranslationKeys>();

/**
 * Load translations for a specific locale
 */
export async function loadTranslations(locale: Locale): Promise<TranslationKeys> {
  // In development, always reload to pick up latest edits to JSON files
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction && translationCache.has(locale)) {
    return translationCache.get(locale)!;
  }

  try {
    const translations = await import(`@/i18n/locales/${locale}.json`);
    const translationData = translations.default as TranslationKeys;
    
    // Cache the translations (production only to avoid stale cache in dev)
    if (isProduction) {
      translationCache.set(locale, translationData);
    }
    
    return translationData;
  } catch (error) {
    console.error(`Failed to load translations for locale: ${locale}`, error);
    
    // Fallback to default locale if not already trying default
    if (locale !== defaultLocale) {
      console.warn(`Falling back to default locale: ${defaultLocale}`);
      return loadTranslations(defaultLocale);
    }
    
    // If even default locale fails, return empty object
    return {} as TranslationKeys;
  }
}

/**
 * Get nested value from object using dot notation
 */
export function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Replace placeholders in translation strings
 */
export function replacePlaceholders(
  text: string, 
  values?: Record<string, string | number>
): string {
  if (!values) return text;
  
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key]?.toString() || match;
  });
}

/**
 * Format translation with interpolation
 */
export function formatTranslation(
  translation: string,
  values?: Record<string, string | number>
): string {
  if (!values) return translation;
  
  return replacePlaceholders(translation, values);
}

/**
 * Get browser locale preference
 */
export function getBrowserLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;
  
  const browserLanguage = navigator.language.split('-')[0] as Locale;
  const supportedLocales: Locale[] = ['en', 'fr'];
  
  return supportedLocales.includes(browserLanguage) ? browserLanguage : defaultLocale;
}

/**
 * Get locale from server headers (set by middleware)
 */
export function getServerLocale(): Locale {
  try {
    // This will be called on the server side
    const { headers: getHeaders } = require('next/headers');
    const headersList = getHeaders();
    const locale = headersList.get('x-locale') as Locale;
    
    if (locale && ['en', 'fr'].includes(locale)) {
      return locale;
    }
  } catch (error) {
    // If headers are not available, return default
    console.warn('Could not get server locale:', error);
  }
  
  return defaultLocale;
}

/**
 * Get locale from various sources (cookie, localStorage, browser) - CLIENT ONLY
 */
export function getInitialLocale(): Locale {
  if (typeof window === 'undefined') {
    return getServerLocale();
  }
  
  // Check localStorage first
  try {
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && ['en', 'fr'].includes(savedLocale)) {
      return savedLocale;
    }
  } catch (error) {
    console.warn('Could not access localStorage:', error);
  }
  
  // Check cookie
  try {
    const cookieLocale = document.cookie
      .split('; ')
      .find(row => row.startsWith('locale='))
      ?.split('=')[1] as Locale;
    
    if (cookieLocale && ['en', 'fr'].includes(cookieLocale)) {
      return cookieLocale;
    }
  } catch (error) {
    console.warn('Could not access cookies:', error);
  }
  
  // Fallback to browser language
  return getBrowserLocale();
}

/**
 * Clear translation cache (useful for development)
 */
export function clearTranslationCache(): void {
  translationCache.clear();
}