import { Metadata } from 'next';
import TaskManagementPage from '@/components/task-management/TaskManagementPage';

export const metadata: Metadata = {
  title: 'Task Management - Eddura',
  description: 'Manage your applications, interviews, and follow-ups in one place.',
  keywords: 'task management, applications, interviews, follow-ups, deadlines, Eddura',
  openGraph: {
    title: 'Task Management - Eddura',
    description: 'Manage your applications, interviews, and follow-ups in one place.',
    type: 'website',
    url: 'https://eddura.com/task-management',
    siteName: 'Eddura',
  },
};

export default function TaskManagementPageRoute() {
  return <TaskManagementPage />;
}