"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Receipt, ShoppingCart, Plus, DollarSign, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getBills } from '@/lib/bills';
import { getOrCreateBudget, getShoppingItems } from '@/lib/shopping';
import { format } from 'date-fns';
import { useFinancialSummary } from '@/hooks/useFinancialSummary';
import CategoryExpenseChart from '@/components/CategoryExpenseChart';

const Dashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const userId = user?.id;

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Dados de Transações e Resumo Financeiro
  const { totalIncome, totalExpense, netBalance, expenseDistribution, isLoading: isSummaryLoading } = useFinancialSummary();

  // Dados de Contas a Pagar
  const { data: bills, isLoading: billsLoading } = useQuery({
    queryKey: ['bills', userId],
    queryFn: () => getBills(userId!),
    enabled: !!userId,
  });

  // Dados da Lista de Compras
  const { data: shoppingData, isLoading: shoppingLoading } = useQuery({
    queryKey: ['monthlyShoppingSummary', userId, currentMonth, currentYear],
    queryFn: async () => {
      if (!userId) return null;
      const budget = await getOrCreateBudget(userId, currentMonth, currentYear);
      const items = await getShoppingItems(budget.id);
      const totalExpenses = items.reduce((sum, item) => sum + Number(item.price), 0);
      return { budget, totalExpenses };
    },
    enabled: !!userId,
  });

  const safeBills = bills || [];
  const safeShoppingData = shoppingData || { budget: { amount: 0 }, totalExpenses: 0 };

  const pendingBills = safeBills.filter(bill => !bill.is_paid);
  const pendingBillsTotal = pendingBills.reduce((sum, bill) => sum + Number(bill.amount), 0);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (authLoading || billsLoading || shoppingLoading || isSummaryLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-foreground">Dashboard Financeiro</h1>
          <p className="text-gray-600 mt-1 dark:text-muted-foreground">Sua visão geral de contas, compras e fluxo de caixa.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/transactions">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nova Transação
            </Button>
          </Link>
          <Link to="/bills">
            <Button variant="outline" size="sm">
              Ver Contas
            </Button>
          </Link>
        </div>
      </div>

      {/* Resumo Financeiro Geral */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <Card className="dark:bg-card dark:border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-foreground">Saldo Líquido</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netBalance)}
            </div>
            <p className="text-xs text-muted-foreground">Total de Receitas - Despesas</p>
          </CardContent>
        </Card>
        <Card className="dark:bg-card dark:border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-foreground">Receitas</CardTitle>
            <ArrowUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
            <p className="text-xs text-muted-foreground">Total de entradas registradas</p>
          </CardContent>
        </Card>
        <Card className="dark:bg-card dark:border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-foreground">Despesas</CardTitle>
            <ArrowDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</div>
            <p className="text-xs text-muted-foreground">Total de saídas registradas</p>
          </CardContent>
        </Card>
        <Card className="dark:bg-card dark:border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-foreground">Contas Pendentes</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{formatCurrency(pendingBillsTotal)}</div>
            <p className="text-xs text-muted-foreground">{pendingBills.length} conta(s) a vencer</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Despesas por Categoria */}
        <Card className="dark:bg-card dark:border-border lg:col-span-1">
          <CardHeader>
            <CardTitle className="dark:text-foreground">Distribuição de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryExpenseChart data={expenseDistribution} isLoading={isSummaryLoading} />
          </CardContent>
        </Card>

        {/* Próximas Contas a Vencer */}
        <Card className="dark:bg-card dark:border-border lg:col-span-1">
          <CardHeader>
            <CardTitle className="dark:text-foreground">Próximas Contas a Vencer</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingBills.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
                Nenhuma conta pendente. Tudo em dia!
              </div>
            ) : (
              <div className="space-y-3">
                {pendingBills.slice(0, 5).map((bill) => (
                  <div key={bill.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-secondary">
                    <div className="mb-2 sm:mb-0">
                      <p className="font-medium text-gray-800 dark:text-foreground">{bill.name}</p>
                      <p className="text-sm text-gray-600 dark:text-muted-foreground">
                        Vence em: {format(new Date(bill.due_date), 'dd/MM/yyyy')}
                      </p>
                    </div>
                    <span className="font-semibold text-lg text-red-600 dark:text-red-400">
                      {formatCurrency(bill.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;