import { Card, Transaction, User, Invoice, InvoiceStatus, CardTransaction, CardTransactionInstallment, TransactionSummary, CardTransactionType } from '../../types';

type SupabaseRow<T extends object> = T & Record<string, any>;

const pick = <T extends object>(row: SupabaseRow<T>, key: string) => {
  if (key in row) return row[key];
  const lower = key.toLowerCase();
  if (lower in row) return row[lower];
  return undefined;
};

export const mapCardFromSupabase = (row: SupabaseRow<Card>): Card => ({
  id: row.id,
  nickname: pick(row, 'nickname') ?? '',
  brand: pick(row, 'brand'),
  last4: pick(row, 'last4') ?? '',
  holderName: pick(row, 'holderName') ?? '',
  expiration: pick(row, 'expiration') ?? '',
  limit: Number(pick(row, 'limit') ?? pick(row, 'creditLimit') ?? 0),
  dueDateDay: Number(pick(row, 'dueDateDay') ?? pick(row, 'due_day') ?? 1),
  closingDay: pick(row, 'closingDay') != null ? Number(pick(row, 'closingDay')) : undefined,
  gradient: pick(row, 'gradient') ?? { start: '#4B5563', end: '#1F2937' },
});

export const mapTransactionFromSupabase = (
  row: SupabaseRow<Transaction>,
): Transaction => ({
  id: row.id,
  description: pick(row, 'description') ?? '',
  category: pick(row, 'category'),
  amount: Number(pick(row, 'amount') ?? 0),
  date: pick(row, 'date') ?? new Date().toISOString(),
  type: pick(row, 'type'),
  paymentMethod: pick(row, 'paymentMethod') ?? pick(row, 'payment_method'),
  sourceId: pick(row, 'sourceId') ?? pick(row, 'source_id') ?? '',
  isInstallment: Boolean(pick(row, 'isInstallment')),
  installment: pick(row, 'installment') ?? undefined,
});

export const mapUserFromSupabase = (row: SupabaseRow<User>): User => {
  const name = pick(row, 'name') ?? '';
  const avatarUrl = pick(row, 'avatarUrl') ?? pick(row, 'avatar_url');
  
  return {
    id: pick(row, 'id') ?? '',
    name,
    email: pick(row, 'email') ?? '',
    // Gera avatar padrão com iniciais do usuário se não houver avatar no banco
    avatarUrl: avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`,
    membership: (pick(row, 'membership') ?? 'Free') as 'Free' | 'Premium',
  };
};

const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const getMonthName = (m: number | string) => {
  if (typeof m === 'number') return monthNames[m - 1] || '';
  return m;
};

export const mapInvoiceFromSupabase = (row: SupabaseRow<Invoice>): Invoice => ({
  id: row.id,
  cardId: pick(row, 'credit_card_id') ?? pick(row, 'cardId') ?? pick(row, 'cardid') ?? '',
  month: getMonthName(pick(row, 'month')),
  year: Number(pick(row, 'year') ?? 0),
  totalAmount: Number(pick(row, 'total_amount') ?? pick(row, 'totalAmount') ?? pick(row, 'totalamount') ?? 0),
  dueDate: pick(row, 'due_date') ?? pick(row, 'dueDate') ?? pick(row, 'duedate') ?? new Date().toISOString(),
  paymentDate: pick(row, 'payment_date') ?? pick(row, 'paymentDate') ?? pick(row, 'paymentdate') ?? undefined,
  status: (pick(row, 'status') ?? InvoiceStatus.Pending) as InvoiceStatus,
  transactions: (pick(row, 'transactions') as Invoice['transactions']) ?? [],
  installments: (pick(row, 'installments') as Invoice['installments']) ?? [],
  paidAmount: Number(pick(row, 'paidAmount') ?? pick(row, 'paidamount') ?? 0),
});

/**
 * Map Supabase card_transactions record to CardTransaction type
 */
export const mapCardTransactionFromSupabase = (row: SupabaseRow<any>): CardTransaction => ({
  id: row.id,
  userId: pick(row, 'user_id') ?? '',
  cardId: pick(row, 'card_id') ?? '',
  description: pick(row, 'description') ?? '',
  totalAmount: Number(pick(row, 'total_amount') ?? 0),
  installmentCount: Number(pick(row, 'installment_count') ?? 1),
  purchaseDate: pick(row, 'purchase_date') ?? new Date().toISOString(),
  category: pick(row, 'category'),
  createdAt: pick(row, 'created_at') ?? new Date().toISOString(),
  type: (pick(row, 'type') as CardTransactionType) ?? (Number(pick(row, 'installment_count') ?? 1) > 1 ? 'INSTALLMENT' : 'SINGLE'),
  recurringTransactionId: pick(row, 'recurring_transaction_id') ?? undefined,
  installmentAmount: Number(pick(row, 'installment_amount') ?? 0) || (Number(pick(row, 'total_amount') ?? 0) / Math.max(1, Number(pick(row, 'installment_count') ?? 1))),
});

/**
 * Map Supabase card_transaction_installments record to CardTransactionInstallment type
 */
export const mapCardTransactionInstallmentFromSupabase = (row: SupabaseRow<any>): CardTransactionInstallment => ({
  id: row.id,
  transactionId: pick(row, 'transaction_id') ?? '',
  installmentNumber: Number(pick(row, 'installment_number') ?? 1),
  amount: Number(pick(row, 'amount') ?? 0),
  dueDate: pick(row, 'due_date') ?? new Date().toISOString(),
  invoiceId: pick(row, 'invoice_id'),
  status: (pick(row, 'status') ?? 'pending') as 'pending' | 'paid' | 'cancelled',
  createdAt: pick(row, 'created_at') ?? new Date().toISOString(),
});

/**
 * Map aggregated query result to TransactionSummary
 */
export const mapTransactionSummaryFromSupabase = (row: SupabaseRow<any>): TransactionSummary => {
  const installments = pick(row, 'installments') || [];
  const dates = installments.map((i: any) => new Date(i.due_date).getTime()).sort();
  const amounts = installments.map((i: any) => Number(i.amount)).filter((v: number) => Number.isFinite(v));
  
  const card = pick(row, 'card');
  return {
    id: row.id,
    description: pick(row, 'description') ?? '',
    totalAmount: Number(pick(row, 'total_amount') ?? 0),
    installmentCount: Number(pick(row, 'installment_count') ?? 1),
    installmentAmount: amounts.length > 0
      ? Number(amounts[0].toFixed(2))
      : Number(pick(row, 'total_amount') ?? 0) / Math.max(1, Number(pick(row, 'installment_count') ?? 1)),
    purchaseDate: pick(row, 'purchase_date') ?? new Date().toISOString(),
    firstInstallmentDate: dates.length > 0 ? new Date(dates[0]).toISOString() : pick(row, 'purchase_date') ?? new Date().toISOString(),
    lastInstallmentDate: dates.length > 0 ? new Date(dates[dates.length - 1]).toISOString() : pick(row, 'purchase_date') ?? new Date().toISOString(),
    type: (pick(row, 'type') as CardTransactionType) ?? (Number(pick(row, 'installment_count') ?? 1) > 1 ? 'INSTALLMENT' : 'SINGLE'),
    recurringTransactionId: pick(row, 'recurring_transaction_id') ?? undefined,
    card: {
      id: card?.id || pick(row, 'card_id') || '',
      alias: card?.nickname 
        ? `${card.nickname} (****${card.last4})`
        : 'Cartao desconhecido',
    },
    category: {
      id: pick(row, 'category') ?? '',
      name: pick(row, 'category') ?? '',
    },
  };
};


