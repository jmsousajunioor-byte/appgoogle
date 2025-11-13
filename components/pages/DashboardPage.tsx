import React, { useState, useMemo } from 'react';
import SummaryCard from '../dashboard/SummaryCard';
import CategoryChart from '../dashboard/CategoryChart';
import RecentTransactions from '../dashboard/RecentTransactions';
import CardCarousel from '../dashboard/CardCarousel';
import Button from '../ui/Button';
import { Card, NewTransaction, Page, Transaction, TransactionType, Invoice, InvoiceStatus, BankAccount, NewCard, PaymentMethod, InvoicePaymentRecord } from '../../types';
import TransactionFormModal from '../transactions/TransactionFormModal';
import CardDetailModal from '../cards/CardDetailModal';
import DashboardFilters from '../dashboard/DashboardFilters';
import AddCardModal from '../cards/AddCardModal';

type EnhancedCard = Card & { availableLimit: number; currentInvoiceAmount: number; dueDate: string; invoiceStatus: InvoiceStatus; };

interface DashboardPageProps {
    summary: { // This will now be the total summary, not filtered.
        totalBalance: number;
        creditCardDebt: number;
    };
    cards: EnhancedCard[];
    transactions: Transaction[];
    onAddTransaction: (newTx: NewTransaction) => void;
    onUpdateTransaction: (tx: Transaction) => void;
    onNavigate: (page: Page) => void;
    invoices: Invoice[];
    onUpdateInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;
    cardSettings: Record<string, { alertThreshold: number }>;
    onUpdateCardSettings: (cardId: string, threshold: number) => void;
    accounts: (BankAccount | Card)[];
    onAddCard: (newCard: NewCard) => void;
    onUpdateCard: (card: Card) => void;
    payments: InvoicePaymentRecord[];
    onRegisterInvoicePayment: (invoiceId: string, amount: number, dateISO?: string) => void;
    onRefundInvoiceTransaction: (invoiceId: string, txId: string) => void;
    onRefundInstallmentGroup: (txId: string) => void;
    onShowInvoicesModal: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ 
  summary, 
  cards, 
  transactions, 
  onAddTransaction,
  onUpdateTransaction,
  onNavigate,
  invoices,
  onUpdateInvoiceStatus,
  cardSettings,
  onUpdateCardSettings,
  accounts,
  onAddCard,
  onUpdateCard,
  payments,
  onRegisterInvoicePayment,
  onRefundInvoiceTransaction,
  onRefundInstallmentGroup,
  onShowInvoicesModal
}) => {
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [selectedCard, setSelectedCard] = useState<EnhancedCard | null>(null);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  
  // --- FILTER STATE ---
  const [dateRange, setDateRange] = useState('this-month');
  // We keep state for future use, but we will not show income-related controls now
  const [transactionType, setTransactionType] = useState('expense');
  const [selectedAccount, setSelectedAccount] = useState('all');

  // --- FILTERED DATA ---
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let startDate = new Date(now.getFullYear(), now.getMonth(), 1);

    if (dateRange === 'last-30-days') {
        startDate = new Date(now.setDate(now.getDate() - 30));
    }

    return transactions.filter(tx => {
        const txDate = new Date(tx.date);
        const dateFilterPassed = dateRange === 'all-time' || txDate >= startDate;
        // Force only expenses (ignore 'income' for now)
        const typeFilterPassed = tx.type === TransactionType.Expense;
        // Only credit or debit expenses
        const methodFilterPassed = tx.paymentMethod === PaymentMethod.Credit || tx.paymentMethod === PaymentMethod.Debit;
        const accountFilterPassed = selectedAccount === 'all' || tx.sourceId === selectedAccount;
        return dateFilterPassed && typeFilterPassed && methodFilterPassed && accountFilterPassed;
    });
  }, [transactions, dateRange, transactionType, selectedAccount]);

  const filteredSummary = useMemo(() => {
    return {
        totalExpenses: filteredTransactions.reduce((sum, t) => sum + t.amount, 0),
    }
  }, [filteredTransactions]);


  // --- HANDLERS ---
  const handleEditTransaction = (tx: Transaction) => {
    setTransactionToEdit(tx);
    setIsTxModalOpen(true);
  };
  
  const handleModalClose = () => {
    setIsTxModalOpen(false);
    setTransactionToEdit(null); // Important to reset
  }

  const handleModalSubmit = (txData: NewTransaction | Transaction) => {
    if ('id' in txData) {
      onUpdateTransaction(txData as Transaction);
    } else {
      onAddTransaction(txData as NewTransaction);
    }
    handleModalClose();
  }
  
  const handleAddCard = (newCard: NewCard) => {
    onAddCard(newCard);
    setIsAddCardModalOpen(false);
  };

  const handleCardClick = (card: Card) => {
    const enhancedCard = cards.find(c => c.id === card.id);
    if(enhancedCard) {
        setSelectedCard(enhancedCard);
    }
  };

  const handleCloseCardModal = () => {
    setSelectedCard(null);
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 min-h-screen">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl sm:text-4xl font-heading text-neutral-800 dark:text-neutral-100">Painel</h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">Bem-vindo de volta! Aqui está um resumo de suas finanças.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onShowInvoicesModal} leftIcon="calendar">Ver Faturas</Button>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          title="Despesas no Período"
          amount={filteredSummary.totalExpenses}
          icon="trending-down"
          trend="+ 12.8%"
          trendDirection="down"
          iconBgColor="bg-amber-200/70"
          iconColor="text-amber-700"
          containerClassName="bg-gradient-to-br from-amber-50 via-white to-white dark:from-amber-900/20 dark:via-transparent dark:to-neutral-900"
        />
        <SummaryCard 
          title="Faturas Abertas"
          amount={summary.creditCardDebt}
          icon="credit-card"
          trend="- R$ 350,00"
          trendDirection="down"
          iconBgColor="bg-rose-200/70"
          iconColor="text-rose-700"
          containerClassName="bg-gradient-to-br from-rose-50 via-white to-white dark:from-rose-900/30 dark:via-transparent dark:to-neutral-900"
        />
      </div>

      <DashboardFilters 
        accounts={accounts}
        filters={{ dateRange, transactionType, selectedAccount }}
        onFilterChange={{ setDateRange, setTransactionType, setSelectedAccount }}
        showTypeFilter={false}
      />

      <div>
        <h2 className="text-2xl font-heading text-neutral-700 dark:text-neutral-200 mb-4">Seus Cartões</h2>
        <CardCarousel cards={cards} onCardClick={handleCardClick} />
        <div className="mt-6 text-center">
            <Button
                leftIcon="plus"
                size="sm"
                variant="secondary"
                onClick={() => setIsAddCardModalOpen(true)}
            >
                Adicionar Cartão
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <RecentTransactions 
            transactions={filteredTransactions} 
            onNavigate={onNavigate} 
            onEdit={handleEditTransaction}
            onAdd={() => setIsTxModalOpen(true)}
          />
        </div>
        <div className="lg:col-span-2">
          <CategoryChart transactions={filteredTransactions} />
      </div>
      </div>
      
      <TransactionFormModal 
        isOpen={isTxModalOpen} 
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        accounts={accounts}
        transactionToEdit={transactionToEdit}
        allowedTypes={[TransactionType.Expense]}
        allowedPaymentMethods={[PaymentMethod.Credit, PaymentMethod.Debit]}
      />

      {selectedCard && (
        <CardDetailModal 
          isOpen={!!selectedCard}
          onClose={handleCloseCardModal}
          card={selectedCard}
          invoices={invoices.filter(inv => inv.cardId === selectedCard.id)}
          onUpdateInvoiceStatus={onUpdateInvoiceStatus}
          cardSettings={cardSettings}
          onUpdateCardSettings={onUpdateCardSettings}
          onUpdateCard={onUpdateCard}
          payments={payments}
          onRegisterInvoicePayment={onRegisterInvoicePayment}
          onRefundTransaction={(invoiceId, txId)=> onRefundInvoiceTransaction(invoiceId, txId)}
          onRefundGroup={(txId) => onRefundInstallmentGroup(txId)}
        />
      )}

      <AddCardModal 
        isOpen={isAddCardModalOpen} 
        onClose={() => setIsAddCardModalOpen(false)}
        onAddCard={handleAddCard}
      />
    </div>
  );
};

export default DashboardPage;
