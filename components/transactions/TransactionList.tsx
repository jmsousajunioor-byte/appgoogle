import React from 'react';
import { BankAccount, Card, Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Icon } from '../ui/Icon';

interface TransactionListProps {
  transactions: Transaction[];
  accounts: (BankAccount | Card)[];
}

const getCategoryIcon = (category: string): React.ComponentProps<typeof Icon>['icon'] => {
    switch (category.toLowerCase()) {
        case 'alimentação': return 'credit-card';
        case 'moradia': return 'bank';
        case 'assinaturas': return 'cog';
        case 'saúde': return 'plus';
        case 'salário': return 'trending-up';
        case 'renda extra': return 'trending-up';
        case 'compras': return 'credit-card';
        case 'lazer': return 'pie-chart';
        case 'investimento': return 'bar-chart';
        default: return 'transactions';
    }
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, accounts }) => {

    const getSourceName = (sourceId: string) => {
        const source = accounts.find(acc => acc.id === sourceId);
        if (!source) return 'Desconhecido';
        return 'nickname' in source ? source.nickname : source.bankName;
    }

  return (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
            <thead className="bg-neutral-50 dark:bg-neutral-800">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Descrição</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Valor</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Data</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Fonte</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-800">
                {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-neutral-100 dark:bg-neutral-800'}`}>
                                    <Icon icon={getCategoryIcon(tx.category)} className={`h-5 w-5 ${tx.type === 'income' ? 'text-emerald-600' : 'text-neutral-500 dark:text-neutral-300'}`} />
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{tx.description}</div>
                                    <div className="text-sm text-neutral-500 dark:text-neutral-400">{tx.category}</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-mono font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                            </div>
                            {tx.isInstallment && tx.installment && (
                                <div className="text-xs text-neutral-400 dark:text-neutral-500">
                                    Parcela {tx.installment.current}/{tx.installment.total}
                                </div>
                            )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">{formatDate(tx.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">{getSourceName(tx.sourceId)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-indigo-600 hover:text-indigo-900"><Icon icon="dots-horizontal" /></button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
};

export default TransactionList;