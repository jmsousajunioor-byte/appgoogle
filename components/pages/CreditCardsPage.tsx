import React, { useState, useEffect, useRef } from 'react';
import { Card, Invoice, InvoiceStatus, NewCard } from '../../types';
import CardGrid from '../cards/CardGrid';
import CardDetailModal from '../cards/CardDetailModal';
import Button from '../ui/Button';
import AddCardModal from '../cards/AddCardModal';
import { daysRemaining } from '../../utils/formatters';
import LimitUtilizationChart from '../cards/LimitUtilizationChart';
// FIX: Corrected import syntax to alias the default export 'Card' component as 'UICard' to avoid name collision with the 'Card' type.
import UICard from '../ui/Card';

// FIX: Create a type for the enhanced card object to ensure type safety.
type EnhancedCard = Card & { availableLimit: number, currentInvoiceAmount: number, dueDate: string, invoiceStatus: InvoiceStatus };

interface CreditCardsPageProps {
  cards: EnhancedCard[];
  invoices: Invoice[];
  onAddCard: (newCard: NewCard) => void;
  onUpdateInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;
  cardSettings: Record<string, { alertThreshold: number }>;
  onUpdateCardSettings: (cardId: string, threshold: number) => void;
}

const CreditCardsPage: React.FC<CreditCardsPageProps> = ({ cards, invoices, onAddCard, onUpdateInvoiceStatus, cardSettings, onUpdateCardSettings }) => {
  // FIX: Use the EnhancedCard type for the selected card state.
  const [selectedCard, setSelectedCard] = useState<EnhancedCard | null>(null);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);

  const alertedInvoices = useRef(new Set<string>());
  const alertedLimits = useRef(new Set<string>());

  useEffect(() => {
    // Due date alerts
    cards.forEach(card => {
      if (card.invoiceStatus === InvoiceStatus.Pending) {
        const remaining = daysRemaining(card.dueDate);
        if (remaining >= 0 && remaining < 5 && !alertedInvoices.current.has(card.id)) {
          console.warn(`ALERTA: A fatura do cartão ${card.nickname} vence em ${remaining} dias!`);
          alertedInvoices.current.add(card.id);
        }
      }
    });

    // Custom limit alerts
    cards.forEach(card => {
        const settings = cardSettings[card.id];
        if (settings) {
            const utilization = (card.currentInvoiceAmount / card.limit) * 100;
            if (utilization >= settings.alertThreshold && !alertedLimits.current.has(card.id)) {
                console.warn(`ALERTA DE LIMITE: Você utilizou ${utilization.toFixed(0)}% do limite do cartão ${card.nickname}, que é maior que o seu alerta de ${settings.alertThreshold}%.`);
                alertedLimits.current.add(card.id);
            } else if (utilization < settings.alertThreshold && alertedLimits.current.has(card.id)) {
                // Reset alert if user goes back under the threshold
                alertedLimits.current.delete(card.id);
            }
        }
    });
  }, [cards, cardSettings]);

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

      <UICard title="Tendência de Uso do Limite (Agregado)">
        <LimitUtilizationChart invoices={invoices} cards={cards} />
      </UICard>

      <CardGrid cards={cards} onCardClick={handleCardClick} />

      {selectedCard && (
        <CardDetailModal 
          isOpen={!!selectedCard}
          onClose={handleCloseModal}
          card={selectedCard}
          invoices={cardInvoices}
          onUpdateInvoiceStatus={onUpdateInvoiceStatus}
          cardSettings={cardSettings}
          onUpdateCardSettings={onUpdateCardSettings}
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