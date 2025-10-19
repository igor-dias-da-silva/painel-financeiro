"use client";

import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { getTransactions, getCategories, Transaction, Category } from '@/lib/transactions';
import { useMemo } from 'react';
import { format } from 'date-fns';

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
  transactions: Transaction[];
  isLoading: boolean;
}

/**
 * Hook para buscar e resumir transações do mês atual, incluindo distribuição de despesas.
 */
export const useFinancialSummary = (): FinancialSummary => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const userId = user?.id;

  const currentMonthYear = format(new Date(), 'yyyy-MM');

  // 1. Fetch Categories (needed for names and colors)
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['categories', userId],
    queryFn: () => getCategories(userId!),
    enabled: !!userId,
  });

  // 2. Fetch all transactions
  const { data: allTransactions = [], isLoading: isLoadingTransactions } = useQuery<Transaction[]>({
    queryKey: ['transactions', userId],
    queryFn: () => getTransactions(userId!),
    enabled: !!userId,
  });

  // 3. Calculate summary and distribution for the current month
  const summary = useMemo(() => {
    const filteredTransactions = allTransactions.filter(t => 
      t.transaction_date.startsWith(currentMonthYear)
    );

    let totalIncome = 0;
    let totalExpense = 0;
    const expenseMap = new Map<string, number>();
    const expenseCategories = categories.filter(c => c.type === 'expense');

    filteredTransactions.forEach(t => {
      const amount = Number(t.amount);
      if (t.type === 'income') {
        totalIncome += amount;
      } else if (t.type === 'expense') {
        totalExpense += amount;
        if (t.category_id) {
          const categoryId = t.category_id;
          const currentTotal = expenseMap.get(categoryId) || 0;
          expenseMap.set(categoryId, currentTotal + amount);
        }
      }
    });

    const netBalance = totalIncome - totalExpense;

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
      transactions: filteredTransactions,
    };
  }, [allTransactions, categories, currentMonthYear]);

  return {
    ...summary,
    isLoading: isAuthLoading || isLoadingTransactions || isLoadingCategories,
  };
};