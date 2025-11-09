import { Card, Invoice, CardBrand, InvoiceStatus, BankAccount, Transaction, User, Budget, Goal, TransactionType, Category, PaymentMethod } from '../types';

export const mockUser: User = {
    name: 'João da Silva',
    email: 'joao.silva@email.com',
    avatarUrl: 'https://picsum.photos/200',
    membership: 'Free'
};

export const mockCards: Card[] = [
  {
    id: 'c1',
    nickname: 'Nubank Ultravioleta',
    brand: CardBrand.Mastercard,
    last4: '1234',
    holderName: 'Joao da Silva',
    expiration: '12/28',
    limit: 15000,
    dueDateDay: 10,
    // FIX: Added gradient property to conform to Card type
    gradient: { start: '#2C2A4A', end: '#7F27FF' },
  },
  {
    id: 'c2',
    nickname: 'Inter Black',
    brand: CardBrand.Mastercard,
    last4: '5678',
    holderName: 'Joao da Silva',
    expiration: '10/27',
    limit: 25000,
    dueDateDay: 15,
    // FIX: Added gradient property to conform to Card type
    gradient: { start: '#333333', end: '#FF8A00' },
  },
  {
    id: 'c3',
    nickname: 'XP Visa Infinite',
    brand: CardBrand.Visa,
    last4: '9012',
    holderName: 'Joao da Silva',
    expiration: '06/29',
    limit: 30000,
    dueDateDay: 20,
    // FIX: Added gradient property to conform to Card type
    gradient: { start: '#00295B', end: '#004F9F' },
  },
];

export const mockBankAccounts: BankAccount[] = [
    { id: 'b1', bankName: 'Itaú', accountType: 'checking', accountNumber: '12345-6', branch: '0123', balance: 12500.75, logoUrl: 'https://logodownload.org/wp-content/uploads/2014/04/itau-logo-1.png' },
    { id: 'b2', bankName: 'Bradesco', accountType: 'checking', accountNumber: '65432-1', branch: '3210', balance: 7800.20, logoUrl: 'https://logodownload.org/wp-content/uploads/2014/04/bradesco-logo-1.png' },
    { id: 'b3', bankName: 'Nu Pagamentos', accountType: 'savings', accountNumber: '1234567-8', branch: '0001', balance: 25000.00, logoUrl: 'https://logodownload.org/wp-content/uploads/2019/08/nubank-logo-3.png' },
];

export const mockTransactions: Transaction[] = [
    { id: 't1', description: 'Salário Empresa X', category: Category.Salary, amount: 12000, date: '2024-07-05', type: TransactionType.Income, paymentMethod: PaymentMethod.Pix, sourceId: 'b1', isInstallment: false },
    { id: 't2', description: 'Aluguel', category: Category.Housing, amount: 2500, date: '2024-07-06', type: TransactionType.Expense, paymentMethod: PaymentMethod.Debit, sourceId: 'b1', isInstallment: false },
    { id: 't3', description: 'iFood', category: Category.Food, amount: 89.90, date: '2024-07-08', type: TransactionType.Expense, paymentMethod: PaymentMethod.Credit, sourceId: 'c1', isInstallment: false },
    { id: 't4', description: 'Supermercado', category: Category.Food, amount: 750.45, date: '2024-07-10', type: TransactionType.Expense, paymentMethod: PaymentMethod.Credit, sourceId: 'c2', isInstallment: false },
    { id: 't5', description: 'Netflix', category: Category.Subscriptions, amount: 39.90, date: '2024-07-12', type: TransactionType.Expense, paymentMethod: PaymentMethod.Credit, sourceId: 'c1', isInstallment: false },
    { id: 't6', description: 'Academia SmartFit', category: Category.Health, amount: 129.90, date: '2024-07-15', type: TransactionType.Expense, paymentMethod: PaymentMethod.Debit, sourceId: 'b2', isInstallment: false },
    { id: 't7', description: 'Projeto Freelance', category: Category.Freelance, amount: 3500, date: '2024-07-18', type: TransactionType.Income, paymentMethod: PaymentMethod.Pix, sourceId: 'b3', isInstallment: false },
    { id: 't8', description: 'Samsung TV', category: Category.Shopping, amount: 300.00, date: '2024-07-20', type: TransactionType.Expense, paymentMethod: PaymentMethod.Credit, sourceId: 'c1', isInstallment: true, installment: { current: 3, total: 10 } },
    { id: 't9', description: 'Cinema', category: Category.Leisure, amount: 65.00, date: '2024-07-22', type: TransactionType.Expense, paymentMethod: PaymentMethod.Credit, sourceId: 'c2', isInstallment: false },
    { id: 't10', description: 'Transferência para Poupança', category: Category.Investment, amount: 2000, date: '2024-07-25', type: TransactionType.Transfer, paymentMethod: PaymentMethod.Transfer, sourceId: 'b1', isInstallment: false },
];

