import React from 'react';
import Modal from '../ui/Modal';
import type { TransactionDetails } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Icon } from '../ui/Icon';

interface TransactionDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: TransactionDetails | null;
}

/**
 * Modal que exibe os detalhes completos de uma transação parcelada
 * Mostra a transação pai e todas as parcelas associadas
 */
const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
    isOpen,
    onClose,
    transaction,
}) => {
    if (!transaction) return null;

    const { installments = [] } = transaction;
    const installmentValue = transaction.installmentAmount ?? (transaction.totalAmount / Math.max(1, transaction.installmentCount));

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Detalhes da Transação">
            <div className="space-y-6">
                {/* Header com informações principais */}
                <div className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                {transaction.description}
                            </h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                {transaction.category}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                                {transaction.type === 'RECURRING' && (
                                    <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
                                        Recorrente
                                    </span>
                                )}
                                {transaction.type === 'INSTALLMENT' && transaction.installmentCount > 1 && (
                                    <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
                                        Parcelado
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 px-3 py-2 rounded-lg">
                            <Icon icon="credit-card" className="h-4 w-4 text-neutral-500" />
                            <span className="text-sm font-medium">{transaction.card.nickname}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                                Valor Total
                            </p>
                            <p className="text-2xl font-mono font-bold text-red-600 mt-1">
                                {formatCurrency(transaction.totalAmount)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                                Parcelamento
                            </p>
                            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                                {transaction.type === 'INSTALLMENT'
                                    ? `${transaction.installmentCount}x de ${formatCurrency(installmentValue)}`
                                    : transaction.type === 'RECURRING'
                                        ? 'Despesa recorrente'
                                        : 'À vista'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                                Data da Compra
                            </p>
                            <p className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mt-1">
                                {formatDate(transaction.purchaseDate)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                                Cartão
                            </p>
                            <p className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mt-1">
                                ••{transaction.card.last4}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Lista de parcelas */}
                <div>
                    <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                        Parcelas ({installments.length})
                    </h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {installments
                            .sort((a, b) => a.installmentNumber - b.installmentNumber)
                            .map((installment) => (
                                <div
                                    key={installment.id}
                                    className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 transition"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800">
                                            <span className="font-bold text-neutral-700 dark:text-neutral-300">
                                                {installment.installmentNumber}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                                Parcela {installment.installmentNumber}/{transaction.installmentCount}
                                            </p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                Vencimento: {formatDate(installment.dueDate)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-mono font-bold text-red-600">
                                            {formatCurrency(installment.amount)}
                                        </p>
                                        <span
                                            className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${installment.status === 'paid'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : installment.status === 'cancelled'
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                }`}
                                        >
                                            {installment.status === 'paid'
                                                ? 'Paga'
                                                : installment.status === 'cancelled'
                                                    ? 'Cancelada'
                                                    : 'Pendente'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Resumo no rodapé */}
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase">
                                Parcelas Pagas
                            </p>
                            <p className="text-xl font-bold text-green-600">
                                {installments.filter((i) => i.status === 'paid').length}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase">
                                Parcelas Pendentes
                            </p>
                            <p className="text-xl font-bold text-yellow-600">
                                {installments.filter((i) => i.status === 'pending').length}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase">
                                Total Pago
                            </p>
                            <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                                {formatCurrency(
                                    installments
                                        .filter((i) => i.status === 'paid')
                                        .reduce((sum, i) => sum + i.amount, 0)
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default TransactionDetailModal;

