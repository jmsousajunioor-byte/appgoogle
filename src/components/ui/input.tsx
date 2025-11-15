import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => (
    <input
      ref={ref}
      className={`h-12 w-full rounded-2xl border border-border/40 bg-input/60 px-4 text-sm text-foreground transition-all focus-visible:border-cosmic-blue/60 focus-visible:ring-2 focus-visible:ring-cosmic-blue/40 focus-visible:outline-none ${className}`.trim()}
      {...props}
    />
  ),
);

Input.displayName = 'Input';

export default Input;
