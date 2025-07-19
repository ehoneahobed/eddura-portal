import { Metadata } from 'next';
import ApplicationPackageManager from '@/components/applications/ApplicationPackageManager';

export const metadata: Metadata = {
  title: 'Application Package Management - Eddura',
  description: 'Manage your application package end-to-end including documents, requirements, interviews, and submission tracking.',
  keywords: 'application management, documents, requirements, interviews, submission tracking',
  openGraph: {
    title: 'Application Package Management - Eddura',
    description: 'Manage your application package end-to-end including documents, requirements, interviews, and submission tracking.',
    type: 'website',
    url: 'https://eddura.com/applications',
    siteName: 'Eddura',
  },
};

interface ApplicationPageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicationPage({ params }: ApplicationPageProps) {
  const resolvedParams = await params;
  
  return <ApplicationPackageManager applicationId={resolvedParams.id} />;
}