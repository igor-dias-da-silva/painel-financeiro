"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { X, Plus, Receipt, Loader2, Calendar, DollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBills, addBill, updateBill, deleteBill, Bill } from '@/lib/bills';
import { showError, showSuccess } from '@/utils/toast';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';

const BillsPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [newBillName, setNewBillName] = useState('');
  const [newBillAmount, setNewBillAmount] = useState('');
  const [newBillDueDate, setNewBillDueDate] = useState<Date | undefined>(new Date());

  const { data: bills, isLoading: billsLoading } = useQuery({
    queryKey: ['bills', user?.id],
    queryFn: () => getBills(user!.id),
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
    onMutate: async ({ billId, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['bills', user?.id] });
      const previousBills = queryClient.getQueryData(['bills', user?.id]);
      queryClient.setQueryData(['bills', user?.id], (old: Bill[] | undefined) => 
        old ? old.map(bill => bill.id === billId ? { ...bill, ...updates } : bill) : []
      );
      return { previousBills };
    },
    onError: (err, vars, context) => {
      if (context?.previousBills) {
        queryClient.setQueryData(['bills', user?.id], context.previousBills);
      }
      showError('Erro ao atualizar conta.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['bills', user?.id] });
    },
  });

  const deleteBillMutation = useMutation({
    mutationFn: (billId: string) => deleteBill(billId),
    onMutate: async (billId) => {
      await queryClient.cancelQueries({ queryKey: ['bills', user?.id] });
      const previousBills = queryClient.getQueryData(['bills', user?.id]);
      queryClient.setQueryData(['bills', user?.id], (old: Bill[] | undefined) => 
        old ? old.filter(bill => bill.id !== billId) : []
      );
      return { previousBills };
    },
    onError: (err, vars, context) => {
      if (context?.previousBills) {
        queryClient.setQueryData(['bills', user?.id], context.previousBills);
      }
      showError('Erro ao deletar conta.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['bills', user?.id] });
    },
  });

  const { totalPaid, totalPending } = useMemo(() => {
    const paid = bills?.filter(b => b.is_paid).reduce((sum, b) => sum + Number(b.amount), 0) || 0;
    const pending = bills?.filter(b => !b.is_paid).reduce((sum, b) => sum + Number(b.amount), 0) || 0;
    return { totalPaid: paid, totalPending: pending };
  }, [bills]);

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

  const isLoading = authLoading || billsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Paga</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bills && bills.length > 0 ? (
                    bills.map(bill => (
                      <TableRow key={bill.id} className={bill.is_paid ? 'bg-green-50 dark:bg-green-900/20' : ''}>
                        <TableCell>
                          <Checkbox checked={bill.is_paid} onCheckedChange={() => handleTogglePaid(bill)} />
                        </TableCell>
                        <TableCell className={`font-medium ${bill.is_paid ? 'line-through text-muted-foreground' : ''}`}>{bill.name}</TableCell>
                        <TableCell className={bill.is_paid ? 'line-through text-muted-foreground' : ''}>{format(new Date(bill.due_date), 'dd/MM/yyyy')}</TableCell>
                        <TableCell className={`text-right font-semibold ${bill.is_paid ? 'line-through text-muted-foreground' : ''}`}>{formatCurrency(bill.amount)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => deleteBillMutation.mutate(bill.id)}>
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        Nenhuma conta cadastrada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BillsPage;