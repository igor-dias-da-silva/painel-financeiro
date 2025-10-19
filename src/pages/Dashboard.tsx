"use client";

import React, { useMemo, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';
import { AuthGuard } from '@/components/AuthGuard';
import { Transaction, Category } from '@/data/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getTransactions, getCategories } from '@/lib/data'; // Importando funções reais de dados
import { useToast } from '@/components/ui/use-toast';

// Cores para o gráfico de rosca
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Dashboard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const [fetchedTransactions, fetchedCategories] = await Promise.all([
          getTransactions(),
          getCategories(),
        ]);
        setTransactions(fetchedTransactions);
        setCategories(fetchedCategories);
      } catch (error) {
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar transações e categorias.",
          variant: "destructive",
        });
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  // 1. Lógica de Cálculo de Totais e Saldo
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
        name: category ? category.name : 'Sem Categoria',
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
  }, [transactions, categories]);

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="p-4 md:p-6 flex justify-center items-center h-full">
          <p>Carregando dados...</p>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="p-4 md:p-6 space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Saldo Atual */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {currentBalance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {/* Placeholder para mudança mensal */}
                +20.1% do mês passado
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Receitas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-foreground">Receitas</CardTitle>
              <ArrowUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ {totalIncome.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Total de entradas no mês
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Despesas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-foreground">Despesas</CardTitle>
              <ArrowDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">R$ {totalExpense.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Total de saídas no mês
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Gráfico de Distribuição de Despesas */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Despesas por Categoria</CardTitle>
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
                    <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
                    <Legend layout="vertical" align="right" verticalAlign="middle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Nenhuma despesa registrada para o período.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card de Metas/Orçamento (Placeholder) */}
          <Card>
            <CardHeader>
              <CardTitle>Metas e Orçamento</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Acompanhe seu progresso em relação aos seus orçamentos mensais.
              </p>
              <Button className="w-full">Ver Orçamento Completo</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Dashboard;