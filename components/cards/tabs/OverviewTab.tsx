import React, { useState } from 'react';
import { Card, Invoice, InvoiceStatus } from '../../../types';
import { daysRemaining, formatCurrency } from '../../../utils/formatters';
import ProgressBar from '../../ui/ProgressBar';
import Badge from '../../ui/Badge';
import InstallmentList from '../InstallmentList';
import Button from '../../ui/Button';
import InvoiceDetailModal from '../InvoiceDetailModal';

interface OverviewTabProps {
  card: Card & { availableLimit: number, currentInvoiceAmount: number, dueDate: string, invoiceStatus: InvoiceStatus };
  invoice: Invoice;
  onUpdateInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ card, invoice, onUpdateInvoiceStatus }) => {
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const limitUtilization = (card.currentInvoiceAmount / card.limit) * 100;
  const remainingDays = daysRemaining(card.dueDate);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading text-neutral-800 dark:text-neutral-100">Fatura Atual ({invoice.month})</h2>
        <div className="mt-4 p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-md space-y-4">
          <div className="flex justify-between items-baseline">
            <span className="text-neutral-500 dark:text-neutral-400">Valor</span>
            <span className="font-mono text-3xl font-bold text-indigo-600">{formatCurrency(invoice.totalAmount)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-500 dark:text-neutral-400">Vencimento</span>
            <span className={`font-bold ${remainingDays < 5 ? 'text-red-500' : 'text-neutral-600 dark:text-neutral-300'}`}>
              {new Date(card.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })} ({remainingDays} dias restantes)
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-500 dark:text-neutral-400">Status</span>
            <Badge status={invoice.status} />
          </div>
          <div className="!mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button 
              variant="primary" 
              className="w-full"
              onClick={() => onUpdateInvoiceStatus(invoice.id, InvoiceStatus.Paid)}
              disabled={invoice.status === InvoiceStatus.Paid}
            >
              {invoice.status === InvoiceStatus.Paid ? 'Fatura Paga' : 'Marcar como Paga'}
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => setIsStatementModalOpen(true)}>Ver Extrato</Button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-heading text-neutral-800 dark:text-neutral-200 mb-2">Limite do Cartão</h3>
        <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl shadow-md space-y-3">
          <ProgressBar value={limitUtilization} />
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500 dark:text-neutral-400">Utilizado</span>
            <span className="font-mono font-bold text-neutral-700 dark:text-neutral-200">{formatCurrency(card.currentInvoiceAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500 dark:text-neutral-400">Disponível</span>
            <span className="font-mono text-emerald-600 font-bold">{formatCurrency(card.availableLimit)}</span>
          </div>
           <div className="flex justify-between text-sm">
            <span className="text-neutral-500 dark:text-neutral-400">Total</span>
            <span className="font-mono text-neutral-700 dark:text-neutral-200">{formatCurrency(card.limit)}</span>
          </div>
        </div>
      </div>
      
       <div>
        <h3 className="text-xl font-heading text-neutral-800 dark:text-neutral-200 mb-2">Parcelamentos Futuros</h3>
        <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl shadow-md">
            <InstallmentList installments={invoice.installments} />
        </div>
      </div>

      {isStatementModalOpen && (
          <InvoiceDetailModal
              isOpen={isStatementModalOpen}
              onClose={() => setIsStatementModalOpen(false)}
              invoice={invoice}
          />
      )}
    </div>
  );
};

export default OverviewTab;