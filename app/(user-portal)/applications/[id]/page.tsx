import { Metadata } from 'next';
import ApplicationForm from '@/components/applications/ApplicationForm';

export const metadata: Metadata = {
  title: 'Application Form - Eddura',
  description: 'Complete your scholarship application step by step.',
  keywords: 'application form, scholarship application, apply for scholarship',
  openGraph: {
    title: 'Application Form - Eddura',
    description: 'Complete your scholarship application step by step.',
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
  
  return <ApplicationForm applicationId={resolvedParams.id} />;
}