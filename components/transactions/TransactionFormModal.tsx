import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { NewTransaction, Category, TransactionType, PaymentMethod, BankAccount, Card, Transaction } from '../../types';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewTransaction | Transaction) => void;
  accounts: (BankAccount | Card)[];
  transactionToEdit?: Transaction | null;
}

const TransactionFormModal: React.FC<TransactionFormModalProps> = ({ isOpen, onClose, onSubmit, accounts, transactionToEdit }) => {
  const [type, setType] = useState<TransactionType>(TransactionType.Expense);
  const [isInstallment, setIsInstallment] = useState(false);
  const isEditing = !!transactionToEdit;

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setIsInstallment(transactionToEdit.isInstallment);
    } else {
      // Reset state when modal opens for a new transaction
      setType(TransactionType.Expense);
      setIsInstallment(false);
    }
  }, [transactionToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const txData = {
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
    
    if (isEditing) {
      onSubmit({ ...txData, id: transactionToEdit.id });
    } else {
      onSubmit(txData);
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Editar Transação" : "Adicionar Nova Transação"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select 
            label="Tipo" 
            name="type" 
            required
            value={type}
            onChange={(e) => setType(e.target.value as TransactionType)}
            defaultValue={transactionToEdit?.type}
        >
          <option value={TransactionType.Expense}>Despesa</option>
          <option value={TransactionType.Income}>Receita</option>
          <option value={TransactionType.Transfer}>Transferência</option>
        </Select>

        <Input label="Descrição" name="description" type="text" placeholder="Ex: Salário, Aluguel" required defaultValue={transactionToEdit?.description} />
        <Input label="Valor" name="amount" type="number" step="0.01" placeholder="0,00" required defaultValue={transactionToEdit?.amount} />

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
            <Input label="Parcela Atual" name="installmentCurrent" type="number" min="1" placeholder="1" required defaultValue={transactionToEdit?.installment?.current} />
            <Input label="Total de Parcelas" name="installmentTotal" type="number" min="2" placeholder="12" required defaultValue={transactionToEdit?.installment?.total} />
          </div>
        )}
        
        <Select label="Categoria" name="category" required defaultValue={transactionToEdit?.category}>
          {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </Select>
        
        <Select label="Método de Pagamento" name="paymentMethod" required defaultValue={transactionToEdit?.paymentMethod}>
            {Object.values(PaymentMethod).map(pm => <option key={pm} value={pm}>{pm}</option>)}
        </Select>

        <Select label="Fonte/Conta" name="sourceId" required defaultValue={transactionToEdit?.sourceId}>
            {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                    {'nickname' in acc ? acc.nickname : acc.bankName}
                </option>
            ))}
        </Select>

        <Input label="Data" name="date" type="date" defaultValue={transactionToEdit ? transactionToEdit.date.split('T')[0] : new Date().toISOString().split('T')[0]} required />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{isEditing ? 'Salvar Alterações' : 'Salvar Transação'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default TransactionFormModal;