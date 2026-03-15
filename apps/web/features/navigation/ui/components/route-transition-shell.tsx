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
  duration: 0.42,
  ease: [0.22, 1, 0.36, 1] as const,
};

const beamTransition = {
  duration: 0.56,
  ease: [0.24, 0.9, 0.32, 1] as const,
};

export function RouteTransitionShell({ pathname, children, className }: Props) {
  return (
    <div className={cn('route-transition-shell', className)}>
      <AnimatePresence initial={false} mode="sync">
        <m.div
          key={`route-beam-${pathname}`}
          aria-hidden="true"
          className="route-transition-beam"
          initial={{
            opacity: 0,
            x: '-22%',
            y: -10,
            scaleX: 0.82,
          }}
          animate={{
            opacity: [0, 0.92, 0],
            x: ['-22%', '4%', '18%'],
            y: [-10, -4, 0],
            scaleX: [0.82, 0.96, 1.06],
          }}
          exit={{ opacity: 0 }}
          transition={beamTransition}
        />

        <m.div
          key={`route-frame-${pathname}`}
          className="route-transition-frame"
          initial={{
            opacity: 0,
            y: 18,
            scale: 0.988,
            filter: 'blur(12px) saturate(0.92)',
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px) saturate(1)',
          }}
          exit={{
            opacity: 0,
            y: -10,
            scale: 1.01,
            filter: 'blur(8px) saturate(1.04)',
          }}
          transition={pageTransition}
        >
          {children}
        </m.div>
      </AnimatePresence>
    </div>
  );
}
