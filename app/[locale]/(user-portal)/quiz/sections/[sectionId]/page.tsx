import { Metadata } from 'next';
import QuizSection from '@/components/quiz/QuizSection';
import { QUIZ_SECTIONS, getSectionById } from '@/lib/quiz-config';
import { notFound } from 'next/navigation';

interface QuizSectionPageProps {
  params: Promise<{ sectionId: string }>;
}

export async function generateMetadata({ params }: QuizSectionPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const section = getSectionById(resolvedParams.sectionId);
  
  if (!section) {
    return {
      title: 'Section Not Found - Eddura Quiz',
    };
  }

  return {
    title: `${section.title} - Career Discovery Quiz - Eddura`,
    description: section.description,
  };
}

export async function generateStaticParams() {
  return QUIZ_SECTIONS.map((section) => ({
    sectionId: section.id,
  }));
}

export default async function QuizSectionPage({ params }: QuizSectionPageProps) {
  const resolvedParams = await params;
  const section = getSectionById(resolvedParams.sectionId);
  
  if (!section) {
    notFound();
  }

  return <QuizSection section={section} />;
} 