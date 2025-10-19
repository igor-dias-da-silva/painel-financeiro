"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Receipt, ShoppingCart, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getBills } from '@/lib/bills';
import { getOrCreateBudget, getShoppingItems } from '@/lib/shopping';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const userId = user?.id;

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const { data: bills, isLoading: billsLoading, error: billsError } = useQuery({
    queryKey: ['bills', userId],
    queryFn: () => getBills(userId!),
    enabled: !!userId,
  });

  const { data: shoppingData, isLoading: shoppingLoading, error: shoppingError } = useQuery({
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

  // Garante que os dados sejam arrays vazios se forem undefined
  const safeBills = bills || [];
  const safeShoppingData = shoppingData || { budget: { amount: 0 }, totalExpenses: 0 };

  const pendingBills = safeBills.filter(bill => !bill.is_paid);
  const pendingBillsTotal = pendingBills.reduce((sum, bill) => sum + Number(bill.amount), 0);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (authLoading || billsLoading || shoppingLoading) {
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
          <p className="text-gray-600 mt-1 dark:text-muted-foreground">Sua visão geral de contas e compras.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/bills">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Conta
            </Button>
          </Link>
          <Link to="/shopping-list">
            <Button variant="outline" size="sm">
              Ver Lista de Compras
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        <Card className="dark:bg-card dark:border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-foreground">Contas a Pagar</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{formatCurrency(pendingBillsTotal)}</div>
            <p className="text-xs text-muted-foreground">{pendingBills.length} conta(s) pendente(s)</p>
          </CardContent>
        </Card>
        <Card className="dark:bg-card dark:border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-foreground">Lista de Compras do Mês</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{formatCurrency(safeShoppingData.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">Orçamento de {formatCurrency(safeShoppingData.budget.amount)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Bills */}
      <Card className="dark:bg-card dark:border-border">
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
                  <span className="font-semibold text-lg text-gray-800 dark:text-foreground">
                    {formatCurrency(bill.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;