import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import MainContent from './components/layout/MainContent';
import { Page, Card as CardType, Invoice, BankAccount, Transaction, User, Budget, Goal, NewCard, NewBankAccount, NewTransaction, InvoiceStatus, TransactionType, Theme, NewBudget, NewGoal, InvoicePaymentRecord, NotificationItem, RecurringTransaction } from './types';
import DashboardPage from './components/pages/DashboardPage';
import CreditCardsPage from './components/pages/CreditCardsPage';
import BankAccountsPage from './components/pages/BankAccountsPage';
import TransactionsPage from './components/pages/TransactionsPage';
import ReportsPage from './components/pages/ReportsPage';
import BudgetsPage from './components/pages/BudgetsPage';
import ProfilePage from './components/pages/ProfilePage';
import CardsDashboardPage from './components/pages/CardsDashboardPage';
import SettingsPage from './components/pages/SettingsPage';
import { mockCards, mockInvoices, mockBankAccounts, mockTransactions, mockUser, mockBudgets, mockGoals } from './utils/mockData';
import { formatDate } from './utils/formatters';
import { addCreditPurchaseToInvoices, recalculateChainForCard, registerInvoicePayment } from './utils/invoiceEngine';
import InvoicesPage, { InvoicesModal } from './components/pages/InvoicesPage';
import { ThemeContext } from './contexts/ThemeContext';
import {
  listarTransacoes,
  criarTransacao as criarTransacaoService,
  atualizarTransacao as atualizarTransacaoService,
  deletarTransacao as deletarTransacaoService,
} from './src/services/transacoesService';
import {
  listarCartoes,
  criarCartao as criarCartaoService,
  atualizarCartao as atualizarCartaoService,
} from './src/services/cartoesService';
import {
  buscarUsuarioPorId,
  atualizarUsuario as atualizarUsuarioService,
} from './src/services/usuariosService';
import {
  mapCardFromSupabase,
  mapTransactionFromSupabase,
  mapUserFromSupabase,
} from './src/services/mappers';

const DEFAULT_USER_ID =
  (import.meta.env.VITE_SUPABASE_DEFAULT_USER_ID as string | undefined) ||
  'demo-user-id';

if (import.meta.env.DEV) {
  console.debug('Supabase env check', {
    url: import.meta.env.VITE_SUPABASE_URL,
    key: import.meta.env.VITE_SUPABASE_ANON_KEY ? '***' : undefined,
  });
}

const toNewTransactionPayload = (
  tx: Transaction | NewTransaction,
): NewTransaction => ({
  description: tx.description,
  category: tx.category,
  amount: tx.amount,
  date: tx.date,
  type: tx.type,
  paymentMethod: tx.paymentMethod,
  sourceId: tx.sourceId,
  isInstallment: !!tx.isInstallment,
  installment: tx.isInstallment && tx.installment
    ? { current: tx.installment.current, total: tx.installment.total }
    : undefined,
});

