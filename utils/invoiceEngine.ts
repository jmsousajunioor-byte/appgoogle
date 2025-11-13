import { Card, Invoice, InvoiceStatus, InvoiceTransaction, Transaction, PaymentMethod } from '../types';

// Helper: month names in pt-BR, capitalized to match existing mock data
const monthNames = [
  'janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'
];

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function monthNameFromNumber(m: number) {
  return capitalize(monthNames[(m - 1 + 12) % 12]);
}

// Closing day approximation: if card doesn't have explicit closing day, assume 7 days before due date
export function getClosingDay(card: Card): number {
  if ((card as any).closingDay && Number.isFinite((card as any).closingDay)) {
    return Math.min(28, Math.max(1, Number((card as any).closingDay)));
  }
  const d = Math.max(1, ((card.dueDateDay - 7 - 1 + 31) % 31) + 1);
  // Clamp to 1..28 to avoid invalid days across months (Feb, etc.)
  return Math.min(28, d);
}

// Calculates reference invoice month/year based on purchase date and card closing day
// Rule: purchases on/before closing day -> next month; after closing day -> two months ahead (reference month)
export function calculateInvoiceRef(purchaseDate: Date, card: Card): { month: number; year: number } {
  const day = purchaseDate.getDate();
  let month = purchaseDate.getMonth() + 1; // 1-12
  let year = purchaseDate.getFullYear();
  const closing = getClosingDay(card);
  const jump = day > closing ? 2 : 1;
  month += jump;
  while (month > 12) { month -= 12; year += 1; }
  return { month, year };
}

export function buildDueDate(year: number, month: number, dueDay: number): string {
  // JS Date takes 0-based month, handles overflow
  const d = new Date(year, month - 1, dueDay);
  return d.toISOString();
}

export function buildClosingDate(year: number, month: number, closingDay: number): string {
  const d = new Date(year, month - 1, closingDay);
  return d.toISOString();
}

