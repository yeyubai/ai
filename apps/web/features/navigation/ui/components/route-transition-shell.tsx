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

const pageVariants = {
  initial: {
    opacity: 0,
    x: 28,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: -28,
  },
};

export function RouteTransitionShell({ pathname, children, className }: Props) {
  return (
    <div className={cn('route-transition-shell', className)}>
      <AnimatePresence initial={false} mode="wait">
        <m.div
          key={`route-layer-${pathname}`}
          className="route-transition-frame"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
        >
          {children}
        </m.div>
      </AnimatePresence>
    </div>
  );
}
