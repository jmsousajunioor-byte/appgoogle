import { supabaseClient } from '../lib/supabaseClient';
import { Transaction, NewTransaction } from '../../types';

const TABLE = 'transactions';

export async function listarTransacoes(filters?: {
  userId?: string;
  cardId?: string;
  bankAccountId?: string;
}) {
  try {
    let query = supabaseClient
      .from(TABLE)
      .select('*')
      .order('tx_date', { ascending: false });

    if (filters?.userId) query = query.eq('user_id', filters.userId);
    if (filters?.cardId) query = query.eq('card_id', filters.cardId);
    if (filters?.bankAccountId)
      query = query.eq('bank_account_id', filters.bankAccountId);

    const { data, error } = await query;
    if (error) throw error;
    return data as Transaction[];
  } catch (err) {
    console.error('Erro ao listar transacoes:', err);
    throw new Error('Nao foi possivel listar as transacoes.');
  }
}

export async function buscarTransacaoPorId(id: string) {
  try {
    const { data, error } = await supabaseClient
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Transaction;
  } catch (err) {
    console.error(`Erro ao buscar transacao ${id}:`, err);
    throw new Error('Nao foi possivel localizar a transacao solicitada.');
  }
}

export async function criarTransacao(payload: NewTransaction & { user_id: string }) {
  try {
    const { data, error } = await supabaseClient
      .from(TABLE)
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data as Transaction;
  } catch (err) {
    console.error('Erro ao criar transacao:', err);
    throw new Error('Nao foi possivel criar a transacao.');
  }
}

export async function atualizarTransacao(
  id: string,
  updates: Partial<Omit<Transaction, 'id'>>,
) {
  try {
    const { data, error } = await supabaseClient
      .from(TABLE)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Transaction;
  } catch (err) {
    console.error(`Erro ao atualizar transacao ${id}:`, err);
    throw new Error('Nao foi possivel atualizar a transacao.');
  }
}

export async function deletarTransacao(id: string) {
  try {
    const { error } = await supabaseClient.from(TABLE).delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Erro ao deletar transacao ${id}:`, err);
    throw new Error('Nao foi possivel remover a transacao.');
  }
}
