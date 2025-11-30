import React from 'react';
import { InstallmentGroup } from '../../../types';
import InstallmentList from '../InstallmentList';

interface FutureInstallmentsTabProps {
  installments: InstallmentGroup[];
}

const FutureInstallmentsTab: React.FC<FutureInstallmentsTabProps> = ({ installments }) => {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-heading text-neutral-800 dark:text-neutral-100">Lançamentos Futuros</h2>
        <p className="text-neutral-500 dark:text-neutral-400">
          Acompanhe os parcelamentos que serão cobrados nas próximas faturas.
        </p>
      </header>
      <div className="p-4 bg-white/10 dark:bg-neutral-800/20 backdrop-blur-md rounded-2xl shadow-md border border-white/20 dark:border-neutral-700/30">
        <InstallmentList installments={installments} />
      </div>
    </div>
  );
};

export default FutureInstallmentsTab;
