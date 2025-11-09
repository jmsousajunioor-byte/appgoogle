import React from 'react';
import { InstallmentGroup } from '../../types';
import ProgressBar from '../ui/ProgressBar';
import { formatCurrency } from '../../utils/formatters';

interface InstallmentListProps {
  installments: InstallmentGroup[];
}

const InstallmentList: React.FC<InstallmentListProps> = ({ installments }) => {
  if (installments.length === 0) {
    return <div className="text-center py-10 text-neutral-500 dark:text-neutral-400">Nenhum parcelamento ativo.</div>;
  }

  const totalMonthlyCharge = installments.reduce((sum, item) => sum + item.monthlyCharge, 0);
  const totalRemainingDebt = installments.reduce((sum, item) => sum + item.installments * item.monthlyCharge - item.currentInstallment * item.monthlyCharge, 0);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {installments.map(item => (
          <div key={item.id} className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-bold text-neutral-700 dark:text-neutral-200">{item.description}</span>
              <span className="text-sm font-bold text-neutral-600 dark:text-neutral-300">
                {item.currentInstallment}/{item.installments}
              </span>
            </div>
            <ProgressBar value={(item.currentInstallment / item.installments) * 100} colorClass="bg-indigo-500" />
            <div className="flex justify-between items-center mt-2 text-xs">
              <span className="text-neutral-500 dark:text-neutral-400">Cobrança Mês</span>
              <span className="font-mono text-neutral-700 dark:text-neutral-200">{formatCurrency(item.monthlyCharge)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-500 dark:text-neutral-400">Restante</span>
              <span className="font-mono text-neutral-700 dark:text-neutral-200">{formatCurrency(item.installments * item.monthlyCharge - item.currentInstallment * item.monthlyCharge)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4 mt-4 space-y-2">
         <div className="flex justify-between text-sm font-bold">
            <span className="text-neutral-600 dark:text-neutral-300">Total Parcelas (Mês)</span>
            <span className="font-mono text-neutral-800 dark:text-neutral-100">{formatCurrency(totalMonthlyCharge)}</span>
         </div>
         <div className="flex justify-between text-sm font-bold">
            <span className="text-neutral-600 dark:text-neutral-300">Dívida Total Parcelada</span>
            <span className="font-mono text-red-600">{formatCurrency(totalRemainingDebt)}</span>
         </div>
      </div>
    </div>
  );
};

export default InstallmentList;