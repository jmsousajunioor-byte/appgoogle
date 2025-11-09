
import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  className?: string;
  colorClass?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, className = 'h-2', colorClass }) => {
  const percentage = Math.max(0, Math.min(100, value));
  
  let finalColorClass = colorClass;
  if (!finalColorClass) {
    if (percentage < 30) {
      finalColorClass = 'bg-emerald-500';
    } else if (percentage < 70) {
      finalColorClass = 'bg-amber-500';
    } else {
      finalColorClass = 'bg-red-500';
    }
  }

  return (
    <div className={`w-full bg-neutral-200 rounded-full overflow-hidden ${className}`}>
      <div 
        className={`h-full rounded-full transition-all duration-500 ease-out ${finalColorClass}`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
