import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/types/database';
import { getOrCreateBudget } from './shopping';

export type MonthlyBudget = Database['public']['Tables']['monthly_budgets']['Row'];
export type CategoryLimit = Record<string, number>; // { category_id: limit_amount }

/**
 * Fetches the monthly budget, including category limits.
 */
export async function getMonthlyBudget(userId: string, month: number, year: number): Promise<MonthlyBudget> {
  // Reuses getOrCreateBudget from shopping.ts, which now targets monthly_budgets
  return getOrCreateBudget(userId, month, year);
}

/**
 * Updates the category limits for a specific monthly budget.
 */
export async function updateCategoryLimits(budgetId: string, limits: CategoryLimit): Promise<MonthlyBudget> {
  const { data, error } = await supabase
    .from('monthly_budgets')
    .update({ category_limits: limits, updated_at: new Date().toISOString() })
    .eq('id', budgetId)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating category limits: ${error.message}`);
  }
  return data as MonthlyBudget;
}