const stripId = <T extends { id: string }>(entity: T): Omit<T, 'id'> => {
  const { id: _omit, ...rest } = entity;
  return rest;
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = window.localStorage.getItem('theme') as Theme | null;
    return stored === 'dark' ? 'dark' : 'light';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- STATE MANAGEMENT ---
  const [user, setUser] = useState<User>(mockUser);
  const [cards, setCards] = useState<CardType[]>(mockCards);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(mockBankAccounts);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [cardSettings, setCardSettings] = useState<Record<string, { alertThreshold: number }>>({});
  const [invoicePayments, setInvoicePayments] = useState<InvoicePaymentRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [recurrences, setRecurrences] = useState<RecurringTransaction[]>([]);
  const [isInvoicesModalOpen, setIsInvoicesModalOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const loadInitialData = async () => {
      try {
        const [remoteCards, remoteTransactions, remoteUser] = await Promise.all([
          listarCartoes(DEFAULT_USER_ID),
          listarTransacoes({ userId: DEFAULT_USER_ID }),
          buscarUsuarioPorId(DEFAULT_USER_ID).catch(() => null),
        ]);
        if (!active) return;
        if (remoteCards && remoteCards.length) {
          setCards(remoteCards.map(mapCardFromSupabase));
        }
        if (remoteTransactions && remoteTransactions.length) {
          setTransactions(remoteTransactions.map(mapTransactionFromSupabase));
        }
        if (remoteUser) {
          setUser(mapUserFromSupabase(remoteUser));
        }
      } catch (error) {
        console.error('Erro ao carregar dados do Supabase:', error);
      }
    };
    loadInitialData();
    return () => {
      active = false;
    };
  }, []);


  // --- DERIVED STATE & MEMOS ---
  const enhancedCards = useMemo(() => {
    return cards.map(card => {
      const statusesToSum = [InvoiceStatus.Pending, InvoiceStatus.Open, InvoiceStatus.Overdue];
      const related = invoices.filter(inv => inv.cardId === card.id && statusesToSum.includes(inv.status));
      const outstanding = related.reduce((sum, inv) => sum + Math.max(0, (inv.totalAmount || 0) - (inv.paidAmount || 0)), 0);
      const currentInvoice = invoices.find(inv => inv.cardId === card.id && inv.status === InvoiceStatus.Pending);
      const currentInvoiceAmount = currentInvoice?.totalAmount || 0;
      const availableLimit = card.limit - outstanding;
      const dueDate = currentInvoice?.dueDate || new Date().toISOString();
      return { ...card, currentInvoiceAmount, availableLimit, dueDate, invoiceStatus: currentInvoice?.status || InvoiceStatus.Paid };
    });
  }, [cards, transactions, invoices]);
  
  const dashboardSummary = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyTx = transactions.filter(t => {
        const txDate = new Date(t.date);
        return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    });

    return {
        totalBalance: bankAccounts.reduce((sum, acc) => sum + acc.balance, 0),
        totalIncome: monthlyTx.filter(t => t.type === TransactionType.Income).reduce((sum, t) => sum + t.amount, 0),
        totalExpenses: monthlyTx.filter(t => t.type === TransactionType.Expense).reduce((sum, t) => sum + t.amount, 0),
        creditCardDebt: invoices.filter(inv => inv.status === InvoiceStatus.Pending).reduce((sum, inv) => sum + inv.totalAmount, 0),
    }
  }, [bankAccounts, transactions, invoices]);


  // --- HANDLER FUNCTIONS ---
  const handleAddCard = (newCard: NewCard) => {
    (async () => {
      try {
        const created = await criarCartaoService({
          ...newCard,
          user_id: DEFAULT_USER_ID,
        });
        if (created) {
          setCards(prev => [...prev, created as CardType]);
          return;
        }
      } catch (error) {
        console.error('Erro ao criar cartao no Supabase:', error);
      }
      const fallback: CardType = {
        ...newCard,
        id: `c${Date.now()}`,
        gradient: newCard.gradient || { start: '#4B5563', end: '#1F2937' },
      };
      setCards(prev => [...prev, fallback]);
    })();
  };

  const handleUpdateCard = (updated: CardType) => {
    setCards(prev => prev.map(c => (c.id === updated.id ? { ...updated } : c)));
    (async () => {
      try {
        await atualizarCartaoService(updated.id, stripId(updated));
      } catch (error) {
        console.error(`Erro ao atualizar cartao ${updated.id}:`, error);
      }
    })();
  };

  const handleAddBankAccount = (newAccount: NewBankAccount) => {
    const account: BankAccount = { ...newAccount, id: `b${Date.now()}`, logoUrl: 'https://logodownload.org/wp-content/uploads/2018/05/banco-do-brasil-logo-3.png' };
    setBankAccounts(prev => [...prev, account]);
  };

  const persistTransactions = (txs: (Transaction | NewTransaction)[]) => {
    if (!txs.length) return;
    void Promise.all(
      txs.map(tx =>
        criarTransacaoService({
          ...toNewTransactionPayload(tx),
          user_id: DEFAULT_USER_ID,
        }),
      ),
    ).catch(error => console.error('Erro ao persistir transacoes:', error));
  };

  const handleAddTransaction = (newTx: NewTransaction) => {
    // If credit purchase, route to invoice engine and possibly generate installments
    const isCredit = newTx.paymentMethod === TransactionType ? false : newTx.paymentMethod === 'credit' || newTx.paymentMethod === (undefined as any);
    const isCardSource = typeof newTx.sourceId === 'string' && newTx.sourceId.startsWith('c');
    if (newTx.paymentMethod === (undefined as any)) {
      // keep fallback path, but normally paymentMethod is defined
    }

    if (newTx.paymentMethod === 'credit' && isCardSource) {
      const card = cards.find(c => c.id === newTx.sourceId);
      if (card) {
        const { createdTxs } = addCreditPurchaseToInvoices({
          invoices,
          setInvoices,
          card,
          baseTransaction: { ...newTx },
        });
        // prepend created transactions
        setTransactions(prev => [...createdTxs, ...prev]);
        persistTransactions(createdTxs);
        // No bank account balance to update for credit purchases
        return;
      }
    }

    // Non-credit or bank-account transactions fall back to original behavior
    const tx: Transaction = { ...newTx, id: `t${Date.now()}` };
    setTransactions(prev => [tx, ...prev]);

    // Update account balance only for bank account sources (not for cards)
    setBankAccounts(prev => prev.map(acc => {
        if (acc.id === tx.sourceId) {
            const newBalance = tx.type === TransactionType.Income ? acc.balance + tx.amount : acc.balance - tx.amount;
            return { ...acc, balance: newBalance };
        }
        return acc;
    }));
    persistTransactions([tx]);
  };

  const handleUpdateTransaction = (updatedTx: Transaction) => {
    const originalTx = transactions.find(t => t.id === updatedTx.id);
    if (!originalTx) return;

    // Update transactions list
    setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));

    // Update account balances, handling changes in amount, type, and source account
    setBankAccounts(prev => prev.map(acc => {
        let newBalance = acc.balance;
        const isOriginalSource = acc.id === originalTx.sourceId;
        const isNewSource = acc.id === updatedTx.sourceId;

        // Revert original transaction if it was a bank account transaction
        if (isOriginalSource && !originalTx.sourceId.startsWith('c')) {
            if (originalTx.type === TransactionType.Income) newBalance -= originalTx.amount;
            if (originalTx.type === TransactionType.Expense) newBalance += originalTx.amount;
        }

        // Apply updated transaction if it's a bank account transaction
        if (isNewSource && !updatedTx.sourceId.startsWith('c')) {
            if (updatedTx.type === TransactionType.Income) newBalance += updatedTx.amount;
            if (updatedTx.type === TransactionType.Expense) newBalance -= updatedTx.amount;
        }

        return { ...acc, balance: newBalance };
    }));

    (async () => {
      try {
        await atualizarTransacaoService(updatedTx.id, stripId(updatedTx));
      } catch (error) {
        console.error(`Erro ao atualizar transacao ${updatedTx.id}:`, error);
      }
    })();
  };

  const handleUpdateInvoiceStatus = (invoiceId: string, status: InvoiceStatus) => {
    setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status, paymentDate: status === InvoiceStatus.Paid ? new Date().toISOString() : undefined } : inv));
  };
  
  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    void atualizarUsuarioService(DEFAULT_USER_ID, updatedUser).catch(error => {
      console.error('Erro ao atualizar usuario no Supabase:', error);
    });
  };
  
  const handleAddBudget = (newBudget: NewBudget) => {
    const budget: Budget = { ...newBudget, id: `bud${Date.now()}` };
    setBudgets(prev => [...prev, budget]);
  };
  
  const handleAddGoal = (newGoal: NewGoal) => {
    const goal: Goal = { ...newGoal, id: `g${Date.now()}` };
    setGoals(prev => [...prev, goal]);
  };

  const handleUpdateCardSettings = (cardId: string, threshold: number) => {
    setCardSettings(prev => ({
        ...prev,
        [cardId]: { alertThreshold: threshold },
    }));
  };

  const handleRegisterInvoicePayment = (invoiceId: string, amount: number, dateISO?: string) => {
    if (amount <= 0 || !Number.isFinite(amount)) return;
    registerInvoicePayment(invoices, setInvoices, invoiceId, amount, dateISO);
    const inv = invoices.find(i => i.id === invoiceId);
    if (inv) {
      setInvoicePayments(prev => [...prev, { id: `pay${Date.now()}`, invoiceId, cardId: inv.cardId, amount, dateISO: dateISO || new Date().toISOString() }]);
    }
  };

  const handleRefundInvoiceTransaction = (invoiceId: string, txId: string) => {
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) return;
    setInvoices(prev => {
      const idx = prev.findIndex(i => i.id === invoiceId);
      if (idx === -1) return prev;
      const updated = [...prev];
      const target = updated[idx];
      const nextInv = { ...target, transactions: (target.transactions || []).filter(t => t.id !== txId) };
      updated[idx] = nextInv as Invoice;
      return recalculateChainForCard(updated, nextInv.cardId);
    });
    setTransactions(prev => prev.filter(t => t.id !== txId));
    void deletarTransacaoService(txId).catch(error => {
      console.error(`Erro ao deletar transacao ${txId} durante estorno:`, error);
    });
  };

  const handleRefundInstallmentGroup = (txId: string) => {
    // find invoice and transaction
    let foundInvoice: Invoice | undefined;
    let foundTx: { id: string; description: string; installment?: { current: number; total: number } } | undefined;
    for (const inv of invoices) {
      const tx = inv.transactions.find(t => t.id === txId);
      if (tx) { foundInvoice = inv; foundTx = tx as any; break; }
    }
    if (!foundInvoice || !foundTx) return;
    const base = (foundTx.description || '').replace(/\s*\(\d+\/\d+\)$/, '').trim();
    const total = foundTx.installment?.total;
    // collect ids to remove across invoices of same card
    const idsToRemove = new Set<string>();
    invoices.forEach(inv => {
      if (inv.cardId !== foundInvoice!.cardId) return;
      inv.transactions.forEach(t => {
        const tBase = (t.description || '').replace(/\s*\(\d+\/\d+\)$/, '').trim();
        const sameGroup = tBase === base && (!total || t.installment?.total === total);
        if (sameGroup) idsToRemove.add(t.id);
      });
    });
    if (idsToRemove.size === 0) return;
    setInvoices(prev => recalculateChainForCard(prev.map(inv => inv.cardId !== foundInvoice!.cardId ? inv : ({
      ...inv,
      transactions: inv.transactions.filter(t => !idsToRemove.has(t.id))
    })), foundInvoice!.cardId));
    setTransactions(prev => prev.filter(t => !idsToRemove.has(t.id)));
    idsToRemove.forEach(txId => {
      void deletarTransacaoService(txId).catch(error => {
        console.error(`Erro ao deletar transacao ${txId} durante estorno em grupo:`, error);
      });
    });
  };
  
  const allAccounts = useMemo(() => [...bankAccounts, ...cards], [bankAccounts, cards]);

  // --- BACKGROUND JOBS: recurrences and notifications ---
  React.useEffect(() => {
    const today = new Date();
    const ym = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`;

    // Process recurrences (credit only)
    setRecurrences(prev => {
      const updated = prev.map(rec => {
        if (!rec.active) return rec;
        const start = new Date(rec.startDate);
        const end = rec.endDate ? new Date(rec.endDate) : null;
        const within = start <= today && (!end || today <= end);
        const shouldRun = within && today.getDate() === rec.dayOfMonth && rec.lastRunMonth !== ym;
        if (shouldRun) {
          const card = cards.find(c => c.id === rec.cardId);
          if (card) {
            addCreditPurchaseToInvoices({
              invoices,
              setInvoices,
              card,
              baseTransaction: {
                description: `${rec.description} (recorrente)`,
                amount: rec.amount,
                category: rec.category,
                date: today.toISOString(),
                type: TransactionType.Expense,
                paymentMethod: 'credit' as any,
                sourceId: card.id,
                isInstallment: false,
              },
            });
          }
          return { ...rec, lastRunMonth: ym };
        }
        return rec;
      });
      return updated;
    });

    // Notifications
    setNotifications(prev => {
      const out = [...prev];
      const in3 = new Date(today); in3.setDate(in3.getDate()+3);
      invoices.forEach(inv => {
        if (inv.status === InvoiceStatus.Paid) return;
        const due = new Date(inv.dueDate);
        if (due >= today && due <= in3) {
          out.push({ id: `n${Date.now()}_${inv.id}_due`, type: 'due-soon', title: 'Fatura vencendo em breve', message: `Fatura ${inv.month}/${inv.year} vence em ${formatDate(inv.dueDate)}`, dateISO: today.toISOString(), read: false, invoiceId: inv.id, cardId: inv.cardId });
        }
        if (due < today && (inv.status === InvoiceStatus.Overdue)) {
          out.push({ id: `n${Date.now()}_${inv.id}_ovd`, type: 'overdue', title: 'Fatura em atraso', message: `Fatura ${inv.month}/${inv.year} está em atraso`, dateISO: today.toISOString(), read: false, invoiceId: inv.id, cardId: inv.cardId });
        }
      });
      return out;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- PAGE RENDERING ---
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage 
                  summary={dashboardSummary} 
                  cards={enhancedCards} 
                  transactions={transactions} 
                  onAddTransaction={handleAddTransaction}
                  onUpdateTransaction={handleUpdateTransaction}
                  onNavigate={setCurrentPage}
                  onShowInvoicesModal={handleShowInvoicesModal}
                  invoices={invoices}
                  onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
                  cardSettings={cardSettings}
                  onUpdateCardSettings={handleUpdateCardSettings}
                  accounts={allAccounts}
                  onAddCard={handleAddCard}
                  onUpdateCard={handleUpdateCard}
                  payments={invoicePayments}
                  onRegisterInvoicePayment={handleRegisterInvoicePayment}
                  onRefundInvoiceTransaction={handleRefundInvoiceTransaction}
                  onRefundInstallmentGroup={handleRefundInstallmentGroup}
                />;
      case 'credit-cards':
        return <CreditCardsPage 
                    cards={enhancedCards} 
                    invoices={invoices} 
                    onAddCard={handleAddCard} 
                    onUpdateInvoiceStatus={handleUpdateInvoiceStatus} 
                    cardSettings={cardSettings}
                    onUpdateCardSettings={handleUpdateCardSettings}
                    onUpdateCard={handleUpdateCard}
                    payments={invoicePayments}
                    onRegisterInvoicePayment={handleRegisterInvoicePayment}
                    onRefundInvoiceTransaction={handleRefundInvoiceTransaction}
                    onRefundInstallmentGroup={handleRefundInstallmentGroup}
                    onNavigate={setCurrentPage}
                    onShowInvoicesModal={handleShowInvoicesModal}
                />;
      case 'cards-dashboard':
        return <CardsDashboardPage
                  cards={enhancedCards}
                  invoices={invoices}
                  transactions={transactions}
                  summary={dashboardSummary}
                  onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
                  onRegisterInvoicePayment={handleRegisterInvoicePayment}
                  onNavigate={setCurrentPage}
                  onShowInvoicesModal={handleShowInvoicesModal}
                  cardSettings={cardSettings}
                  onUpdateCardSettings={handleUpdateCardSettings}
                  onAddCard={handleAddCard}
                  onUpdateCard={handleUpdateCard}
                  payments={invoicePayments}
                  onRefundInvoiceTransaction={handleRefundInvoiceTransaction}
                  onRefundInstallmentGroup={handleRefundInstallmentGroup}
                  accounts={allAccounts}
                  onAddTransaction={handleAddTransaction}
                  onUpdateTransaction={handleUpdateTransaction}
                />;
      case 'bank-accounts':
        return <BankAccountsPage accounts={bankAccounts} onAddAccount={handleAddBankAccount} />;
      case 'transactions':
        return <TransactionsPage 
                  transactions={transactions} 
                  onAddTransaction={handleAddTransaction} 
                  onUpdateTransaction={handleUpdateTransaction}
                  accounts={allAccounts}
                />;
      case 'invoices':
        return <InvoicesPage
                  cards={cards}
                  invoices={invoices}
                  payments={invoicePayments}
                  onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
                  onRegisterInvoicePayment={handleRegisterInvoicePayment}
                  onRefundTransaction={handleRefundInvoiceTransaction}
                  onRefundGroup={handleRefundInstallmentGroup}
                />;
      case 'reports':
        return <ReportsPage transactions={transactions} />;
      case 'budgets':
        return <BudgetsPage budgets={budgets} transactions={transactions} onAddBudget={handleAddBudget} />;
      case 'profile':
        return <ProfilePage user={user} onUpdateUser={handleUpdateUser} />;
      case 'settings':
        return <SettingsPage 
          cards={cards}
          notifications={notifications}
          recurrences={recurrences}
          onAddRecurrence={handleAddRecurrence}
          onToggleRecurrence={handleToggleRecurrence}
          onDeleteRecurrence={handleDeleteRecurrence}
          onMarkNotificationRead={handleMarkNotificationRead}
          onClearNotifications={handleClearNotifications}
        />;
      default:
        return <DashboardPage 
                  summary={dashboardSummary} 
                  cards={enhancedCards} 
                  transactions={transactions} 
                  onAddTransaction={handleAddTransaction}
                  onUpdateTransaction={handleUpdateTransaction}
                  onNavigate={setCurrentPage}
                  onShowInvoicesModal={handleShowInvoicesModal}
                  invoices={invoices}
                  onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
                  cardSettings={cardSettings}
                  onUpdateCardSettings={handleUpdateCardSettings}
                  accounts={allAccounts}
                  onAddCard={handleAddCard}
                  onUpdateCard={handleUpdateCard}
                />;
    }
  };

  const themeValue = { theme, setTheme };
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    document.body.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  // Recurrences/Notifications handlers
  const handleAddRecurrence = (input: { description: string; amount: number; category: any; cardId: string; dayOfMonth: number; startDate?: string; endDate?: string; }) => {
    const rec: RecurringTransaction = {
      id: `rec${Date.now()}`,
      description: input.description,
      amount: input.amount,
      category: input.category,
      cardId: input.cardId,
      dayOfMonth: input.dayOfMonth,
      active: true,
      startDate: input.startDate || new Date().toISOString(),
      endDate: input.endDate,
    };
    setRecurrences(prev => [rec, ...prev]);
  };

  const handleToggleRecurrence = (id: string, active: boolean) => {
    setRecurrences(prev => prev.map(r => r.id === id ? { ...r, active } : r));
  };

  const handleDeleteRecurrence = (id: string) => {
    setRecurrences(prev => prev.filter(r => r.id !== id));
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };
  const handleShowInvoicesModal = () => setIsInvoicesModalOpen(true);
  const handleCloseInvoicesModal = () => setIsInvoicesModalOpen(false);

  return (
    <ThemeContext.Provider value={themeValue}>
      <div className={`flex h-screen font-sans ${theme === 'dark' ? 'dark' : ''}`}>
        <Sidebar 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage} 
            user={user} 
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            overdueCount={invoices.filter(inv => inv.status === InvoiceStatus.Overdue).length}
        />
        <MainContent onMenuClick={() => setIsSidebarOpen(true)}>
          {renderPage()}
        </MainContent>
        <InvoicesModal
          isOpen={isInvoicesModalOpen}
          onClose={handleCloseInvoicesModal}
          cards={cards}
          invoices={invoices}
          payments={invoicePayments}
          onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
          onRegisterInvoicePayment={handleRegisterInvoicePayment}
          onRefundTransaction={handleRefundInvoiceTransaction}
          onRefundGroup={handleRefundInstallmentGroup}
        />
      </div>
    </ThemeContext.Provider>
  );
};

export default App;
