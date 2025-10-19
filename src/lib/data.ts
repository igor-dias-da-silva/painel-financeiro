import { supabase } from '@/integrations/supabase/client';
import { Account, Category, CategoryInsert, Transaction, TransactionInsert, AccountInsert } from '@/data/types';

// --- Funções de Contas (Accounts) ---

export async function getAccounts(): Promise<Account[]> {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching accounts:', error);
    throw error;
  }
  return data as Account[];
}

export async function insertAccount(account: AccountInsert): Promise<Account> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated for insert operation.");

  const accountWithUser = {
    ...account,
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from('accounts')
    .insert(accountWithUser)
    .select()
    .single();

  if (error) {
    console.error('Error inserting account:', error);
    throw error;
  }
  return data as Account;
}

// --- Funções de Categorias (Categories) ---

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
  return data as Category[];
}

export async function insertCategory(category: CategoryInsert): Promise<Category> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated for insert operation.");

  const categoryWithUser = {
    ...category,
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from('categories')
    .insert(categoryWithUser)
    .select()
    .single();

  if (error) {
    console.error('Error inserting category:', error);
    throw error;
  }
  return data as Category;
}

export async function updateCategory(id: string, updates: Partial<CategoryInsert>): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating category:', error);
    throw error;
  }
  return data as Category;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

// --- Funções de Transações (Transactions) ---

export async function getTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('transaction_date', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
  return data as Transaction[];
}

export async function insertTransaction(transaction: TransactionInsert): Promise<Transaction> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated for insert operation.");

  const transactionWithUser = {
    ...transaction,
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from('transactions')
    .insert(transactionWithUser)
    .select()
    .single();

  if (error) {
    console.error('Error inserting transaction:', error);
    throw error;
  }
  return data as Transaction;
}

export async function updateTransaction(id: string, updates: Partial<TransactionInsert>): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
  return data as Transaction;
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
}

// --- Funções de Exclusão em Massa ---

/**
 * Exclui todos os dados financeiros (transações, contas, categorias, orçamentos, itens de compra, contas a pagar)
 * associados ao usuário logado.
 */
export async function deleteAllFinancialData(userId: string): Promise<void> {
  const tablesToDelete = [
    'transactions',
    'accounts',
    'categories',
    'monthly_budgets',
    'shopping_items',
    'bills',
  ];

  const deletePromises = tablesToDelete.map(tableName => 
    supabase
      .from(tableName)
      .delete()
      .eq('user_id', userId)
  );

  const results = await Promise.all(deletePromises);

  for (const result of results) {
    if (result.error) {
      console.error(`Error deleting data from table ${result.error.details}:`, result.error);
      throw new Error(`Falha ao excluir dados: ${result.error.message}`);
    }
  }
}