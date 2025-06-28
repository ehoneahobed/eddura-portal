import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SWRProvider } from '@/components/providers/SWRProvider';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Eddura Portal - Educational Management System',
  description: 'Comprehensive platform for managing schools, programs, and scholarships',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SWRProvider>
          {children}
          <Toaster />
        </SWRProvider>
      </body>
    </html>
  );
}
