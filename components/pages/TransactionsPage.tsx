import React, { useState, useMemo } from 'react';
import { Transaction, NewTransaction, BankAccount, Card } from '../../types';
import TransactionList from '../transactions/TransactionList';
import Button from '../ui/Button';
import TransactionFormModal from '../transactions/TransactionFormModal';
import { Icon } from '../ui/Icon';

interface TransactionsPageProps {
    transactions: Transaction[];
    onAddTransaction: (newTx: NewTransaction) => void;
    accounts: (BankAccount | Card)[];
}

const TransactionsPage: React.FC<TransactionsPageProps> = ({ transactions, onAddTransaction, accounts }) => {
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleAddTransaction = (newTx: NewTransaction) => {
        onAddTransaction(newTx);
        setIsFormModalOpen(false);
    }
    
    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => 
            tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.amount.toString().includes(searchTerm)
        );
    }, [transactions, searchTerm]);
    
    return (
        <div className="p-8 space-y-8 min-h-screen">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-heading text-neutral-800 dark:text-neutral-100">Transações</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">Acompanhe todas as suas movimentações financeiras.</p>
                </div>
                 <Button leftIcon="plus" onClick={() => setIsFormModalOpen(true)}>Adicionar Transação</Button>
            </header>

            <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-lg">
                <div className="flex items-center space-x-4 mb-6">
                   <div className="relative flex-1">
                     <input 
                        type="text" 
                        placeholder="Pesquisar transação..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-4 pr-10 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-transparent" />
                     <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                       <Icon icon="credit-card" className="h-5 w-5 text-neutral-400" />
                     </div>
                   </div>
                    <Button variant="secondary" leftIcon="chevron-down">Filtros</Button>
                    <Button variant="secondary" leftIcon="chevron-down">Exportar</Button>
                </div>
                <TransactionList transactions={filteredTransactions} accounts={accounts} />
            </div>

            <TransactionFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onAddTransaction={handleAddTransaction}
                accounts={accounts}
            />
        </div>
    );
};

export default TransactionsPage;