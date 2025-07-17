import { Metadata } from 'next';
import CreateInterestForm from '@/components/applications/CreateInterestForm';

export const metadata: Metadata = {
  title: 'Add Interest - Eddura',
  description: 'Add a new interest in a program, school, or external institution to track your application journey.',
  keywords: 'add interest, program interest, school interest, application tracking',
  openGraph: {
    title: 'Add Interest - Eddura',
    description: 'Add a new interest in a program, school, or external institution to track your application journey.',
    type: 'website',
    url: 'https://eddura.com/applications/create-interest',
    siteName: 'Eddura',
  },
};

export default function CreateInterestPage() {
  return <CreateInterestForm />;
}