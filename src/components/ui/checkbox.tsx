import React from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', onCheckedChange, checked, defaultChecked, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(event.target.checked);
      props.onChange?.(event);
    };

    return (
      <input
        type="checkbox"
        ref={ref}
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={handleChange}
        className={`h-4 w-4 rounded border border-purple-500/50 text-cosmic-purple accent-cosmic-purple transition-colors ${className}`.trim()}
        {...props}
      />
    );
  },
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
