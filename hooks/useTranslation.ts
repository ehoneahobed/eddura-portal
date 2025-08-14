'use client';

import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';
import { loadTranslations, getNestedValue, formatTranslation } from '@/lib/i18n';
import { TranslationKeys } from '@/i18n/types';
import { Locale } from '@/i18n/config';

interface UseTranslationReturn {
  t: (key: string, values?: Record<string, string | number>) => string;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isLoading: boolean;
  error: string | null;
  translations: TranslationKeys | null;
}

export function useTranslation(): UseTranslationReturn {
  const { locale, setLocale, isLoading: contextLoading } = useI18n();
  const [translations, setTranslations] = useState<TranslationKeys | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load translations when locale changes
  useEffect(() => {
    let isMounted = true;

    const loadLocaleTranslations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const translationData = await loadTranslations(locale);
        
        if (isMounted) {
          setTranslations(translationData);
        }
      } catch (err) {
        console.error('Error loading translations:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load translations');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadLocaleTranslations();

    return () => {
      isMounted = false;
    };
  }, [locale]);

  // Translation function with fallback and interpolation
  const t = useCallback((
    key: string, 
    values?: Record<string, string | number>
  ): string => {
    if (!translations) {
      // Provide a readable fallback instead of returning the full key path
      const fallback = key.split('.').pop() || key;
      const humanized = fallback
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[._-]/g, ' ')
        .trim();
      return humanized.charAt(0).toUpperCase() + humanized.slice(1);
    }

    try {
      const translation = getNestedValue(translations, key);
      
      if (translation === undefined || translation === null) {
        console.warn(`Translation missing for key: ${key} in locale: ${locale}`);
        
        // Return the key as fallback, but make it more readable
        const fallback = key.split('.').pop() || key;
        return fallback.charAt(0).toUpperCase() + fallback.slice(1);
      }

      if (typeof translation !== 'string') {
        console.warn(`Translation for key: ${key} is not a string:`, translation);
        return key;
      }

      return formatTranslation(translation, values);
    } catch (err) {
      console.error(`Error getting translation for key: ${key}`, err);
      return key;
    }
  }, [translations, locale]);

  return {
    t,
    locale,
    setLocale,
    isLoading: isLoading || contextLoading,
    error,
    translations
  };
}

// Specialized hooks for common use cases
export function usePageTranslation(page: keyof TranslationKeys['pages'] | string) {
  const { t, ...rest } = useTranslation();
  
  const pageT = useCallback((key: string, values?: Record<string, string | number>) => {
    return t(`pages.${page}.${key}`, values);
  }, [t, page]);

  return { t: pageT, ...rest };
}

export function useCommonTranslation() {
  const { t, ...rest } = useTranslation();
  
  const commonT = useCallback((key: string, values?: Record<string, string | number>) => {
    return t(`common.${key}`, values);
  }, [t]);

  return { t: commonT, ...rest };
}

export function useFormTranslation() {
  const { t, ...rest } = useTranslation();
  
  const formT = useCallback((key: string, values?: Record<string, string | number>) => {
    return t(`forms.${key}`, values);
  }, [t]);

  return { t: formT, ...rest };
}

export function useNotificationTranslation() {
  const { t, ...rest } = useTranslation();
  
  const notificationT = useCallback((key: string, values?: Record<string, string | number>) => {
    return t(`notifications.${key}`, values);
  }, [t]);

  return { t: notificationT, ...rest };
}