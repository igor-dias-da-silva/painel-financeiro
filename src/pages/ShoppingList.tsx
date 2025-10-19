"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Plus, ShoppingCart, Loader2, Save, FileDown, Share2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getOrCreateBudget, 
  updateBudgetAmount, 
  getShoppingItems, 
  addShoppingItem, 
  updateShoppingItem, 
  deleteShoppingItem,
  ShoppingItem as DbShoppingItem
} from '@/lib/shopping';
import { showError, showSuccess } from '@/utils/toast';
import { AuthGuard } from '@/components/AuthGuard';

const ShoppingListPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [localSalary, setLocalSalary] = useState<number | string>('');
  const [isExporting, setIsExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const { data: budget, isLoading: budgetLoading } = useQuery({
    queryKey: ['shoppingBudget', user?.id, currentMonth, currentYear],
    queryFn: () => getOrCreateBudget(user!.id, currentMonth, currentYear),
    enabled: !!user,
  });

  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ['shoppingItems', budget?.id],
    queryFn: () => getShoppingItems(budget!.id),
    enabled: !!budget,
  });

  useEffect(() => {
    if (budget) {
      setLocalSalary(budget.amount);
    }
  }, [budget]);

  const updateBudgetMutation = useMutation({
    mutationFn: (amount: number) => updateBudgetAmount(budget!.id, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shoppingBudget', user?.id, currentMonth, currentYear] });
      showSuccess('Orçamento atualizado!');
    },
    onError: () => showError('Erro ao atualizar orçamento.'),
  });

  const addItemMutation = useMutation({
    mutationFn: (newItem: Omit<DbShoppingItem, 'id' | 'created_at'>) => addShoppingItem(newItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shoppingItems', budget?.id] });
      setNewItemName('');
      setNewItemPrice('');
    },
    onError: () => showError('Erro ao adicionar item.'),
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, updates }: { itemId: string, updates: Partial<DbShoppingItem> }) => updateShoppingItem(itemId, updates),
    onMutate: async ({ itemId, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['shoppingItems', budget?.id] });
      const previousItems = queryClient.getQueryData(['shoppingItems', budget?.id]);
      queryClient.setQueryData(['shoppingItems', budget?.id], (old: DbShoppingItem[] | undefined) => {
        if (!old) return [];
        return old.map(item => 
          item.id === itemId ? { ...item, ...updates } : item
        );
      });
      return { previousItems };
    },
    onError: (err, variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(['shoppingItems', budget?.id], context.previousItems);
      }
      showError('Erro ao atualizar item.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['shoppingItems', budget?.id] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: string) => deleteShoppingItem(itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ['shoppingItems', budget?.id] });
      const previousItems = queryClient.getQueryData(['shoppingItems', budget?.id]);
      queryClient.setQueryData(['shoppingItems', budget?.id], (old: DbShoppingItem[] | undefined) => {
        if (!old) return [];
        return old.filter(item => item.id !== itemId);
      });
      return { previousItems };
    },
    onError: (err, variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(['shoppingItems', budget?.id], context.previousItems);
      }
      showError('Erro ao remover item.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['shoppingItems', budget?.id] });
    },
  });

  const totalExpenses = useMemo(() => {
    return items?.reduce((total, item) => total + Number(item.price), 0) || 0;
  }, [items]);

  const purchasedExpenses = useMemo(() => {
    return items
      ?.filter(item => item.purchased)
      .reduce((total, item) => total + Number(item.price), 0) || 0;
  }, [items]);

  const remainingBalance = useMemo(() => {
    return Number(budget?.amount || 0) - purchasedExpenses;
  }, [budget, purchasedExpenses]);

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSalary(e.target.value);
  };

  const handleSaveBudget = () => {
    const newAmount = parseFloat(String(localSalary));
    if (!isNaN(newAmount) && newAmount !== budget?.amount) {
      updateBudgetMutation.mutate(newAmount);
    }
  };

  const handleAddItem = () => {
    const price = parseFloat(newItemPrice);
    if (newItemName.trim() && !isNaN(price) && price > 0 && budget) {
      addItemMutation.mutate({
        user_id: user!.id,
        budget_id: budget.id,
        name: newItemName.trim(),
        price,
        purchased: false,
      });
    }
  };

  const handleTogglePurchased = (id: string, currentStatus: boolean) => {
    updateItemMutation.mutate({ itemId: id, updates: { purchased: !currentStatus } });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleShareList = async () => {
    const itemsText = items?.map(item => 
      `${item.purchased ? '[x]' : '[ ]'} ${item.name} - ${formatCurrency(Number(item.price))}`
    ).join('\n') || 'Nenhum item na lista.';

    const shareText = `
🛒 *Lista de Compras (${currentMonth}/${currentYear})*

*Resumo:*
- Orçamento: ${formatCurrency(budget?.amount || 0)}
- Total Gasto: ${formatCurrency(purchasedExpenses)}
- Saldo Restante: ${formatCurrency(remainingBalance)}

*Itens:*
${itemsText}
    `;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Lista de Compras - ${currentMonth}/${currentYear}`,
          text: shareText,
        });
        showSuccess('Lista compartilhada!');
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
        showError('Não foi possível abrir a janela de compartilhamento.');
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        showSuccess('Lista copiada para a área de transferência!');
      } catch (error) {
        console.error('Erro ao copiar:', error);
        showError('Não foi possível copiar a lista para a área de transferência.');
      }
    }
  };

  const handleExportPDF = () => {
    if (!exportRef.current) return;

    setIsExporting(true);
    const input = exportRef.current;

    html2canvas(input, { scale: 2 })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        const imgWidth = pdfWidth;
        const imgHeight = imgWidth / ratio;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`lista-de-compras-${currentMonth}-${currentYear}.pdf`);
        setIsExporting(false);
        showSuccess('PDF exportado com sucesso!');
      })
      .catch(() => {
        showError('Erro ao exportar para PDF.');
        setIsExporting(false);
      });
  };

  const isLoading = authLoading || budgetLoading || itemsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="container mx-auto p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center">
            <ShoppingCart className="h-8 w-8 mr-3 text-primary" />
            <h1 className="text-3xl font-bold">Lista de Compras e Orçamento</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleShareList} variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
            <Button onClick={handleExportPDF} disabled={isExporting} variant="outline">
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileDown className="h-4 w-4 mr-2" />}
              Exportar PDF
            </Button>
          </div>
        </div>

        <div ref={exportRef} className="grid gap-8 lg:grid-cols-3">
          {/* Coluna de Orçamento e Totais */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Meu Orçamento ({currentMonth}/{currentYear})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="salary">Salário / Orçamento Mensal</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="salary"
                      type="number"
                      placeholder="R$ 0,00"
                      value={localSalary}
                      onChange={handleBudgetChange}
                      disabled={updateBudgetMutation.isPending}
                    />
                    <Button onClick={handleSaveBudget} disabled={updateBudgetMutation.isPending} size="sm">
                      {updateBudgetMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Orçamento Total:</span>
                  <span className="font-semibold text-lg">{formatCurrency(budget?.amount || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Gastos Previstos:</span>
                  <span className="font-semibold text-lg text-orange-500">{formatCurrency(totalExpenses)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Gasto (Comprados):</span>
                  <span className="font-semibold text-lg text-red-500">{formatCurrency(purchasedExpenses)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Saldo Restante:</span>
                  <span className={`font-bold text-xl ${remainingBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(remainingBalance)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna da Lista de Compras */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Itens da Lista</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                  <Input
                    placeholder="Nome do item"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    disabled={addItemMutation.isPending}
                  />
                  <Input
                    type="number"
                    placeholder="Preço (R$)"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                    className="w-full sm:w-32"
                    disabled={addItemMutation.isPending}
                  />
                  <Button onClick={handleAddItem} disabled={addItemMutation.isPending}>
                    {addItemMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </div>
                <Separator className="my-4" />
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                  {items?.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Sua lista de compras está vazia.</p>
                  ) : (
                    items?.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                        <Checkbox
                          id={`item-${item.id}`}
                          checked={item.purchased}
                          onCheckedChange={() => handleTogglePurchased(item.id, item.purchased)}
                          disabled={updateItemMutation.isPending}
                        />
                        <Label
                          htmlFor={`item-${item.id}`}
                          className={`flex-1 text-base ${item.purchased ? 'line-through text-muted-foreground' : ''}`}
                        >
                          {item.name}
                        </Label>
                        <span className={`font-semibold ${item.purchased ? 'line-through text-muted-foreground' : ''}`}>
                          {formatCurrency(Number(item.price))}
                        </span>
                        <Button variant="ghost" size="icon" onClick={() => deleteItemMutation.mutate(item.id)} disabled={deleteItemMutation.isPending}>
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default ShoppingListPage;