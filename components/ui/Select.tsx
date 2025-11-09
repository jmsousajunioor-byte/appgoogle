import React, { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  children: React.ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, name, error, children, ...props }, ref) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
        {label}
      </label>
      <select
        id={name}
        name={name}
        ref={ref}
        className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-neutral-700 dark:text-neutral-100 ${
          error ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'
        }`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;