'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, locales, defaultLocale } from '@/i18n/config';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  // Always use the initialLocale if provided, otherwise use defaultLocale
  const [locale, setLocaleState] = useState<Locale>(initialLocale || defaultLocale);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Only detect browser language if no initialLocale was provided and after hydration
  useEffect(() => {
    setIsHydrated(true);
    
    // Only run client-side detection if no initialLocale was provided
    if (!initialLocale && typeof window !== 'undefined') {
      const detectBrowserLanguage = (): Locale => {
        try {
          // Check localStorage first
          const savedLocale = localStorage.getItem('locale') as Locale;
          if (savedLocale && locales.includes(savedLocale)) {
            return savedLocale;
          }

          // Check cookie (set by middleware)
          const cookieLocale = document.cookie
            .split('; ')
            .find(row => row.startsWith('locale='))
            ?.split('=')[1] as Locale;
          
          if (cookieLocale && locales.includes(cookieLocale)) {
            return cookieLocale;
          }

          // Check browser language
          const browserLanguage = navigator.language.split('-')[0] as Locale;
          if (locales.includes(browserLanguage)) {
            return browserLanguage;
          }

          return defaultLocale;
        } catch (error) {
          console.warn('Error detecting browser language:', error);
          return defaultLocale;
        }
      };

      const detectedLocale = detectBrowserLanguage();
      if (detectedLocale !== locale) {
        setLocaleState(detectedLocale);
      }
    }
  }, []);

  const setLocale = async (newLocale: Locale) => {
    if (newLocale === locale) return;

    setIsLoading(true);
    
    try {
      // Update localStorage
      localStorage.setItem('locale', newLocale);
      
      // Update cookie
      document.cookie = `locale=${newLocale}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
      
      // Update HTML lang attribute
      document.documentElement.lang = newLocale;
      
      // Update state
      setLocaleState(newLocale);
      
      // Announce language change to screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = `Language changed to ${newLocale === 'en' ? 'English' : 'Français'}`;
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
      
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update HTML lang attribute when locale changes
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value: I18nContextType = {
    locale,
    setLocale,
    isLoading
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}