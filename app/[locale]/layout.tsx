import { ReactNode } from 'react';
import { locales } from '@/i18n';

interface LocaleLayoutProps {
  children: ReactNode;
  params: { locale: string };
}

export default function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = params;

  // Validate locale
  if (!locales.includes(locale as any)) {
    return null; // This will trigger the not-found page
  }

  return <>{children}</>;
}