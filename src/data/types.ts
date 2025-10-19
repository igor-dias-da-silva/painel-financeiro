import { Database } from '@/types/database';

// Tipos base do Supabase
type Tables = Database['public']['Tables'];

// --- Tipos de Contas ---
export type Account = Tables['accounts']['Row'];
export type AccountInsert = Tables['accounts']['Insert'];

// --- Tipos de Categorias ---
export type Category = Tables['categories']['Row'];
export type CategoryInsert = Tables['categories']['Insert'];

// --- Tipos de Transações ---
export type Transaction = Tables['transactions']['Row'];
export type TransactionInsert = Omit<Tables['transactions']['Insert'], 'user_id' | 'created_at'>;
export type TransactionUpdate = Omit<Tables['transactions']['Update'], 'user_id' | 'created_at'>;

// --- Tipos de Orçamento ---
export type MonthlyBudget = Tables['monthly_budgets']['Row'];
export type ShoppingItem = Tables['shopping_items']['Row'];