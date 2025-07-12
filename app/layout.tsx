import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SWRProvider } from '@/components/providers/SWRProvider';
import SessionProvider from '@/components/providers/SessionProvider';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Eddura - Educational Management Platform',
    template: '%s | Eddura'
  },
  description: 'Eddura is a comprehensive educational management platform for schools, programs, and scholarships. Streamline your educational institution management with our powerful tools.',
  keywords: [
    'Eddura',
    'educational management',
    'school management',
    'program management',
    'scholarship management',
    'education platform',
    'academic programs',
    'educational institutions',
    'student management',
    'education technology'
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
    title: 'Eddura - Educational Management Platform',
    description: 'Comprehensive platform for managing schools, programs, and scholarships. Streamline your educational institution management.',
    siteName: 'Eddura',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Eddura - Educational Management Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eddura - Educational Management Platform',
    description: 'Comprehensive platform for managing schools, programs, and scholarships.',
    images: ['/og-image.jpg'],
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <SWRProvider>
            {children}
            <Toaster />
          </SWRProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
