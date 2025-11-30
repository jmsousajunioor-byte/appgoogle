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
      className={`px-4 py-3 text-sm font-medium w-full text-left rounded-xl transition-all duration-300 relative overflow-hidden group ${
        activeTab === tab
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
          : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-white hover:bg-transparent'
      }`}
    >
      {activeTab !== tab && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
      <span className="relative z-10">{label}</span>
    </button>
  );

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" title="">
      <div id="modaldetailcard" className="flex flex-col h-full">
        <header className="flex justify-between items-center pb-4 mb-4 border-b border-white/10">
          <h2 className="text-2xl font-heading text-white">Detalhes do Cartão</h2>
          <button 
            onClick={onClose}
            aria-label="Fechar"
            className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 rounded-full p-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-[320px,1fr] gap-8 flex-1 overflow-hidden">
          <div className="space-y-6 flex flex-col">
            <RealisticCard card={card} />
            <div className="flex">
              <Button
                className="w-full bg-transparent backdrop-blur-md text-neutral-700 dark:text-neutral-200 border border-white/20 dark:border-neutral-600 hover:bg_white/10 dark:hover:bg-neutral-600 transition-all duration-200 transform hover:scale-105"
                onClick={() => setIsEditOpen(true)}
              >
                Editar Cartão
              </Button>
            </div>
            <div className="flex flex-col p-2 flex-1">
              <TabButton tab="overview" label="Visão Geral" />
              <TabButton tab="invoices" label="Faturas" />
              <TabButton tab="transactions" label="Lançamentos Futuros" />
              <TabButton tab="settings" label="Configurações" />
            </div>
          </div>
          
          <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
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