export function ensureInvoiceForRef(params: {
  invoices: Invoice[];
  setInvoices: (updater: (prev: Invoice[]) => Invoice[]) => void;
  card: Card;
  ref: { month: number; year: number };
}): Invoice {
  const { invoices, setInvoices, card, ref } = params;
  const name = monthNameFromNumber(ref.month);
  let invoice = invoices.find(inv => inv.cardId === card.id && inv.year === ref.year && inv.month.toLowerCase() === name.toLowerCase());
  if (!invoice) {
    const dueDate = buildDueDate(ref.year, ref.month, card.dueDateDay);
    const closingDate = buildClosingDate(ref.year, ref.month, getClosingDay(card));
    invoice = {
      id: `inv${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      cardId: card.id,
      month: name,
      year: ref.year,
      totalAmount: 0,
      dueDate,
      status: InvoiceStatus.Open,
      transactions: [],
      installments: [],
      paidAmount: 0,
      // @ts-ignore keep meta fields non-breaking (not used elsewhere)
      closingDate,
    } as Invoice & { closingDate?: string };
    setInvoices(prev => [...prev, invoice!]);
  }
  return invoice;
}

// Recalculate a single invoice (sum transactions + previous carry)
export function recalculateInvoice(invoices: Invoice[], target: Invoice, opts?: { previous?: Invoice | null }): Invoice {
  const previous = opts?.previous ?? findPreviousInvoice(invoices, target);
  const purchases = (target.transactions || []).reduce((s, t) => s + (t.amount || 0), 0);
  const prevOutstanding = previous ? Math.max(0, (previous.totalAmount || 0) - (previous.paidAmount || 0)) : 0;
  const totalAmount = purchases + prevOutstanding;

  const paid = target.paidAmount || 0;
  const outstanding = Math.max(0, totalAmount - paid);
  const now = new Date();
  const due = new Date(target.dueDate);

  let status: InvoiceStatus = target.status;
  if (outstanding <= 0) {
    status = InvoiceStatus.Paid;
  } else {
    const closing = (target as any).closingDate ? new Date((target as any).closingDate) : null;
    const closedPeriod = closing ? now >= closing : true;
    if (now > due) status = InvoiceStatus.Overdue;
    else if (paid > 0) status = InvoiceStatus.Open;
    else status = closedPeriod ? InvoiceStatus.Pending : InvoiceStatus.Open;
  }

  return { ...target, totalAmount, status };
}

export function recalculateChainForCard(invoices: Invoice[], cardId: string): Invoice[] {
  // Sort by due date ascending to propagate carry
  const items = invoices
    .filter(i => i.cardId === cardId)
    .sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const out = [...invoices];
  let prev: Invoice | null = null;
  for (const inv of items) {
    const recalced = recalculateInvoice(out, inv, { previous: prev });
    // replace in out
    const idx = out.findIndex(x => x.id === inv.id);
    out[idx] = recalced;
    prev = recalced;
  }
  return out;
}

export function findPreviousInvoice(invoices: Invoice[], target: Invoice): Invoice | null {
  // previous by card and by dueDate before target
  const sameCard = invoices.filter(i => i.cardId === target.cardId);
  const before = sameCard
    .filter(i => new Date(i.dueDate).getTime() < new Date(target.dueDate).getTime())
    .sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  return before[0] || null;
}

export function addCreditPurchaseToInvoices(params: {
  invoices: Invoice[];
  setInvoices: (updater: (prev: Invoice[]) => Invoice[]) => void;
  card: Card;
  baseTransaction: Omit<Transaction, 'id'>; // amount as total if installment, else as purchase amount
}): { createdTxs: Transaction[] } {
  const { invoices, setInvoices, card, baseTransaction } = params;
  const isInstallment = !!baseTransaction.isInstallment && baseTransaction.installment?.total && baseTransaction.installment.total > 1;
  const total = baseTransaction.amount;
  const totalParc = isInstallment ? baseTransaction.installment!.total : 1;
  const valorParcela = isInstallment ? Math.floor((total / totalParc) * 100) / 100 : total;
  const diferenca = isInstallment ? +(total - valorParcela * totalParc).toFixed(2) : 0;

  const created: Transaction[] = [];

  for (let i = 1; i <= totalParc; i++) {
    const date = new Date(baseTransaction.date);
    date.setMonth(date.getMonth() + (i - 1));
    const ref = calculateInvoiceRef(date, card);

    // ensure invoice exists
    let inv: Invoice | null = null;
    setInvoices(prev => {
      const found = prev.find(v => v.cardId === card.id && v.year === ref.year && v.month.toLowerCase() === monthNameFromNumber(ref.month).toLowerCase());
      if (found) { inv = found; return prev; }
      const dueDate = buildDueDate(ref.year, ref.month, card.dueDateDay);
      const closingDate = buildClosingDate(ref.year, ref.month, getClosingDay(card));
      const createdInv: Invoice & { closingDate?: string } = {
        id: `inv${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        cardId: card.id,
        month: monthNameFromNumber(ref.month),
        year: ref.year,
        totalAmount: 0,
        dueDate,
        status: InvoiceStatus.Open,
        transactions: [],
        installments: [],
        paidAmount: 0,
        closingDate,
      };
      inv = createdInv;
      return [...prev, createdInv];
    });

    if (!inv) {
      // find again
      inv = (invoices as Invoice[]).find(v => v.cardId === card.id && v.year === ref.year && v.month.toLowerCase() === monthNameFromNumber(ref.month).toLowerCase()) || null;
    }

    const valueThis = i === totalParc ? valorParcela + diferenca : valorParcela;
    const tx: Transaction = {
      ...baseTransaction,
      id: `t${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      amount: valueThis,
      isInstallment: isInstallment,
      installment: isInstallment ? { current: i, total: totalParc } : undefined,
      paymentMethod: PaymentMethod.Credit,
      date: date.toISOString(),
    };
    created.push(tx);

    // also push to invoice.transactions
    const invTx: InvoiceTransaction = {
      id: tx.id,
      description: tx.description,
      category: tx.category as any,
      amount: valueThis,
      date: tx.date,
      type: isInstallment ? 'installment' : 'single',
      installment: isInstallment ? { current: i, total: totalParc } : undefined,
    };

    setInvoices(prev => prev.map(v => v.id === inv!.id ? { ...v, transactions: [...(v.transactions || []), invTx] } : v));
  }

  // After all, recompute chain to keep carryover in sync
  setInvoices(prev => recalculateChainForCard(prev, card.id));

  return { createdTxs: created };
}

export function registerInvoicePayment(invoices: Invoice[], setInvoices: (updater: (prev: Invoice[]) => Invoice[]) => void, invoiceId: string, amount: number, dateISO?: string) {
  const inv = invoices.find(i => i.id === invoiceId);
  if (!inv) return;
  if (amount <= 0) return;

  setInvoices(prev => prev.map(i => i.id === invoiceId ? {
    ...i,
    paidAmount: Math.min((i.totalAmount || 0), (i.paidAmount || 0) + amount),
    paymentDate: dateISO || new Date().toISOString(),
  } : i));
  // ensure status reflects full payment and cascades to next invoices
  setInvoices(prev => recalculateChainForCard(prev, inv!.cardId));
}
