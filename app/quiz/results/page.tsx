import { Metadata } from 'next';
import QuizResults from '@/components/quiz/QuizResults';

export const metadata: Metadata = {
  title: 'Your Career Discovery Results - Eddura',
  description: 'Discover your personalized career insights and university program recommendations based on your quiz responses.',
  keywords: 'career results, university recommendations, personalized insights, career discovery',
  openGraph: {
    title: 'Your Career Discovery Results - Eddura',
    description: 'Discover your personalized career insights and university program recommendations.',
    type: 'website',
    url: 'https://eddura.com/quiz/results',
    siteName: 'Eddura',
  },
};

export default function QuizResultsPage() {
  return <QuizResults />;
} 