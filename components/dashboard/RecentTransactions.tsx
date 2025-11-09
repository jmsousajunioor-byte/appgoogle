import React from 'react';
import { Page, Transaction } from '../../types';
import Card from '../ui/Card';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Icon } from '../ui/Icon';
import Button from '../ui/Button';

interface RecentTransactionsProps {
  transactions: Transaction[];
  onNavigate: (page: Page) => void;
}

const getCategoryIcon = (category: string): React.ComponentProps<typeof Icon>['icon'] => {
    switch (category.toLowerCase()) {
        case 'alimentação': return 'credit-card';
        case 'moradia': return 'bank';
        case 'assinaturas': return 'cog';
        case 'saúde': return 'plus';
        case 'salário': return 'trending-up';
        default: return 'transactions';
    }
}


const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions, onNavigate }) => {
  const recent = transactions.slice(0, 5);

  return (
    <Card title="Transações Recentes" actions={<Button variant="ghost" size="sm" onClick={() => onNavigate('transactions')}>Ver Todas</Button>}>
      <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {recent.map(tx => (
          <li key={tx.id} className="py-3 flex items-center space-x-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-neutral-100 dark:bg-neutral-800'}`}>
              <Icon icon={getCategoryIcon(tx.category)} className={`h-5 w-5 ${tx.type === 'income' ? 'text-emerald-600' : 'text-neutral-500 dark:text-neutral-300'}`} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-neutral-800 dark:text-neutral-100">{tx.description}</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{tx.category}</p>
            </div>
            <div className="text-right">
                <p className={`font-mono font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                </p>
                <p className="text-sm text-neutral-400 dark:text-neutral-500">{formatDate(tx.date)}</p>
                {tx.isInstallment && tx.installment && (
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                        Parcela {tx.installment.current}/{tx.installment.total}
                    </p>
                )}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default RecentTransactions;