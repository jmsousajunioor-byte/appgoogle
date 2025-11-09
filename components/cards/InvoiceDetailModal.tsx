import React from 'react';
import { Invoice, InvoiceTransaction, Category } from '../../types';
import Modal from '../ui/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Icon } from '../ui/Icon';
import Badge from '../ui/Badge';

interface InvoiceDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: Invoice;
}

const getCategoryIcon = (category: string): React.ComponentProps<typeof Icon>['icon'] => {
    switch (category) {
        case Category.Food: return 'credit-card';
        case Category.Housing: return 'bank';
        case Category.Subscriptions: return 'cog';
        case Category.Health: return 'plus';
        case Category.Shopping: return 'credit-card';
        default: return 'transactions';
    }
};

const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ isOpen, onClose, invoice }) => {
    const { transactions } = invoice;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Detalhes da Fatura - ${invoice.month}/${invoice.year}`} size="lg">
            <div className="space-y-4">
                <header className="flex justify-between items-center p-4 bg-neutral-100 dark:bg-neutral-900 rounded-xl">
                    <div>
                        <p className="text-sm text-neutral-500">Valor Total</p>
                        <p className="text-2xl font-mono font-bold">{formatCurrency(invoice.totalAmount)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-neutral-500">Vencimento</p>
                        <p className="font-bold">{formatDate(invoice.dueDate)}</p>
                    </div>
                    <Badge status={invoice.status} />
                </header>

                <h3 className="font-heading text-lg">Transações</h3>
                {!transactions || transactions.length === 0 ? (
                     <div className="text-center py-10 text-neutral-500 dark:text-neutral-400">Nenhuma transação nesta fatura.</div>
                ) : (
                    <ul className="divide-y divide-neutral-100 dark:divide-neutral-800 bg-white dark:bg-neutral-900 p-4 rounded-2xl shadow-inner max-h-96 overflow-y-auto">
                        {transactions.map((tx: InvoiceTransaction) => (
                           <li key={tx.id} className="py-3 flex items-center space-x-4">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
                                    <Icon icon={getCategoryIcon(tx.category)} className="h-5 w-5 text-neutral-500 dark:text-neutral-300" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-neutral-800 dark:text-neutral-100">{tx.description}</p>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{tx.category}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono font-bold text-red-600">
                                        - {formatCurrency(tx.amount)}
                                        {tx.type === 'installment' && tx.installment && (
                                            <span className="text-xs font-sans text-neutral-400 dark:text-neutral-500 ml-1">
                                                ({tx.installment.current}/{tx.installment.total})
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-sm text-neutral-400 dark:text-neutral-500">{formatDate(tx.date)}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </Modal>
    );
};

export default InvoiceDetailModal;
