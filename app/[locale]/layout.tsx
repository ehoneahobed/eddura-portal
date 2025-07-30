import { ReactNode } from 'react';
import { locales } from '@/i18n';

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as any)) {
    return null; // This will trigger the not-found page
  }

  return <>{children}</>;
}