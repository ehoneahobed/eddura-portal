'use client';

import { useTranslations } from 'next-intl';
import { useI18n } from '@/hooks/use-i18n';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

export default function TestI18nPage() {
  const t = useTranslations('common');
  const { currentLocale, switchLanguage } = useI18n();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Language Test
            </h1>
            <LanguageSwitcher />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Current Language Info */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">
                Language Information
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
                  English
                </Button>
                <Button 
                  onClick={() => switchLanguage('fr')}
                  variant={currentLocale === 'fr' ? 'default' : 'outline'}
                  className="w-full"
                >
                  French
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
                    <li>• {t('loading')}</li>
                    <li>• {t('save')}</li>
                    <li>• {t('cancel')}</li>
                    <li>• {t('error')}</li>
                  </ul>
                </div>
                
                <div>
                  <strong>Navigation:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• {t('dashboard')}</li>
                    <li>• {t('scholarships')}</li>
                    <li>• {t('documents')}</li>
                    <li>• {t('settings')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Sections */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">
                Dashboard
              </h3>
              <p className="text-gray-700 mb-3">
                Your personalized dashboard
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Recent Activity</li>
                <li>• Upcoming Deadlines</li>
                <li>• Completed Applications</li>
              </ul>
            </div>

            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">
                Scholarships
              </h3>
              <p className="text-gray-700 mb-3">
                Find and apply for scholarships
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Search scholarships...</li>
                <li>• Apply Now</li>
                <li>• View Details</li>
              </ul>
            </div>

            <div className="bg-teal-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">
                Documents
              </h3>
              <p className="text-gray-700 mb-3">
                Manage your documents
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Upload Document</li>
                <li>• Download Document</li>
                <li>• Delete Document</li>
              </ul>
            </div>
          </div>

          {/* Error Messages */}
          <div className="mt-8 bg-red-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-red-800">
              Error Messages
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong className="text-red-700">Error Messages:</strong>
                <ul className="ml-4 mt-1 space-y-1 text-sm">
                  <li>• {t('somethingWentWrong')}</li>
                  <li>• {t('tryAgain')}</li>
                  <li>• {t('notFound')}</li>
                  <li>• {t('unauthorized')}</li>
                </ul>
              </div>
              <div>
                <strong className="text-red-700">File Errors:</strong>
                <ul className="ml-4 mt-1 space-y-1 text-sm">
                  <li>• {t('fileTooLarge')}</li>
                  <li>• {t('unsupportedFormat')}</li>
                  <li>• {t('uploadFailed')}</li>
                  <li>• {t('downloadFailed')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}