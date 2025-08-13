import { ThemeAwareLogo } from '@/components/ui/logo';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-black">
      <span className="sr-only">Loading Eddura…</span>
      <ThemeAwareLogo size="7xl" className="animate-pulse" />
    </div>
  );
}


