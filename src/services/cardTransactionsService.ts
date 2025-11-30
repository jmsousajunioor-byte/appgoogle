/**
 * Service for managing aggregated card transactions.
 * Handles creation of parent transactions, installments and summary/detail queries.
 */

import { supabaseClient } from '@/lib/supabaseClient';
import type {
  CardTransaction,
  CardTransactionInstallment,
  TransactionSummary,
  TransactionDetails,
  NewCardTransaction,
  Card,
  Category,
  CardTransactionType,
} from '../../types';
import { mapTransactionSummaryFromSupabase } from './mappers';

/**
 * Calcula as datas de vencimento para cada parcela.
 * Baseado na data de compra, dia de fechamento e vencimento do cartão.
 */
export function calculateInstallmentDates(
  purchaseDate: string,
  card: Card,
  installmentCount: number,
): string[] {
  const dates: string[] = [];
  const purchase = new Date(purchaseDate);

  // Dia de fechamento (ou 7 dias antes do vencimento se não especificado)
  const closingDay =
    card.closingDay || Math.max(1, ((card.dueDateDay - 7 - 1 + 31) % 31) + 1);

  for (let i = 0; i < installmentCount; i++) {
    const installmentDate = new Date(purchase);
    installmentDate.setMonth(installmentDate.getMonth() + i);

    const purchaseDay = installmentDate.getDate();
    let referenceMonth = installmentDate.getMonth();
    let referenceYear = installmentDate.getFullYear();

    // Compras após o fechamento vão para a fatura do próximo mês
    if (purchaseDay > closingDay) {
      referenceMonth += 1;
    }

    if (referenceMonth > 11) {
      referenceMonth = referenceMonth % 12;
      referenceYear += 1;
    }

    const dueDate = new Date(referenceYear, referenceMonth, card.dueDateDay);
    dates.push(dueDate.toISOString());
  }

  return dates;
}

/**
 * Cria uma transação pai com suas parcelas de cartão de crédito.
 * Cria atomicamente a transação pai e todas as parcelas.
 */
