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
  duration: 0.4,
  ease: [0.22, 1, 0.36, 1] as const,
};

const beamTransition = {
  duration: 0.68,
  ease: [0.22, 1, 0.36, 1] as const,
};

export function RouteTransitionShell({ pathname, children, className }: Props) {
  return (
    <div className={cn('route-transition-shell', className)}>
      <AnimatePresence initial={false} mode="wait">
        <m.div
          key={`route-layer-${pathname}`}
          className="route-transition-frame"
          initial={{
            opacity: 0,
            clipPath: 'inset(0 0 10% 0 round 32px)',
            filter: 'saturate(0.92) brightness(0.985)',
          }}
          animate={{
            opacity: 1,
            clipPath: 'inset(0 0 0% 0 round 32px)',
            filter: 'saturate(1) brightness(1)',
          }}
          exit={{
            opacity: 0.72,
            clipPath: 'inset(2% 0 0 0 round 32px)',
            filter: 'saturate(1.02) brightness(1.01)',
          }}
          transition={pageTransition}
        >
          <m.div
            aria-hidden="true"
            className="route-transition-beam"
            initial={{ opacity: 0, x: '-20%', scaleX: 0.9 }}
            animate={{
              opacity: [0, 0.82, 0],
              x: ['-20%', '-4%', '18%'],
              scaleX: [0.9, 1, 1.08],
            }}
            transition={beamTransition}
          />
          {children}
        </m.div>
      </AnimatePresence>
    </div>
  );
}
