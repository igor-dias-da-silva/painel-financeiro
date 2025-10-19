export interface Database {
  public: {
    Tables: {
      // ... outras tabelas aqui ...
      goals: { // Adicionando a nova tabela
        Row: {
          id: string;
          user_id: string;
          name: string;
          target_amount: number;
          current_amount: number;
          due_date: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          target_amount: number;
          current_amount?: number;
          due_date?: string | null;
        };
        Update: {
          name?: string;
          target_amount?: number;
          current_amount?: number;
          due_date?: string | null;
        };
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: 'expense' | 'income';
          color: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          type: 'expense' | 'income';
          color?: string | null;
        };
        Update: {
          name?: string;
          type?: 'expense' | 'income';
          color?: string | null;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          amount: number;
          description: string | null;
          transaction_date: string;
          type: 'expense' | 'income';
          created_at: string;
          account_id: string | null; // Adicionado account_id
        };
        Insert: {
          user_id: string;
          category_id?: string | null;
          amount: number;
          description?: string | null;
          transaction_date: string;
          type: 'expense' | 'income';
          account_id?: string | null; // Adicionado account_id
        };
        Update: {
          category_id?: string | null;
          amount?: number;
          description?: string | null;
          transaction_date?: string;
          type?: 'expense' | 'income';
          account_id?: string | null; // Adicionado account_id
        };
      };
      monthly_budgets: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          month: number;
          year: number;
          category_limits: Record<string, number>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          amount?: number;
          month: number;
          year: number;
          category_limits?: Record<string, number>;
        };
        Update: {
          amount?: number;
          category_limits?: Record<string, number>;
          updated_at?: string;
        };
      };
      shopping_items: {
        Row: {
          id: string;
          user_id: string;
          budget_id: string;
          name: string;
          price: number;
          purchased: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          budget_id: string;
          name: string;
          price: number;
          purchased?: boolean;
        };
        Update: {
          name?: string;
          price?: number;
          purchased?: boolean;
        };
      };
      accounts: { // Adicionado para corrigir o erro 1
        Row: {
          id: string;
          user_id: string;
          name: string;
          balance: number;
          type: 'checking' | 'savings' | 'cash';
          created_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          balance?: number;
          type: 'checking' | 'savings' | 'cash';
        };
        Update: {
          name?: string;
          balance?: number;
          type?: 'checking' | 'savings' | 'cash';
        };
      };
    };
  };
}