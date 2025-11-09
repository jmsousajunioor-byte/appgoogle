import React from 'react';
import { Invoice, InvoiceTransaction } from '../../../types';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { Icon } from '../../ui/Icon';
import { Category } from '../../../types';

interface CardTransactionsTabProps {
    invoice: Invoice;
}

const getCategoryIcon = (category: string): React.ComponentProps<typeof Icon>['icon'] => {
    switch (category) {
        case Category.Food: return 'credit-card';
        case Category.Housing: return 'bank';
        case Category.Subscriptions: return 'cog';
        case Category.Health: return 'plus';
        case Category.Shopping: return 'credit-card';
        default: return 'transactions';
    }
}

const CardTransactionsTab: React.FC<CardTransactionsTabProps> = ({ invoice }) => {
    const { transactions } = invoice;
    if (!transactions || transactions.length === 0) {
        return <div className="text-center py-10 text-neutral-500 dark:text-neutral-400">Nenhuma transação nesta fatura.</div>;
    }

    return (
        <div className="space-y-4">
            <header>
                <h2 className="text-2xl font-heading text-neutral-800 dark:text-neutral-100">Lançamentos na Fatura</h2>
                <p className="text-neutral-500 dark:text-neutral-400">Transações que compõem a fatura de {invoice.month}.</p>
            </header>
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800 bg-white dark:bg-neutral-900 p-4 rounded-2xl shadow-md">
                {transactions.map((tx: InvoiceTransaction) => (
                    <li key={tx.id} className="py-3 flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
                            <Icon icon={getCategoryIcon(tx.category)} className="h-5 w-5 text-neutral-500 dark:text-neutral-300" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-neutral-800 dark:text-neutral-100">{tx.description}</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">{tx.category}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-mono font-bold text-red-600">
                                - {formatCurrency(tx.amount)}
                                {tx.type === 'installment' && tx.installment && (
                                    <span className="text-xs font-sans text-neutral-400 dark:text-neutral-500 ml-1">
                                        ({tx.installment.current}/{tx.installment.total})
                                    </span>
                                )}
                            </p>
                            <p className="text-sm text-neutral-400 dark:text-neutral-500">{formatDate(tx.date)}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CardTransactionsTab;