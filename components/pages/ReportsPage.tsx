import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../../types';
import Card from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';
import CategoryChart from '../dashboard/CategoryChart';

interface ReportsPageProps {
  transactions: Transaction[];
}

const ReportsPage: React.FC<ReportsPageProps> = ({ transactions }) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() + 1 === selectedMonth && date.getFullYear() === selectedYear;
    });
  }, [transactions, selectedMonth, selectedYear]);

  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === TransactionType.Income)
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = filteredTransactions
      .filter(t => t.type === TransactionType.Expense)
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expenses, savings: income - expenses };
  }, [filteredTransactions]);

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  return (
    <div className="p-8 space-y-8 min-h-screen">
      <header>
        <h1 className="text-4xl font-heading text-neutral-800 dark:text-neutral-100">Relatórios</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">Analise suas finanças com relatórios detalhados.</p>
      </header>

      <Card>
        <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-bold">Resumo Mensal</h2>
          <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-transparent">
            {monthNames.map((month, i) => <option key={month} value={i + 1}>{month}</option>)}
          </select>
          <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-transparent">
            <option value={2024}>2024</option>
            <option value={2023}>2023</option>
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="!p-4 text-center">
                <p className="text-sm text-neutral-500">Receita Total</p>
                <p className="text-3xl font-mono font-bold text-emerald-600">{formatCurrency(summary.income)}</p>
            </Card>
            <Card className="!p-4 text-center">
                <p className="text-sm text-neutral-500">Despesa Total</p>
                <p className="text-3xl font-mono font-bold text-red-600">{formatCurrency(summary.expenses)}</p>
            </Card>
            <Card className="!p-4 text-center">
                <p className="text-sm text-neutral-500">Saldo Final</p>
                <p className={`text-3xl font-mono font-bold ${summary.savings >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>{formatCurrency(summary.savings)}</p>
            </Card>
        </div>
        
        <CategoryChart transactions={filteredTransactions.filter(t => t.type === TransactionType.Expense)} />
      </Card>
    </div>
  );
};

export default ReportsPage;
