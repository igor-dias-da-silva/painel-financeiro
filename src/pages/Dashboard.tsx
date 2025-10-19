"use client";

import React, { useMemo, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ArrowUp, ArrowDown, TrendingUp, Receipt, Loader2 } from 'lucide-react';
import { AuthGuard } from '@/components/AuthGuard';
import { Transaction, Category } from '@/data/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getTransactions, getCategories } from '@/lib/data';
import { getBills, Bill } from '@/lib/bills'; // Importando funções de Bills
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth'; // Importando useAuth para obter o user id
import { useQuery } from '@tanstack/react-query'; // Importando useQuery
import { useTranslation } from 'react-i18next';

// Cores para o gráfico de rosca
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userId = user?.id;
  const { toast } = useToast();

  // 1. Fetch Transações
  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery<Transaction[]>({
    queryKey: ['transactions', userId],
    queryFn: getTransactions,
    enabled: !!userId,
  });

  // 2. Fetch Categorias
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['categories', userId],
    queryFn: getCategories,
    enabled: !!userId,
  });

  // 3. Fetch Contas a Pagar
  const { data: bills = [], isLoading: isLoadingBills } = useQuery<Bill[]>({
    queryKey: ['bills', userId],
    queryFn: () => getBills(userId!),
    enabled: !!userId,
  });

  // 4. Lógica de Cálculo de Totais e Saldo
  const { totalIncome, totalExpense, currentBalance, expenseDistribution } = useMemo(() => {
    let income = 0;
    let expense = 0;
    const expenseMap: Record<string, number> = {};

    // Mapeia categorias para fácil acesso
    const categoriesMap = categories.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {} as Record<string, Category>);

    // Filtra e calcula os totais
    transactions.forEach((t: Transaction) => {
      const amount = Number(t.amount); // Garante que o valor é numérico
      if (t.type === 'income') {
        income += amount;
      } else if (t.type === 'expense') {
        expense += amount;
        
        // Agrupa despesas por categoria para o gráfico
        const categoryId = t.category_id || 'uncategorized';
        expenseMap[categoryId] = (expenseMap[categoryId] || 0) + amount;
      }
    });

    const balance = income - expense;

    // Formata os dados para o gráfico de rosca
    const distributionData = Object.keys(expenseMap).map((categoryId, index) => {
      const category = categoriesMap[categoryId];
      return {
        name: category ? category.name : t('dashboard.uncategorized'),
        value: expenseMap[categoryId],
        color: COLORS[index % COLORS.length],
      };
    }).filter(item => item.value > 0);

    return {
      totalIncome: income,
      totalExpense: expense,
      currentBalance: balance,
      expenseDistribution: distributionData,
    };
  }, [transactions, categories, t]);

  // 5. Cálculo de Contas Pendentes
  const totalPendingBills = useMemo(() => {
    return bills.filter(b => !b.is_paid).reduce((sum, b) => sum + Number(b.amount), 0);
  }, [bills]);

  const isLoading = isLoadingTransactions || isLoadingCategories || isLoadingBills;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="p-4 md:p-6 flex justify-center items-center h-full">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="p-4 md:p-6 space-y-6">
        <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Saldo Atual */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.currentBalance')}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(currentBalance)}</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.fromLastMonth')}
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Receitas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-foreground">{t('dashboard.income')}</CardTitle>
              <ArrowUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.totalIncomeThisMonth')}
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Despesas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-foreground">{t('dashboard.expenses')}</CardTitle>
              <ArrowDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.totalExpensesThisMonth')}
              </p>
            </CardContent>
          </Card>
          
          {/* Card 4: Contas a Vencer */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-foreground">{t('dashboard.billsDue')}</CardTitle>
              <Receipt className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalPendingBills)}</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.totalPendingAmount')}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Gráfico de Distribuição de Despesas */}
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.expenseDistribution')}</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              {expenseDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {expenseDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend layout="vertical" align="right" verticalAlign="middle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  {t('dashboard.noExpensesRecorded')}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card de Metas/Orçamento */}
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.goalsAndBudget')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {t('dashboard.trackProgress')}
              </p>
              <Link to="/budget">
                <Button className="w-full">{t('dashboard.viewFullBudget')}</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Dashboard;