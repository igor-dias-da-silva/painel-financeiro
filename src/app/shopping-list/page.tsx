"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Plus, ShoppingCart, Loader2 } from 'lucide-react';
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

const ShoppingListPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [localSalary, setLocalSalary] = useState<number | string>('');

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // JS months are 0-indexed
  const currentYear = currentDate.getFullYear();

  // Fetch budget for the current month
  const { data: budget, isLoading: budgetLoading } = useQuery({
    queryKey: ['shoppingBudget', user?.id, currentMonth, currentYear],
    queryFn: () => getOrCreateBudget(user!.id, currentMonth, currentYear),
    enabled: !!user,
  });

  // Fetch shopping items for the current budget
  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ['shoppingItems', budget?.id],
    queryFn: () => getShoppingItems(budget!.id),
    enabled: !!budget,
  });

  // Effect to sync local salary state with fetched budget data
  useEffect(() => {
    if (budget) {
      setLocalSalary(budget.amount);
    }
  }, [budget]);

  // Mutation to update budget
  const updateBudgetMutation = useMutation({
    mutationFn: (amount: number) => updateBudgetAmount(budget!.id, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shoppingBudget', user?.id, currentMonth, currentYear] });
      showSuccess('Orçamento atualizado!');
    },
    onError: () => showError('Erro ao atualizar orçamento.'),
  });

  // Mutation to add an item
  const addItemMutation = useMutation({
    mutationFn: (newItem: Omit<DbShoppingItem, 'id' | 'created_at'>) => addShoppingItem(newItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shoppingItems', budget?.id] });
      setNewItemName('');
      setNewItemPrice('');
    },
    onError: () => showError('Erro ao adicionar item.'),
  });

  // Mutation to update an item
  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, updates }: { itemId: string, updates: Partial<DbShoppingItem> }) => updateShoppingItem(itemId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shoppingItems', budget?.id] });
    },
    onError: () => showError('Erro ao atualizar item.'),
  });

  // Mutation to delete an item
  const deleteItemMutation = useMutation({
    mutationFn: (itemId: string) => deleteShoppingItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shoppingItems', budget?.id] });
      showSuccess('Item removido!');
    },
    onError: () => showError('Erro ao remover item.'),
  });

  const totalExpenses = useMemo(() => {
    return items?.reduce((total, item) => total + Number(item.price), 0) || 0;
  }, [items]);

  const remainingBalance = useMemo(() => {
    return (budget?.amount || 0) - totalExpenses;
  }, [budget, totalExpenses]);

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSalary(e.target.value);
  };

  const handleBudgetBlur = () => {
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

  const isLoading = authLoading || budgetLoading || itemsLoading;

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
        <ShoppingCart className="h-8 w-8 mr-3 text-primary" />
        <h1 className="text-3xl font-bold">Lista de Compras e Orçamento</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Coluna de Orçamento e Totais */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meu Orçamento ({currentMonth}/{currentYear})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="salary">Salário / Orçamento Mensal</Label>
                <Input
                  id="salary"
                  type="number"
                  placeholder="R$ 0,00"
                  value={localSalary}
                  onChange={handleBudgetChange}
                  onBlur={handleBudgetBlur}
                  disabled={updateBudgetMutation.isPending}
                />
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
                <span className="font-semibold text-lg text-red-500">{formatCurrency(totalExpenses)}</span>
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
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Itens da Lista</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
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
                  className="w-32"
                  disabled={addItemMutation.isPending}
                />
                <Button onClick={handleAddItem} disabled={addItemMutation.isPending}>
                  {addItemMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>
              <Separator className="my-4" />
              <div className="space-y-3 h-96 overflow-y-auto pr-2">
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
  );
};

export default ShoppingListPage;