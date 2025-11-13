

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

export type NewTransaction = Omit<Transaction, 'id'>;

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
  transactions: InvoiceTransaction[];
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
  cardId: string;
  dayOfMonth: number;
  active: boolean;
  startDate: string;
  endDate?: string;
  lastRunMonth?: string; // yyyy-mm
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
    name: string;
    email: string;
    avatarUrl: string;
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


export type Page = 'dashboard' | 'cards-dashboard' | 'credit-cards' | 'bank-accounts' | 'transactions' | 'invoices' | 'reports' | 'budgets' | 'profile' | 'settings';
export type Theme = 'light' | 'dark';
