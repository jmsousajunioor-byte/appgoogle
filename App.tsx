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

  // --- STATE MANAGEMENT ---
  const [user, setUser] = useState<User>(mockUser);
  const [cards, setCards] = useState<CardType[]>(mockCards);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(mockBankAccounts);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);
  const [goals, setGoals] = useState<Goal[]>(mockGoals);

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
    const card: CardType = { ...newCard, id: `c${Date.now()}` };
    setCards(prev => [...prev, card]);
  };

  const handleAddBankAccount = (newAccount: NewBankAccount) => {
    const account: BankAccount = { ...newAccount, id: `b${Date.now()}`, logoUrl: 'https://logodownload.org/wp-content/uploads/2018/05/banco-do-brasil-logo-3.png' };
    setBankAccounts(prev => [...prev, account]);
  };

  const handleAddTransaction = (newTx: NewTransaction) => {
    const tx: Transaction = { ...newTx, id: `t${Date.now()}`, isInstallment: false };
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

  // --- PAGE RENDERING ---
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage summary={dashboardSummary} cards={enhancedCards} transactions={transactions} onAddTransaction={handleAddTransaction} onNavigate={setCurrentPage} />;
      case 'credit-cards':
        return <CreditCardsPage cards={enhancedCards} invoices={invoices} onAddCard={handleAddCard} onUpdateInvoiceStatus={handleUpdateInvoiceStatus} />;
      case 'bank-accounts':
        return <BankAccountsPage accounts={bankAccounts} onAddAccount={handleAddBankAccount} />;
      case 'transactions':
        return <TransactionsPage transactions={transactions} onAddTransaction={handleAddTransaction} accounts={[...bankAccounts, ...cards]}/>;
      case 'reports':
        return <ReportsPage transactions={transactions} />;
      case 'budgets':
        return <BudgetsPage budgets={budgets} transactions={transactions} onAddBudget={handleAddBudget} />;
      case 'profile':
        return <ProfilePage user={user} onUpdateUser={handleUpdateUser} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage summary={dashboardSummary} cards={enhancedCards} transactions={transactions} onAddTransaction={handleAddTransaction} onNavigate={setCurrentPage} />;
    }
  };

  const themeValue = { theme, setTheme };

  return (
    <ThemeContext.Provider value={themeValue}>
      <div className={`flex h-screen font-sans ${theme === 'dark' ? 'dark' : ''}`}>
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} user={user} />
        <MainContent>
          {renderPage()}
        </MainContent>
      </div>
    </ThemeContext.Provider>
  );
};

export default App;