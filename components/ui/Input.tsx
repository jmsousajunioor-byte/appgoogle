import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, name, error, ...props }, ref) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
        {label}
      </label>
      <input
        id={name}
        name={name}
        ref={ref}
        className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-neutral-700 dark:text-neutral-100 ${
          error ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;