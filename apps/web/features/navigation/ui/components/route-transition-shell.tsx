'use client';

import { type ReactNode } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { cn } from '@/lib/utils';

type Props = {
  pathname: string;
  children: ReactNode;
  className?: string;
};

const pageTransition = {
  duration: 0.26,
  ease: [0.22, 1, 0.36, 1] as const,
};

const beamTransition = {
  duration: 0.42,
  ease: [0.22, 1, 0.36, 1] as const,
};

export function RouteTransitionShell({ pathname, children, className }: Props) {
  return (
    <div className={cn('route-transition-shell', className)}>
      <AnimatePresence initial={false} mode="wait">
        <m.div
          key={`route-layer-${pathname}`}
          className="route-transition-frame"
          initial={{ opacity: 0.82 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0.9 }}
          transition={pageTransition}
        >
          <m.div
            aria-hidden="true"
            className="route-transition-beam"
            initial={{ opacity: 0, x: '-14%' }}
            animate={{ opacity: [0, 0.75, 0], x: ['-14%', '0%', '10%'] }}
            transition={beamTransition}
          />
          {children}
        </m.div>
      </AnimatePresence>
    </div>
  );
}
