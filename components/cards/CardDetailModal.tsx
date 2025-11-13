import React, { useState } from 'react';
import { Card, Invoice, InvoiceStatus, InvoicePaymentRecord } from '../../types';
import Modal from '../ui/Modal';
import RealisticCard from './RealisticCard';
import OverviewTab from './tabs/OverviewTab';
import InvoicesTab from './tabs/InvoicesTab';
import CardSettingsTab from './tabs/CardSettingsTab';
import FutureInstallmentsTab from './tabs/FutureInstallmentsTab';
import Button from '../ui/Button';
import AddCardModal from './AddCardModal';

// FIX: Update the card prop to be the enhanced card type to match what child components expect.
type EnhancedCard = Card & { availableLimit: number; currentInvoiceAmount: number; dueDate: string; invoiceStatus: InvoiceStatus; };

interface CardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: EnhancedCard;
  invoices: Invoice[];
  onUpdateInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;
  cardSettings: Record<string, { alertThreshold: number }>;
  onUpdateCardSettings: (cardId: string, threshold: number) => void;
  onUpdateCard: (card: Card) => void;
  payments: InvoicePaymentRecord[];
  onRegisterInvoicePayment: (invoiceId: string, amount: number, dateISO?: string) => void;
  onRefundTransaction: (invoiceId: string, txId: string) => void;
  onRefundGroup: (txId: string) => void;
}

type Tab = 'overview' | 'invoices' | 'transactions' | 'settings';

const CardDetailModal: React.FC<CardDetailModalProps> = ({ isOpen, onClose, card, invoices, onUpdateInvoiceStatus, cardSettings, onUpdateCardSettings, onUpdateCard, payments, onRegisterInvoicePayment, onRefundTransaction, onRefundGroup }) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const sortedInvoices = [...invoices].sort(
    (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime(),
  );
  const currentInvoice =
    invoices.find((inv) => inv.status === InvoiceStatus.Pending) ||
    sortedInvoices[0];

  const TabButton: React.FC<{ tab: Tab; label: string }> = ({ tab, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm font-bold w-full text-left rounded-lg transition-colors ${
        activeTab === tab 
          ? 'bg-indigo-600 text-white' 
          : 'text-neutral-500 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" title="Detalhes do Cartão">
      <div className="grid grid-cols-1 md:grid-cols-[320px,1fr] gap-8">
        <div className="space-y-6">
          <RealisticCard card={card} />
          <div className="flex">
            <Button className="w-full" variant="secondary" onClick={() => setIsEditOpen(true)}>Editar Cartão</Button>
          </div>
          <div className="flex flex-col space-y-2 p-4 bg-neutral-100 dark:bg-neutral-900 rounded-2xl">
              <TabButton tab="overview" label="Visão Geral" />
              <TabButton tab="invoices" label="Faturas" />
              <TabButton tab="transactions" label="Lançamentos Futuros" />
              <TabButton tab="settings" label="Configurações" />
          </div>
        </div>
        <div className="h-[550px] overflow-y-auto pr-2 custom-scrollbar">
          {activeTab === 'overview' && (
            <OverviewTab
              card={card}
              invoices={invoices}
              currentInvoice={currentInvoice}
              onUpdateInvoiceStatus={onUpdateInvoiceStatus}
            />
          )}
          {activeTab === 'invoices' && <InvoicesTab invoices={invoices} payments={payments} onRegisterInvoicePayment={onRegisterInvoicePayment} onRefundTransaction={onRefundTransaction} onRefundGroup={onRefundGroup} />}
          {activeTab === 'transactions' && currentInvoice && <FutureInstallmentsTab installments={currentInvoice.installments} />}
          {activeTab === 'settings' && <CardSettingsTab 
              cardId={card.id}
              currentThreshold={cardSettings[card.id]?.alertThreshold}
              onUpdate={onUpdateCardSettings}
            />}
        </div>
      </div>
      <style>{`
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent; 
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #d1d5db; 
        border-radius: 3px;
      }
      .dark .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #4b5563;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #9ca3af; 
      }
      .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #6b7280;
      }
    `}</style>
    </Modal>
    {isEditOpen && (
      <AddCardModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialCard={{ id: card.id, nickname: card.nickname, brand: card.brand, last4: card.last4, holderName: card.holderName, expiration: card.expiration, limit: card.limit, dueDateDay: card.dueDateDay, gradient: card.gradient }}
        onUpdateCard={(updated) => { onUpdateCard(updated); setIsEditOpen(false); onClose(); }}
      />
    )}
    </>
  );
};

export default CardDetailModal;
