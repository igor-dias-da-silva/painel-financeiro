"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { X, Plus, Receipt, Loader2, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBills, addBill, updateBill, deleteBill, Bill } from '@/lib/bills';
import { getOrCreateBudget, getShoppingItems } from '@/lib/shopping';
import { showError, showSuccess } from '@/utils/toast';
import { DatePicker } from '@/components/ui/date-picker';
import { format, endOfMonth } from 'date-fns';

const BillsPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [newBillName, setNewBillName] = useState('');
  const [newBillAmount, setNewBillAmount] = useState('');
  const [newBillDueDate, setNewBillDueDate] = useState<Date | undefined>(new Date());

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Fetch regular bills
  const { data: bills, isLoading: billsLoading } = useQuery({
    queryKey: ['bills', user?.id],
    queryFn: () => getBills(user!.id),
    enabled: !!user,
  });

  // Fetch shopping list data for the current month
  const { data: shoppingData, isLoading: shoppingLoading } = useQuery({
    queryKey: ['monthlyShoppingSummary', user?.id, currentMonth, currentYear],
    queryFn: async () => {
      const budget = await getOrCreateBudget(user!.id, currentMonth, currentYear);
      const items = await getShoppingItems(budget.id);
      const totalExpenses = items.reduce((sum, item) => sum + Number(item.price), 0);
      const purchasedExpenses = items.filter(i => i.purchased).reduce((sum, item) => sum + Number(item.price), 0);
      return { totalExpenses, purchasedExpenses };
    },
    enabled: !!user,
  });

  const addBillMutation = useMutation({
    mutationFn: (newBill: Omit<Bill, 'id' | 'created_at'>) => addBill(newBill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills', user?.id] });
      showSuccess('Conta adicionada com sucesso!');
      setNewBillName('');
      setNewBillAmount('');
      setNewBillDueDate(new Date());
    },
    onError: () => showError('Erro ao adicionar conta.'),
  });

  const updateBillMutation = useMutation({
    mutationFn: ({ billId, updates }: { billId: string, updates: Partial<Bill> }) => updateBill(billId, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bills', user?.id] }),
    onError: () => showError('Erro ao atualizar conta.'),
  });

  const deleteBillMutation = useMutation({
    mutationFn: (billId: string) => deleteBill(billId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bills', user?.id] }),
    onError: () => showError('Erro ao deletar conta.'),
  });

  const displayBills = useMemo(() => {
    const allBills = [...(bills || [])];
    if (shoppingData && shoppingData.totalExpenses > 0) {
      const shoppingBill: Bill & { isVirtual?: boolean } = {
        id: 'shopping-list-bill',
        user_id: user!.id,
        name: 'Compras do Mês',
        amount: shoppingData.totalExpenses,
        due_date: format(endOfMonth(currentDate), 'yyyy-MM-dd'),
        is_paid: shoppingData.purchasedExpenses === shoppingData.totalExpenses,
        created_at: currentDate.toISOString(),
        isVirtual: true,
      };
      allBills.push(shoppingBill);
    }
    return allBills.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  }, [bills, shoppingData, user, currentDate]);

  const { totalPaid, totalPending } = useMemo(() => {
    const regularPaid = bills?.filter(b => b.is_paid).reduce((sum, b) => sum + Number(b.amount), 0) || 0;
    const regularPending = bills?.filter(b => !b.is_paid).reduce((sum, b) => sum + Number(b.amount), 0) || 0;
    
    const shoppingPaid = shoppingData?.purchasedExpenses || 0;
    const shoppingPending = (shoppingData?.totalExpenses || 0) - shoppingPaid;

    return { 
      totalPaid: regularPaid + shoppingPaid, 
      totalPending: regularPending + shoppingPending 
    };
  }, [bills, shoppingData]);

  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newBillAmount);
    if (newBillName.trim() && !isNaN(amount) && amount > 0 && newBillDueDate && user) {
      addBillMutation.mutate({
        user_id: user.id,
        name: newBillName.trim(),
        amount,
        due_date: format(newBillDueDate, 'yyyy-MM-dd'),
        is_paid: false,
      });
    } else {
      showError('Por favor, preencha todos os campos corretamente.');
    }
  };

  const handleTogglePaid = (bill: Bill) => {
    updateBillMutation.mutate({ billId: bill.id, updates: { is_paid: !bill.is_paid } });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const isLoading = authLoading || billsLoading || shoppingLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-0">
      <div className="flex items-center mb-6">
        <Receipt className="h-8 w-8 mr-3 text-primary" />
        <h1 className="text-3xl font-bold">Contas a Pagar</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Nova Conta</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddBill} className="space-y-4">
                <div>
                  <Label htmlFor="billName">Nome da Conta</Label>
                  <Input id="billName" value={newBillName} onChange={e => setNewBillName(e.target.value)} placeholder="Ex: Conta de Luz" />
                </div>
                <div>
                  <Label htmlFor="billAmount">Valor (R$)</Label>
                  <Input id="billAmount" type="number" value={newBillAmount} onChange={e => setNewBillAmount(e.target.value)} placeholder="Ex: 150.00" />
                </div>
                <div>
                  <Label htmlFor="billDueDate">Data de Vencimento</Label>
                  <DatePicker date={newBillDueDate} setDate={setNewBillDueDate} />
                </div>
                <Button type="submit" className="w-full" disabled={addBillMutation.isPending}>
                  {addBillMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Adicionar Conta
                </Button>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Resumo Mensal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Pago:</span>
                <span className="font-semibold text-lg text-green-600">{formatCurrency(totalPaid)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Pendente:</span>
                <span className="font-semibold text-lg text-red-500">{formatCurrency(totalPending)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Minhas Contas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Status</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayBills.length > 0 ? (
                      displayBills.map(bill => {
                        const isVirtual = 'isVirtual' in bill && bill.isVirtual;
                        return (
                          <TableRow key={bill.id} className={bill.is_paid ? 'bg-green-50 dark:bg-green-900/20' : ''}>
                            <TableCell>
                              <Checkbox checked={!!bill.is_paid} onCheckedChange={() => handleTogglePaid(bill)} disabled={isVirtual} />
                            </TableCell>
                            <TableCell className={`font-medium ${bill.is_paid ? 'line-through text-muted-foreground' : ''}`}>
                              <div className="flex items-center">
                                {isVirtual && <ShoppingCart className="h-4 w-4 mr-2 text-primary" />}
                                {bill.name}
                              </div>
                              {isVirtual && <div className="text-xs text-muted-foreground">Total de {shoppingData?.totalExpenses === shoppingData?.purchasedExpenses ? 'comprados' : 'previstos'}</div>}
                            </TableCell>
                            <TableCell className={bill.is_paid ? 'line-through text-muted-foreground' : ''}>{format(new Date(bill.due_date), 'dd/MM/yyyy')}</TableCell>
                            <TableCell className={`text-right font-semibold ${bill.is_paid ? 'line-through text-muted-foreground' : ''}`}>{formatCurrency(bill.amount)}</TableCell>
                            <TableCell>
                              {!isVirtual && (
                                <Button variant="ghost" size="icon" onClick={() => deleteBillMutation.mutate(bill.id)}>
                                  <X className="h-4 w-4 text-red-500" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">
                          Nenhuma conta cadastrada.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BillsPage;