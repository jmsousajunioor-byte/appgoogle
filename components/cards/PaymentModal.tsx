import React, { useMemo, useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { Invoice } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onSubmit: (invoiceId: string, amount: number, dateISO?: string, method?: string, notes?: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, invoice, onSubmit }) => {
  const [type, setType] = useState<'total' | 'partial'>('total');
  const [amountInput, setAmountInput] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<string>('PIX');
  const [notes, setNotes] = useState<string>('');

  const outstanding = useMemo(() => Math.max(0, (invoice.totalAmount || 0) - (invoice.paidAmount || 0)), [invoice]);
  const amount = type === 'total' ? outstanding : parseFloat((amountInput || '').replace(',', '.')) || 0;
  const remaining = Math.max(0, outstanding - amount);

  const handleSubmit = () => {
    if (amount <= 0) return;
    onSubmit(invoice.id, amount, date ? new Date(date).toISOString() : undefined, method, notes);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Pagamento da Fatura - ${invoice.month}/${invoice.year}`} size="md">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-neutral-500">Saldo atual</div>
            <div className="font-mono font-semibold">{formatCurrency(outstanding)}</div>
          </div>
          <div>
            <div className="text-sm text-neutral-500">Vencimento</div>
            <div className="font-semibold">{formatDate(invoice.dueDate)}</div>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2 text-sm"><input type="radio" name="ptype" checked={type==='total'} onChange={()=>setType('total')} /> Total</label>
          <label className="flex items-center gap-2 text-sm"><input type="radio" name="ptype" checked={type==='partial'} onChange={()=>setType('partial')} /> Parcial</label>
        </div>

        {type === 'partial' && (
          <Input label="Valor" name="amount" type="number" step="0.01" value={amountInput} onChange={e=>setAmountInput(e.target.value)} placeholder="0,00" />
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input label="Data do pagamento" name="date" type="date" value={date} onChange={e=>setDate(e.target.value)} />
          <Select label="Método" name="method" value={method} onChange={e=>setMethod(e.target.value)}>
            <option value="PIX">PIX</option>
            <option value="Débito">Débito</option>
            <option value="Transferência">Transferência</option>
            <option value="Outro">Outro</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm mb-1">Observações</label>
          <textarea className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent" rows={3} value={notes} onChange={e=>setNotes(e.target.value)} />
        </div>

        <div className="bg-neutral-50 dark:bg-neutral-900 p-3 rounded-lg text-sm flex justify-between">
          <div>Será pago: <span className="font-bold">{formatCurrency(amount)}</span></div>
          <div>Saldo após: <span className="font-bold">{formatCurrency(remaining)}</span></div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit}>Confirmar</Button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;

