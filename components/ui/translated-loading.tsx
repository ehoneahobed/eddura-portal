'use client';

import { LoadingSpinner } from '@/components/ui/enhanced-loading';
import { useCommonTranslation } from '@/hooks/useTranslation';

interface TranslatedLoadingProps {
  messageKey?: string;
  values?: Record<string, string | number>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TranslatedLoading({ 
  messageKey = 'status.loading', 
  values,
  size = 'md',
  className 
}: TranslatedLoadingProps) {
  const { t } = useCommonTranslation();

  return (
    <div className={`flex flex-col items-center justify-center py-8 ${className || ''}`}>
      <LoadingSpinner size={size} />
      <p className="text-eddura-600 dark:text-eddura-400 mt-4 text-sm">
        {t(messageKey, values)}
      </p>
    </div>
  );
}

// Common loading variants
export function LoadingDocuments(props: Omit<TranslatedLoadingProps, 'messageKey'>) {
  return <TranslatedLoading messageKey="status.loadingDocuments" {...props} />;
}

export function LoadingData(props: Omit<TranslatedLoadingProps, 'messageKey'>) {
  return <TranslatedLoading messageKey="status.loadingData" {...props} />;
}