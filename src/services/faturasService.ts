import { supabaseClient } from '../lib/supabaseClient';
import { Invoice, InvoiceTransactionDetail } from '../../types';
import { mapInvoiceFromSupabase } from './mappers';

const TABLE = 'invoices';
const monthNames = ['janeiro','fevereiro','mar�o','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

const normalizeMonth = (value: number | string | null | undefined): string | number => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return value;
  const num = Number(value);
  if (!Number.isNaN(num)) return num;
  return value;
};

const isSameMonth = (stored: any, target: number | string) => {
  const normStored = normalizeMonth(stored);
  const normTarget = normalizeMonth(target);
  if (typeof normStored === 'number' && typeof normTarget === 'number') {
    return normStored === normTarget;
  }
  const asString = String(normStored).toLowerCase();
  const targetStr = String(normTarget).toLowerCase();
  return asString === targetStr || asString === monthNames[Number(normTarget) - 1]?.toLowerCase();
};

export async function getOrCreateInvoice(cardId: string, month: number, year: number, dueDate: string): Promise<Invoice> {
  try {
    // Busca faturas existentes do cart�o para o ano informado (compatibilidade card_id/cardid)
    const { data, error } = await supabaseClient
      .from(TABLE)
      .select('*')
      .or(`card_id.eq.${cardId},cardid.eq.${cardId}`)
      .eq('year', year);

    if (error) throw error;

    const existing = (data || []).find((row: any) => isSameMonth(row.month, month));
    if (existing) return mapInvoiceFromSupabase(existing);

    // Cria fatura se n�o existir
    const payload = {
      card_id: cardId,
      cardid: cardId, // coluna legada
      month,
      year,
      due_date: dueDate,
      duedate: dueDate,
      status: 'pending',
      total_amount: 0,
      totalamount: 0,
      paid_amount: 0,
      paidamount: 0,
    };

    const { data: newInv, error: createError } = await supabaseClient
      .from(TABLE)
      .insert(payload)
      .select()
      .single();
    
    if (createError) throw createError;
    return mapInvoiceFromSupabase(newInv);
  } catch (err) {
    console.error('Erro ao buscar/criar fatura:', err);
    throw err;
  }
}

export async function listarFaturasPorCartoes(cardIds: string[]): Promise<Invoice[]> {
  if (!cardIds || !cardIds.length) return [];
  try {
    // 1. Buscar faturas relacionadas aos cart�es (coluna card_id ou cardid)
    const { data: invoicesData, error } = await supabaseClient
      .from(TABLE)
      .select('*')
      .or(`card_id.in.(${cardIds.join(',')}),cardid.in.(${cardIds.join(',')})`);
      
    if (error) throw error;
    
    const invoices = (invoicesData || []).map(mapInvoiceFromSupabase);
    const invoiceIds = invoices.map(i => i.id);

    if (invoiceIds.length === 0) return [];

    // 2. Buscar parcelas vinculadas �s faturas, com a transa��o pai e cart�o
    const { data: installmentsData, error: instError } = await supabaseClient
      .from('card_transaction_installments')
      .select(`
        *,
        transaction:card_transactions (
          *,
          card:cards (*)
        )
      `)
      .in('invoice_id', invoiceIds);

    if (instError) {
      console.error('Erro ao buscar parcelas das faturas:', instError);
      return invoices;
    }

    // 3. Agrupar por fatura gerando uma entrada por transa��o pai
    const transactionsByInvoice: Record<string, InvoiceTransactionDetail[]> = {};
    const totalsByInvoice: Record<string, number> = {};
    
    (installmentsData || []).forEach((inst: any) => {
      if (!inst.invoice_id) return;
      const parent = inst.transaction || {};
      const entry: InvoiceTransactionDetail = {
        transactionId: parent.id,
        description: parent.description || 'Sem descri��o',
        totalAmount: Number(parent.total_amount ?? inst.amount ?? 0),
        installmentCount: Number(parent.installment_count ?? 1),
        currentInstallmentNumber: Number(inst.installment_number ?? 1),
        currentInstallmentAmount: Number(inst.amount ?? 0),
        installmentAmount: Number(inst.amount ?? 0),
        purchaseDate: parent.purchase_date || inst.due_date || inst.created_at,
        category: parent.category,
        type: parent.type || (Number(parent.installment_count ?? 1) > 1 ? 'INSTALLMENT' : 'SINGLE'),
        recurringTransactionId: parent.recurring_transaction_id || undefined,
        card: parent.card ? {
          id: parent.card.id,
          nickname: parent.card.nickname,
          last4: parent.card.last4,
          brand: parent.card.brand,
        } : undefined,
      };

      if (!transactionsByInvoice[inst.invoice_id]) {
        transactionsByInvoice[inst.invoice_id] = [];
      }

      // Evita duplicar a mesma compra na mesma fatura
      const already = transactionsByInvoice[inst.invoice_id].find(t => t.transactionId === entry.transactionId);
      if (!already) {
        transactionsByInvoice[inst.invoice_id].push(entry);
      }

      totalsByInvoice[inst.invoice_id] = (totalsByInvoice[inst.invoice_id] || 0) + entry.currentInstallmentAmount;
    });

    // 4. Retornar faturas com lan�amentos agregados e total recalculado
    return await Promise.all(invoices.map(async inv => {
      const txs = transactionsByInvoice[inv.id] || [];
      const totalAmount = totalsByInvoice[inv.id] ?? inv.totalAmount ?? 0;

      // Atualiza o total na tabela para manter consist�ncia
      try {
        await supabaseClient
          .from(TABLE)
          .update({ total_amount: totalAmount, totalamount: totalAmount })
          .eq('id', inv.id);
      } catch (updateErr) {
        console.warn('N�o foi poss�vel atualizar total da fatura', inv.id, updateErr);
      }

      return {
        ...inv,
        totalAmount,
        transactions: txs as any,
      };
    }));

  } catch (err) {
    console.error('Erro ao listar faturas:', err);
    throw new Error('Nao foi possivel listar as faturas.');
  }
}