export const mockInvoices: Invoice[] = [
  {
    id: 'inv1', cardId: 'c1', month: 'Agosto', year: 2024, totalAmount: 3749.50, dueDate: '2024-08-10', status: InvoiceStatus.Pending,
    transactions: [
      { id: 'tx1', description: 'iFood', category: Category.Food, amount: 120.50, date: '2024-07-20', type: 'single' },
      { id: 'tx2', description: 'Netflix', category: Category.Subscriptions, amount: 39.90, date: '2024-07-22', type: 'single' },
      { id: 'tx3', description: 'Samsung TV', category: Category.Shopping, amount: 300.00, date: '2024-07-25', type: 'installment', installment: { current: 3, total: 10 } },
    ],
    installments: [
       { id: 'ig1', description: 'Samsung TV', totalAmount: 3000.00, installments: 10, currentInstallment: 3, startDate: '2024-05-25', endDate: '2025-02-25', monthlyCharge: 300.00 },
       { id: 'ig2', description: 'Macbook Pro', totalAmount: 15000.00, installments: 12, currentInstallment: 8, startDate: '2023-12-25', endDate: '2024-11-25', monthlyCharge: 1250.00 },
    ]
  },
  { id: 'inv2', cardId: 'c1', month: 'Julho', year: 2024, totalAmount: 2500.00, dueDate: '2024-07-10', paymentDate: '2024-07-08', status: InvoiceStatus.Paid, transactions: [], installments: [] },
  { id: 'inv3', cardId: 'c1', month: 'Junho', year: 2024, totalAmount: 4100.00, dueDate: '2024-06-10', paymentDate: '2024-06-10', status: InvoiceStatus.Paid, transactions: [], installments: [] },
  { id: 'inv4', cardId: 'c2', month: 'Agosto', year: 2024, totalAmount: 1200.00, dueDate: '2024-08-15', status: InvoiceStatus.Pending, transactions: [], installments: [] },
  { id: 'inv5', cardId: 'c2', month: 'Julho', year: 2024, totalAmount: 950.00, dueDate: '2024-07-15', paymentDate: '2024-07-15', status: InvoiceStatus.Paid, transactions: [], installments: [] },
  { id: 'inv6', cardId: 'c3', month: 'Julho', year: 2024, totalAmount: 5400.00, dueDate: '2024-07-20', paymentDate: '2024-07-18', status: InvoiceStatus.Paid, transactions: [], installments: [] },
];

export const mockBudgets: Budget[] = [
    { id: 'bud1', category: Category.Food, amount: 1500, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
    { id: 'bud2', category: Category.Transport, amount: 300, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
    { id: 'bud3', category: Category.Leisure, amount: 500, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
];

export const mockGoals: Goal[] = [
    { id: 'g1', name: 'Viagem para a Europa', targetAmount: 20000, currentAmount: 7500, targetDate: '2025-12-31' },
    { id: 'g2', name: 'Novo MacBook', targetAmount: 15000, currentAmount: 13000, targetDate: '2024-12-31' },
];