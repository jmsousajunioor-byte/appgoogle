import React, { useState } from 'react';
import { BankAccount, NewBankAccount } from '../../types';
import BankCard from '../banks/BankCard';
import Button from '../ui/Button';
import AddBankAccountModal from '../banks/AddBankAccountModal';

interface BankAccountsPageProps {
  accounts: BankAccount[];
  onAddAccount: (newAccount: NewBankAccount) => void;
}

const BankAccountsPage: React.FC<BankAccountsPageProps> = ({ accounts, onAddAccount }) => {
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  
  const handleAddAccount = (newAccount: NewBankAccount) => {
    onAddAccount(newAccount);
    setIsAddAccountModalOpen(false);
  }

  return (
    <div className="p-8 space-y-8 min-h-screen">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-heading text-neutral-800 dark:text-neutral-100">Contas Bancárias</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Veja o saldo e as informações de suas contas.</p>
        </div>
        <Button leftIcon="plus" onClick={() => setIsAddAccountModalOpen(true)}>Adicionar Conta</Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {accounts.map(account => (
          <BankCard key={account.id} account={account} />
        ))}
      </div>

      <AddBankAccountModal 
        isOpen={isAddAccountModalOpen} 
        onClose={() => setIsAddAccountModalOpen(false)}
        onAddAccount={handleAddAccount}
      />
    </div>
  );
};

export default BankAccountsPage;