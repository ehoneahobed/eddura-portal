import { getRequestConfig } from 'next-intl/server';
import { defaultLocale } from './config';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !['en', 'fr'].includes(locale)) {
    locale = defaultLocale;
  }

  return {
    messages: (await import(`./locales/${locale}.json`)).default
  };
});