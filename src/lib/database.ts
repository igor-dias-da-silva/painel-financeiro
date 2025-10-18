import { supabase } from '@/integrations/supabase/client'

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  bio?: string | null;
  default_priority?: 'low' | 'medium' | 'high' | 'urgent';
  priority_colors?: Record<string, string> | null;
  updated_at: string;
}

// Profiles
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
    throw error;
  }
  return data || null;
};

export const updateProfile = async (userId: string, updates: Partial<Omit<Profile, 'id' | 'updated_at'>>): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};