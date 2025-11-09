import React from 'react';
import { Invoice } from '../../../types';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import Badge from '../../ui/Badge';
import { Icon } from '../../ui/Icon';
import Button from '../../ui/Button';

interface InvoicesTabProps {
  invoices: Invoice[];
}

const InvoicesTab: React.FC<InvoicesTabProps> = ({ invoices }) => {
  return (
    <div className="space-y-6">
        <header className="flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-heading text-neutral-800 dark:text-neutral-100">Histórico de Faturas</h2>
                <p className="text-neutral-500 dark:text-neutral-400">Veja todas as faturas passadas e a atual.</p>
            </div>
            <div className="flex items-center space-x-2">
                 <Button variant="secondary" size="sm" leftIcon="chevron-down">Ano: 2024</Button>
            </div>
        </header>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-md overflow-hidden">
            <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {invoices.map(invoice => (
                    <li key={invoice.id} className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-200">
                        <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                                <Icon icon="calendar" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                                <div>
                                    <p className="font-bold text-neutral-800 dark:text-neutral-100">{invoice.month} {invoice.year}</p>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Vencimento: {formatDate(invoice.dueDate)}</p>
                                </div>
                                <div className="text-right md:text-left">
                                    <p className="font-mono text-lg font-bold text-neutral-800 dark:text-neutral-100">{formatCurrency(invoice.totalAmount)}</p>
                                </div>
                                <div>
                                    <Badge status={invoice.status} />
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="ghost" size="sm">Detalhes</Button>
                                    {invoice.status === 'Paid' && (
                                        <Button variant="ghost" size="sm"><Icon icon="copy" className="h-5 w-5" /></Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    </div>
  );
};

export default InvoicesTab;