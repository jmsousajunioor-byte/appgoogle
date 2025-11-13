import React from 'react';
import { Icon } from '../ui/Icon';
import { formatCurrency } from '../../utils/formatters';
import AutoFitText from '../ui/AutoFitText';

interface SummaryCardProps {
  title: string;
  amount: number;
  icon: React.ComponentProps<typeof Icon>['icon'];
  trend: string;
  trendDirection: 'up' | 'down';
  iconBgColor: string;
  iconColor: string;
  containerClassName?: string;
  footerLabel?: string;
  footerContent?: React.ReactNode;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  amount,
  icon,
  trend,
  trendDirection,
  iconBgColor,
  iconColor,
  containerClassName,
  footerLabel = 'vs. mês passado',
  footerContent,
}) => {
  const isUp = trendDirection === 'up';
  const baseContainer =
    'p-6 rounded-2xl shadow-md flex flex-col justify-between h-full transition-transform duration-300 hover:scale-105 hover:shadow-xl backdrop-blur-sm';
  const containerClasses = containerClassName
    ? `${baseContainer} ${containerClassName}`
    : `${baseContainer} bg-white dark:bg-neutral-900`;
  return (
    <div className={containerClasses}>
      <div className="flex items-start gap-4 min-w-0">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBgColor}`}>
          <Icon icon={icon} className={`h-6 w-6 ${iconColor}`} />
        </div>
        <div className="min-w-0 space-y-1 flex-1">
          <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-snug min-h-[2.5rem]">{title}</p>
          <AutoFitText
            text={formatCurrency(amount)}
            min={14}
            max={26}
            className="font-heading font-semibold text-neutral-800 dark:text-neutral-100 tracking-tight"
          />
        </div>
      </div>
      {footerContent ?? (
        <div className="flex items-center text-xs mt-2">
          <Icon
            icon={isUp ? 'arrow-up-right' : 'arrow-down-right'}
            className={`h-4 w-4 mr-1 ${isUp ? 'text-emerald-500' : 'text-red-500'}`}
          />
          <span className={`${isUp ? 'text-emerald-500' : 'text-red-500'} font-bold`}>{trend}</span>
          <span className="text-neutral-500/70 dark:text-neutral-400 ml-1">{footerLabel}</span>
        </div>
      )}
    </div>
  );
};

export default SummaryCard;
