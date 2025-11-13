import React from 'react';
import { BankAccount, Card, TransactionType } from '../../types';
// FIX: Renamed Card component import to UICard to avoid name collision with the Card type.
import UICard from '../ui/Card';
import Select from '../ui/Select';
import { Icon } from '../ui/Icon';

interface DashboardFiltersProps {
  accounts: (BankAccount | Card)[];
  filters: {
    dateRange: string;
    transactionType: string;
    selectedAccount: string;
  };
  onFilterChange: {
    setDateRange: (value: string) => void;
    setTransactionType: (value: string) => void;
    setSelectedAccount: (value: string) => void;
  };
  showTypeFilter?: boolean;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({ accounts, filters, onFilterChange, showTypeFilter = true }) => {
  const gridCols = showTypeFilter
    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4';
  return (
    <UICard>
        <div className="flex items-center space-x-2 mb-4">
            <Icon icon="filter" className="h-5 w-5 text-neutral-500" />
            <h3 className="font-heading text-lg text-neutral-700 dark:text-neutral-200">Filtros</h3>
        </div>
      <div className={gridCols}>
        <Select 
            label="Período"
            value={filters.dateRange}
            onChange={(e) => onFilterChange.setDateRange(e.target.value)}
        >
          <option value="this-month">Este Mês</option>
          <option value="last-30-days">Últimos 30 dias</option>
          <option value="all-time">Todo o período</option>
        </Select>
        {showTypeFilter && (
          <Select 
              label="Tipo de Transação"
              value={filters.transactionType}
              onChange={(e) => onFilterChange.setTransactionType(e.target.value)}
          >
              <option value="all">Todas</option>
              <option value={TransactionType.Income}>Receitas</option>
              <option value={TransactionType.Expense}>Despesas</option>
          </Select>
        )}

        <Select
            label="Conta"
            value={filters.selectedAccount}
            onChange={(e) => onFilterChange.setSelectedAccount(e.target.value)}
        >
            <option value="all">Todas as Contas</option>
            {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                    {'nickname' in acc ? acc.nickname : acc.bankName}
                </option>
            ))}
        </Select>
      </div>
    </UICard>
  );
};

export default DashboardFilters;
