import React, { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { NewTransaction, Category, TransactionType, PaymentMethod, BankAccount, Card, Transaction } from '../../types';
import { getCategoryMeta } from '../../utils/categoryMeta';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewTransaction | Transaction) => void;
  accounts: (BankAccount | Card)[];
  transactionToEdit?: Transaction | null;
  allowedTypes?: TransactionType[];
  allowedPaymentMethods?: PaymentMethod[];
  onAddRecurrence?: (data: any) => void;
}

const TransactionFormModal: React.FC<TransactionFormModalProps> = ({ isOpen, onClose, onSubmit, accounts, transactionToEdit, allowedTypes, allowedPaymentMethods, onAddRecurrence }) => {
  const defaultTypes: TransactionType[] = React.useMemo(() => (
    allowedTypes ?? [TransactionType.Expense, TransactionType.Income, TransactionType.Transfer]
  ), [allowedTypes]);
  const defaultPayments: PaymentMethod[] = React.useMemo(() => (
    allowedPaymentMethods ?? (Object.values(PaymentMethod) as PaymentMethod[])
  ), [allowedPaymentMethods]);

  const [type, setType] = useState<TransactionType>(defaultTypes[0]);
  const [mode, setMode] = useState<'single' | 'installment' | 'recurring'>('single');
  const categoryOptions = React.useMemo(() => Object.values(Category) as Category[], []);

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setMode(!!transactionToEdit.isInstallment && (transactionToEdit.installment?.total || 1) > 1 ? 'installment' : 'single');
    } else {
      setType(defaultTypes[0]);
      setMode('single');
    }
  }, [transactionToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const amount = parseFloat((data.amount as string) || '0');

    // Handle Recurring
    if (mode === 'recurring') {
      if (onAddRecurrence) {
        onAddRecurrence({
          description: data.description,
          amount,
          category: data.category,
          cardId: data.sourceId, // Assuming sourceId is cardId for recurring
          dayOfMonth: parseInt(data.dayOfMonth as string, 10),
          startDate: data.date,
          endDate: data.endDate || undefined,
          frequency: data.frequency as 'weekly' | 'monthly' | 'yearly'
        });
        onClose();
        return;
      }
    }

    const installmentTotal = mode === 'installment' ? parseInt((data.installmentTotal as string) || '0', 10) : 1;

    const txData: NewTransaction = {
      description: data.description as string,
      amount,
      category: data.category as Category,
      date: data.date as string,
      type: data.type as TransactionType,
      paymentMethod: data.paymentMethod as PaymentMethod,
      sourceId: data.sourceId as string,
      isInstallment: mode === 'installment',
      installment: mode === 'installment' ? { current: 1, total: installmentTotal } : undefined,
    };

    // Validations
    if (!txData.description || !Number.isFinite(txData.amount) || txData.amount <= 0) {
      alert('Informe uma descrição e um valor maior que zero.');
      return;
    }
    if (mode === 'installment') {
      if (installmentTotal < 2 || installmentTotal > 60) {
        alert('Qtd. de parcelas deve estar entre 2 e 60.');
        return;
      }
    }
    if (txData.paymentMethod === PaymentMethod.Credit) {
      if (!txData.sourceId || !txData.sourceId.startsWith('c')) {
        alert('Selecione um Cartão para pagamentos no crédito.');
        return;
      }
    } else {
      // For recurring, we might allow bank account later, but for now let's stick to existing logic
      if (mode !== 'recurring' && (!txData.sourceId || !txData.sourceId.startsWith('b'))) {
        // alert('Selecione uma Conta para pagamentos não-crédito.');
        // Relaxing this check as sourceId might be flexible
      }
    }

    if (transactionToEdit) {
      onSubmit({ ...(txData as any), id: transactionToEdit.id } as Transaction);
    } else {
      onSubmit(txData);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={transactionToEdit ? 'Editar Transação' : 'Adicionar Nova Transação'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Tipo"
          name="type"
          required
          value={type}
          onChange={(e) => setType(e.target.value as TransactionType)}
          defaultValue={transactionToEdit?.type}
        >
          {defaultTypes.includes(TransactionType.Expense) && (
            <option value={TransactionType.Expense}>Despesa</option>
          )}
          {defaultTypes.includes(TransactionType.Income) && (
            <option value={TransactionType.Income}>Receita</option>
          )}
          {defaultTypes.includes(TransactionType.Transfer) && (
            <option value={TransactionType.Transfer}>Transferência</option>
          )}
        </Select>

        <Input label="Descrição" name="description" type="text" placeholder="Ex: Salário, Aluguel" required defaultValue={transactionToEdit?.description} />
        <Input label="Valor" name="amount" type="number" step="0.01" placeholder="0,00" required defaultValue={transactionToEdit?.amount} />

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="mode" checked={mode === 'single'} onChange={() => setMode('single')} /> À vista
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="mode" checked={mode === 'installment'} onChange={() => setMode('installment')} /> Parcelado
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="mode" checked={mode === 'recurring'} onChange={() => setMode('recurring')} /> Recorrente
          </label>
        </div>

        {mode === 'installment' && (
          <div className="grid grid-cols-2 gap-4 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
            <Input label="Total de Parcelas" name="installmentTotal" type="number" min="2" max="60" placeholder="12" required defaultValue={transactionToEdit?.installment?.total} />
          </div>
        )}

        {mode === 'recurring' && (
          <div className="grid grid-cols-2 gap-4 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
            <Input label="Dia do Vencimento" name="dayOfMonth" type="number" min="1" max="31" placeholder="Dia" required />
            <Select label="Frequência" name="frequency" required defaultValue="monthly">
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
              <option value="yearly">Anual</option>
            </Select>
            <Input label="Data Final (Opcional)" name="endDate" type="date" />
          </div>
        )}

        <Select label="Categoria" name="category" required defaultValue={transactionToEdit?.category}>
          {categoryOptions.map(cat => {
            const meta = getCategoryMeta(cat);
            return (
              <option key={cat} value={cat}>
                {`${meta.icon} ${cat}`}
              </option>
            );
          })}
        </Select>

        <Select label="Método de Pagamento" name="paymentMethod" required defaultValue={transactionToEdit?.paymentMethod}>
          {defaultPayments.map(pm => {
            const label = pm === PaymentMethod.Credit
              ? 'Crédito'
              : pm === PaymentMethod.Debit
                ? 'Débito'
                : pm === PaymentMethod.Transfer
                  ? 'Transferência'
                  : pm === PaymentMethod.Cash
                    ? 'Dinheiro'
                    : 'Pix';
            return (
              <option key={pm} value={pm}>{label}</option>
            );
          })}
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
          <Button type="submit">{transactionToEdit ? 'Salvar Alterações' : 'Salvar Transação'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default TransactionFormModal;
