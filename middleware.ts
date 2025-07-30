import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales: locales,
  
  // Used when no locale matches
  defaultLocale: defaultLocale,
  
  // Always show the locale in the URL
  localePrefix: 'always',
  
  // Enable locale detection
  localeDetection: true
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(fr|en)/:path*']
};