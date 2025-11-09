import React, { useState, useMemo } from 'react';
import { Invoice, InvoiceStatus } from '../../../types';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import Badge from '../../ui/Badge';
import { Icon } from '../../ui/Icon';
import Button from '../../ui/Button';
import InvoiceDetailModal from '../InvoiceDetailModal';

interface InvoicesTabProps {
  invoices: Invoice[];
}

const InvoicesTab: React.FC<InvoicesTabProps> = ({ invoices }) => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const [currentYear] = useState(new Date().getFullYear());
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const filteredInvoices = useMemo(() => {
    return invoices
      .filter(invoice => {
        const yearMatch = selectedYear === 'all' || invoice.year === selectedYear;
        const monthIndex = monthNames.findIndex(m => m.toLowerCase() === invoice.month.toLowerCase());
        const monthMatch = selectedMonth === 'all' || monthIndex === selectedMonth;
        return yearMatch && monthMatch;
      })
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  }, [invoices, selectedYear, selectedMonth]);


  return (
    <div className="space-y-6">
        <header className="flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-heading text-neutral-800 dark:text-neutral-100">Histórico de Faturas</h2>
                <p className="text-neutral-500 dark:text-neutral-400">Veja todas as faturas passadas e a atual.</p>
            </div>
            <div className="flex items-center space-x-2">
                 <select
                    value={String(selectedMonth)}
                    onChange={(e) => setSelectedMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="p-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-600 bg-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    aria-label="Filtrar por mês"
                >
                    <option value="all">Todos os Meses</option>
                    {monthNames.map((month, i) => <option key={month} value={i}>{month}</option>)}
                </select>
                <select
                    value={String(selectedYear)}
                    onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="p-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-600 bg-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    aria-label="Filtrar por ano"
                >
                    <option value="all">Todos os Anos</option>
                    {years.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
            </div>
        </header>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-md overflow-hidden">
            <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {filteredInvoices.length > 0 ? (
                    filteredInvoices.map(invoice => (
                        <li key={invoice.id} className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-200">
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                                    <Icon icon="calendar" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                                    <div>
                                        <p className="font-bold text-neutral-800 dark:text-neutral-100">{invoice.month} {invoice.year}</p>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Vencimento: {formatDate(invoice.dueDate)}</p>
                                    </div>
                                    <div className="text-right md:text-left">
                                        <p className="font-mono text-lg font-bold text-neutral-800 dark:text-neutral-100">{formatCurrency(invoice.totalAmount)}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <Badge status={invoice.status} />
                                        {invoice.status === InvoiceStatus.Paid && (
                                            <Icon icon="check" className="ml-2 h-5 w-5 text-emerald-500" title="Paid" aria-label="Paid status" />
                                        )}
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <Button variant="ghost" size="sm" onClick={() => setSelectedInvoice(invoice)}>Detalhes</Button>
                                        {invoice.status === 'Paid' && (
                                            <Button variant="ghost" size="sm"><Icon icon="copy" className="h-5 w-5" /></Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))
                ) : (
                    <li className="p-8 text-center text-neutral-500 dark:text-neutral-400">
                        Nenhuma fatura encontrada para o período selecionado.
                    </li>
                )}
            </ul>
        </div>
        {selectedInvoice && (
            <InvoiceDetailModal
                isOpen={!!selectedInvoice}
                onClose={() => setSelectedInvoice(null)}
                invoice={selectedInvoice}
            />
        )}
    </div>
  );
};

export default InvoicesTab;