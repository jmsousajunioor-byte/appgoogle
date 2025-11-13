import React, { useMemo, useState } from 'react';

import {
  Card as CardType,
  Invoice,
  InvoiceStatus,
  Transaction,
  TransactionType,
  PaymentMethod,
  Page,
  NewCard,
  InvoicePaymentRecord,
  NewTransaction,
  BankAccount,
} from '../../types';

import UICard from '../ui/Card';

import Button from '../ui/Button';

import Select from '../ui/Select';

import Input from '../ui/Input';

import SummaryCard from '../dashboard/SummaryCard';

import { formatCurrency, formatDate } from '../../utils/formatters';

import CardCarousel from '../dashboard/CardCarousel';

import CardDetailModal from '../cards/CardDetailModal';

import AddCardModal from '../cards/AddCardModal';

import PaymentModal from '../cards/PaymentModal';

import TransactionFormModal from '../transactions/TransactionFormModal';

import { getCategoryMeta } from '../../utils/categoryMeta';
import { Icon } from '../ui/Icon';

type EnhancedCard = CardType & {
  availableLimit: number;
  currentInvoiceAmount: number;
  dueDate: string;
  invoiceStatus: InvoiceStatus;
};

interface CardsDashboardPageProps {
  cards: EnhancedCard[];

  invoices: Invoice[];

  transactions: Transaction[];

  summary: {
    totalBalance: number;
  };

  onUpdateInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;

  onRegisterInvoicePayment: (
    invoiceId: string,
    amount: number,
    dateISO?: string,
  ) => void;

  onNavigate: (page: Page) => void;

  onShowInvoicesModal: () => void;

  cardSettings: Record<string, { alertThreshold: number }>;

  onUpdateCardSettings: (cardId: string, threshold: number) => void;

  onAddCard: (newCard: NewCard) => void;

  onUpdateCard: (card: CardType) => void;

  payments: InvoicePaymentRecord[];

  onRefundInvoiceTransaction: (invoiceId: string, txId: string) => void;

  onRefundInstallmentGroup: (txId: string) => void;

  accounts: (BankAccount | CardType)[];

  onAddTransaction: (tx: NewTransaction) => void;

  onUpdateTransaction: (tx: Transaction) => void;
}

