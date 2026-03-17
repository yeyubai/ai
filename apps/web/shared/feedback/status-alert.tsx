'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

type StatusAlertProps = {
  message: string;
  variant?: 'default' | 'destructive';
  className?: string;
};

export function StatusAlert({
  message,
  variant = 'default',
  className,
}: StatusAlertProps) {
  return (
    <Alert variant={variant} className={cn(className)}>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
