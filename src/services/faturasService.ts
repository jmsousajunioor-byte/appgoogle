import { supabaseClient } from '../lib/supabaseClient';
import { Invoice } from '../../types';

const TABLE = 'invoices';

export async function listarFaturasPorCartoes(cardIds: string[]): Promise<Invoice[]> {
  if (!cardIds || !cardIds.length) return [];
  try {
    const { data, error } = await supabaseClient
      .from(TABLE)
      .select('*')
      .in('cardid', cardIds);
    if (error) throw error;
    return data as Invoice[];
  } catch (err) {
    console.error('Erro ao listar faturas:', err);
    throw new Error('Nao foi possivel listar as faturas.');
  }
}
