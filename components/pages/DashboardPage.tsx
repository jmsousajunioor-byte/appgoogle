import React, { useState } from 'react';
import SummaryCard from '../dashboard/SummaryCard';
import CategoryChart from '../dashboard/CategoryChart';
import RecentTransactions from '../dashboard/RecentTransactions';
import CardCarousel from '../dashboard/CardCarousel';
import Button from '../ui/Button';
import { Card, NewTransaction, Page, Transaction, TransactionType } from '../../types';
import TransactionFormModal from '../transactions/TransactionFormModal';

interface DashboardPageProps {
    summary: {
        totalBalance: number;
        totalIncome: number;
        totalExpenses: number;
        creditCardDebt: number;
    };
    cards: Card[];
    transactions: Transaction[];
    onAddTransaction: (newTx: NewTransaction) => void;
    onNavigate: (page: Page) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ summary, cards, transactions, onAddTransaction, onNavigate }) => {
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  
  const handleAddTransaction = (newTx: NewTransaction) => {
    onAddTransaction(newTx);
    setIsTxModalOpen(false);
  }

  return (
    <div className="p-8 space-y-8 min-h-screen">
      <header className="flex justify-between items-center">
        <div>
            <h1 className="text-4xl font-heading text-neutral-800 dark:text-neutral-100">Dashboard</h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">Bem-vindo de volta! Aqui está um resumo de suas finanças.</p>
        </div>
        <Button leftIcon="plus" onClick={() => setIsTxModalOpen(true)}>Adicionar Transação</Button>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Saldo Total em Contas"
          amount={summary.totalBalance}
          icon="bank"
          trend="+ R$ 1.200,00"
          trendDirection="up"
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <SummaryCard 
          title="Receitas no Mês"
          amount={summary.totalIncome}
          icon="trending-up"
          trend="+ 5.2%"
          trendDirection="up"
          iconBgColor="bg-emerald-100"
          iconColor="text-emerald-600"
        />
        <SummaryCard 
          title="Despesas no Mês"
          amount={summary.totalExpenses}
          icon="trending-down"
          trend="+ 12.8%"
          trendDirection="down"
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
        />
        <SummaryCard 
          title="Faturas Abertas"
          amount={summary.creditCardDebt}
          icon="credit-card"
          trend="- R$ 350,00"
          trendDirection="down"
          iconBgColor="bg-red-100"
          iconColor="text-red-600"
        />
      </div>

      <div>
        <h2 className="text-2xl font-heading text-neutral-700 dark:text-neutral-200 mb-4">Seus Cartões</h2>
        <CardCarousel cards={cards} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <RecentTransactions transactions={transactions} onNavigate={onNavigate} />
        </div>
        <div className="lg:col-span-2">
          <CategoryChart transactions={transactions.filter(t => t.type === TransactionType.Expense)} />
        </div>
      </div>
      
      <TransactionFormModal 
        isOpen={isTxModalOpen} 
        onClose={() => setIsTxModalOpen(false)}
        onAddTransaction={handleAddTransaction}
        accounts={[]}
      />
    </div>
  );
};

export default DashboardPage;