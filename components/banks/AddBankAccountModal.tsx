import React from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { NewBankAccount } from '../../types';

interface AddBankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAccount: (newAccount: NewBankAccount) => void;
}

const AddBankAccountModal: React.FC<AddBankAccountModalProps> = ({ isOpen, onClose, onAddAccount }) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const newAccount: NewBankAccount = {
      bankName: data.bankName as string,
      accountType: data.accountType as 'checking' | 'savings',
      branch: data.branch as string,
      accountNumber: data.accountNumber as string,
      balance: parseFloat(data.balance as string),
    };
    onAddAccount(newAccount);
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Conta Bancária">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nome do Banco" name="bankName" type="text" placeholder="Ex: Itaú" required />
        <Select label="Tipo de Conta" name="accountType" required>
          <option value="checking">Conta Corrente</option>
          <option value="savings">Conta Poupança</option>
        </Select>
        <Input label="Agência" name="branch" type="text" placeholder="0001" required />
        <Input label="Número da Conta" name="accountNumber" type="text" placeholder="12345-6" required />
        <Input label="Saldo Inicial" name="balance" type="number" step="0.01" placeholder="1000,00" required />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Adicionar Conta</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddBankAccountModal;