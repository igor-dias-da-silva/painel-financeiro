"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { X, Plus, Receipt, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBills, addBill, updateBill, deleteBill, Bill } from '@/lib/bills';
import { showError, showSuccess } from '@/utils/toast';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import { AuthGuard } from '@/components/AuthGuard';
import { useTranslation } from 'react-i18next';

const BillsPage = () => {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [newBillName, setNewBillName] = useState('');
  const [newBillAmount, setNewBillAmount] = useState('');
  const [newBillDueDate, setNewBillDueDate] = useState<Date | undefined>(new Date());

  // Fetch regular bills
  const { data: bills, isLoading: billsLoading, error: billsError } = useQuery({
    queryKey: ['bills', user?.id],
    queryFn: () => getBills(user!.id),
    enabled: !!user,
  });

  // Log errors for debugging
  if (billsError) console.error('Bills Error:', billsError);

  const addBillMutation = useMutation({
    mutationFn: (newBill: Omit<Bill, 'id' | 'created_at'>) => addBill(newBill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills', user?.id] });
      showSuccess(t('bills.addSuccess'));
      setNewBillName('');
      setNewBillAmount('');
      setNewBillDueDate(new Date());
    },
    onError: () => showError(t('bills.addError')),
  });

  const updateBillMutation = useMutation({
    mutationFn: ({ billId, updates }: { billId: string, updates: Partial<Bill> }) => updateBill(billId, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bills', user?.id] }),
    onError: () => showError(t('bills.updateError')),
  });

  const deleteBillMutation = useMutation({
    mutationFn: (billId: string) => deleteBill(billId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bills', user?.id] }),
    onError: () => showError(t('bills.deleteError')),
  });

  const displayBills = useMemo(() => {
    // Apenas contas regulares, sem a conta virtual da lista de compras
    return bills ? [...bills].sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()) : [];
  }, [bills]);

  const { totalPaid, totalPending } = useMemo(() => {
    const totalPaid = bills?.filter(b => b.is_paid).reduce((sum, b) => sum + Number(b.amount), 0) || 0;
    const totalPending = bills?.filter(b => !b.is_paid).reduce((sum, b) => sum + Number(b.amount), 0) || 0;
    
    return { totalPaid, totalPending };
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
      showError(t('bills.formError'));
    }
  };

  const handleTogglePaid = (bill: Bill) => {
    updateBillMutation.mutate({ billId: bill.id, updates: { is_paid: !bill.is_paid } });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const isLoading = authLoading || billsLoading;

  return (
    <AuthGuard>
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex items-center mb-6">
          <Receipt className="h-8 w-8 mr-3 text-primary" />
          <h1 className="text-3xl font-bold">{t('bills.title')}</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('bills.addNewBill')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddBill} className="space-y-4">
                    <div>
                      <Label htmlFor="billName">{t('bills.billName')}</Label>
                      <Input id="billName" value={newBillName} onChange={e => setNewBillName(e.target.value)} placeholder={t('bills.billNamePlaceholder')} />
                    </div>
                    <div>
                      <Label htmlFor="billAmount">{t('bills.amount')}</Label>
                      <Input id="billAmount" type="number" value={newBillAmount} onChange={e => setNewBillAmount(e.target.value)} placeholder={t('bills.amountPlaceholder')} />
                    </div>
                    <div>
                      <Label htmlFor="billDueDate">{t('bills.dueDate')}</Label>
                      <DatePicker date={newBillDueDate} setDate={setNewBillDueDate} />
                    </div>
                    <Button type="submit" className="w-full" disabled={addBillMutation.isPending}>
                      {addBillMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                      {t('bills.addBillButton')}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t('bills.monthlySummary')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('bills.totalPaid')}</span>
                    <span className="font-semibold text-lg text-green-600">{formatCurrency(totalPaid)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('bills.totalPending')}</span>
                    <span className="font-semibold text-lg text-red-500">{formatCurrency(totalPending)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t('bills.myBills')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Desktop View */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">{t('bills.status')}</TableHead>
                          <TableHead>{t('bills.description')}</TableHead>
                          <TableHead>{t('bills.due')}</TableHead>
                          <TableHead className="text-right">{t('bills.value')}</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayBills.length > 0 ? (
                          displayBills.map(bill => {
                            return (
                              <TableRow key={bill.id} className={bill.is_paid ? 'bg-green-50 dark:bg-green-900/20' : ''}>
                                <TableCell>
                                  <Checkbox checked={bill.is_paid} onCheckedChange={() => handleTogglePaid(bill)} />
                                </TableCell>
                                <TableCell className={`font-medium ${bill.is_paid ? 'line-through text-muted-foreground' : ''}`}>
                                  {bill.name}
                                </TableCell>
                                <TableCell className={bill.is_paid ? 'line-through text-muted-foreground' : ''}>{format(new Date(bill.due_date), 'dd/MM/yyyy')}</TableCell>
                                <TableCell className={`text-right font-semibold ${bill.is_paid ? 'line-through text-muted-foreground' : ''}`}>{formatCurrency(bill.amount)}</TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="icon" onClick={() => deleteBillMutation.mutate(bill.id)}>
                                    <X className="h-4 w-4 text-red-500" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center h-24">
                              {t('bills.noBills')}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  {/* Mobile View */}
                  <div className="md:hidden space-y-4">
                    {displayBills.length > 0 ? (
                      displayBills.map(bill => {
                        return (
                          <div key={bill.id} className={`p-4 rounded-lg border ${bill.is_paid ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-card'}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4">
                                <Checkbox checked={bill.is_paid} onCheckedChange={() => handleTogglePaid(bill)} className="mt-1" />
                                <div>
                                  <div className={`font-medium ${bill.is_paid ? 'line-through text-muted-foreground' : ''}`}>
                                    {bill.name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {t('bills.mobileDueDate', { date: format(new Date(bill.due_date), 'dd/MM/yyyy') })}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`font-semibold text-lg ${bill.is_paid ? 'line-through text-muted-foreground' : ''}`}>{formatCurrency(bill.amount)}</div>
                                <Button variant="ghost" size="icon" onClick={() => deleteBillMutation.mutate(bill.id)} className="h-8 w-8 mt-1">
                                  <X className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-10 text-muted-foreground">
                        {t('bills.noBills')}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
};

export default BillsPage;