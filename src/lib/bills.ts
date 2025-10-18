import { supabase } from '@/integrations/supabase/client';

export interface Bill {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  due_date: string; // Format: YYYY-MM-DD
  is_paid: boolean;
  created_at: string;
}

// Get all bills for a user
export const getBills = async (userId: string): Promise<Bill[]> => {
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true });

  if (error) throw error;
  return data || [];
};

// Add a new bill
export const addBill = async (bill: Omit<Bill, 'id' | 'created_at'>): Promise<Bill> => {
  const { data, error } = await supabase
    .from('bills')
    .insert(bill)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update a bill (e.g., mark as paid)
export const updateBill = async (billId: string, updates: Partial<Bill>): Promise<Bill> => {
  const { data, error } = await supabase
    .from('bills')
    .update(updates)
    .eq('id', billId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete a bill
export const deleteBill = async (billId: string): Promise<void> => {
  const { error } = await supabase
    .from('bills')
    .delete()
    .eq('id', billId);

  if (error) throw error;
};