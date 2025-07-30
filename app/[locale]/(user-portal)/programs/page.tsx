import { Metadata } from 'next';
import ProgramsPage from '@/components/programs/ProgramsPage';

export const metadata: Metadata = {
  title: 'Programs - Eddura',
  description: 'Discover academic programs and universities that match your career goals and preferences.',
  keywords: 'university programs, academic programs, degree programs, study abroad, higher education',
  openGraph: {
    title: 'Programs - Eddura',
    description: 'Discover academic programs and universities that match your career goals and preferences.',
    type: 'website',
    url: 'https://eddura.com/programs',
    siteName: 'Eddura',
  },
};

export default function ProgramsPageRoute() {
  return <ProgramsPage />;
}
