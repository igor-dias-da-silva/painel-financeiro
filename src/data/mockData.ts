import { Category, Account, Transaction } from './types';

const MOCK_USER_ID = 'mock-user-id-123';
const MOCK_CREATED_AT = new Date().toISOString();

export const mockCategories: Category[] = [
  { id: '1', user_id: MOCK_USER_ID, name: 'Alimentação', type: 'expense', color: '#FF6384', created_at: MOCK_CREATED_AT },
  { id: '2', user_id: MOCK_USER_ID, name: 'Salário', type: 'income', color: '#36A2EB', created_at: MOCK_CREATED_AT },
  { id: '3', user_id: MOCK_USER_ID, name: 'Transporte', type: 'expense', color: '#FFCE56', created_at: MOCK_CREATED_AT },
  { id: '4', user_id: MOCK_USER_ID, name: 'Investimentos', type: 'income', color: '#4BC0C0', created_at: MOCK_CREATED_AT },
  { id: '5', user_id: MOCK_USER_ID, name: 'Lazer', type: 'expense', color: '#9966FF', created_at: MOCK_CREATED_AT },
];

export const mockAccounts: Account[] = [
  { id: '1', user_id: MOCK_USER_ID, name: 'Conta Corrente', balance: 1500.50, type: 'checking', created_at: MOCK_CREATED_AT },
  { id: '2', user_id: MOCK_USER_ID, name: 'Poupança', balance: 5000.00, type: 'savings', created_at: MOCK_CREATED_AT },
  { id: '3', user_id: MOCK_USER_ID, name: 'Cartão de Crédito', balance: -850.25, type: 'checking', created_at: MOCK_CREATED_AT },
];

export const mockTransactions: Transaction[] = [
  {
    id: 't1',
    user_id: MOCK_USER_ID,
    description: 'Almoço no restaurante',
    amount: 45.00,
    type: 'expense',
    transaction_date: '2024-07-15',
    category_id: '1',
    account_id: '1',
    created_at: MOCK_CREATED_AT,
  },
  {
    id: 't2',
    user_id: MOCK_USER_ID,
    description: 'Salário mensal',
    amount: 3500.00,
    type: 'income',
    transaction_date: '2024-07-10',
    category_id: '2',
    account_id: '1',
    created_at: MOCK_CREATED_AT,
  },
  {
    id: 't3',
    user_id: MOCK_USER_ID,
    description: 'Gasolina',
    amount: 150.00,
    type: 'expense',
    transaction_date: '2024-07-12',
    category_id: '3',
    account_id: '3',
    created_at: MOCK_CREATED_AT,
  },
  {
    id: 't4',
    user_id: MOCK_USER_ID,
    description: 'Cinema e pipoca',
    amount: 80.00,
    type: 'expense',
    transaction_date: '2024-07-14',
    category_id: '5',
    account_id: '1',
    created_at: MOCK_CREATED_AT,
  },
];