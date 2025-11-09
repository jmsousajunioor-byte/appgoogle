import React from 'react';
import { BankAccount } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Icon } from '../ui/Icon';

interface BankCardProps {
  account: BankAccount;
}

const BankCard: React.FC<BankCardProps> = ({ account }) => {
  return (
    <Card className="flex flex-col">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
            <img src={account.logoUrl} alt={`${account.bankName} logo`} className="h-8 w-8 object-contain" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">{account.bankName}</h4>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 capitalize">{account.accountType} Account</p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
            <Icon icon="dots-horizontal" className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="my-6">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Saldo Atual</p>
        <p className="text-4xl font-mono font-bold text-neutral-800 dark:text-neutral-100">{formatCurrency(account.balance)}</p>
      </div>
      
      <div className="mt-auto pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-between text-sm text-neutral-600 dark:text-neutral-300">
        <div>
          <p>Agência: {account.branch}</p>
          <p>Conta: {account.accountNumber}</p>
        </div>
        <div className="flex items-end">
            <Button variant="secondary" size="sm">Ver Transações</Button>
        </div>
      </div>
    </Card>
  );
};

export default BankCard;