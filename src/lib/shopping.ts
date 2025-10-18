import { supabase } from '@/integrations/supabase/client';

export interface ShoppingBudget {
  id: string;
  user_id: string;
  amount: number;
  month: number;
  year: number;
  created_at: string;
  updated_at: string;
}

export interface ShoppingItem {
  id: string;
  user_id: string;
  budget_id: string;
  name: string;
  price: number;
  purchased: boolean;
  created_at: string;
}

// Get or create a budget for the current month
export const getOrCreateBudget = async (userId: string, month: number, year: number): Promise<ShoppingBudget> => {
  // First, try to get the budget
  let { data: budget, error } = await supabase
    .from('shopping_budgets')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)
    .eq('year', year)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
    throw error;
  }

  // If no budget is found, create one
  if (!budget) {
    const { data: newBudget, error: insertError } = await supabase
      .from('shopping_budgets')
      .insert({ user_id: userId, month, year, amount: 0 })
      .select()
      .single();
    
    if (insertError) throw insertError;
    budget = newBudget;
  }

  return budget;
};

// Update budget amount
export const updateBudgetAmount = async (budgetId: string, amount: number): Promise<ShoppingBudget> => {
  const { data, error } = await supabase
    .from('shopping_budgets')
    .update({ amount, updated_at: new Date().toISOString() })
    .eq('id', budgetId)
    .select()
    .single();

  if (error) throw error;
  return data;
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
  return data;
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
  return data;
};

// Delete a shopping item
export const deleteShoppingItem = async (itemId: string): Promise<void> => {
  const { error } = await supabase
    .from('shopping_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
};