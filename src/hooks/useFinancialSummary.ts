"use client";

import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { getTransactions, getCategories, Transaction, Category } from '@/lib/transactions';
import { useMemo } from 'react';

interface ExpenseDistribution {
  name: string;
  value: number;
  color: string;
}

interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  expenseDistribution: ExpenseDistribution[];
  isLoading: boolean;
}

export const useFinancialSummary = (): FinancialSummary => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const userId = user?.id;

  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery<Transaction[]>({
    queryKey: ['transactions', userId],
    queryFn: () => getTransactions(userId!),
    enabled: !!userId,
  });

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['categories', userId],
    queryFn: () => getCategories(userId!),
    enabled: !!userId,
  });

  const summary = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const netBalance = totalIncome - totalExpense;

    const expenseMap = new Map<string, number>();
    const expenseCategories = categories.filter(c => c.type === 'expense');

    transactions
      .filter(t => t.type === 'expense' && t.category_id)
      .forEach(t => {
        const categoryId = t.category_id!;
        const currentTotal = expenseMap.get(categoryId) || 0;
        expenseMap.set(categoryId, currentTotal + Number(t.amount));
      });

    const expenseDistribution: ExpenseDistribution[] = Array.from(expenseMap.entries()).map(([categoryId, value]) => {
      const category = expenseCategories.find(c => c.id === categoryId);
      return {
        name: category?.name || 'Outros',
        value: value,
        color: category?.color || '#6B7280', // Cor padrão cinza
      };
    }).filter(item => item.value > 0);

    return {
      totalIncome,
      totalExpense,
      netBalance,
      expenseDistribution,
    };
  }, [transactions, categories]);

  return {
    ...summary,
    isLoading: isAuthLoading || isLoadingTransactions || isLoadingCategories,
  };
};