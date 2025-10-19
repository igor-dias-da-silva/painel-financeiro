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
      // boards, columns, and cards tables removed
    }
  }
}