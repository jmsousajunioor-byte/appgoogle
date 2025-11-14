import { supabaseClient } from '../lib/supabaseClient';
import { Card, NewCard } from '../../types';

const TABLE = 'cards';

export async function listarCartoes(userId?: string) {
  try {
    let query = supabaseClient.from(TABLE).select('*').order('nickname');
    if (userId) query = query.eq('user_id', userId);

    const { data, error } = await query;
    if (error) throw error;
    return data as Card[];
  } catch (err) {
    console.error('Erro ao listar cartoes:', err);
    throw new Error('Nao foi possivel listar os cartoes.');
  }
}

export async function buscarCartaoPorId(id: string) {
  try {
    const { data, error } = await supabaseClient
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Card;
  } catch (err) {
    console.error(`Erro ao buscar cartao ${id}:`, err);
    throw new Error('Nao foi possivel localizar o cartao informado.');
  }
}

export async function criarCartao(payload: NewCard & { user_id: string }) {
  try {
    const { data, error } = await supabaseClient
      .from(TABLE)
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data as Card;
  } catch (err) {
    console.error('Erro ao criar cartao:', err);
    throw new Error('Nao foi possivel criar o cartao.');
  }
}

export async function atualizarCartao(
  id: string,
  updates: Partial<Omit<Card, 'id'>>,
) {
  try {
    const { data, error } = await supabaseClient
      .from(TABLE)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Card;
  } catch (err) {
    console.error(`Erro ao atualizar cartao ${id}:`, err);
    throw new Error('Nao foi possivel atualizar o cartao.');
  }
}

export async function deletarCartao(id: string) {
  try {
    const { error } = await supabaseClient.from(TABLE).delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Erro ao deletar cartao ${id}:`, err);
    throw new Error('Nao foi possivel remover o cartao.');
  }
}
