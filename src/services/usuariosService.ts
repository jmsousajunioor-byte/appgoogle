import { supabaseClient } from '../lib/supabaseClient';
import { User } from '../../types';

const TABLE = 'users';

export async function listarUsuarios() {
  try {
    const { data, error } = await supabaseClient
      .from(TABLE)
      .select('*')
      .order('name');
    if (error) throw error;
    return data as User[];
  } catch (err) {
    console.error('Erro ao listar usuarios:', err);
    throw new Error('Nao foi possivel listar os usuarios.');
  }
}

export async function buscarUsuarioPorId(id: string) {
  try {
    const { data, error } = await supabaseClient
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as User;
  } catch (err) {
    console.error(`Erro ao buscar usuario ${id}:`, err);
    throw new Error('Nao foi possivel localizar o usuario solicitado.');
  }
}

export async function criarUsuario(
  payload: Omit<User, 'membership'> & { membership?: User['membership'] },
) {
  try {
    const { data, error } = await supabaseClient
      .from(TABLE)
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data as User;
  } catch (err) {
    console.error('Erro ao criar usuario:', err);
    throw new Error('Nao foi possivel criar o usuario.');
  }
}

export async function atualizarUsuario(
  id: string,
  updates: Partial<Omit<User, 'id'>>,
) {
  try {
    const { data, error } = await supabaseClient
      .from(TABLE)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as User;
  } catch (err) {
    console.error(`Erro ao atualizar usuario ${id}:`, err);
    throw new Error('Nao foi possivel atualizar o usuario.');
  }
}

export async function deletarUsuario(id: string) {
  try {
    const { error } = await supabaseClient.from(TABLE).delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Erro ao deletar usuario ${id}:`, err);
    throw new Error('Nao foi possivel remover o usuario.');
  }
}
