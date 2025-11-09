import React, { useState, useRef, useEffect } from 'react';
import { Page, Transaction } from '../../types';
import Card from '../ui/Card';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Icon } from '../ui/Icon';
import Button from '../ui/Button';

interface RecentTransactionsProps {
  transactions: Transaction[];
  onNavigate: (page: Page) => void;
  onEdit: (transaction: Transaction) => void;
  onAdd: () => void;
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

const TransactionMenu: React.FC<{ onEdit: () => void }> = ({ onEdit }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700">
                <Icon icon="dots-horizontal" className="h-5 w-5 text-neutral-500" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-neutral-800 rounded-lg shadow-xl z-10 border border-neutral-200 dark:border-neutral-700">
                    <button 
                        onClick={() => { onEdit(); setIsOpen(false); }}
                        className="w-full text-left flex items-center space-x-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    >
                        <Icon icon="pencil" className="h-4 w-4" />
                        <span>Editar</span>
                    </button>
                </div>
            )}
        </div>
    );
};


const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions, onNavigate, onEdit, onAdd }) => {
  const recent = transactions.slice(0, 5);

  return (
    <Card 
      title="Transações Recentes" 
      actions={
        <div className="flex items-center space-x-1">
          <Button leftIcon="plus" variant="ghost" size="sm" onClick={onAdd}>Adicionar</Button>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('transactions')}>Ver Todas</Button>
        </div>
      }
    >
      {recent.length > 0 ? (
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
              <TransactionMenu onEdit={() => onEdit(tx)} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-10 text-neutral-500 dark:text-neutral-400">
            Nenhuma transação encontrada para os filtros selecionados.
        </div>
      )}
    </Card>
  );
};

export default RecentTransactions;