import React from 'react';
import { cn } from '@/lib/utils';

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'dark' | 'light';
}

export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className = '', variant = 'dark', ...props }, ref) => {
    const base = variant === 'light' ? 'glass-panel-light' : 'glass-panel';
    return <div ref={ref} className={cn(base, className)} {...props} />;
  },
);

GlassPanel.displayName = 'GlassPanel';

export default GlassPanel;
