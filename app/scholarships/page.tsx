import { Metadata } from 'next';
import ScholarshipsPage from '@/components/scholarships/ScholarshipsPage';

export const metadata: Metadata = {
  title: 'Scholarships - Eddura',
  description: 'Discover and apply for scholarships that match your profile and academic goals.',
  keywords: 'scholarships, financial aid, university funding, student grants, academic scholarships',
  openGraph: {
    title: 'Scholarships - Eddura',
    description: 'Discover and apply for scholarships that match your profile and academic goals.',
    type: 'website',
    url: 'https://eddura.com/scholarships',
    siteName: 'Eddura',
  },
};

export default function ScholarshipsPageRoute() {
  return <ScholarshipsPage />;
}