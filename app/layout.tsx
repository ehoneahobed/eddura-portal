import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SWRProvider } from '@/components/providers/SWRProvider';
import SessionProvider from '@/components/providers/SessionProvider';
import ErrorBoundaryProvider from '@/components/providers/ErrorBoundaryProvider';
import { AnalyticsProvider } from '@/components/AnalyticsProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { I18nProvider } from '@/components/providers/I18nProvider';
import { Toaster } from '@/components/ui/toaster';
import { getInitialLocale } from '@/lib/i18n';
import { headers } from 'next/headers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Eddura - Scholarships and School Application Platform',
    template: '%s | Eddura'
  },
  description: 'Eddura is a comprehensive platform for managing your schools, programs, and scholarships applications.',
  keywords: [
    'Eddura',
    'scholarships',
    'school applications',
    'program applications',
    'scholarship applications',
    'scholarship platform',
    'academic programs',
    'educational institutions',
    'student applications',
    'scholarship technology'
  ],
  authors: [{ name: 'Eddura Team' }],
  creator: 'Eddura',
  publisher: 'Eddura',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://eddura.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://eddura.com',
    title: 'Eddura - Scholarships and School Application Platform',
    description: 'Eddura is a comprehensive platform for managing your schools, programs, and scholarships applications.',
    siteName: 'Eddura',
    images: [
      {
        url: '/assets/images/eddura-logo-white-text.jpg',
        width: 1200,
        height: 630,
        alt: 'Eddura - Scholarships and School Application Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eddura - Scholarships and School Application Platform',
    description: 'Eddura is a comprehensive platform for managing your schools, programs, and scholarships applications.',
    images: ['/assets/images/eddura-logo-white-text.jpg'],
    creator: '@eddura',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get initial locale from headers (set by middleware)
  const headersList = await headers();
  const initialLocale = headersList.get('x-locale') || 'en';

  return (
    <html lang={initialLocale} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ErrorBoundaryProvider>
          <SessionProvider>
            <SWRProvider>
              <AnalyticsProvider>
                <ThemeProvider>
                  <I18nProvider initialLocale={initialLocale as any}>
                    {children}
                  </I18nProvider>
                </ThemeProvider>
                <Toaster />
              </AnalyticsProvider>
            </SWRProvider>
          </SessionProvider>
        </ErrorBoundaryProvider>
      </body>
    </html>
  );
}
