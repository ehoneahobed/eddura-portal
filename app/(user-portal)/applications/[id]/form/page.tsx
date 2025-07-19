import { Metadata } from 'next';
import ApplicationForm from '@/components/applications/ApplicationForm';

export const metadata: Metadata = {
  title: 'Application Form - Eddura',
  description: 'Fill out your scholarship application form',
  keywords: 'application form, scholarship application, form submission',
};

interface ApplicationFormPageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicationFormPage({ params }: ApplicationFormPageProps) {
  const resolvedParams = await params;
  
  return <ApplicationForm applicationId={resolvedParams.id} />;
} 