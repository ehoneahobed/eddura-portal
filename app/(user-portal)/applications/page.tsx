import { Metadata } from 'next';
import ApplicationsPage from '@/components/applications/ApplicationsPage';

export const metadata: Metadata = {
  title: 'My Applications - Eddura',
  description: 'Track and manage your scholarship applications. View progress, status, and continue where you left off.',
  keywords: 'applications, scholarship applications, application tracking, application status',
  openGraph: {
    title: 'My Applications - Eddura',
    description: 'Track and manage your scholarship applications. View progress, status, and continue where you left off.',
    type: 'website',
    url: 'https://eddura.com/applications',
    siteName: 'Eddura',
  },
};

export default function ApplicationsPageRoute() {
  return <ApplicationsPage />;
}