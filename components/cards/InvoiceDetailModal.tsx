import React, { useMemo, useState } from 'react';
import { Invoice, InvoiceTransaction, Category, InvoicePaymentRecord } from '../../types';
import Modal from '../ui/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Icon } from '../ui/Icon';
import Badge from '../ui/Badge';
import PaymentModal from './PaymentModal';

interface InvoiceDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: Invoice;
    payments?: InvoicePaymentRecord[];
    onRegisterPayment?: (invoiceId: string, amount: number, dateISO?: string) => void;
    onRefundTransaction?: (txId: string) => void;
    onRefundGroup?: (txId: string) => void;
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

const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ isOpen, onClose, invoice, payments = [], onRegisterPayment, onRefundTransaction, onRefundGroup }) => {
    const { transactions } = invoice;
    const [paying, setPaying] = useState(false);
    const outstanding = useMemo(() => Math.max(0, (invoice.totalAmount || 0) - (invoice.paidAmount || 0)), [invoice]);

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
                    <div className="flex items-center gap-2">
                      <Badge status={invoice.status} />
                      {onRegisterPayment && (
                        <button className="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white" onClick={() => setPaying(true)}>Registrar Pagamento</button>
                      )}
                      <button className="px-3 py-1.5 text-sm rounded-lg bg-neutral-200 dark:bg-neutral-800" onClick={() => {
                        const w = window.open('', '_blank');
                        if (!w) return;
                        const list = (transactions || []).map(t => `
                          <tr><td>${new Date(t.date).toLocaleDateString('pt-BR')}</td><td>${t.description}</td><td style="text-align:right">${formatCurrency(t.amount)}</td></tr>
                        `).join('');
                        w.document.write(`
                          <html><head><title>Fatura ${invoice.month}/${invoice.year}</title></head>
                          <body>
                            <h2>Fatura ${invoice.month}/${invoice.year}</h2>
                            <p>Vencimento: ${new Date(invoice.dueDate).toLocaleDateString('pt-BR')}</p>
                            <table style="width:100%;border-collapse:collapse" border="1" cellpadding="6">
                              <thead><tr><th>Data</th><th>Descrição</th><th>Valor</th></tr></thead>
                              <tbody>${list}</tbody>
                            </table>
                            <p>Total: ${formatCurrency(invoice.totalAmount)} | Pago: ${formatCurrency(invoice.paidAmount || 0)} | Restante: ${formatCurrency(outstanding)}</p>
                            <script>window.print()</script>
                          </body></html>
                        `);
                        w.document.close();
                      }}>Baixar PDF</button>
                    </div>
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
                                    <div className="flex gap-2 justify-end mt-2">
                                      {onRefundTransaction && (
                                        <button className="text-xs px-2 py-1 rounded bg-red-100 text-red-700" onClick={() => onRefundTransaction(tx.id)}>Estornar</button>
                                      )}
                                      {onRefundGroup && tx.type === 'installment' && (
                                        <button className="text-xs px-2 py-1 rounded bg-red-200 text-red-800" onClick={() => onRefundGroup(tx.id)}>Estornar Grupo</button>
                                      )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                <div>
                  <h3 className="font-heading text-lg mt-4">Pagamentos</h3>
                  {(!payments || payments.length === 0) ? (
                    <div className="text-neutral-500 dark:text-neutral-400 py-4">Nenhum pagamento registrado.</div>
                  ) : (
                    <ul className="divide-y divide-neutral-100 dark:divide-neutral-800 bg-white dark:bg-neutral-900 p-4 rounded-2xl shadow-inner">
                      {payments.map(p => (
                        <li key={p.id} className="py-2 flex items-center justify-between">
                          <div className="text-sm">{new Date(p.dateISO).toLocaleDateString('pt-BR')}</div>
                          <div className="font-mono">{formatCurrency(p.amount)}</div>
                          <div className="text-xs text-neutral-500">{p.method || '—'}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
            </div>
            {paying && onRegisterPayment && (
              <PaymentModal
                isOpen={paying}
                onClose={() => setPaying(false)}
                invoice={invoice}
                onSubmit={(invoiceId, amount, dateISO) => onRegisterPayment(invoiceId, amount, dateISO)}
              />
            )}
        </Modal>
    );
};

export default InvoiceDetailModal;
