import React from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { CardBrand, NewCard } from '../../types';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCard: (newCard: NewCard) => void;
}

const AddCardModal: React.FC<AddCardModalProps> = ({ isOpen, onClose, onAddCard }) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const newCard: NewCard = {
      nickname: data.nickname as string,
      brand: data.brand as CardBrand,
      last4: data.last4 as string,
      holderName: data.holderName as string,
      expiration: data.expiration as string,
      limit: parseFloat(data.limit as string),
      dueDateDay: parseInt(data.dueDateDay as string, 10),
    };

    onAddCard(newCard);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Novo Cartão">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Apelido do Cartão" name="nickname" type="text" placeholder="Ex: Cartão Nubank" required />
        <Input label="4 Últimos Dígitos" name="last4" type="text" maxLength={4} placeholder="1234" required />
        <Select label="Bandeira" name="brand" required>
          {Object.values(CardBrand).map(brand => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </Select>
        <Input label="Nome no Cartão" name="holderName" type="text" placeholder="JOAO DA SILVA" required />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Validade (MM/AA)" name="expiration" type="text" placeholder="12/28" required />
          <Input label="Dia de Vencimento" name="dueDateDay" type="number" min="1" max="31" placeholder="10" required />
        </div>
        <Input label="Limite de Crédito" name="limit" type="number" step="0.01" placeholder="5000,00" required />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Adicionar Cartão</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddCardModal;