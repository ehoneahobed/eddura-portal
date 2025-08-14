'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { LanguageSelector } from '@/components/ui/language-selector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestI18nPage() {
  const { t, locale } = useTranslation();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Internationalization Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p><strong>Current Locale:</strong> {locale}</p>
          </div>
          
          <div>
            <p><strong>Language Selector:</strong></p>
            <LanguageSelector variant="dropdown" />
          </div>
          
          <div>
            <p><strong>Sample Translations:</strong></p>
            <ul className="space-y-2">
              <li>Dashboard: {t('pages.dashboard.title')}</li>
              <li>Welcome: {t('common.messages.welcome')}</li>
              <li>Save: {t('common.actions.save')}</li>
              <li>Loading: {t('common.status.loading')}</li>
              <li>Documents: {t('pages.documents.title')}</li>
              <li>Library: {t('pages.library.title')}</li>
            </ul>
          </div>
          
          <div>
            <p><strong>Compact Language Selector:</strong></p>
            <LanguageSelector variant="compact" />
          </div>
          
          <div>
            <p><strong>Toggle Language Selector:</strong></p>
            <LanguageSelector variant="toggle" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}