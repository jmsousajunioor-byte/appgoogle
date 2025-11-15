import React from 'react';

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'link' | 'destructive';
type ButtonSize = 'default' | 'sm' | 'lg';

const baseClasses =
  'inline-flex items-center justify-center rounded-2xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cosmic-blue disabled:pointer-events-none disabled:opacity-60';

const variantClasses: Record<ButtonVariant, string> = {
  default:
    'bg-gradient-to-r from-cosmic-purple via-cosmic-blue to-cosmic-pink text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:scale-[1.01]',
  outline: 'border border-border/50 text-foreground hover:bg-white/10',
  ghost: 'text-foreground hover:bg-white/10',
  link: 'text-cosmic-blue underline-offset-4 hover:underline',
  destructive: 'bg-red-600 text-white hover:bg-red-500',
};

const sizeClasses: Record<ButtonSize, string> = {
  default: 'h-12 px-5 text-sm',
  sm: 'h-10 px-4 text-sm',
  lg: 'h-14 px-6 text-base',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();
    return <button ref={ref} className={classes} {...props} />;
  },
);

Button.displayName = 'Button';

export default Button;
