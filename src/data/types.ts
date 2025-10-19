export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  icon: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string; // ISO date string (YYYY-MM-DD)
  categoryId: string;
  accountId: string;
}