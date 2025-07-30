import StudentLayout from '@/components/layout/StudentLayout';

export default function UserPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentLayout>{children}</StudentLayout>;
}