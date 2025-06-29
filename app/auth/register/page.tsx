import { Metadata } from 'next';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Register - Eddura',
  description: 'Create your Eddura account to save your quiz results and get personalized recommendations.',
  keywords: 'register, sign up, create account, Eddura, career quiz',
};

export default function RegisterPage() {
  return <RegisterForm />;
} 