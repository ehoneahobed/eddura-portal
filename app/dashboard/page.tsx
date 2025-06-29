import { Metadata } from 'next';
import DashboardContent from '@/components/dashboard/DashboardContent';

export const metadata: Metadata = {
  title: 'Dashboard - Eddura',
  description: 'Your personalized dashboard with quiz results and career recommendations.',
  keywords: 'dashboard, quiz results, career recommendations, Eddura',
};

export default function DashboardPage() {
  return <DashboardContent />;
} 