export async function createCardTransaction(
  userId: string,
  cardId: string,
  transaction: NewCardTransaction,
  card: Card,
): Promise<{ transaction: CardTransaction; installments: CardTransactionInstallment[] } | null> {
  try {
    // 1. Criar transação pai
    const { data: parentData, error: parentError } = await supabaseClient
      .from('card_transactions')
      .insert([
        {
          user_id: userId,
          card_id: cardId,
          description: transaction.description,
          total_amount: transaction.totalAmount,
          installment_count: transaction.installmentCount,
          purchase_date: transaction.purchaseDate,
          category: transaction.category,
          type:
            transaction.type ||
            (transaction.installmentCount > 1 ? 'INSTALLMENT' : 'SINGLE'),
          recurring_transaction_id: transaction.recurringTransactionId || null,
        },
      ])
      .select()
      .single();

    if (parentError || !parentData) {
      console.error('Erro ao criar transação pai:', parentError);
      return null;
    }

    // 2. Calcular valores das parcelas (distribui centavos restantes na última)
    const installmentAmount =
      Math.floor((transaction.totalAmount / transaction.installmentCount) * 100) / 100;
    const remainder = +(
      transaction.totalAmount -
      installmentAmount * transaction.installmentCount
    ).toFixed(2);

    // 3. Calcular datas de vencimento
    const dueDates = calculateInstallmentDates(
      transaction.purchaseDate,
      card,
      transaction.installmentCount,
    );

    // 4. Criar parcelas
    const installmentsToCreate: Omit<CardTransactionInstallment, 'id' | 'createdAt'>[] = [];

    for (let i = 0; i < transaction.installmentCount; i++) {
      const installmentNumber = i + 1;
      const amount =
        installmentNumber === transaction.installmentCount
          ? installmentAmount + remainder
          : installmentAmount;

      installmentsToCreate.push({
        transactionId: parentData.id,
        installmentNumber,
        amount,
        dueDate: dueDates[i],
        invoiceId: undefined,
        status: 'pending',
      });
    }

    const { data: installmentsData, error: installmentsError } = await supabaseClient
      .from('card_transaction_installments')
      .insert(
        installmentsToCreate.map((inst) => ({
          transaction_id: inst.transactionId,
          installment_number: inst.installmentNumber,
          amount: inst.amount,
          due_date: inst.dueDate,
          status: inst.status,
        })),
      )
      .select();

    if (installmentsError || !installmentsData) {
      console.error('Erro ao criar parcelas:', installmentsError);

      // Tentar reverter criação da transação pai
      await supabaseClient.from('card_transactions').delete().eq('id', parentData.id);
      return null;
    }

    // 5. Mapear resultado
    const mappedTransaction: CardTransaction = {
      id: parentData.id,
      userId: parentData.user_id,
      cardId: parentData.card_id,
      description: parentData.description,
      totalAmount: Number(parentData.total_amount),
      installmentCount: parentData.installment_count,
      purchaseDate: parentData.purchase_date,
      category: parentData.category as Category,
      createdAt: parentData.created_at,
      type:
        (parentData.type as CardTransactionType) ||
        (transaction.installmentCount > 1 ? 'INSTALLMENT' : 'SINGLE'),
      recurringTransactionId: parentData.recurring_transaction_id || undefined,
      installmentAmount,
    };

    const mappedInstallments: CardTransactionInstallment[] = installmentsData.map(
      (inst: any): CardTransactionInstallment => ({
        id: inst.id,
        transactionId: inst.transaction_id,
        installmentNumber: inst.installment_number,
        amount: Number(inst.amount),
        dueDate: inst.due_date,
        invoiceId: inst.invoice_id,
        status: inst.status as 'pending' | 'paid' | 'cancelled',
        createdAt: inst.created_at,
      }),
    );

    try {
      await processTransactionInvoices(mappedTransaction, mappedInstallments, card);
    } catch (linkErr) {
      console.error('Erro ao vincular parcelas em faturas:', linkErr);
    }

    return {
      transaction: mappedTransaction,
      installments: mappedInstallments,
    };
  } catch (error) {
    console.error('Erro inesperado ao criar transação:', error);
    return null;
  }
}

/**
 * Lista transações agregadas (resumo) para um usuário.
 * Retorna uma transação por compra, não por parcela.
 */
export async function getTransactionSummaries(
  userId: string,
): Promise<TransactionSummary[]> {
  try {
    const { data, error } = await supabaseClient
      .from('card_transactions')
      .select(`
        id,
        description,
        total_amount,
        installment_count,
        purchase_date,
        category,
        type,
        recurring_transaction_id,
        card_id,
        card:cards (
          id,
          nickname,
          last4
        ),
        installments:card_transaction_installments (
          amount,
          due_date
        )
      `)
      .eq('user_id', userId)
      .order('purchase_date', { ascending: false });

    if (error || !data) {
      console.error('Erro ao listar transações:', error);
      return [];
    }

    return data.map((row: any) => mapTransactionSummaryFromSupabase(row));
  } catch (error) {
    console.error('Erro inesperado ao listar transações:', error);
    return [];
  }
}

/**
 * Obtém os detalhes completos de uma transação (pai + todas as parcelas).
 */
