import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Program Details | Eddura Portal',
  description: 'View detailed information about academic programs, admission requirements, tuition fees, and more.',
  keywords: 'academic programs, university programs, admission requirements, tuition fees, study abroad',
};

export default function ProgramDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 