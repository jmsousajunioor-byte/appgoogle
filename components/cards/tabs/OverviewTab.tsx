import React, { useEffect, useMemo, useState } from 'react';
import { Card, Invoice, InvoiceStatus } from '../../../types';
import { daysRemaining, formatCurrency, formatDate } from '../../../utils/formatters';
import ProgressBar from '../../ui/ProgressBar';
import Badge from '../../ui/Badge';
import InstallmentList from '../InstallmentList';
import Button from '../../ui/Button';
import InvoiceDetailModal from '../InvoiceDetailModal';
import Select from '../../ui/Select';

const MONTH_OPTIONS = [
  { value: 'janeiro', label: 'Janeiro' },
  { value: 'fevereiro', label: 'Fevereiro' },
  { value: 'março', label: 'Março' },
  { value: 'abril', label: 'Abril' },
  { value: 'maio', label: 'Maio' },
  { value: 'junho', label: 'Junho' },
  { value: 'julho', label: 'Julho' },
  { value: 'agosto', label: 'Agosto' },
  { value: 'setembro', label: 'Setembro' },
  { value: 'outubro', label: 'Outubro' },
  { value: 'novembro', label: 'Novembro' },
  { value: 'dezembro', label: 'Dezembro' },
];

interface OverviewTabProps {
  card: Card & {
    availableLimit: number;
    currentInvoiceAmount: number;
    dueDate: string;
    invoiceStatus: InvoiceStatus;
  };
  invoices: Invoice[];
  currentInvoice?: Invoice;
  onUpdateInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  card,
  invoices,
  currentInvoice,
  onUpdateInvoiceStatus,
}) => {
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [statementInvoice, setStatementInvoice] = useState<Invoice | null>(null);
  const now = new Date();
  const initialYear = Math.max(2020, currentInvoice?.year ?? now.getFullYear());
  const initialMonth =
    currentInvoice?.month?.toLowerCase() ??
    MONTH_OPTIONS[now.getMonth()].value;

  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);

  useEffect(() => {
    if (currentInvoice) {
      setSelectedYear(currentInvoice.year);
      setSelectedMonth(currentInvoice.month.toLowerCase());
    }
  }, [currentInvoice?.id]);

  const maxYear = Math.max(now.getFullYear(), 2025);
  const yearOptions = Array.from(
    { length: maxYear - 2020 + 1 },
    (_, idx) => 2020 + idx,
  );

  const selectedInvoice = useMemo(() => {
    return invoices.find(
      (inv) =>
        inv.year === selectedYear &&
        inv.month.toLowerCase() === selectedMonth,
    );
  }, [invoices, selectedYear, selectedMonth]);

  const selectedMonthLabel =
    MONTH_OPTIONS.find((m) => m.value === selectedMonth)?.label ??
    selectedMonth;

  const limitUtilization = (card.currentInvoiceAmount / card.limit) * 100;
  const remainingDays = selectedInvoice
    ? daysRemaining(selectedInvoice.dueDate)
    : 0;
  const paidAmount =
    selectedInvoice?.paidAmount ??
    (selectedInvoice?.status === InvoiceStatus.Paid
      ? selectedInvoice?.totalAmount ?? 0
      : 0);

  const paymentSummary = !selectedInvoice
    ? 'Sem fatura selecionada'
    : selectedInvoice.totalAmount > 0 &&
        paidAmount >= selectedInvoice.totalAmount
    ? 'Pagamento total'
    : paidAmount > 0
    ? 'Pagamento parcial'
    : 'Em aberto';

  const handleMarkAsPaid = () => {
    if (selectedInvoice) {
      onUpdateInvoiceStatus(selectedInvoice.id, InvoiceStatus.Paid);
    }
  };

  const handleShowStatement = () => {
    if (selectedInvoice) {
      setStatementInvoice(selectedInvoice);
      setIsStatementModalOpen(true);
    }
  };

  const closeStatementModal = () => {
    setIsStatementModalOpen(false);
    setStatementInvoice(null);
  };

  const installments =
    selectedInvoice?.installments ??
    currentInvoice?.installments ??
    [];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <h2 className="text-2xl font-heading text-neutral-800 dark:text-neutral-100">
            Faturas por período
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:w-auto">
            <Select
              label="Ano"
              name="invoiceYear"
              value={selectedYear.toString()}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {yearOptions.map((year) => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </Select>

            <Select
              label="Mês"
              name="invoiceMonth"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {MONTH_OPTIONS.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="mt-4 p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-md space-y-4">
          {selectedInvoice ? (
            <>
              <div className="flex justify-between items-baseline">
                <span className="text-neutral-500 dark:text-neutral-400">
                  Valor
                </span>

                <span className="font-mono text-3xl font-bold text-indigo-600">
                  {formatCurrency(selectedInvoice.totalAmount)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500 dark:text-neutral-400">
                  Vencimento
                </span>

                <span
                  className={`font-bold ${remainingDays < 5 ? 'text-red-500' : 'text-neutral-600 dark:text-neutral-300'}`}
                >
                  {formatDate(selectedInvoice.dueDate)} (
                  {remainingDays} dias restantes)
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500 dark:text-neutral-400">
                  Status
                </span>

                <Badge status={selectedInvoice.status} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-neutral-500 dark:text-neutral-400">
                    Pago até agora
                  </span>
                  <p className="font-semibold">
                    {formatCurrency(paidAmount || 0)}
                  </p>
                </div>

                <div>
                  <span className="text-neutral-500 dark:text-neutral-400">
                    Pagamento
                  </span>
                  <p className="font-semibold">{paymentSummary}</p>
                </div>

                <div>
                  <span className="text-neutral-500 dark:text-neutral-400">
                    Pago em
                  </span>
                  <p className="font-semibold">
                    {selectedInvoice.paymentDate
                      ? formatDate(selectedInvoice.paymentDate)
                      : '—'}
                  </p>
                </div>
              </div>

              <div className="!mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleMarkAsPaid}
                  disabled={
                    !selectedInvoice ||
                    selectedInvoice.status === InvoiceStatus.Paid
                  }
                >
                  {selectedInvoice.status === InvoiceStatus.Paid
                    ? 'Fatura Paga'
                    : 'Marcar como Paga'}
                </Button>

                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleShowStatement}
                  disabled={!selectedInvoice}
                >
                  Ver Extrato
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center text-neutral-500 dark:text-neutral-400">
              Nenhuma fatura encontrada para {selectedMonthLabel}/
              {selectedYear}.
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-heading text-neutral-800 dark:text-neutral-200 mb-2">
          Limite do Cartão
        </h3>

        <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl shadow-md space-y-3">
          <ProgressBar value={limitUtilization} />

          <div className="flex justify-between text-sm">
            <span className="text-neutral-500 dark:text-neutral-400">
              Utilizado
            </span>
            <span className="font-mono font-bold text-neutral-700 dark:text-neutral-200">
              {formatCurrency(card.currentInvoiceAmount)}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-neutral-500 dark:text-neutral-400">
              Disponível
            </span>
            <span className="font-mono text-emerald-600 font-bold">
              {formatCurrency(card.availableLimit)}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-neutral-500 dark:text-neutral-400">
              Total
            </span>
            <span className="font-mono text-neutral-700 dark:text-neutral-200">
              {formatCurrency(card.limit)}
            </span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-heading text-neutral-800 dark:text-neutral-200 mb-2">
          Parcelamentos Futuros
        </h3>

        <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl shadow-md">
          <InstallmentList installments={installments} />
        </div>
      </div>

      {statementInvoice && (
        <InvoiceDetailModal
          isOpen={isStatementModalOpen}
          onClose={closeStatementModal}
          invoice={statementInvoice}
        />
      )}
    </div>
  );
};

export default OverviewTab;
