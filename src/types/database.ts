export interface Database {
  public: {
    Tables: {
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
        };
        Insert: {
          user_id: string;
          category_id?: string | null;
          amount: number;
          description?: string | null;
          transaction_date: string;
          type: 'expense' | 'income';
        };
        Update: {
          category_id?: string | null;
          amount?: number;
          description?: string | null;
          transaction_date?: string;
          type?: 'expense' | 'income';
        };
      };
      monthly_budgets: { // Renomeado de shopping_budgets
        Row: {
          id: string;
          user_id: string;
          amount: number;
          month: number;
          year: number;
          category_limits: Record<string, number>; // Novo campo
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
      // shopping_items still references monthly_budgets via budget_id
    }
  }
}