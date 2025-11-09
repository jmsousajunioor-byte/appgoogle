import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { NewTransaction, Category, TransactionType, PaymentMethod, BankAccount, Card } from '../../types';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (newTx: NewTransaction) => void;
  accounts: (BankAccount | Card)[];
}

const TransactionFormModal: React.FC<TransactionFormModalProps> = ({ isOpen, onClose, onAddTransaction, accounts }) => {
  const [type, setType] = useState<TransactionType>(TransactionType.Expense);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const newTx: NewTransaction = {
      description: data.description as string,
      amount: parseFloat(data.amount as string),
      category: data.category as Category,
      date: data.date as string,
      type: data.type as TransactionType,
      paymentMethod: data.paymentMethod as PaymentMethod,
      sourceId: data.sourceId as string,
    };
    onAddTransaction(newTx);
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Nova Transação">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select 
            label="Tipo" 
            name="type" 
            required
            value={type}
            onChange={(e) => setType(e.target.value as TransactionType)}
        >
          <option value={TransactionType.Expense}>Despesa</option>
          <option value={TransactionType.Income}>Receita</option>
          <option value={TransactionType.Transfer}>Transferência</option>
        </Select>

        <Input label="Descrição" name="description" type="text" placeholder="Ex: Salário, Aluguel" required />
        <Input label="Valor" name="amount" type="number" step="0.01" placeholder="0,00" required />
        
        <Select label="Categoria" name="category" required>
          {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </Select>
        
        <Select label="Método de Pagamento" name="paymentMethod" required>
            {Object.values(PaymentMethod).map(pm => <option key={pm} value={pm}>{pm}</option>)}
        </Select>

        <Select label="Fonte/Conta" name="sourceId" required>
            {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                    {'nickname' in acc ? acc.nickname : acc.bankName}
                </option>
            ))}
        </Select>

        <Input label="Data" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Salvar Transação</Button>
        </div>
      </form>
    </Modal>
  );
};

export default TransactionFormModal;