import React from 'react';
import { Card, InvoiceStatus } from '../../types';
import RealisticCard from './RealisticCard';
import { daysRemaining, formatCurrency } from '../../utils/formatters';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

// FIX: Define the enhanced card type for clarity and reuse.
type EnhancedCard = Card & { availableLimit: number, currentInvoiceAmount: number, dueDate: string, invoiceStatus: InvoiceStatus };

interface CardGridProps {
  cards: EnhancedCard[];
  // FIX: Update onCardClick to expect the enhanced card type.
  onCardClick: (card: EnhancedCard) => void;
}

const CardGrid: React.FC<CardGridProps> = ({ cards, onCardClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {cards.map(card => {
        const remainingDays = daysRemaining(card.dueDate);
        
        return (
          <div key={card.id} className="bg-white dark:bg-neutral-900 p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col space-y-4">
            <RealisticCard card={card} onClick={() => onCardClick(card)} />
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">Fatura Atual</span>
                <span className="font-mono font-bold text-lg text-neutral-800 dark:text-neutral-100">{formatCurrency(card.currentInvoiceAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">Limite Disponível</span>
                <span className="font-mono text-neutral-600 dark:text-neutral-300">{formatCurrency(card.availableLimit)}</span>
              </div>
               <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500 dark:text-neutral-400">Vencimento</span>
                <span className={`font-bold ${remainingDays < 5 ? 'text-red-500' : 'text-neutral-600 dark:text-neutral-300'}`}>
                  {new Date(card.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} ({remainingDays} dias)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">Status</span>
                <Badge status={card.invoiceStatus} />
              </div>
            </div>
             <div className="!mt-6 flex justify-between space-x-2">
                <Button variant="secondary" className="w-full" onClick={() => onCardClick(card)}>Ver Detalhes</Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CardGrid;