const CardsDashboardPage: React.FC<CardsDashboardPageProps> = ({
  cards,

  invoices,

  transactions,

  summary,

  onUpdateInvoiceStatus,

  onRegisterInvoicePayment,

  onNavigate,

  onShowInvoicesModal,

  cardSettings,

  onUpdateCardSettings,

  onAddCard,

  onUpdateCard,

  payments,

  onRefundInvoiceTransaction,

  onRefundInstallmentGroup,

  accounts,

  onAddTransaction,

  onUpdateTransaction,
}) => {
  const [dateRange, setDateRange] = useState<
    'this-month' | 'last-30-days' | 'all-time' | 'custom'
  >('this-month');

  const [customStart, setCustomStart] = useState<string>('');

  const [customEnd, setCustomEnd] = useState<string>('');

  const [selectedCardId, setSelectedCardId] = useState<string>('all');

  const [partialInputs, setPartialInputs] = useState<Record<string, string>>(
    {},
  );

  const [paying, setPaying] = useState<Invoice | null>(null);

  const [selectedCardDetail, setSelectedCardDetail] =
    useState<EnhancedCard | null>(null);

  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  const [transactionToEdit, setTransactionToEdit] =
    useState<Transaction | null>(null);

  const COLORS = [
    '#6366f1',
    '#8b5cf6',
    '#f97316',
    '#10b981',
    '#ef4444',
    '#14b8a6',
  ];

  const statusPt = (s: InvoiceStatus) =>
    s === InvoiceStatus.Paid
      ? 'Paga'
      : s === InvoiceStatus.Overdue
        ? 'Atrasada'
        : s === InvoiceStatus.Pending
          ? 'Pendente'
          : s === InvoiceStatus.Closed
            ? 'Fechada'
            : 'Aberta';

  const getRanges = () => {
    const now = new Date();

    let start = new Date(now.getFullYear(), now.getMonth(), 1);

    let end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    if (dateRange === 'last-30-days') {
      end = new Date();

      start = new Date();

      start.setDate(end.getDate() - 30);
    } else if (dateRange === 'all-time') {
      start = new Date(2000, 0, 1);

      end = new Date(2100, 0, 1);
    } else if (dateRange === 'custom') {
      start = customStart ? new Date(customStart) : new Date(2000, 0, 1);

      end = customEnd ? new Date(customEnd) : new Date(2100, 0, 1);
    }

    const spanDays = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
    );

    const prevEnd = new Date(start);

    const prevStart = new Date(start);

    prevStart.setDate(prevStart.getDate() - spanDays);

    return { start, end, prevStart, prevEnd };
  };

  const { filteredTransactions, totalExpenses } = useMemo(() => {
    const { start, end, prevStart, prevEnd } = getRanges();

    const filterTx = (s: Date, e: Date) =>
      transactions.filter((tx) => {
        const d = new Date(tx.date);

        const byDate = d >= s && d <= e;

        const byType = tx.type === TransactionType.Expense;

        const byMethod =
          tx.paymentMethod === PaymentMethod.Credit ||
          tx.paymentMethod === PaymentMethod.Debit;

        const byCard =
          selectedCardId === 'all' ? true : tx.sourceId === selectedCardId;

        return byDate && byType && byMethod && byCard;
      });

    const cur = filterTx(start, end);

    const curTotal = cur.reduce((s, t) => s + t.amount, 0);

    return { filteredTransactions: cur, totalExpenses: curTotal };
  }, [transactions, dateRange, customStart, customEnd, selectedCardId]);

  const totals = useMemo(() => {
    const selectedCards =
      selectedCardId === 'all'
        ? cards
        : cards.filter((c) => c.id === selectedCardId);

    const totalLimit = selectedCards.reduce((sum, c) => sum + c.limit, 0);

    const totalAvailable = selectedCards.reduce(
      (sum, c) => sum + c.availableLimit,
      0,
    );

    return { totalLimit, totalAvailable };
  }, [cards, selectedCardId]);

  const totalLimitUsed = Math.max(0, totals.totalLimit - totals.totalAvailable);

  const totalLimitUsedPct =
    totals.totalLimit > 0 ? (totalLimitUsed / totals.totalLimit) * 100 : 0;

  // Removido gráfico de "Gasto por Cartão"; cálculo agregado por cartão não é mais necessário aqui.

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};

    filteredTransactions.forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });

    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const invoicesInRange = useMemo(() => {
    const { start, end } = getRanges();

    return invoices.filter((inv) => {
      const due = new Date(inv.dueDate);

      const byDate = due >= start && due <= end;

      const byCard =
        selectedCardId === 'all' ? true : inv.cardId === selectedCardId;

      return byDate && byCard;
    });
  }, [invoices, dateRange, customStart, customEnd, selectedCardId]);

  const invoiceDebts = useMemo(() => {
    const { start, end, prevStart, prevEnd } = getRanges();

    const statusesToCount = [
      InvoiceStatus.Pending,
      InvoiceStatus.Open,
      InvoiceStatus.Overdue,
    ];

    const calcOutstanding = (rangeStart: Date, rangeEnd: Date) => {
      return invoices.reduce((sum, inv) => {
        const due = new Date(inv.dueDate);

        const byDate = due >= rangeStart && due <= rangeEnd;

        const byCard =
          selectedCardId === 'all' ? true : inv.cardId === selectedCardId;

        const includeStatus = statusesToCount.includes(inv.status);

        if (!byDate || !byCard || !includeStatus) return sum;

        const alreadyPaid =
          inv.paidAmount ??
          (inv.status === InvoiceStatus.Paid ? inv.totalAmount : 0);

        const outstanding = Math.max(0, inv.totalAmount - alreadyPaid);

        return sum + outstanding;
      }, 0);
    };

    return {
      current: calcOutstanding(start, end),

      previous: calcOutstanding(prevStart, prevEnd),
    };
  }, [invoices, dateRange, customStart, customEnd, selectedCardId]);

  const currentInvoiceDebt = invoiceDebts.current;

  const previousInvoiceDebt = invoiceDebts.previous;

  const invoiceDebtDiff = currentInvoiceDebt - previousInvoiceDebt;

  const invoiceTrendDirection: 'up' | 'down' =
    invoiceDebtDiff > 0 ? 'down' : 'up';

  const invoiceTrendLabel =
    invoiceDebtDiff === 0
      ? formatCurrency(0)
      : `${invoiceDebtDiff > 0 ? '+ ' : '- '}${formatCurrency(Math.abs(invoiceDebtDiff))}`;

  const invoiceByTxId = useMemo(() => {
    const map = new Map<string, Invoice>();

    invoices.forEach((inv) => {
      (inv.transactions || []).forEach((t) => map.set(t.id, inv));
    });

    return map;
  }, [invoices]);

  const recentTransactions = useMemo(() => {
    return [...filteredTransactions]

      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      .slice(0, 5);
  }, [filteredTransactions]);

  const getTransactionStatus = (tx: Transaction) => {
    if (tx.paymentMethod !== PaymentMethod.Credit) {
      return { label: 'Pago', isPaid: true };
    }

    const invoice = invoiceByTxId.get(tx.id);

    if (!invoice) {
      return { label: 'Pendente', isPaid: false };
    }

    const paidAmount =
      invoice.paidAmount ??
      (invoice.status === InvoiceStatus.Paid ? invoice.totalAmount : 0);

    const isPaid = paidAmount >= invoice.totalAmount && invoice.totalAmount > 0;

    return { label: isPaid ? 'Pago' : 'Pendente', isPaid };
  };

  const handlePartialChange = (id: string, value: string) =>
    setPartialInputs((prev) => ({ ...prev, [id]: value }));

  const applyPartial = (id: string) => {
    const raw = partialInputs[id];

    const amount = parseFloat((raw || '').replace(',', '.'));

    if (Number.isFinite(amount) && amount > 0) {
      onRegisterInvoicePayment(id, amount);

      setPartialInputs((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const handleCardClick = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);

    if (card) {
      setSelectedCardDetail(card);
    }
  };

  const openNewTransactionModal = () => {
    setTransactionToEdit(null);

    setIsTxModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setTransactionToEdit(tx);

    setIsTxModalOpen(true);
  };

  const handleTxModalClose = () => {
    setIsTxModalOpen(false);

    setTransactionToEdit(null);
  };

  const handleTxModalSubmit = (data: NewTransaction | Transaction) => {
    if ('id' in data) {
      onUpdateTransaction(data as Transaction);
    } else {
      onAddTransaction(data as NewTransaction);
    }

    handleTxModalClose();
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 min-h-screen">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading text-neutral-800 dark:text-neutral-100">
            Sua Visão Financeira
          </h1>
        </div>
      </header>

      <div className="flex justify-end">
        <Button
          variant="secondary"
          onClick={onShowInvoicesModal}
          leftIcon="calendar"
        >
          Ver Faturas
        </Button>
      </div>

      <UICard title="Filtros">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Período"
            name="periodo"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
          >
            <option value="this-month">Este Mês</option>

            <option value="last-30-days">Últimos 30 dias</option>

            <option value="all-time">Todo o período</option>

            <option value="custom">Personalizado</option>
          </Select>

          {dateRange === 'custom' && (
            <>
              <Input
                label="Início"
                name="inicio"
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
              />

              <Input
                label="Fim"
                name="fim"
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
            </>
          )}

          <Select
            label="Cartão"
            name="cartao"
            value={selectedCardId}
            onChange={(e) => setSelectedCardId(e.target.value)}
          >
            <option value="all">Todos os Cartões</option>

            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nickname} ({c.last4})
              </option>
            ))}
          </Select>
        </div>
      </UICard>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <SummaryCard
          title="Faturas Abertas"
          amount={currentInvoiceDebt}
          icon="credit-card"
          trend={invoiceTrendLabel}
          trendDirection={invoiceTrendDirection}
          iconBgColor="bg-rose-200/70"
          iconColor="text-rose-700"
          containerClassName="bg-gradient-to-br from-rose-50 via-white to-white dark:from-rose-900/30 dark:via-transparent dark:to-neutral-900"
        />
        <SummaryCard
          title="Valor Gasto em Contas"
          amount={summary.totalBalance}
          icon="bank"
          trend="+ R$ 1.200,00"
          trendDirection="up"
          iconBgColor="bg-sky-200/70"
          iconColor="text-sky-700"
          containerClassName="bg-gradient-to-br from-sky-50 via-white to-white dark:from-sky-900/20 dark:via-transparent dark:to-neutral-900"
        />
        <SummaryCard
          title="Limite Total dos Cartões"
          amount={totals.totalLimit}
          icon="pie-chart"
          trend=""
          trendDirection="up"
          iconBgColor="bg-cyan-200/70"
          iconColor="text-cyan-700"
          containerClassName="bg-gradient-to-br from-cyan-50 via-white to-white dark:from-cyan-900/25 dark:via-transparent dark:to-neutral-900"
          footerContent={
            <div className="mt-3 text-xs font-semibold text-cyan-700 dark:text-cyan-200">
              Disponível: {formatCurrency(totals.totalAvailable)}
            </div>
          }
        />
        <SummaryCard
          title="Limite Total Utilizado"
          amount={totalLimitUsed}
          icon="bar-chart"
          trend=""
          trendDirection="down"
          iconBgColor="bg-amber-200/70"
          iconColor="text-amber-700"
          containerClassName="bg-gradient-to-br from-amber-50 via-white to-white dark:from-amber-900/20 dark:via-transparent dark:to-neutral-900"
          footerContent={
            <div className="mt-3 text-xs font-semibold text-amber-700 dark:text-amber-200">
              {totalLimitUsedPct.toFixed(1)}% do limite
            </div>
          }
        />
      </div>
      <div className="grid grid-cols-1 gap-6 items-stretch">
        <UICard title="Meus Cartões">
          <div className="px-2">
            <CardCarousel
              cards={
                (selectedCardId === 'all'
                  ? cards
                  : cards.filter((c) => c.id === selectedCardId)) as any
              }
              onCardClick={(card) => handleCardClick(card.id)}
            />
          </div>

          <div className="mt-4 text-center">
            <Button
              variant="secondary"
              leftIcon="plus"
              size="sm"
              onClick={() => setIsAddCardModalOpen(true)}
            >
              Adicionar Cartão
            </Button>
          </div>
        </UICard>
      </div>

      <UICard title="Gastos por Categoria">
        <div className="space-y-3">
          {categoryData.map((c, i) => {
            const pct = totalExpenses > 0 ? (c.value / totalExpenses) * 100 : 0;

            return (
              <div
                key={c.name}
                className="grid grid-cols-12 items-center gap-3"
              >
                <div className="col-span-3 sm:col-span-2 text-sm text-neutral-600 dark:text-neutral-300">
                  {c.name}
                </div>

                <div className="col-span-7 sm:col-span-8">
                  <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: COLORS[i % COLORS.length],
                      }}
                    />
                  </div>
                </div>

                <div className="col-span-2 text-right text-sm font-semibold">
                  {formatCurrency(c.value)}
                </div>
              </div>
            );
          })}
        </div>
      </UICard>

      <UICard>
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="font-heading text-lg text-neutral-700 dark:text-neutral-200">
              Transações Recentes
            </h3>

            <div className="flex items-center gap-2">
              <Button
                leftIcon="plus"
                variant="ghost"
                size="sm"
                onClick={openNewTransactionModal}
              >
                Adicionar
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('transactions')}
              >
                Ver Todas
              </Button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-3 w-full">
            <Select
              label="Filtrar por Cartão"
              name="filtroCartao"
              value={selectedCardId}
              onChange={(e) => setSelectedCardId(e.target.value)}
            >
              <option value="all">Todos</option>

              {cards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nickname} (••{c.last4})
                </option>
              ))}
            </Select>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
              <Input
                label="Início"
                name="txStart"
                type="date"
                value={customStart}
                onChange={(e) => {
                  setCustomStart(e.target.value);
                  setDateRange('custom');
                }}
              />

              <Input
                label="Fim"
                name="txEnd"
                type="date"
                value={customEnd}
                onChange={(e) => {
                  setCustomEnd(e.target.value);
                  setDateRange('custom');
                }}
              />
            </div>
          </div>
        </div>

        <div>
          {recentTransactions.length > 0 ? (
            <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {recentTransactions.map((tx) => {
                const meta = getCategoryMeta(tx.category);
                const status = getTransactionStatus(tx);

                return (
                  <li
                    key={tx.id}
                    className="py-4 flex items-center gap-4 flex-wrap sm:flex-nowrap"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                      <div
                        className={`h-12 w-12 rounded-full flex items-center justify-center text-xl ${meta.bgClass}`}
                      >
                        {meta.icon}
                      </div>

                      <div>
                        <p className="font-semibold text-neutral-800 dark:text-neutral-100">
                          {tx.description}
                        </p>

                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {tx.category}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-mono font-bold text-red-500">
                        -{formatCurrency(tx.amount)}
                      </p>

                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {formatDate(tx.date)}
                      </p>

                      <span
                        className={`mt-1 inline-flex justify-end text-xs font-semibold px-2 py-0.5 rounded-full ${status.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleEditTransaction(tx)}
                      className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-500"
                      aria-label={`Editar ${tx.description}`}
                    >
                      <Icon icon="pencil" className="h-5 w-5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="py-8 text-center text-neutral-500 dark:text-neutral-400">
              Nenhuma transação encontrada para o período selecionado.
            </div>
          )}
        </div>
      </UICard>

      {/* Faturas detalhadas com pagamento total/parcial */}

      <UICard title="Faturas Detalhadas">
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
              {invoicesInRange.map((inv) => {
                const card = cards.find((c) => c.id === inv.cardId);

                const paid =
                  inv.paidAmount ??
                  (inv.status === InvoiceStatus.Paid ? inv.totalAmount : 0);

                const remaining = Math.max(0, inv.totalAmount - paid);

                return (
                  <tr key={inv.id}>
                    <td className="py-3 pr-4">
                      {card?.nickname}{' '}
                      <span className="text-neutral-400">
                        (••{card?.last4})
                      </span>
                    </td>

                    <td className="py-3 pr-4">
                      {inv.month}/{inv.year}
                    </td>

                    <td className="py-3 pr-4">{formatDate(inv.dueDate)}</td>

                    <td className="py-3 pr-4 font-semibold">
                      {formatCurrency(inv.totalAmount)}
                    </td>

                    <td className="py-3 pr-4">{formatCurrency(paid)}</td>

                    <td className="py-3 pr-4">{statusPt(inv.status)}</td>

                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            onRegisterInvoicePayment(inv.id, remaining)
                          }
                          disabled={remaining <= 0}
                        >
                          Pagar Total
                        </Button>

                        <Input
                          label=""
                          name={`partial-${inv.id}`}
                          placeholder="Parcial"
                          value={partialInputs[inv.id] || ''}
                          onChange={(e) =>
                            handlePartialChange(inv.id, e.target.value)
                          }
                          className="w-28"
                        />

                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => applyPartial(inv.id)}
                        >
                          Aplicar
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPaying(inv)}
                        >
                          Registrar
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </UICard>

      {paying && (
        <PaymentModal
          isOpen={!!paying}
          onClose={() => setPaying(null)}
          invoice={paying}
          onSubmit={(invoiceId, amount, dateISO) =>
            onRegisterInvoicePayment(invoiceId, amount, dateISO)
          }
        />
      )}

      {selectedCardDetail && (
        <CardDetailModal
          isOpen={!!selectedCardDetail}
          onClose={() => setSelectedCardDetail(null)}
          card={selectedCardDetail}
          invoices={invoices.filter(
            (inv) => inv.cardId === selectedCardDetail.id,
          )}
          onUpdateInvoiceStatus={onUpdateInvoiceStatus}
          cardSettings={cardSettings}
          onUpdateCardSettings={onUpdateCardSettings}
          onUpdateCard={onUpdateCard}
          payments={payments.filter((p) => p.cardId === selectedCardDetail.id)}
          onRegisterInvoicePayment={onRegisterInvoicePayment}
          onRefundTransaction={onRefundInvoiceTransaction}
          onRefundGroup={onRefundInstallmentGroup}
        />
      )}

      <TransactionFormModal
        isOpen={isTxModalOpen}
        onClose={handleTxModalClose}
        onSubmit={handleTxModalSubmit}
        accounts={accounts}
        transactionToEdit={transactionToEdit}
        allowedTypes={[TransactionType.Expense]}
        allowedPaymentMethods={[PaymentMethod.Credit, PaymentMethod.Debit]}
      />

      <AddCardModal
        isOpen={isAddCardModalOpen}
        onClose={() => setIsAddCardModalOpen(false)}
        onAddCard={(newCard) => {
          onAddCard(newCard);
          setIsAddCardModalOpen(false);
        }}
      />
    </div>
  );
};

export default CardsDashboardPage;

