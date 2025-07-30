'use client';

import { useTranslations } from 'next-intl';
import { useI18n } from '@/hooks/use-i18n';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

export default function TestI18nPage() {
  const t = useTranslations();
  const { currentLocale, switchLanguage } = useI18n();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {t('common.language')} Test
            </h1>
            <LanguageSwitcher />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Current Language Info */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">
                {t('common.language')} Information
              </h2>
              <p className="text-gray-700 mb-2">
                <strong>Current Language:</strong> {currentLocale.toUpperCase()}
              </p>
              <p className="text-gray-700 mb-4">
                <strong>URL:</strong> {typeof window !== 'undefined' ? window.location.pathname : ''}
              </p>
              
              <div className="space-y-2">
                <Button 
                  onClick={() => switchLanguage('en')}
                  variant={currentLocale === 'en' ? 'default' : 'outline'}
                  className="w-full"
                >
                  {t('common.english')}
                </Button>
                <Button 
                  onClick={() => switchLanguage('fr')}
                  variant={currentLocale === 'fr' ? 'default' : 'outline'}
                  className="w-full"
                >
                  {t('common.french')}
                </Button>
              </div>
            </div>

            {/* Translation Examples */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">
                Translation Examples
              </h2>
              <div className="space-y-3">
                <div>
                  <strong>Common:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• {t('common.loading')}</li>
                    <li>• {t('common.save')}</li>
                    <li>• {t('common.cancel')}</li>
                    <li>• {t('common.error')}</li>
                  </ul>
                </div>
                
                <div>
                  <strong>Navigation:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• {t('navigation.dashboard')}</li>
                    <li>• {t('navigation.scholarships')}</li>
                    <li>• {t('navigation.documents')}</li>
                    <li>• {t('navigation.settings')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Sections */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">
                {t('dashboard.title')}
              </h3>
              <p className="text-gray-700 mb-3">
                {t('dashboard.overview')}
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• {t('dashboard.recentActivity')}</li>
                <li>• {t('dashboard.upcomingDeadlines')}</li>
                <li>• {t('dashboard.completedApplications')}</li>
              </ul>
            </div>

            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">
                {t('scholarships.title')}
              </h3>
              <p className="text-gray-700 mb-3">
                {t('scholarships.findAndApply')}
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• {t('scholarships.searchPlaceholder')}</li>
                <li>• {t('scholarships.applyNow')}</li>
                <li>• {t('scholarships.viewDetails')}</li>
              </ul>
            </div>

            <div className="bg-teal-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">
                {t('documents.title')}
              </h3>
              <p className="text-gray-700 mb-3">
                {t('documents.manageDocuments')}
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• {t('documents.uploadDocument')}</li>
                <li>• {t('documents.downloadDocument')}</li>
                <li>• {t('documents.deleteDocument')}</li>
              </ul>
            </div>
          </div>

          {/* Error Messages */}
          <div className="mt-8 bg-red-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-red-800">
              {t('errors.title')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong className="text-red-700">Error Messages:</strong>
                <ul className="ml-4 mt-1 space-y-1 text-sm">
                  <li>• {t('errors.somethingWentWrong')}</li>
                  <li>• {t('errors.tryAgain')}</li>
                  <li>• {t('errors.notFound')}</li>
                  <li>• {t('errors.unauthorized')}</li>
                </ul>
              </div>
              <div>
                <strong className="text-red-700">File Errors:</strong>
                <ul className="ml-4 mt-1 space-y-1 text-sm">
                  <li>• {t('errors.fileTooLarge')}</li>
                  <li>• {t('errors.unsupportedFormat')}</li>
                  <li>• {t('errors.uploadFailed')}</li>
                  <li>• {t('errors.downloadFailed')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}