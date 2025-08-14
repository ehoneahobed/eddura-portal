'use client';

import { Button, ButtonProps } from '@/components/ui/button';
import { useCommonTranslation } from '@/hooks/useTranslation';
import { forwardRef } from 'react';

interface TranslatedButtonProps extends Omit<ButtonProps, 'children'> {
  translationKey: string;
  values?: Record<string, string | number>;
}

export const TranslatedButton = forwardRef<HTMLButtonElement, TranslatedButtonProps>(
  ({ translationKey, values, ...props }, ref) => {
    const { t } = useCommonTranslation();
    
    return (
      <Button ref={ref} {...props}>
        {t(translationKey, values)}
      </Button>
    );
  }
);

TranslatedButton.displayName = 'TranslatedButton';

// Common button variants with predefined translation keys
export function SaveButton(props: Omit<ButtonProps, 'children'>) {
  return <TranslatedButton translationKey="actions.save" {...props} />;
}

export function CancelButton(props: Omit<ButtonProps, 'children'>) {
  return <TranslatedButton translationKey="actions.cancel" variant="outline" {...props} />;
}

export function DeleteButton(props: Omit<ButtonProps, 'children'>) {
  return <TranslatedButton translationKey="actions.delete" variant="destructive" {...props} />;
}

export function EditButton(props: Omit<ButtonProps, 'children'>) {
  return <TranslatedButton translationKey="actions.edit" variant="outline" {...props} />;
}

export function CreateButton(props: Omit<ButtonProps, 'children'>) {
  return <TranslatedButton translationKey="actions.create" {...props} />;
}

export function ViewButton(props: Omit<ButtonProps, 'children'>) {
  return <TranslatedButton translationKey="actions.view" variant="outline" {...props} />;
}

export function CopyButton(props: Omit<ButtonProps, 'children'>) {
  return <TranslatedButton translationKey="actions.copy" variant="outline" {...props} />;
}

export function DownloadButton(props: Omit<ButtonProps, 'children'>) {
  return <TranslatedButton translationKey="actions.download" variant="outline" {...props} />;
}

export function SearchButton(props: Omit<ButtonProps, 'children'>) {
  return <TranslatedButton translationKey="actions.search" {...props} />;
}

export function FilterButton(props: Omit<ButtonProps, 'children'>) {
  return <TranslatedButton translationKey="actions.filter" variant="outline" {...props} />;
}

export function ClearButton(props: Omit<ButtonProps, 'children'>) {
  return <TranslatedButton translationKey="actions.clear" variant="ghost" {...props} />;
}