export async function getTransactionDetails(
  transactionId: string,
): Promise<TransactionDetails | null> {
  try {
    const { data, error } = await supabaseClient
      .from('card_transactions')
      .select(`
        *,
        card:cards (*),
        installments:card_transaction_installments (*)
      `)
      .eq('id', transactionId)
      .single();

    if (error || !data) {
      console.error('Erro ao buscar detalhes da transação:', error);
      return null;
    }

    const installments: CardTransactionInstallment[] = (data.installments || []).map(
      (inst: any): CardTransactionInstallment => ({
        id: inst.id,
        transactionId: inst.transaction_id,
        installmentNumber: inst.installment_number,
        amount: Number(inst.amount),
        dueDate: inst.due_date,
        invoiceId: inst.invoice_id,
        status: inst.status as 'pending' | 'paid' | 'cancelled',
        createdAt: inst.created_at,
      }),
    );

    const cardData = data.card as any;
    const card: Card = {
      id: cardData.id,
      nickname: cardData.nickname,
      brand: cardData.brand,
      last4: cardData.last4,
      holderName: cardData.holdername,
      expiration: cardData.expiration,
      limit: Number(cardData.limit),
      dueDateDay:
        cardData.due_date_day ?? cardData.duedateday ?? cardData.dueDateDay,
      closingDay:
        cardData.closing_day ?? cardData.closingday ?? cardData.closingDay,
      gradient: cardData.gradient,
    };

    const details: TransactionDetails = {
      id: data.id,
      userId: data.user_id,
      cardId: data.card_id,
      description: data.description,
      totalAmount: Number(data.total_amount),
      installmentCount: data.installment_count,
      purchaseDate: data.purchase_date,
      category: data.category as Category,
      createdAt: data.created_at,
      type:
        (data.type as CardTransactionType) ||
        (data.installment_count > 1 ? 'INSTALLMENT' : 'SINGLE'),
      recurringTransactionId: data.recurring_transaction_id || undefined,
      installmentAmount:
        installments.length > 0
          ? installments[0].amount
          : Number(data.total_amount) /
            Math.max(1, data.installment_count || 1),
      installments,
      card,
    };

    return details;
  } catch (error) {
    console.error('Erro inesperado ao buscar detalhes da transação:', error);
    return null;
  }
}

/**
 * Vincula parcelas a uma fatura específica.
 */
export async function linkInstallmentsToInvoice(
  installmentIds: string[],
  invoiceId: string,
): Promise<boolean> {
  try {
    const { error } = await supabaseClient
      .from('card_transaction_installments')
      .update({ invoice_id: invoiceId })
      .in('id', installmentIds);

    if (error) {
      console.error('Erro ao vincular parcelas à fatura:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro inesperado ao vincular parcelas à fatura:', error);
    return false;
  }
}

/**
 * Atualiza o status de uma parcela.
 */
export async function updateInstallmentStatus(
  installmentId: string,
  status: 'pending' | 'paid' | 'cancelled',
): Promise<boolean> {
  try {
    const { error } = await supabaseClient
      .from('card_transaction_installments')
      .update({ status })
      .eq('id', installmentId);

    if (error) {
      console.error('Erro ao atualizar status da parcela:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro inesperado ao atualizar parcela:', error);
    return false;
  }
}

/**
 * Processa as faturas para uma nova transação, criando-as se necessário e vinculando as parcelas.
 */
export async function processTransactionInvoices(
  transaction: CardTransaction,
  installments: CardTransactionInstallment[],
  card: Card,
): Promise<void> {
  // Import dinâmico para evitar possíveis problemas de dependência circular
  const faturasService = await import('./faturasService');

  for (const inst of installments) {
    const dueDate = new Date(inst.dueDate);
    const month = dueDate.getMonth() + 1; // 1-12
    const year = dueDate.getFullYear();

    try {
      const invoice = await faturasService.getOrCreateInvoice(
        card.id,
        month,
        year,
        inst.dueDate,
      );

      if (invoice && invoice.id) {
        await linkInstallmentsToInvoice([inst.id], invoice.id);

        const newTotal = (invoice.totalAmount || 0) + inst.amount;
        await supabaseClient
          .from('invoices')
          .update({ total_amount: newTotal, totalamount: newTotal })
          .eq('id', invoice.id);
      }
    } catch (err) {
      console.error(`Falha ao vincular parcela ${inst.id} à fatura`, err);
    }
  }
}

