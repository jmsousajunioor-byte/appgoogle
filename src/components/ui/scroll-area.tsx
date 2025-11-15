import React from 'react';

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600/60 scrollbar-track-transparent pr-2 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  ),
);

ScrollArea.displayName = 'ScrollArea';

export default ScrollArea;
