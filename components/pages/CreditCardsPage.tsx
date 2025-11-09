import React, { useState } from 'react';
import { Card, Invoice, InvoiceStatus, NewCard } from '../../types';
import CardGrid from '../cards/CardGrid';
import CardDetailModal from '../cards/CardDetailModal';
import Button from '../ui/Button';
import AddCardModal from '../cards/AddCardModal';

interface CreditCardsPageProps {
  cards: (Card & { availableLimit: number, currentInvoiceAmount: number, dueDate: string, invoiceStatus: InvoiceStatus })[];
  invoices: Invoice[];
  onAddCard: (newCard: NewCard) => void;
  onUpdateInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;
}

// FIX: Create a type for the enhanced card object to ensure type safety.
type EnhancedCard = Card & { availableLimit: number, currentInvoiceAmount: number, dueDate: string, invoiceStatus: InvoiceStatus };

const CreditCardsPage: React.FC<CreditCardsPageProps> = ({ cards, invoices, onAddCard, onUpdateInvoiceStatus }) => {
  // FIX: Use the EnhancedCard type for the selected card state.
  const [selectedCard, setSelectedCard] = useState<EnhancedCard | null>(null);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);

  // FIX: Update the handler to accept the EnhancedCard type.
  const handleCardClick = (card: EnhancedCard) => {
    setSelectedCard(card);
  };

  const handleCloseModal = () => {
    setSelectedCard(null);
  };

  const handleAddCard = (newCard: NewCard) => {
    onAddCard(newCard);
    setIsAddCardModalOpen(false);
  }

  const cardInvoices = selectedCard ? invoices.filter(inv => inv.cardId === selectedCard.id) : [];

  return (
    <div className="p-8 space-y-8 min-h-screen">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-heading text-neutral-800 dark:text-neutral-100">Cartões de Crédito</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Gerencie seus cartões de crédito e faturas.</p>
        </div>
        <Button leftIcon="plus" onClick={() => setIsAddCardModalOpen(true)}>Adicionar Cartão</Button>
      </header>

      <CardGrid cards={cards} onCardClick={handleCardClick} />

      {selectedCard && (
        <CardDetailModal 
          isOpen={!!selectedCard}
          onClose={handleCloseModal}
          card={selectedCard}
          invoices={cardInvoices}
          onUpdateInvoiceStatus={onUpdateInvoiceStatus}
        />
      )}

      <AddCardModal 
        isOpen={isAddCardModalOpen} 
        onClose={() => setIsAddCardModalOpen(false)}
        onAddCard={handleAddCard}
      />
    </div>
  );
};

export default CreditCardsPage;