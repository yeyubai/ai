import type { ReactNode } from 'react';

export default function RootTemplate({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="route-transition-shell">
      <div aria-hidden="true" className="route-transition-veil" />
      <div className="route-transition-content">{children}</div>
    </div>
  );
}
