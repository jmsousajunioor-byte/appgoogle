import { supabaseClient } from '../lib/supabaseClient';
import { RecurringTransaction, CardTransaction, Category } from '../../types';
import { createCardTransaction } from './cardTransactionsService';
import { mapCardFromSupabase } from './mappers';

export interface NewRecurringTransaction {
  description: string;
  amount: number;
  category: Category | string;
  cardId: string;
  frequency: 'weekly' | 'monthly' | 'yearly';
  dayOfPeriod: number;
  startDate: string;
  terminationType?: 'never' | 'on_date' | 'after_occurrences';
  terminationDate?: string;
  maxOccurrences?: number;
}

function mapRecurringFromSupabase(row: any): RecurringTransaction {
  return {
    id: row.id,
    description: row.description,
    amount: Number(row.amount),
    category: row.category,
    cardId: row.card_id || undefined,
    startDate: row.start_date,
    endDate: row.end_date || undefined,
    frequency: row.frequency,
    dayOfPeriod: Number(row.day_of_period),
    status: row.status || (row.active === false ? 'paused' : 'active'),
    terminationType: row.termination_type || 'never',
    terminationDate: row.termination_date || row.end_date || undefined,
    maxOccurrences: row.max_occurrences || undefined,
    occurrencesGenerated: row.occurrences_generated || 0,
    lastGeneratedDate: row.last_generated_date || undefined,
    lastRunMonth: row.last_generated_date || undefined,
  };
}

export async function createRecurringTransaction(userId: string, data: NewRecurringTransaction) {
  try {
    const { data: created, error } = await supabaseClient
      .from('recurring_transactions')
      .insert([{
        user_id: userId,
        card_id: data.cardId,
        description: data.description,
        amount: data.amount,
        category: data.category,
        start_date: data.startDate,
        end_date: data.terminationType === 'on_date' ? data.terminationDate : null,
        frequency: data.frequency,
        day_of_period: data.dayOfPeriod,
        status: 'active',
        active: true,
        termination_type: data.terminationType ?? 'never',
        termination_date: data.terminationDate ?? null,
        max_occurrences: data.maxOccurrences ?? null,
        occurrences_generated: 0,
      }])
      .select()
      .single();

    if (error) throw error;
    return mapRecurringFromSupabase(created);
  } catch (error) {
    console.error('Error creating recurring transaction:', error);
    return null;
  }
}

export async function getRecurringTransactions(userId: string, includeInactive = false) {
  try {
    let query = supabaseClient
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', userId);

    if (!includeInactive) {
      query = query.eq('status', 'active').eq('active', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapRecurringFromSupabase);
  } catch (error) {
    console.error('Error fetching recurring transactions:', error);
    return [];
  }
}

export async function updateRecurringStatus(id: string, status: RecurringTransaction['status']) {
  try {
    const { data, error } = await supabaseClient
      .from('recurring_transactions')
      .update({ status, active: status === 'active' })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapRecurringFromSupabase(data);
  } catch (error) {
    console.error('Erro ao atualizar status de recorr�ncia:', error);
    return null;
  }
}

const alignFirstOccurrence = (start: Date, rec: RecurringTransaction) => {
  const aligned = new Date(start);
  aligned.setHours(12, 0, 0, 0);

  if (rec.frequency === 'weekly') {
    const diff = ((rec.dayOfPeriod - aligned.getDay()) + 7) % 7;
    aligned.setDate(aligned.getDate() + diff);
  } else if (rec.frequency === 'monthly') {
    aligned.setDate(rec.dayOfPeriod);
    if (aligned < start) {
      aligned.setMonth(aligned.getMonth() + 1);
      aligned.setDate(rec.dayOfPeriod);
    }
  } else {
    aligned.setDate(rec.dayOfPeriod);
    if (aligned < start) {
      aligned.setFullYear(aligned.getFullYear() + 1);
      aligned.setDate(rec.dayOfPeriod);
    }
  }

  return aligned;
};

const addInterval = (base: Date, rec: RecurringTransaction) => {
  const next = new Date(base);
  next.setHours(12, 0, 0, 0);
  if (rec.frequency === 'weekly') {
    next.setDate(next.getDate() + 7);
    const diff = ((rec.dayOfPeriod - next.getDay()) + 7) % 7;
    next.setDate(next.getDate() + diff);
  } else if (rec.frequency === 'monthly') {
    next.setMonth(next.getMonth() + 1);
    next.setDate(rec.dayOfPeriod);
  } else {
    next.setFullYear(next.getFullYear() + 1);
    next.setDate(rec.dayOfPeriod);
  }
  return next;
};

export async function processRecurringTransactions(userId: string): Promise<CardTransaction[]> {
  const recurrences = await getRecurringTransactions(userId, true);
  const today = new Date();
  const generatedTransactions: CardTransaction[] = [];

  for (const rec of recurrences) {
    if (rec.status !== 'active') continue;

    if (rec.terminationType === 'on_date' && rec.terminationDate) {
      const end = new Date(rec.terminationDate);
      if (end < today) continue;
    }

    if (!rec.cardId) continue;

    const { data: cardRow } = await supabaseClient.from('cards').select('*').eq('id', rec.cardId).single();
    if (!cardRow) continue;
    const card = mapCardFromSupabase(cardRow);

    const { data: lastTxData } = await supabaseClient
      .from('card_transactions')
      .select('purchase_date')
      .eq('recurring_transaction_id', rec.id)
      .order('purchase_date', { ascending: false })
      .limit(1);

    const lastDate = lastTxData && lastTxData.length ? new Date(lastTxData[0].purchase_date) : null;

    const { count: existingCount } = await supabaseClient
      .from('card_transactions')
      .select('id', { count: 'exact', head: true })
      .eq('recurring_transaction_id', rec.id);

    let occurrencesGenerated = existingCount ?? rec.occurrencesGenerated ?? 0;
    if (rec.terminationType === 'after_occurrences' && rec.maxOccurrences && occurrencesGenerated >= rec.maxOccurrences) {
      continue;
    }

    let nextDate = lastDate ? addInterval(lastDate, rec) : alignFirstOccurrence(new Date(rec.startDate), rec);

    // Gera ocorr�ncias at� a data atual
    while (nextDate <= today) {
      if (rec.terminationType === 'after_occurrences' && rec.maxOccurrences && occurrencesGenerated >= rec.maxOccurrences) {
        break;
      }

      const created = await createCardTransaction(userId, rec.cardId, {
        description: `${rec.description} (Recorrente)`,
        totalAmount: rec.amount,
        installmentCount: 1,
        purchaseDate: nextDate.toISOString(),
        category: rec.category as any,
        cardId: rec.cardId,
        type: 'RECURRING',
        recurringTransactionId: rec.id,
      }, card);

      if (created) {
        generatedTransactions.push(created.transaction);
        occurrencesGenerated += 1;
        await supabaseClient
          .from('recurring_transactions')
          .update({
            last_generated_date: nextDate.toISOString(),
            occurrences_generated: occurrencesGenerated,
          })
          .eq('id', rec.id);
      } else {
        break;
      }

      nextDate = addInterval(nextDate, rec);
    }
  }

  return generatedTransactions;
}
