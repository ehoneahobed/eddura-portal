import { Metadata } from 'next';
import QuizIntro from '@/components/quiz/QuizIntro';

export const metadata: Metadata = {
  title: 'Career Discovery Quiz - Eddura',
  description: 'Take our comprehensive career discovery quiz to find your perfect university program. Get personalized AI recommendations based on your interests, strengths, and goals.',
  keywords: 'career quiz, university program finder, career discovery, AI recommendations, student assessment',
  openGraph: {
    title: 'Career Discovery Quiz - Eddura',
    description: 'Discover your perfect university program with our AI-powered career quiz. Get personalized recommendations based on your unique profile.',
    type: 'website',
    url: 'https://eddura.com/quiz',
    siteName: 'Eddura',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Career Discovery Quiz - Eddura',
    description: 'Discover your perfect university program with our AI-powered career quiz.',
  },
};

export default function QuizPage() {
  return <QuizIntro />;
} 