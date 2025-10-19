"use client";

import React from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ArrowUp, ArrowDown, Repeat2, Loader2, Receipt } from 'lucide-react';
import { useFinancialSummary } from '@/hooks/useFinancialSummary';
import CategoryExpenseChart from '@/components/CategoryExpenseChart'; // Importando o novo componente
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { getBills } from '@/lib/bills';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const { totalIncome, totalExpense, netBalance, expenseDistribution, transactions, isLoading: isSummaryLoading } = useFinancialSummary();

  // Dados de Contas a Pagar
  const { data: bills, isLoading: billsLoading } = useQuery({
    queryKey: ['bills', userId],
    queryFn: () => getBills(userId!),
    enabled: !!userId,
  });

  const safeBills = bills || [];
  const pendingBills = safeBills.filter(bill => !bill.is_paid);
  const pendingBillsTotal = pendingBills.reduce((sum, bill) => sum + Number(bill.amount), 0);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const currentMonth = format(new Date(), 'MMMM/yyyy');
  const isLoading = isSummaryLoading || billsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-foreground">Dashboard Financeiro</h1>
            <p className="text-gray-600 mt-1 dark:text-muted-foreground">Resumo do mês: {currentMonth}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/transactions">
              <Button size="sm">
                <Repeat2 className="h-4 w-4 mr-2" />
                Nova Transação
              </Button>
            </Link>
            <Link to="/budget">
              <Button variant="outline" size="sm">
                Ver Orçamento
              </Button>
            </Link>
          </div>
        </div>

        {/* Resumo Financeiro Geral */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Card de Saldo Líquido */}
          <Card>
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
          
          {/* Card de Receita Total */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-foreground">Receitas</CardTitle>
              <ArrowUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
              <p className="text-xs text-muted-foreground">Total de entradas registradas</p>
            </CardContent>
          </Card>

          {/* Card de Despesa Total */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-foreground">Despesas</CardTitle>
              <ArrowDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</div>
              <p className="text-xs text-muted-foreground">Total de saídas registradas</p>
            </CardContent>
          </Card>

          {/* Card de Contas Pendentes */}
          <Card>
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

        {/* Gráfico de Despesas por Categoria */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="dark:text-foreground">Distribuição de Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryExpenseChart data={expenseDistribution} isLoading={isSummaryLoading} />
            </CardContent>
          </Card>
          
          {/* Próximas Contas a Vencer (Mantido para contexto) */}
          <Card className="lg:col-span-1">
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
    </AuthGuard>
  );
};

export default Dashboard;