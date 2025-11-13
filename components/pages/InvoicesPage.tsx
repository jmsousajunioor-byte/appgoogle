import React, { useMemo, useState } from 'react';
import { Card as CardType, Invoice, InvoiceStatus, InvoicePaymentRecord } from '../../types';
import UICard from '../ui/Card';
import Select from '../ui/Select';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import InvoiceDetailModal from '../cards/InvoiceDetailModal';
import PaymentModal from '../cards/PaymentModal';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';

const statusLabels: Record<InvoiceStatus, string> = {
  [InvoiceStatus.Paid]: 'Paga',
  [InvoiceStatus.Pending]: 'Pendente',
  [InvoiceStatus.Overdue]: 'Em atraso',
  [InvoiceStatus.Open]: 'Aberta',
  [InvoiceStatus.Closed]: 'Fechada',
};

const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

interface InvoicesPageProps {
  cards: CardType[];
  invoices: Invoice[];
  payments: InvoicePaymentRecord[];
  onUpdateInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;
  onRegisterInvoicePayment: (invoiceId: string, amount: number, dateISO?: string) => void;
  onRefundTransaction: (invoiceId: string, txId: string) => void;
  onRefundGroup: (txId: string) => void;
}

interface InvoicesModalProps extends InvoicesPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const InvoicesContent: React.FC<InvoicesPageProps & { isModal?: boolean }> = ({
  cards,
  invoices,
  payments,
  onUpdateInvoiceStatus,
  onRegisterInvoicePayment,
  onRefundTransaction,
  onRefundGroup,
  isModal = false,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | InvoiceStatus>('all');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paying, setPaying] = useState<Invoice | null>(null);

  const years = useMemo(() => {
    const set = new Set<number>();
    invoices.forEach(i => set.add(i.year));
    return Array.from(set).sort((a, b) => b - a);
  }, [invoices]);

  const filtered = useMemo(() => {
    return invoices
      .filter(inv => selectedCardId === 'all' || inv.cardId === selectedCardId)
      .filter(inv => selectedStatus === 'all' || inv.status === selectedStatus)
      .filter(inv => selectedYear === 'all' || inv.year === selectedYear)
      .filter(inv => {
        if (selectedMonth === 'all') return true;
        const idx = monthNames.findIndex(m => m.toLowerCase() === inv.month.toLowerCase());
        return idx === selectedMonth;
      })
      .filter(inv => !search || `${inv.month}/${inv.year}`.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  }, [invoices, selectedCardId, selectedStatus, selectedYear, selectedMonth, search]);

  return (
    <div className={isModal ? 'space-y-6' : 'space-y-8'}>
      <UICard title="Filtros">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select label="Cartão" name="cartao" value={selectedCardId} onChange={e => setSelectedCardId(e.target.value)}>
            <option value="all">Todos</option>
            {cards.map(c => <option key={c.id} value={c.id}>{c.nickname} (••{c.last4})</option>)}
          </Select>
          <Select label="Status" name="status" value={selectedStatus === 'all' ? 'all' : selectedStatus} onChange={e => setSelectedStatus(e.target.value === 'all' ? 'all' : e.target.value as InvoiceStatus)}>
            <option value="all">Todos</option>
            {Object.values(InvoiceStatus).map(status => (
              <option key={status} value={status}>{statusLabels[status]}</option>
            ))}
          </Select>
          <Select label="Mês" name="mes" value={String(selectedMonth)} onChange={e => setSelectedMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
            <option value="all">Todos</option>
            {monthNames.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </Select>
          <Select label="Ano" name="ano" value={String(selectedYear)} onChange={e => setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
            <option value="all">Todos</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </Select>
          <Input label="Busca" name="busca" value={search} onChange={e => setSearch(e.target.value)} placeholder="Ex: Março/2025" />
        </div>
      </UICard>

      <UICard title="Lista de Faturas">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-500">
                <th className="py-2 pr-4">Cartão</th>
                <th className="py-2 pr-4">Mês</th>
                <th className="py-2 pr-4">Vencimento</th>
                <th className="py-2 pr-4">Valor</th>
                <th className="py-2 pr-4">Pago</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {filtered.map(inv => {
                const card = cards.find(c => c.id === inv.cardId);
                const paid = inv.paidAmount ?? (inv.status === InvoiceStatus.Paid ? inv.totalAmount : 0);
                const remaining = Math.max(0, inv.totalAmount - paid);
                return (
                  <tr key={inv.id}>
                    <td className="py-3 pr-4">{card?.nickname} <span className="text-neutral-400">(••{card?.last4})</span></td>
                    <td className="py-3 pr-4">{inv.month}/{inv.year}</td>
                    <td className="py-3 pr-4">{formatDate(inv.dueDate)}</td>
                    <td className="py-3 pr-4 font-semibold">{formatCurrency(inv.totalAmount)}</td>
                    <td className="py-3 pr-4">{formatCurrency(paid)}</td>
                    <td className="py-3 pr-4"><Badge status={inv.status} /></td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="secondary" onClick={() => setSelectedInvoice(inv)}>Detalhes</Button>
                        <Button size="sm" variant="secondary" onClick={() => onRegisterInvoicePayment(inv.id, remaining)} disabled={remaining <= 0}>Pagar Total</Button>
                        <Button size="sm" variant="primary" onClick={() => setPaying(inv)}>Registrar</Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </UICard>

      {selectedInvoice && (
        <InvoiceDetailModal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          invoice={selectedInvoice}
          payments={payments.filter(p => p.invoiceId === selectedInvoice.id)}
          onRegisterPayment={(invoiceId, amount, dateISO) => onRegisterInvoicePayment(invoiceId, amount, dateISO)}
          onRefundTransaction={(txId) => onRefundTransaction(selectedInvoice.id, txId)}
          onRefundGroup={onRefundGroup}
        />
      )}
      {paying && (
        <PaymentModal
          isOpen={!!paying}
          onClose={() => setPaying(null)}
          invoice={paying}
          onSubmit={(invoiceId, amount, dateISO) => onRegisterInvoicePayment(invoiceId, amount, dateISO)}
        />
      )}
    </div>
  );
};

const InvoicesPage: React.FC<InvoicesPageProps> = (props) => (
  <div className="p-8 space-y-8 min-h-screen">
    <header>
      <h1 className="text-4xl font-heading text-neutral-800 dark:text-neutral-100">Faturas</h1>
    </header>
    <InvoicesContent {...props} />
  </div>
);

export const InvoicesModal: React.FC<InvoicesModalProps> = ({ isOpen, onClose, ...props }) => (
  <Modal isOpen={isOpen} onClose={onClose} size="5xl" title="Faturas Detalhadas">
    <InvoicesContent {...props} isModal />
  </Modal>
);

export default InvoicesPage;
