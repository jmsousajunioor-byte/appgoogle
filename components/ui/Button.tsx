import React from 'react';
import { Icon } from './Icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ComponentProps<typeof Icon>['icon'];
  rightIcon?: React.ComponentProps<typeof Icon>['icon'];
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  leftIcon, 
  rightIcon, 
  className = '', 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/50 focus:ring-indigo-500',
    secondary: 'bg-white/10 dark:bg-neutral-700/20 backdrop-blur-md text-neutral-700 dark:text-neutral-200 border border-white/20 dark:border-neutral-600 hover:bg-white/20 dark:hover:bg-neutral-600 focus:ring-indigo-500',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg hover:shadow-red-500/50 focus:ring-red-500',
    ghost: 'bg-transparent text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 focus:ring-indigo-500',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`} {...props}>
      {leftIcon && <Icon icon={leftIcon} className="mr-2 h-5 w-5" />}
      {children}
      {rightIcon && <Icon icon={rightIcon} className="ml-2 h-5 w-5" />}
    </button>
  );
};

export default Button;