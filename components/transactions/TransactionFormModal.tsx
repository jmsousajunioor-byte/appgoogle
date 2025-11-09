import React, { useState, useEffect } from 'react';
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
  const [isInstallment, setIsInstallment] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setType(TransactionType.Expense);
      setIsInstallment(false);
    }
  }, [isOpen]);

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
      isInstallment: isInstallment,
      installment: isInstallment
        ? {
            current: parseInt(data.installmentCurrent as string, 10),
            total: parseInt(data.installmentTotal as string, 10),
          }
        : undefined,
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

        <div className="flex items-center space-x-2">
            <input
                type="checkbox"
                id="isInstallment"
                name="isInstallment"
                checked={isInstallment}
                onChange={(e) => setIsInstallment(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isInstallment" className="text-sm text-neutral-700 dark:text-neutral-300">
                É uma compra parcelada?
            </label>
        </div>

        {isInstallment && (
          <div className="grid grid-cols-2 gap-4 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
            <Input label="Parcela Atual" name="installmentCurrent" type="number" min="1" placeholder="1" required />
            <Input label="Total de Parcelas" name="installmentTotal" type="number" min="2" placeholder="12" required />
          </div>
        )}
        
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