import { Metadata } from 'next';
import ApplicationView from '@/components/applications/ApplicationView';

export const metadata: Metadata = {
  title: 'Application View - Eddura',
  description: 'View your completed scholarship application with all questions and answers.',
  keywords: 'application view, scholarship application, application review',
  openGraph: {
    title: 'Application View - Eddura',
    description: 'View your completed scholarship application with all questions and answers.',
    type: 'website',
    url: 'https://eddura.com/applications',
    siteName: 'Eddura',
  },
};

interface ApplicationViewPageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicationViewPage({ params }: ApplicationViewPageProps) {
  const resolvedParams = await params;
  
  return <ApplicationView applicationId={resolvedParams.id} />;
}