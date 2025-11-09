import { Card, Invoice, CardBrand, InvoiceStatus, BankAccount, Transaction, User, Budget, Goal, TransactionType, Category, PaymentMethod } from '../types';

// --- DYNAMIC DATE HELPERS ---
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth(); // 0-indexed

/**
 * Generates a date string in 'YYYY-MM-DD' format for the current year and month.
 * @param day The day of the month.
 * @param monthOffset An offset from the current month (e.g., 1 for next month, -1 for last month).
 */
const formatDateForMock = (day: number, monthOffset = 0) => {
    // new Date() correctly handles month overflow/underflow (e.g., month 12 becomes Jan of next year)
    const date = new Date(currentYear, currentMonth + monthOffset, day);
    return date.toISOString().split('T')[0];
};

/**
 * Gets the Portuguese name of a month based on an offset from the current month.
 * @param monthOffset An offset from the current month.
 */
const getMonthName = (monthOffset = 0) => {
    const date = new Date(currentYear, currentMonth + monthOffset, 1);
    return date.toLocaleString('pt-BR', { month: 'long' });
};

/**
 * Gets the year for a month based on an offset from the current month.
 * @param monthOffset An offset from the current month.
 */
const getYearForMonth = (monthOffset = 0) => {
    const date = new Date(currentYear, currentMonth + monthOffset, 1);
    return date.getFullYear();
}

/**
 * Capitalizes the first letter of a string.
 * @param s The string to capitalize.
 */
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);


// --- MOCK DATA ---
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
    brand: CardBrand.VisaSignature,
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
    { id: 't1', description: 'Salário Empresa X', category: Category.Salary, amount: 12000, date: formatDateForMock(5), type: TransactionType.Income, paymentMethod: PaymentMethod.Pix, sourceId: 'b1', isInstallment: false },
    { id: 't2', description: 'Aluguel', category: Category.Housing, amount: 2500, date: formatDateForMock(6), type: TransactionType.Expense, paymentMethod: PaymentMethod.Debit, sourceId: 'b1', isInstallment: false },
    { id: 't3', description: 'iFood', category: Category.Food, amount: 89.90, date: formatDateForMock(8), type: TransactionType.Expense, paymentMethod: PaymentMethod.Credit, sourceId: 'c1', isInstallment: false },
    { id: 't4', description: 'Supermercado', category: Category.Food, amount: 750.45, date: formatDateForMock(10), type: TransactionType.Expense, paymentMethod: PaymentMethod.Credit, sourceId: 'c2', isInstallment: false },
    { id: 't5', description: 'Netflix', category: Category.Subscriptions, amount: 39.90, date: formatDateForMock(12), type: TransactionType.Expense, paymentMethod: PaymentMethod.Credit, sourceId: 'c1', isInstallment: false },
    { id: 't6', description: 'Academia SmartFit', category: Category.Health, amount: 129.90, date: formatDateForMock(15), type: TransactionType.Expense, paymentMethod: PaymentMethod.Debit, sourceId: 'b2', isInstallment: false },
    { id: 't7', description: 'Projeto Freelance', category: Category.Freelance, amount: 3500, date: formatDateForMock(18), type: TransactionType.Income, paymentMethod: PaymentMethod.Pix, sourceId: 'b3', isInstallment: false },
    { id: 't8', description: 'Samsung TV', category: Category.Shopping, amount: 300.00, date: formatDateForMock(20), type: TransactionType.Expense, paymentMethod: PaymentMethod.Credit, sourceId: 'c1', isInstallment: true, installment: { current: 3, total: 10 } },
    { id: 't9', description: 'Cinema', category: Category.Leisure, amount: 65.00, date: formatDateForMock(22), type: TransactionType.Expense, paymentMethod: PaymentMethod.Credit, sourceId: 'c2', isInstallment: false },
    { id: 't10', description: 'Transferência para Poupança', category: Category.Investment, amount: 2000, date: formatDateForMock(25), type: TransactionType.Transfer, paymentMethod: PaymentMethod.Transfer, sourceId: 'b1', isInstallment: false },
];

export const mockInvoices: Invoice[] = [
  {
    id: 'inv1', cardId: 'c1', month: capitalize(getMonthName(1)), year: getYearForMonth(1), totalAmount: 3749.50, dueDate: formatDateForMock(10, 1), status: InvoiceStatus.Pending,
    transactions: [
      { id: 'tx1', description: 'iFood', category: Category.Food, amount: 120.50, date: formatDateForMock(20), type: 'single' },
      { id: 'tx2', description: 'Netflix', category: Category.Subscriptions, amount: 39.90, date: formatDateForMock(22), type: 'single' },
      { id: 'tx3', description: 'Samsung TV', category: Category.Shopping, amount: 300.00, date: formatDateForMock(25), type: 'installment', installment: { current: 3, total: 10 } },
    ],
    installments: [
       { id: 'ig1', description: 'Samsung TV', totalAmount: 3000.00, installments: 10, currentInstallment: 3, startDate: '2024-05-25', endDate: '2025-02-25', monthlyCharge: 300.00 },
       { id: 'ig2', description: 'Macbook Pro', totalAmount: 15000.00, installments: 12, currentInstallment: 8, startDate: '2023-12-25', endDate: '2024-11-25', monthlyCharge: 1250.00 },
    ]
  },
  { id: 'inv2', cardId: 'c1', month: capitalize(getMonthName()), year: getYearForMonth(), totalAmount: 2500.00, dueDate: formatDateForMock(10), paymentDate: formatDateForMock(8), status: InvoiceStatus.Paid, transactions: [], installments: [] },
  { id: 'inv3', cardId: 'c1', month: capitalize(getMonthName(-1)), year: getYearForMonth(-1), totalAmount: 4100.00, dueDate: formatDateForMock(10, -1), paymentDate: formatDateForMock(10, -1), status: InvoiceStatus.Paid, transactions: [], installments: [] },
  { id: 'inv4', cardId: 'c2', month: capitalize(getMonthName(1)), year: getYearForMonth(1), totalAmount: 1200.00, dueDate: formatDateForMock(15, 1), status: InvoiceStatus.Pending, transactions: [], installments: [] },
  { id: 'inv5', cardId: 'c2', month: capitalize(getMonthName()), year: getYearForMonth(), totalAmount: 950.00, dueDate: formatDateForMock(15), paymentDate: formatDateForMock(15), status: InvoiceStatus.Paid, transactions: [], installments: [] },
  { id: 'inv6', cardId: 'c3', month: capitalize(getMonthName()), year: getYearForMonth(), totalAmount: 5400.00, dueDate: formatDateForMock(20), paymentDate: formatDateForMock(18), status: InvoiceStatus.Paid, transactions: [], installments: [] },
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