'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type PageSkeletonProps = {
  blocks: readonly string[];
  className?: string;
};

export function PageSkeleton({ blocks, className }: PageSkeletonProps) {
  return (
    <div className={cn('app-page space-y-4', className)}>
      {blocks.map((blockClassName, index) => (
        <Skeleton key={`${blockClassName}-${index}`} className={blockClassName} />
      ))}
    </div>
  );
}
