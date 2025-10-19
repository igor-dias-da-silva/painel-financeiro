import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/types/database';

export type Transaction = Database['public']['Tables']['transactions']['Row'] & {
  date: string; // Adicionando 'date' para compatibilidade com o front-end
  categoryId: string; // Adicionando 'categoryId' para compatibilidade
  accountId: string; // Adicionando 'accountId' para compatibilidade
};
export type Category = Database['public']['Tables']['categories']['Row'] & {
  icon: string; // Adicionando 'icon' para compatibilidade
};
export type Account = Database['public']['Tables']['accounts']['Row'];

/**
 * Busca todas as transações de um usuário.
 */
export async function getTransactions(userId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('transaction_date', { ascending: false });

  if (error) throw error;

  // Mapeia para o tipo Transaction esperado pelo front-end
  return data.map(t => ({
    ...t,
    date: t.transaction_date,
    categoryId: t.category_id || '',
    accountId: t.account_id || '',
  })) as Transaction[];
}

/**
 * Busca todas as categorias de um usuário.
 */
export async function getCategories(userId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) throw error;

  // Mapeia para o tipo Category esperado pelo front-end
  return data.map(c => ({
    ...c,
    icon: c.color || 'DollarSign', // Usando 'color' como fallback para 'icon'
  })) as Category[];
}

/**
 * Busca todas as contas de um usuário.
 */
export async function getAccounts(userId: string): Promise<Account[]> {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) throw error;
  return data as Account[];
}