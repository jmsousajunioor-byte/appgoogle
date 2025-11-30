import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import MainContent from './components/layout/MainContent';
import { Page, Card as CardType, Invoice, BankAccount, Transaction, User, Budget, Goal, NewCard, NewBankAccount, NewTransaction, InvoiceStatus, TransactionType, Theme, NewBudget, NewGoal, InvoicePaymentRecord, NotificationItem, RecurringTransaction, TransactionSummary } from './types';
import DashboardPage from './components/pages/DashboardPage';
import CreditCardsPage from './components/pages/CreditCardsPage';
import BankAccountsPage from './components/pages/BankAccountsPage';
import TransactionsPage from './components/pages/TransactionsPage';
import ReportsPage from './components/pages/ReportsPage';
import BudgetsPage from './components/pages/BudgetsPage';
import ProfilePage from './components/pages/ProfilePage';
import CardsDashboardPage from './components/pages/CardsDashboardPage';
import SettingsPage from './components/pages/SettingsPage';
import LoginPage from '@/pages/Login';
import NewLoginPage from '@/pages/NewLogin';
import RegisterPage from '@/pages/Register';
import ForgotPasswordPage from '@/pages/ForgotPassword';
import ResetPasswordPage from '@/pages/ResetPassword';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/ui/toast';
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
  criarUsuario,
} from './src/services/usuariosService';
import {
  mapCardFromSupabase,
  mapTransactionFromSupabase,
  mapUserFromSupabase,
  mapInvoiceFromSupabase,
} from './src/services/mappers';
import { listarFaturasPorCartoes } from './src/services/faturasService';
import { getTransactionSummaries, getTransactionDetails } from './src/services/cardTransactionsService';

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

