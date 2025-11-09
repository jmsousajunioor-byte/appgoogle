import React, { useState, useMemo } from 'react';
import Sidebar from './components/layout/Sidebar';
import MainContent from './components/layout/MainContent';
import { Page, Card as CardType, Invoice, BankAccount, Transaction, User, Budget, Goal, NewCard, NewBankAccount, NewTransaction, InvoiceStatus, TransactionType, Theme, NewBudget, NewGoal } from './types';
import DashboardPage from './components/pages/DashboardPage';
import CreditCardsPage from './components/pages/CreditCardsPage';
import BankAccountsPage from './components/pages/BankAccountsPage';
import TransactionsPage from './components/pages/TransactionsPage';
import ReportsPage from './components/pages/ReportsPage';
import BudgetsPage from './components/pages/BudgetsPage';
import ProfilePage from './components/pages/ProfilePage';
import SettingsPage from './components/pages/SettingsPage';
import { mockCards, mockInvoices, mockBankAccounts, mockTransactions, mockUser, mockBudgets, mockGoals } from './utils/mockData';

export const ThemeContext = React.createContext<{ theme: Theme; setTheme: (theme: Theme) => void }>({
  theme: 'light',
  setTheme: () => {},
});

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [theme, setTheme] = useState<Theme>('light');
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


  // --- DERIVED STATE & MEMOS ---
  const enhancedCards = useMemo(() => {
    return cards.map(card => {
      const cardTransactions = transactions.filter(t => t.sourceId === card.id && t.type === 'expense');
      const currentInvoice = invoices.find(inv => inv.cardId === card.id && inv.status === InvoiceStatus.Pending);
      const currentInvoiceAmount = currentInvoice?.totalAmount || 0;
      const availableLimit = card.limit - currentInvoiceAmount;
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
    const card: CardType = { ...newCard, id: `c${Date.now()}`, gradient: { start: '#4B5563', end: '#1F2937' } };
    setCards(prev => [...prev, card]);
  };

  const handleAddBankAccount = (newAccount: NewBankAccount) => {
    const account: BankAccount = { ...newAccount, id: `b${Date.now()}`, logoUrl: 'https://logodownload.org/wp-content/uploads/2018/05/banco-do-brasil-logo-3.png' };
    setBankAccounts(prev => [...prev, account]);
  };

  const handleAddTransaction = (newTx: NewTransaction) => {
    const tx: Transaction = { ...newTx, id: `t${Date.now()}` };
    setTransactions(prev => [tx, ...prev]);

    // Update account balance
    setBankAccounts(prev => prev.map(acc => {
        if (acc.id === tx.sourceId) {
            const newBalance = tx.type === TransactionType.Income ? acc.balance + tx.amount : acc.balance - tx.amount;
            return { ...acc, balance: newBalance };
        }
        return acc;
    }));
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
  };

  const handleUpdateInvoiceStatus = (invoiceId: string, status: InvoiceStatus) => {
    setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status, paymentDate: status === InvoiceStatus.Paid ? new Date().toISOString() : undefined } : inv));
  };
  
  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
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
  
  const allAccounts = useMemo(() => [...bankAccounts, ...cards], [bankAccounts, cards]);

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
                  invoices={invoices}
                  onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
                  cardSettings={cardSettings}
                  onUpdateCardSettings={handleUpdateCardSettings}
                  accounts={allAccounts}
                  onAddCard={handleAddCard}
                />;
      case 'credit-cards':
        return <CreditCardsPage 
                    cards={enhancedCards} 
                    invoices={invoices} 
                    onAddCard={handleAddCard} 
                    onUpdateInvoiceStatus={handleUpdateInvoiceStatus} 
                    cardSettings={cardSettings}
                    onUpdateCardSettings={handleUpdateCardSettings}
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
      case 'reports':
        return <ReportsPage transactions={transactions} />;
      case 'budgets':
        return <BudgetsPage budgets={budgets} transactions={transactions} onAddBudget={handleAddBudget} />;
      case 'profile':
        return <ProfilePage user={user} onUpdateUser={handleUpdateUser} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage 
                  summary={dashboardSummary} 
                  cards={enhancedCards} 
                  transactions={transactions} 
                  onAddTransaction={handleAddTransaction}
                  onUpdateTransaction={handleUpdateTransaction}
                  onNavigate={setCurrentPage}
                  invoices={invoices}
                  onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
                  cardSettings={cardSettings}
                  onUpdateCardSettings={handleUpdateCardSettings}
                  accounts={allAccounts}
                  onAddCard={handleAddCard}
                />;
    }
  };

  const themeValue = { theme, setTheme };

  return (
    <ThemeContext.Provider value={themeValue}>
      <div className={`flex h-screen font-sans ${theme === 'dark' ? 'dark' : ''}`}>
        <Sidebar 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage} 
            user={user} 
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
        />
        <MainContent onMenuClick={() => setIsSidebarOpen(true)}>
          {renderPage()}
        </MainContent>
      </div>
    </ThemeContext.Provider>
  );
};

export default App;