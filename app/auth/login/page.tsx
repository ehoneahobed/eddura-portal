import { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In - Eddura',
  description: 'Sign in to your Eddura account to access your quiz results and personalized recommendations.',
  keywords: 'login, sign in, authentication, Eddura, career quiz',
};

export default function LoginPage() {
  return <LoginForm />;
} 