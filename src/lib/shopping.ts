import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/types/database';

export type ShoppingBudget = Database['public']['Tables']['monthly_budgets']['Row'];
export type ShoppingItem = Database['public']['Tables']['shopping_items']['Row'];

// Get or create a budget for the current month
export const getOrCreateBudget = async (userId: string, month: number, year: number): Promise<ShoppingBudget> => {
  // First, try to get the budget
  let { data: budget, error } = await supabase
    .from('monthly_budgets') // Renomeado
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)
    .eq('year', year)
    .single();

  // Trata erros de "não encontrado". O PostgREST pode retornar 404 (PGRST116) ou, em alguns casos, 406.
  const isNotFoundError = error && (error.code === 'PGRST116' || error.status === 406);

  if (error && !isNotFoundError) { 
    throw error;
  }

  // If no budget is found (data is null or error is a not found error), create one
  if (!budget || isNotFoundError) {
    const { data: newBudget, error: insertError } = await supabase
      .from('monthly_budgets') // Renomeado
      .insert({ user_id: userId, month, year, amount: 0 })
      .select()
      .single();
    
    if (insertError) {
      console.error("Error inserting new budget:", insertError);
      throw insertError;
    }
    budget = newBudget;
  }

  return budget as ShoppingBudget;
};

// Update budget amount (now general monthly budget amount)
export const updateBudgetAmount = async (budgetId: string, amount: number): Promise<ShoppingBudget> => {
  const { data, error } = await supabase
    .from('monthly_budgets') // Renomeado
    .update({ amount, updated_at: new Date().toISOString() })
    .eq('id', budgetId)
    .select()
    .single();

  if (error) throw error;
  return data as ShoppingBudget;
};

// Get shopping items for a budget
export const getShoppingItems = async (budgetId: string): Promise<ShoppingItem[]> => {
  const { data, error } = await supabase
    .from('shopping_items')
    .select('*')
    .eq('budget_id', budgetId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

// Add a new shopping item
export const addShoppingItem = async (item: Omit<ShoppingItem, 'id' | 'created_at'>): Promise<ShoppingItem> => {
  const { data, error } = await supabase
    .from('shopping_items')
    .insert(item)
    .select()
    .single();

  if (error) throw error;
  return data as ShoppingItem;
};

// Update a shopping item
export const updateShoppingItem = async (itemId: string, updates: Partial<ShoppingItem>): Promise<ShoppingItem> => {
  const { data, error } = await supabase
    .from('shopping_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return data as ShoppingItem;
};

// Delete a shopping item
export const deleteShoppingItem = async (itemId: string): Promise<void> => {
  const { error } = await supabase
    .from('shopping_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
};