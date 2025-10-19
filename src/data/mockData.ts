import { Category, Account, Transaction } from './types';

export const mockCategories: Category[] = [
  { id: '1', name: 'Alimentação', type: 'expense', icon: 'ForkAndKnife' },
  { id: '2', name: 'Salário', type: 'income', icon: 'DollarSign' },
  { id: '3', name: 'Transporte', type: 'expense', icon: 'Car' },
  { id: '4', name: 'Investimentos', type: 'income', icon: 'TrendingUp' },
  { id: '5', name: 'Lazer', type: 'expense', icon: 'Gamepad' },
];

export const mockAccounts: Account[] = [
  { id: '1', name: 'Conta Corrente', balance: 1500.50, icon: 'Banknote' },
  { id: '2', name: 'Poupança', balance: 5000.00, icon: 'Wallet' },
  { id: '3', name: 'Cartão de Crédito', balance: -850.25, icon: 'CreditCard' },
];

export const mockTransactions: Transaction[] = [
  {
    id: 't1',
    description: 'Supermercado',
    amount: 120.50,
    type: 'expense',
    date: '2024-07-15',
    categoryId: '1',
    accountId: '1',
  },
  {
    id: 't2',
    description: 'Pagamento Salário',
    amount: 3500.00,
    type: 'income',
    date: '2024-07-10',
    categoryId: '2',
    accountId: '1',
  },
  {
    id: 't3',
    description: 'Gasolina',
    amount: 50.00,
    type: 'expense',
    date: '2024-07-12',
    categoryId: '3',
    accountId: '2',
  },
  {
    id: 't4',
    description: 'Cinema',
    amount: 45.00,
    type: 'expense',
    date: '2024-07-14',
    categoryId: '5',
    accountId: '1',
  },
];