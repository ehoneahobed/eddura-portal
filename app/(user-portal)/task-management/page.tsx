import { Metadata } from 'next';
import TaskManagementContent from '@/components/task-management/TaskManagementContent';

export const metadata: Metadata = {
  title: 'Task Management - Eddura',
  description: 'Comprehensive task management for all your school, program, and scholarship applications. Track deadlines, manage statuses, and stay organized.',
  keywords: 'task management, application tracking, deadlines, application status, school applications, program applications, scholarship applications',
  openGraph: {
    title: 'Task Management - Eddura',
    description: 'Comprehensive task management for all your school, program, and scholarship applications. Track deadlines, manage statuses, and stay organized.',
    type: 'website',
    url: 'https://eddura.com/task-management',
    siteName: 'Eddura',
  },
};

export default function TaskManagementPage() {
  return <TaskManagementContent />;
}