const AppContainer: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = window.localStorage.getItem('theme') as Theme | null;
    return stored === 'dark' ? 'dark' : 'light';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const {
    user: authUser,
    isAuthenticated,
    loading: authLoading,
    logout,
    recoveryMode,
    enterRecoveryMode,
    clearRecoveryMode,
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [user, setUser] = useState<User | null>(null);
  const [cards, setCards] = useState<CardType[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [transactionSummaries, setTransactionSummaries] = useState<TransactionSummary[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [cardSettings, setCardSettings] = useState<Record<string, { alertThreshold: number }>>({});
  const [invoicePayments, setInvoicePayments] = useState<InvoicePaymentRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [recurrences, setRecurrences] = useState<RecurringTransaction[]>([]);
  const [isInvoicesModalOpen, setIsInvoicesModalOpen] = useState(false);

  const authRoutes = ['/login', '/register', '/forgot-password'];
  const isResetPasswordRoute = location.pathname.startsWith('/reset-password');
  const handledRecoveryRedirect = useRef(false);
  const hasRecoveryParams = useMemo(() => {
    const searchParams = new URLSearchParams(location.search.replace(/^\?/, ''));
    const hashParams = new URLSearchParams(location.hash.replace(/^#/, ''));
    const typeRecovery = searchParams.get('type') === 'recovery' || hashParams.get('type') === 'recovery';
    const hasToken =
      searchParams.has('token') ||
      searchParams.has('code') ||
      searchParams.has('access_token') ||
      hashParams.has('token') ||
      hashParams.has('code') ||
      hashParams.has('access_token');
    return typeRecovery || hasToken;
  }, [location.search, location.hash]);
  // RESUMO DO BUG ORIGINAL DO RESET DE SENHA
  // Antes: ao clicar no link do email, o Supabase criava uma sessao (event PASSWORD_RECOVERY/SIGNED_IN)
  // antes de o roteamento ver os tokens. Como nao havia flag de recuperacao aqui, o App entendia apenas
  // "usuario autenticado" e jogava direto para a area logada (/dashboard), pulando o formulario de reset.
  // Agora: sempre que ha tokens de recovery ou evento de PASSWORD_RECOVERY, marcamos recoveryMode e forçamos
  // a renderizacao da rota /reset-password ate o fluxo terminar.
  const shouldRenderResetPassword = isResetPasswordRoute || hasRecoveryParams || recoveryMode;

  useEffect(() => {
    if (hasRecoveryParams && !recoveryMode) {
      enterRecoveryMode();
    }
  }, [enterRecoveryMode, hasRecoveryParams, recoveryMode]);

  useEffect(() => {
    if (isAuthenticated && authRoutes.includes(location.pathname)) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  useEffect(() => {
    if (handledRecoveryRedirect.current) return;
    const wantsRecoveryPage = hasRecoveryParams || recoveryMode;
    if (wantsRecoveryPage && !isResetPasswordRoute) {
      handledRecoveryRedirect.current = true;
      const suffix = hasRecoveryParams ? `${location.search}${location.hash}` : '';
      navigate(`/reset-password${suffix}`, { replace: true });
    }
  }, [
    hasRecoveryParams,
    recoveryMode,
    isResetPasswordRoute,
    location.search,
    location.hash,
    navigate,
  ]);

  const loadInitialData = useCallback(async () => {
    if (!isAuthenticated || !authUser?.id) {
      setIsBootstrapping(false);
      return;
    }

    try {
      const [remoteCards, remoteTransactions, remoteUser, remoteSummaries] = await Promise.all([
        listarCartoes(authUser.id),
        listarTransacoes({ userId: authUser.id }),
        buscarUsuarioPorId(authUser.id).catch(() => null),
        getTransactionSummaries(authUser.id).catch(() => []),
      ]);

      // Se houver usuário remoto no banco, usar os dados dele
      if (remoteUser) {
        setUser(mapUserFromSupabase(remoteUser));
      } else {
        // Se não houver perfil no banco, criar um perfil padrão com avatar gerado
        // Isso evita crashes ao tentar acessar user.avatarUrl antes do perfil ser criado
        const defaultUser: User = {
          id: authUser.id,
          email: authUser.email,
          name: authUser.fullName,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.fullName)}&background=6366f1&color=fff`,
          membership: 'Free',
        };
        setUser(defaultUser);

        // Criar perfil no banco de dados para próximas sessões
        // Isso garante que o usuário terá um perfil persistente
        void criarUsuario({
          id: authUser.id,
          name: authUser.fullName,
          email: authUser.email,
          avatarUrl: defaultUser.avatarUrl,
          membership: 'Free',
        }).catch(err => console.error('Erro ao criar perfil automaticamente:', err));
      }

      let mappedCards: CardType[] = [];
      if (remoteCards && remoteCards.length) {
        mappedCards = remoteCards.map(mapCardFromSupabase);
        setCards(mappedCards);
      } else {
        const cached = typeof window !== 'undefined' ? window.localStorage.getItem('cards') : null;
        if (cached) {
          try {
            const parsed = JSON.parse(cached) as CardType[];
            mappedCards = parsed;
            setCards(parsed);
          } catch {
            setCards([]);
          }
        } else {
          setCards([]);
        }
      }

      const cardIds = mappedCards.map(card => card.id);
      if (cardIds.length) {
        try {
          const remoteInvoices = await listarFaturasPorCartoes(cardIds);
          if (remoteInvoices?.length) {
            setInvoices(remoteInvoices.map(mapInvoiceFromSupabase));
          } else {
            setInvoices([]);
          }
        } catch (invoiceError) {
          console.error('Erro ao listar faturas:', invoiceError);
        }
      } else {
        setInvoices([]);
      }

      if (remoteTransactions && remoteTransactions.length) {
        setTransactions(remoteTransactions.map(mapTransactionFromSupabase));
      } else {
        setTransactions([]); // Clear mock data
      }

      if (remoteSummaries && remoteSummaries.length) {
        setTransactionSummaries(remoteSummaries);
      } else {
        setTransactionSummaries([]);
      }

      // Clear other mock data that isn't persisted yet to avoid confusion
      setBankAccounts([]);
      setBudgets([]);
      setGoals([]);

    } catch (error) {
      console.error('Erro ao carregar dados do Supabase:', error);
    } finally {
      setIsBootstrapping(false);
    }
  }, [isAuthenticated, authUser?.id]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);


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
    if (!authUser?.id) return;
    (async () => {
      try {
        const created = await criarCartaoService({
          ...newCard,
          user_id: authUser.id,
        });
        if (created) {
          setCards(prev => {
            const next = [...prev, created as CardType];
            if (typeof window !== 'undefined') window.localStorage.setItem('cards', JSON.stringify(next));
            return next;
          });
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
      setCards(prev => {
        const next = [...prev, fallback];
        if (typeof window !== 'undefined') window.localStorage.setItem('cards', JSON.stringify(next));
        return next;
      });
    })();
  };

  const handleUpdateCard = (updated: CardType) => {
    setCards(prev => {
      const next = prev.map(c => (c.id === updated.id ? { ...updated } : c));
      if (typeof window !== 'undefined') window.localStorage.setItem('cards', JSON.stringify(next));
      return next;
    });
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
    if (!txs.length || !authUser?.id) return;
    void Promise.all(
      txs.map(tx =>
        criarTransacaoService({
          ...toNewTransactionPayload(tx),
          user_id: authUser.id,
        }),
      ),
    ).catch(error => console.error('Erro ao persistir transacoes:', error));
  };

  const handleAddTransaction = async (newTx: NewTransaction) => {
    if (!authUser?.id) return;

    try {
      // 1. Handle Credit Card Transactions (Installment or Single)
      const isCredit = newTx.paymentMethod === 'credit';
      const isCardSource = typeof newTx.sourceId === 'string' && newTx.sourceId.startsWith('c'); // Assuming card IDs start with 'c' or are UUIDs

      if (isCredit && newTx.sourceId) {
        const card = cards.find(c => c.id === newTx.sourceId);
        if (card) {
          // Use the new service for card transactions (supports aggregation)
          const { createCardTransaction } = await import('./src/services/cardTransactionsService');

          const result = await createCardTransaction(
            authUser.id,
            card.id,
            {
              description: newTx.description,
              totalAmount: newTx.amount,
              installmentCount: newTx.isInstallment && newTx.installment ? newTx.installment.total : 1,
              purchaseDate: newTx.date,
              category: newTx.category,
              cardId: card.id, // Added required field
            },
            card
          );

          if (result) {
            // Refresh data to ensure consistency
            // In a real app, we might want to optimistically update, but for correctness with invoices, fetching is safer
            const { listarTransacoes } = await import('./src/services/transacoesService');
            const { listarFaturasPorCartoes } = await import('./src/services/faturasService');
            const { mapTransactionFromSupabase, mapInvoiceFromSupabase } = await import('./src/services/mappers');

            const [remoteTransactions, remoteInvoices] = await Promise.all([
              listarTransacoes({ userId: authUser.id }),
              listarFaturasPorCartoes(cards.map(c => c.id))
            ]);

            if (remoteTransactions) setTransactions(remoteTransactions.map(mapTransactionFromSupabase));
            if (remoteInvoices) setInvoices(remoteInvoices.map(mapInvoiceFromSupabase));
          }
          return;
        }
      }

      // 2. Handle Bank Account / Cash Transactions
      const { criarTransacao } = await import('./src/services/transacoesService');
      const created = await criarTransacao({
        ...toNewTransactionPayload(newTx),
        user_id: authUser.id,
      });

      if (created) {
        setTransactions(prev => [created, ...prev]);

        // Update bank account balance
        setBankAccounts(prev => prev.map(acc => {
          if (acc.id === newTx.sourceId) {
            const newBalance = newTx.type === TransactionType.Income
              ? acc.balance + newTx.amount
              : acc.balance - newTx.amount;
            return { ...acc, balance: newBalance };
          }
          return acc;
        }));
      }

    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      // TODO: Show toast error
    }
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
    if (!authUser?.id) return;
    setUser(updatedUser);
    void atualizarUsuarioService(authUser.id, updatedUser).catch(error => {
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
  // --- BACKGROUND JOBS: recurrences and notifications ---
  useEffect(() => {
    if (!authUser?.id) return;

    const runRecurrences = async () => {
      try {
        const { processRecurringTransactions } = await import('./src/services/recurringTransactionsService');
        const generated = await processRecurringTransactions(authUser.id);
        if (generated && generated.length > 0) {
          await loadInitialData();
        }
      } catch (err) {
        console.error('Error processing recurrences:', err);
      }
    };
    runRecurrences();

    // Notifications
    const today = new Date();
    setNotifications(prev => {
      const out = [...prev];
      const in3 = new Date(today); in3.setDate(in3.getDate() + 3);

      invoices.forEach(inv => {
        if (inv.status === InvoiceStatus.Paid) return;
        const due = new Date(inv.dueDate);

        const dueId = `n${inv.id}_due`;
        if (due >= today && due <= in3) {
          if (!out.find(n => n.id.includes(inv.id) && n.type === 'due-soon')) {
            out.push({ id: dueId, type: 'due-soon', title: 'Fatura vencendo em breve', message: `Fatura ${inv.month}/${inv.year} vence em ${formatDate(inv.dueDate)}`, dateISO: today.toISOString(), read: false, invoiceId: inv.id, cardId: inv.cardId });
          }
        }

        const ovdId = `n${inv.id}_ovd`;
        if (due < today && (inv.status === InvoiceStatus.Overdue)) {
          if (!out.find(n => n.id.includes(inv.id) && n.type === 'overdue')) {
            out.push({ id: ovdId, type: 'overdue', title: 'Fatura em atraso', message: `Fatura ${inv.month}/${inv.year} está em atraso`, dateISO: today.toISOString(), read: false, invoiceId: inv.id, cardId: inv.cardId });
          }
        }
      });
      return out;
    });
  }, [authUser, invoices]);

  // Recurrences/Notifications handlers
  const handleAddRecurrence = (input: { description: string; amount: number; category: any; cardId: string; dayOfMonth: number; startDate?: string; endDate?: string; frequency: 'weekly' | 'monthly' | 'yearly' }) => {
    const rec: RecurringTransaction = {
      id: `rec${Date.now()}`,
      description: input.description,
      amount: input.amount,
      category: input.category,
      cardId: input.cardId,
      dayOfPeriod: input.dayOfMonth, // Input still uses dayOfMonth from form, mapping to dayOfPeriod
      frequency: input.frequency,
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

  const handleLogout = async () => {
    try {
      await logout();
      clearRecoveryMode();
    } finally {
      setIsSidebarOpen(false);
      setCurrentPage('dashboard');
      setIsBootstrapping(false);
      navigate('/login', { replace: true });
    }
  };
  const handleShowInvoicesModal = () => setIsInvoicesModalOpen(true);
  const handleCloseInvoicesModal = () => setIsInvoicesModalOpen(false);

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
          summaries={transactionSummaries}
          onAddTransaction={handleAddTransaction}
          onUpdateTransaction={handleUpdateTransaction}
          accounts={allAccounts}
          useAggregatedView={true}
          onViewDetails={async (id) => {
            const details = await getTransactionDetails(id);
            return details;
          }}
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


  const renderLoadingState = (message: string) => (
    <div className={`${theme === 'dark' ? 'dark bg-neutral-900 text-neutral-200' : 'bg-neutral-50 text-neutral-600'} min-h-screen flex items-center justify-center`}>
      <div className="text-center space-y-4">
        <div className="mx-auto h-12 w-12 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );

  let content: React.ReactNode;
  if (shouldRenderResetPassword) {
    content = (
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/reset-password" replace />} />
      </Routes>
    );
  } else if (authLoading) {
    content = renderLoadingState('Verificando sua sessao...');
  } else if (!isAuthenticated) {
    content = (
      <Routes>
        <Route path="/login" element={<NewLoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  } else if (isBootstrapping) {
    content = renderLoadingState('Carregando seus dados...');
  } else {
    content = (
      <div className={`flex h-screen font-sans ${theme === 'dark' ? 'dark' : ''}`}>
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          user={user}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          overdueCount={invoices.filter(inv => inv.status === InvoiceStatus.Overdue).length}
          onLogout={() => { void handleLogout(); }}
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
    );
  }

  return (
    <ThemeContext.Provider value={themeValue}>
      {content}
    </ThemeContext.Provider>
  );
};

const App: React.FC = () => (
  <ToastProvider>
    <AuthProvider>
      <AppContainer />
    </AuthProvider>
  </ToastProvider>
);

export default App;
