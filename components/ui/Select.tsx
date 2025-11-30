import React, { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  children: React.ReactNode;
  mode?: 'native' | 'custom';
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, name, error, children, className = '', mode = 'native', value, onChange, ...props }, ref) => {
  const opts = React.Children.toArray(children).map((child: any) => ({
    value: String(child.props.value),
    label: String(child.props.children),
  }));
  const selected = opts.find(o => String(value ?? '') === o.value) ?? null;

  const [open, setOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);

  const handleSelect = (val: string) => {
    if (onChange) {
      const synthetic = { target: { value: val } } as unknown as React.ChangeEvent<HTMLSelectElement>;
      onChange(synthetic);
    }
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-neutral-800 dark:text-neutral-300 mb-1">
        {label}
      </label>

      {mode === 'native' ? (
        <div className={`relative rounded-md shadow-sm px-3 py-2 bg-white/10 dark:bg-neutral-800/20 backdrop-blur-md border border-white/20 dark:border-neutral-700/30 ${error ? 'border-red-500' : ''}`}>
          <select
            id={name}
            name={name}
            ref={ref}
            className={`block w-full bg-transparent border-0 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-neutral-800 dark:text-neutral-100 appearance-none ${className}`}
            value={value}
            onChange={onChange}
            {...props}
          >
            {children}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            <svg className="h-4 w-4 text-neutral-500 dark:text-neutral-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
      ) : (
        <div className="relative select-float inline-block min-w-[8rem]">
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setOpen(o => !o)}
            onBlur={() => setTimeout(() => setOpen(false), 100)}
            onKeyDown={handleKeyDown}
            className={`w-full text-left bg-transparent border-0 outline-none sm:text-sm text-neutral-800 dark:text-neutral-100 ${className}`}
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            {selected ? selected.label : ''}
            <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <svg className="h-4 w-4 text-neutral-500 dark:text-neutral-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd" />
              </svg>
            </span>
          </button>
          {open && (
            <ul
              role="listbox"
              className="absolute z-10 mt-1 left-0 right-0 bg-transparent backdrop-blur-sm border-0 shadow-none p-1"
            >
              {opts.map(o => (
                <li
                  key={o.value}
                  role="option"
                  aria-selected={String(value ?? '') === o.value}
                  className="px-2 py-1 cursor-pointer bg-transparent text-neutral-800 dark:text-neutral-100 hover:text-indigo-600"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(o.value)}
                >
                  {o.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
