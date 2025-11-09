import React, { useState, useMemo } from 'react';
import { Budget, Transaction, Category, TransactionType, NewBudget } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import { formatCurrency } from '../../utils/formatters';
import { Icon } from '../ui/Icon';
import Modal from '../ui/Modal';
import Select from '../ui/Select';
import Input from '../ui/Input';

interface BudgetsPageProps {
  budgets: Budget[];
  transactions: Transaction[];
  onAddBudget: (newBudget: NewBudget) => void;
}

const AddBudgetModal: React.FC<{ isOpen: boolean, onClose: () => void, onAddBudget: (budget: NewBudget) => void }> = ({ isOpen, onClose, onAddBudget }) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        const newBudget: NewBudget = {
            category: data.category as Category,
            amount: parseFloat(data.amount as string),
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
        };
        onAddBudget(newBudget);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Criar Novo Orçamento">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Select label="Categoria" name="category" required>
                    {Object.values(Category).filter(c => c !== Category.Salary && c !== Category.Freelance && c !== Category.Investment).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </Select>
                <Input label="Valor do Orçamento" name="amount" type="number" step="0.01" placeholder="500,00" required />
                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit">Criar Orçamento</Button>
                </div>
            </form>
        </Modal>
    );
};

const BudgetCard: React.FC<{ budget: Budget; spent: number }> = ({ budget, spent }) => {
  const progress = (spent / budget.amount) * 100;
  const remaining = budget.amount - spent;
  return (
    <Card>
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-bold text-lg">{budget.category}</h4>
        <p className="font-mono text-sm text-neutral-500">{formatCurrency(spent)} / {formatCurrency(budget.amount)}</p>
      </div>
      <ProgressBar value={progress} />
      <div className="flex justify-between items-center mt-2 text-sm">
        <p className="text-neutral-500">Restante</p>
        <p className={`font-bold ${remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(remaining)}</p>
      </div>
    </Card>
  );
};


const BudgetsPage: React.FC<BudgetsPageProps> = ({ budgets, transactions, onAddBudget }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentMonthTransactions = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear && t.type === TransactionType.Expense;
    });
  }, [transactions]);
  
  const budgetWithSpending = useMemo(() => {
    return budgets.map(budget => {
        const spent = currentMonthTransactions
            .filter(t => t.category === budget.category)
            .reduce((sum, t) => sum + t.amount, 0);
        return { ...budget, spent };
    });
  }, [budgets, currentMonthTransactions]);

  return (
    <div className="p-8 space-y-8 min-h-screen">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-heading text-neutral-800 dark:text-neutral-100">Orçamentos e Metas</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Crie orçamentos para controlar seus gastos.</p>
        </div>
        <Button leftIcon="plus" onClick={() => setIsModalOpen(true)}>Criar Orçamento</Button>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgetWithSpending.map(b => (
            <BudgetCard key={b.id} budget={b} spent={b.spent} />
        ))}
         {budgets.length === 0 && (
            <div className="col-span-full text-center py-16">
                <Icon icon="budget" className="h-16 w-16 text-neutral-300 dark:text-neutral-600 mx-auto" />
                <p className="mt-4 text-neutral-500">Você ainda não tem orçamentos. Crie um para começar!</p>
            </div>
        )}
      </div>

      <AddBudgetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddBudget={onAddBudget} />
    </div>
  );
};

export default BudgetsPage;
