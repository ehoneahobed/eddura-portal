import { Metadata } from 'next';
import LandingPage from '@/components/landing/LandingPage';

export const metadata: Metadata = {
  title: 'Eddura: AI-Powered University & Scholarship Application Platform',
  description: 'Streamline your university and scholarship applications with Eddura\'s AI-powered platform. Centralize documents, get AI essay assistance, discover best-fit programs, and track everything in one place. Apply smarter, not harder.',
  keywords: 'university applications, scholarship applications, AI essay assistance, college applications, academic platform, student success',
  openGraph: {
    title: 'Eddura: AI-Powered University & Scholarship Application Platform',
    description: 'Streamline your university and scholarship applications with Eddura\'s AI-powered platform. Centralize documents, get AI essay assistance, discover best-fit programs, and track everything in one place.',
    type: 'website',
    url: 'https://eddura.com',
    siteName: 'Eddura',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eddura: AI-Powered University & Scholarship Application Platform',
    description: 'Streamline your university and scholarship applications with Eddura\'s AI-powered platform.',
  },
};

export default function HomePage() {
  return <LandingPage />;
}