import { Metadata } from 'next';
import ApplicationPackageDashboard from '@/components/applications/ApplicationPackageDashboard';

export const metadata: Metadata = {
  title: 'Application Management - Eddura',
  description: 'Track and manage your program interests and application packages. View progress, status, and manage your entire application journey.',
  keywords: 'applications, program interests, application packages, application tracking, application management',
  openGraph: {
    title: 'Application Management - Eddura',
    description: 'Track and manage your program interests and application packages. View progress, status, and manage your entire application journey.',
    type: 'website',
    url: 'https://eddura.com/applications',
    siteName: 'Eddura',
  },
};

export default function ApplicationsPageRoute() {
  return <ApplicationPackageDashboard />;
}