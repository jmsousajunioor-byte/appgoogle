

export enum CardBrand {
  Visa = 'Visa',
  VisaSignature = 'Visa Signature',
  Mastercard = 'Mastercard',
  Amex = 'Amex',
  Elo = 'Elo',
  Hipercard = 'Hipercard',
}

export enum InvoiceStatus {
  Paid = 'Paid',
  Pending = 'Pending',
  Overdue = 'Overdue',
  Open = 'Open',
  Closed = 'Closed',
}

export enum TransactionType {
    Expense = 'expense',
    Income = 'income',
    Transfer = 'transfer'
}

export enum PaymentMethod {
    Credit = 'credit',
    Debit = 'debit',
    Pix = 'pix',
    Transfer = 'transfer',
    Cash = 'cash'
}

export enum Category {
    Food = 'Alimentação',
    Housing = 'Moradia',
    Transport = 'Transporte',
    Health = 'Saúde',
    Leisure = 'Lazer',
    Subscriptions = 'Assinaturas',
    Shopping = 'Compras',
    Salary = 'Salário',
    Freelance = 'Renda Extra',
    Investment = 'Investimento',
    Other = 'Outros'
}

export interface Gradient {
  start: string;
  end: string;
}

export interface Card {
  id: string;
  nickname: string;
  brand: CardBrand;
  last4: string;
  holderName: string;
  expiration: string;
  limit: number;
  dueDateDay: number;
  closingDay?: number;
  gradient: Gradient;
}

export type NewCard = Omit<Card, 'id'>;

export interface BankAccount {
    id: string;
    bankName: string;
    accountType: 'checking' | 'savings';
    accountNumber: string;
    branch: string;
    balance: number;
    logoUrl: string;
}

export type NewBankAccount = Omit<BankAccount, 'id' | 'logoUrl'>;


export interface Transaction {
    id: string;
    description: string;
    category: Category;
    amount: number;
    date: string;
    type: TransactionType;
    paymentMethod: PaymentMethod;
    sourceId: string; // ID of Card or BankAccount
    isInstallment: boolean;
    installment?: {
        current: number;
        total: number;
    };
}

export type NewTransaction = Omit<Transaction, 'id'> & {
  cardTransactionType?: CardTransactionType;
  recurrenceConfig?: {
    frequency: 'weekly' | 'monthly' | 'yearly';
    dayOfPeriod: number;
    startDate?: string;
    terminationType?: 'never' | 'on_date' | 'after_occurrences';
    terminationDate?: string;
    maxOccurrences?: number;
  };
};

export interface InvoiceTransaction {
    id: string;
    description: string;
    category: Category;
    amount: number;
    date: string;
    type: 'single' | 'installment';
    installment?: {
        current: number;
        total: number;
    };
}

export interface InstallmentGroup {
    id: string;
    description: string;
    totalAmount: number;
    installments: number;
    currentInstallment: number;
    startDate: string;
    endDate: string;
    monthlyCharge: number;
}

export interface Invoice {
  id: string;
  cardId: string;
  month: string;
  year: number;
  totalAmount: number;
  dueDate: string;
  paymentDate?: string;
  status: InvoiceStatus;
  transactions: (InvoiceTransaction | InvoiceTransactionDetail)[];
  installments: InstallmentGroup[];
  // Quantia já paga desta fatura (opcional, para suportar pagamentos parciais)
  paidAmount?: number;
}

// Registered payments for invoices
export interface InvoicePaymentRecord {
  id: string;
  invoiceId: string;
  cardId: string;
  amount: number;
  dateISO: string;
  method?: string;
  notes?: string;
}

// Recurring transaction definition (credit-only for now)
export interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  category: Category;
  cardId?: string;
  startDate: string;
  endDate?: string;
  frequency: 'weekly' | 'monthly' | 'yearly';
  dayOfPeriod: number;
  status: 'active' | 'paused' | 'cancelled';
  terminationType: 'never' | 'on_date' | 'after_occurrences';
  terminationDate?: string;
  maxOccurrences?: number;
  occurrencesGenerated?: number;
  lastGeneratedDate?: string;
  lastRunMonth?: string;
}

export type NotificationType = 'due-soon' | 'overdue' | 'limit' | 'payment';
export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  dateISO: string;
  read: boolean;
  invoiceId?: string;
  cardId?: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string; // Opcional para evitar crashes quando o avatar não estiver disponível
    membership: 'Free' | 'Premium';
}

export interface Budget {
    id: string;
    category: Category;
    amount: number;
    month: number; // 1-12
    year: number;
}
export type NewBudget = Omit<Budget, 'id'>;

export interface Goal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
}
export type NewGoal = Omit<Goal, 'id'>;

// ============================================================================
// AGGREGATED TRANSACTION TYPES (for installment grouping)
// ============================================================================

// Parent transaction representing the full purchase
export interface CardTransaction {
    id: string;
    userId: string;
    cardId: string;
    description: string;
    totalAmount: number;
    installmentCount: number;
    purchaseDate: string;
    category: Category;
    createdAt: string;
    type: CardTransactionType;
    recurringTransactionId?: string;
    installmentAmount?: number;
}

// Individual installment linked to a parent transaction
export interface CardTransactionInstallment {
    id: string;
    transactionId: string;
    installmentNumber: number;
    amount: number;
    dueDate: string;
    invoiceId?: string;
    status: 'pending' | 'paid' | 'cancelled';
    createdAt: string;
}

// Summary for transaction list view (one item per parent transaction)
export interface TransactionSummary {
    id: string;
    description: string;
    totalAmount: number;
    installmentCount: number;
    installmentAmount: number;
    firstInstallmentDate: string;
    lastInstallmentDate: string;
    purchaseDate: string;
    type: CardTransactionType;
    recurringTransactionId?: string;
    card: {
        id: string;
        alias: string;
    };
    category: {
        id: string;
        name: string;
    };
}

// Detailed view of a transaction with all installments
export interface TransactionDetails extends CardTransaction {
    installments: CardTransactionInstallment[];
    card: Card;
}

// Invoice transaction with parent context for fatura detail view
export interface InvoiceTransactionDetail {
    transactionId: string;
    description: string;
    totalAmount: number;
    installmentCount: number;
    currentInstallmentNumber: number;
    installmentAmount?: number;
    currentInstallmentAmount: number;
    purchaseDate: string;
    category: Category;
    card?: Partial<Card>;
    type?: CardTransactionType;
    recurringTransactionId?: string;
}

export type NewCardTransaction = Omit<CardTransaction, 'id' | 'userId' | 'createdAt'>;


export type Page = 'dashboard' | 'cards-dashboard' | 'credit-cards' | 'bank-accounts' | 'transactions' | 'invoices' | 'reports' | 'budgets' | 'profile' | 'settings';
export type Theme = 'light' | 'dark';

// Tipo do agrupamento de transações de cartão
export type CardTransactionType = 'SINGLE' | 'INSTALLMENT' | 'RECURRING';
