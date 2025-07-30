'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { locales, type Locale } from '@/i18n';

export function useI18n() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();

  // Extract current locale from pathname
  const currentLocale = pathname.split('/')[1] as Locale || 'en';

  const switchLanguage = (locale: Locale) => {
    // Remove current locale from pathname
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '') || '/';
    
    // Navigate to new locale
    router.push(`/${locale}${pathWithoutLocale}`);
  };

  const getLocalizedPath = (path: string, locale?: Locale) => {
    const targetLocale = locale || currentLocale;
    return `/${targetLocale}${path}`;
  };

  return {
    currentLocale,
    switchLanguage,
    getLocalizedPath,
    t,
    locales
  };
}