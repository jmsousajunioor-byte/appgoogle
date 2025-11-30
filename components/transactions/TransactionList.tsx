import React, { useState } from 'react';
import { BankAccount, Card, Transaction, TransactionSummary, TransactionDetails } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Icon } from '../ui/Icon';
import TransactionDetailModal from './TransactionDetailModal';

interface TransactionListProps {
    transactions?: Transaction[]; // Legacy transactions (for backward compatibility)
    summaries?: TransactionSummary[]; // New aggregated summaries
    accounts: (BankAccount | Card)[];
    onEdit?: (transaction: Transaction) => void;
    onViewDetails?: (transactionId: string) => Promise<TransactionDetails | null>;
    mode?: 'legacy' | 'aggregated'; // Mode switch
}

const getCategoryIcon = (category: string): React.ComponentProps<typeof Icon>['icon'] => {
    switch (category.toLowerCase()) {
        case 'alimentação': return 'credit-card';
        case 'moradia': return 'bank';
        case 'assinaturas': return 'cog';
        case 'saúde': return 'plus';
        case 'salário': return 'trending-up';
        case 'renda extra': return 'trending-up';
        case 'compras': return 'credit-card';
        case 'lazer': return 'pie-chart';
        case 'investimento': return 'bar-chart';
        default: return 'transactions';
    }
}

const TransactionMenu: React.FC<{ onEdit: () => void }> = ({ onEdit }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
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

/**
 * Lista de transações que suporta tanto o modo legado (parcelas individuais)
 * quanto o modo agregado (uma linha por compra)
 */
const TransactionList: React.FC<TransactionListProps> = ({
    transactions = [],
    summaries = [],
    accounts,
    onEdit,
    onViewDetails,
    mode = 'legacy',
}) => {
    const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetails | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);

    const getSourceName = (sourceId: string) => {
        const source = accounts.find(acc => acc.id === sourceId);
        if (!source) return 'Desconhecido';
        return 'nickname' in source ? source.nickname : source.bankName;
    }

    const handleRowClick = async (id: string) => {
        if (mode === 'aggregated' && onViewDetails) {
            const details = await onViewDetails(id);
            if (details) {
                setSelectedTransaction(details);
                setDetailModalOpen(true);
            }
        }
    };

    // Render legacy mode (individual transactions/installments)
    if (mode === 'legacy') {
        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
                    <thead className="bg-neutral-50 dark:bg-neutral-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Descrição</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Valor</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Data</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Fonte</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-800">
                        {transactions.map(tx => (
                            <tr key={tx.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-neutral-100 dark:bg-neutral-800'}`}>
                                            <Icon icon={getCategoryIcon(tx.category)} className={`h-5 w-5 ${tx.type === 'income' ? 'text-emerald-600' : 'text-neutral-500 dark:text-neutral-300'}`} />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{tx.description}</div>
                                            <div className="text-sm text-neutral-500 dark:text-neutral-400">{tx.category}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className={`text-sm font-mono font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                                    </div>
                                    {tx.isInstallment && tx.installment && (
                                        <div className="text-xs text-neutral-400 dark:text-neutral-500">
                                            Parcela {tx.installment.current}/{tx.installment.total}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">{formatDate(tx.date)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">{getSourceName(tx.sourceId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {onEdit && <TransactionMenu onEdit={() => onEdit(tx)} />}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    // Render aggregated mode (one line per parent transaction)
    return (
        <>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
                    <thead className="bg-neutral-50 dark:bg-neutral-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                Descrição
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                Valor
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                Data
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                Cartão
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Ações</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-800">
                        {summaries.map((summary) => (
                            <tr
                                key={summary.id}
                                className="hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition"
                                onClick={() => handleRowClick(summary.id)}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
                                            <Icon
                                                icon={getCategoryIcon(summary.category.name)}
                                                className="h-5 w-5 text-neutral-500 dark:text-neutral-300"
                                            />
                                        </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                        {summary.description}
                                    </div>
                                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                        {summary.category.name}
                                        {summary.type === 'RECURRING' && (
                                          <span className="ml-2 inline-block text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
                                            Recorrente
                                          </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                                    <div className="text-sm font-mono font-bold text-red-600">
                                        - {formatCurrency(summary.totalAmount)}
                                    </div>
                                    {summary.type === 'INSTALLMENT' && (
                                      <div className="text-xs text-neutral-400 dark:text-neutral-500">
                                        {summary.installmentCount}x de {formatCurrency(summary.installmentAmount)}
                                      </div>
                                    )}
                                    {summary.type === 'SINGLE' && summary.installmentCount <= 1 && (
                                      <div className="text-xs text-neutral-400 dark:text-neutral-500">
                                        À vista
                                      </div>
                                    )}
                                    {summary.type === 'RECURRING' && (
                                      <div className="text-xs text-neutral-400 dark:text-neutral-500">
                                        Despesa recorrente
                                      </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                                    {formatDate(summary.purchaseDate)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                                    {summary.card.alias}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRowClick(summary.id);
                                        }}
                                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                    >
                                        <Icon icon="eye" className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            <TransactionDetailModal
                isOpen={detailModalOpen}
                onClose={() => {
                    setDetailModalOpen(false);
                    setSelectedTransaction(null);
                }}
                transaction={selectedTransaction}
            />
        </>
    );
};

export default TransactionList;
