
import React from 'react';
import { InvoiceStatus } from '../../types';

interface BadgeProps {
  status: InvoiceStatus;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const statusStyles: Record<InvoiceStatus, string> = {
    [InvoiceStatus.Paid]: 'bg-emerald-100 text-emerald-800',
    [InvoiceStatus.Pending]: 'bg-amber-100 text-amber-800',
    [InvoiceStatus.Overdue]: 'bg-red-100 text-red-800',
    [InvoiceStatus.Open]: 'bg-blue-100 text-blue-800',
    [InvoiceStatus.Closed]: 'bg-neutral-200 text-neutral-800',
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-bold rounded-full inline-flex items-center ${statusStyles[status]} ${className}`}>
      <span className={`h-2 w-2 mr-2 rounded-full ${statusStyles[status].replace('100', '500').replace('text-emerald-800', 'bg-emerald-500').replace('text-amber-800', 'bg-amber-500').replace('text-red-800', 'bg-red-500').replace('text-blue-800', 'bg-blue-500').replace('text-neutral-800', 'bg-neutral-500')}`}></span>
      {status}
    </span>
  );
};

export default Badge;
