import React from 'react';
import { Icon } from '../ui/Icon';
import { formatCurrency } from '../../utils/formatters';

interface SummaryCardProps {
  title: string;
  amount: number;
  icon: React.ComponentProps<typeof Icon>['icon'];
  trend: string;
  trendDirection: 'up' | 'down';
  iconBgColor: string;
  iconColor: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, icon, trend, trendDirection, iconBgColor, iconColor }) => {
  const isUp = trendDirection === 'up';
  return (
    <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-md flex items-start space-x-4 transition-transform duration-300 hover:scale-105 hover:shadow-xl">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBgColor}`}>
        <Icon icon={icon} className={`h-6 w-6 ${iconColor}`} />
      </div>
      <div>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">{title}</p>
        <p className="text-2xl font-bold font-mono text-neutral-800 dark:text-neutral-100">{formatCurrency(amount)}</p>
        <div className="flex items-center text-xs mt-1">
          <Icon 
            icon={isUp ? 'arrow-up-right' : 'arrow-down-right'} 
            className={`h-4 w-4 mr-1 ${isUp ? 'text-emerald-500' : 'text-red-500'}`} 
          />
          <span className={`${isUp ? 'text-emerald-500' : 'text-red-500'} font-bold`}>
            {trend}
          </span>
          <span className="text-neutral-400 dark:text-neutral-500 ml-1">vs. mês passado</span>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;