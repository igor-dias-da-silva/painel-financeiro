"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Loader2, Save, DollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, Transaction } from '@/lib/transactions';
import { getMonthlyBudget, updateCategoryLimits, CategoryLimit } from '@/lib/budget';
import { useFinancialSummary } from '@/hooks/useFinancialSummary';
import { showError, showSuccess } from '@/utils/toast';
import { AuthGuard } from '@/components/AuthGuard';
import { format } from 'date-fns';

const BudgetPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Fetch Categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories', userId],
    queryFn: () => getCategories(userId!),
    enabled: !!userId,
  });

  // Fetch Monthly Budget (including category limits)
  const { data: monthlyBudget, isLoading: budgetLoading } = useQuery({
    queryKey: ['monthlyBudget', userId, currentMonth, currentYear],
    queryFn: () => getMonthlyBudget(userId!, currentMonth, currentYear),
    enabled: !!userId,
  });

  // Get actual spending data
  const { transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions', userId],
    queryFn: () => getTransactions(userId!),
    enabled: !!userId,
  });

  const [localLimits, setLocalLimits] = useState<CategoryLimit>({});

  useEffect(() => {
    if (monthlyBudget?.category_limits) {
      setLocalLimits(monthlyBudget.category_limits);
    }
  }, [monthlyBudget]);

  // Calculate actual spending per category
  const spendingByCategory = useMemo(() => {
    const spendingMap: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense' && t.category_id)
      .forEach(t => {
        const categoryId = t.category_id!;
        spendingMap[categoryId] = (spendingMap[categoryId] || 0) + Number(t.amount);
      });
    return spendingMap;
  }, [transactions]);

  const expenseCategories = useMemo(() => {
    return categories.filter(c => c.type === 'expense');
  }, [categories]);

  const updateLimitsMutation = useMutation({
    mutationFn: (limits: CategoryLimit) => updateCategoryLimits(monthlyBudget!.id, limits),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlyBudget', userId, currentMonth, currentYear] });
      showSuccess('Limites de orçamento atualizados!');
    },
    onError: () => showError('Erro ao salvar limites de orçamento.'),
  });

  const handleLimitChange = (categoryId: string, value: string) => {
    const amount = parseFloat(value) || 0;
    setLocalLimits(prev => ({
      ...prev,
      [categoryId]: amount,
    }));
  };

  const handleSaveLimits = () => {
    if (monthlyBudget) {
      updateLimitsMutation.mutate(localLimits);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const isLoading = authLoading || categoriesLoading || budgetLoading || transactionsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex items-center mb-6">
          <TrendingUp className="h-8 w-8 mr-3 text-primary" />
          <h1 className="text-3xl font-bold">Orçamento Mensal</h1>
        </div>
        <p className="text-muted-foreground mb-6">
          Defina limites de gastos para cada categoria neste mês ({format(currentDate, 'MMMM/yyyy')}).
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna de Configuração de Limites */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Definir Limites</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {expenseCategories.length === 0 ? (
                <p className="text-muted-foreground">Crie categorias de despesa na página de Transações para começar a orçar.</p>
              ) : (
                <div className="space-y-4">
                  {expenseCategories.map(category => (
                    <div key={category.id} className="space-y-1">
                      <Label htmlFor={`limit-${category.id}`}>{category.name}</Label>
                      <Input
                        id={`limit-${category.id}`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={localLimits[category.id] || ''}
                        onChange={(e) => handleLimitChange(category.id, e.target.value)}
                        disabled={updateLimitsMutation.isPending}
                      />
                    </div>
                  ))}
                  <Button onClick={handleSaveLimits} className="w-full" disabled={updateLimitsMutation.isPending}>
                    {updateLimitsMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Salvar Limites
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Coluna de Visualização de Progresso */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Progresso do Orçamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {expenseCategories.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum limite definido.</p>
              ) : (
                expenseCategories.map(category => {
                  const limit = localLimits[category.id] || 0;
                  const spent = spendingByCategory[category.id] || 0;
                  const percentage = limit > 0 ? Math.min(100, (spent / limit) * 100) : (spent > 0 ? 100 : 0);
                  
                  let progressColor = 'bg-primary';
                  if (percentage >= 100) {
                    progressColor = 'bg-red-500';
                  } else if (percentage >= 75) {
                    progressColor = 'bg-yellow-500';
                  }

                  return (
                    <div key={category.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{category.name}</span>
                        <span className="text-sm text-muted-foreground">{percentage.toFixed(0)}%</span>
                      </div>
                      <Progress value={percentage} className={`h-3 ${progressColor}`} />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Gasto: <span className="font-semibold text-foreground">{formatCurrency(spent)}</span></span>
                        <span>Limite: <span className="font-semibold text-foreground">{formatCurrency(limit)}</span></span>
                      </div>
                      {percentage >= 100 && (
                        <p className="text-xs text-red-500 font-medium">Limite excedido!</p>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
};

export default BudgetPage;