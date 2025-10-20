import { supabase } from '@/integrations/supabase/client'

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  bio?: string | null;
  phone_number?: string | null; // Novo campo
  default_priority?: 'low' | 'medium' | 'high' | 'urgent';
  priority_colors?: Record<string, string> | null;
  subscription_plan?: 'free' | 'premium';
  subscription_status?: 'active' | 'cancelled' | 'past_due';
  subscription_ends_at?: string | null;
  updated_at: string;
  role: 'user' | 'admin'; // Adicionado o campo role
}

// Profiles
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  // PGRST116 (404) ou 406 (Not Acceptable) são tratados como "não encontrado"
  const isNotFoundError = error && (error.code === 'PGRST116' || error.status === 406);

  if (error && !isNotFoundError) { 
    console.error("Erro ao buscar perfil:", error);
    throw error;
  }
  return data || null;
};

export const getAllProfiles = async (): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }
  return data || [];
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